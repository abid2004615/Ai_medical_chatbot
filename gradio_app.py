# app.py
import os
import gradio as gr
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from brain_of_the_doctor import encode_image, analyze_image_with_query
from voice_of_the_patient import transcribe_with_groq
from voice_of_the_doctor import text_to_speech_with_gtts, text_to_speech_with_elevenlabs

# System prompt for the AI doctor
system_prompt = """You are acting as a professional doctor (for learning purposes only). 
Analyze the patient’s symptoms or image and provide your answer in a clear, point-wise structured format. 
Always include all possible solutions. Use this exact structure and formatting:

1. Condition Summary: Briefly describe the condition in simple words.  
2. Over-the-Counter Solutions: List all possible non-prescription treatments such as shampoos, creams, or medicines, with examples of active ingredients.  
3. Natural and Home Remedies: List safe natural remedies such as oils, herbal remedies, or home treatments.  
4. Lifestyle and Prevention Tips: Give daily habits, diet, and care advice to prevent or reduce symptoms.  
5. When to See a Doctor: Mention conditions where professional help or prescription treatment is necessary.  

Keep the response patient-friendly, concise, and in plain language. Do not say you are an AI. Start directly with the medical response as if speaking to a patient."""

# Main processing function
def process_all(audio_filepath, image_filepath, text_input, sensitivity=60):
    # Speech-to-text
    if audio_filepath:
        try:
            speech_to_text_output = transcribe_with_groq(
                GROQ_API_KEY=os.environ.get("GROQ_API_KEY"),
                audio_filepath=audio_filepath,
                stt_model="whisper-large-v3"
            )
        except Exception as e:
            speech_to_text_output = f"[transcription error] {e}"
    else:
        speech_to_text_output = (text_input or "").strip() or "No text provided."

    # Image analysis
    if image_filepath:
        try:
            encoded = encode_image(image_filepath)
            doctor_response = analyze_image_with_query(
                query=system_prompt + " " + speech_to_text_output,
                encoded_image=encoded,
                model="meta-llama/llama-4-scout-17b-16e-instruct"
            )
        except Exception as e:
            doctor_response = f"[image analysis error] {e}"
    else:
        doctor_response = "No image provided for me to analyze. " + (speech_to_text_output or "")

    # Text-to-speech (Doctor’s voice)
    try:
        voice_of_doctor = text_to_speech_with_elevenlabs(
            input_text=doctor_response, output_filepath="final.mp3"
        )
    except Exception:
        voice_of_doctor = text_to_speech_with_gtts(
            input_text=doctor_response, output_filepath="final.mp3"
        )

    return speech_to_text_output, doctor_response, voice_of_doctor


# Custom CSS for Gradio
custom_css = """
#header_row {margin-bottom: 20px;}
.logo {font-size: 28px; font-weight: bold; color: #4A90E2;}
.title {font-weight: 700;}
.subtitle {font-size: 14px; color: #666;}
"""

# Gradio UI
with gr.Blocks(css=custom_css, title="AI_MEDICAL_CHATBOT — Vision & Voice") as demo:
    # Header
    with gr.Row(elem_id="header_row"):
        with gr.Column(scale=1):
            gr.HTML("<div class='logo'>AI</div>")
        with gr.Column(scale=7):
            gr.Markdown(
                "<h2 class='title' style='margin:0'>AI_MEDICAL_CHATBOT</h2>"
                "<p class='subtitle' style='margin:0'>Vision + Voice clinical assistant — fast, concise guidance</p>"
            )
        with gr.Column(scale=2):
            gr.Markdown(
                "<div style='text-align:right'><small style='color:var(--muted)'>Need keys? see README</small></div>"
            )

    # Main area
    with gr.Row():
        # Left controls & input card
        with gr.Column(scale=6):
            with gr.Group(elem_id="input_card", visible=True):
                gr.Markdown("### Upload & Inputs")
                with gr.Row():
                    image_in = gr.Image(type="filepath", label="Chest X-ray / Image", interactive=True)
                text_in = gr.Textbox(
                    lines=4,
                    label="Clinical notes / Patient text (optional)",
                    placeholder="Describe symptoms, history, or paste transcribed text here"
                )
                audio_in = gr.Audio(
                    sources=["microphone"], type="filepath", label="Record patient audio (optional)"
                )
                with gr.Row(elem_id="controls", variant="compact"):
                    run_btn = gr.Button("Analyze", elem_id="run-btn", variant="primary")
                    clear_btn = gr.Button("Clear")

                gr.Markdown(
                    "#### Tips\n"
                    "• Provide a clear chest x-ray image for better analysis.\n"
                    "• Use the audio recorder to capture patient history when needed."
                )

        # Right results card
        with gr.Column(scale=5):
            gr.Markdown("### Results")
            with gr.Group(elem_id="result_card"):
                stt_out = gr.Textbox(label="Speech → Text", interactive=False)
                doctor_out = gr.Textbox(label="Doctor's Response", interactive=False, lines=6)
                audio_out = gr.Audio(label="Doctor's Voice (playback)")
                with gr.Accordion("Full Logs / Debug (expand if needed)", open=False):
                    debug_out = gr.Textbox(label="Debug output", interactive=False)

    # Status HTML
    status_html = gr.HTML("<div style='color:var(--muted); font-size:13px'>Status: Ready</div>")

    # Run handler
    def run_click(audio, image, text):
        stt, resp, audio_path = process_all(audio, image, text)
        debug = f"audio={audio}\nimage={image}\ntext={text}\noutput_audio={audio_path}"
        return stt, resp, audio_path, debug, "<div style='color:var(--muted); font-size:13px'>Status: Ready</div>"

    run_btn.click(
        fn=run_click,
        inputs=[audio_in, image_in, text_in],
        outputs=[stt_out, doctor_out, audio_out, debug_out, status_html]
    )

    clear_btn.click(
        lambda: (None, "", "", None, ""),
        outputs=[image_in, text_in, stt_out, doctor_out, audio_out]
    )

# Launch app
if __name__ == "__main__":
    demo.launch()
