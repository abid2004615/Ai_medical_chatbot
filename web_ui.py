import json
import os
import sys
import gradio as gr

config_path = os.path.join(os.path.dirname(__file__), "ui.json")
if not os.path.exists(config_path):
    print(f"Config file not found: {config_path}")
    sys.exit(1)

with open(config_path, "r", encoding="utf-8") as f:
    content = f.read()

if not content.strip():
    print(f"Config file is empty: {config_path}")
    sys.exit(1)

try:
    ui = json.loads(content)["dashboard"]
except json.JSONDecodeError as e:
    print(f"Invalid JSON in {config_path}: {e}")
    print("Tip: run: python -m json.tool " + config_path + " to find/format the error.")
    sys.exit(1)
except KeyError:
    print(f"'dashboard' key not found in {config_path}")
    sys.exit(1)

# Remove unwanted UI sections so launch won't create vitals/sensitivity/billing widgets
for drop_key in ("patient_vitals", "vitals", "model_sensitivity", "sensitivity", "billing", "billing_info"):
    if drop_key in ui:
        ui.pop(drop_key, None)

# Also remove these keys from nested settings if present
if isinstance(ui.get("settings"), dict):
    for k in ("sensitivity", "model_sensitivity", "billing", "patient_vitals", "vitals"):
        ui["settings"].pop(k, None)

# -------------------------
# Helper Functions
# -------------------------
def reset_cache():
    return "✅ Cache cleared!"

def toggle_contrast(enabled):
    return "High Contrast Mode: ON" if enabled else "High Contrast Mode: OFF"

def download_report():
    # In real app: generate a patient report dynamically (PDF)
    sample_path = "patient_report.pdf"
    with open(sample_path, "w") as f:
        f.write("Patient Report - HealthAI\n\nAI Analysis + Doctor Notes...")
    return sample_path

# Patient Records Table
patients_data = [
    {"Patient ID": "P001", "Name": "John Doe", "Age": 45, "Condition": "Hypertension", "Last Visit": "2025-09-01"},
    {"Patient ID": "P002", "Name": "Jane Smith", "Age": 52, "Condition": "Diabetes", "Last Visit": "2025-08-20"},
    {"Patient ID": "P003", "Name": "Alex Lee", "Age": 33, "Condition": "Asthma", "Last Visit": "2025-09-03"},
    {"Patient ID": "P004", "Name": "Mary Johnson", "Age": 60, "Condition": "Cardiac Checkup", "Last Visit": "2025-08-28"},
    {"Patient ID": "P005", "Name": "David Kim", "Age": 29, "Condition": "Skin Rash", "Last Visit": "2025-09-05"},
]

def search_patients(query):
    if not query:
        return patients_data
    return [patient for patient in patients_data if query.lower() in str(patient.values()).lower()]

# -------------------------
# Build Gradio UI
# -------------------------
with gr.Blocks(title=ui["pageTitle"], theme=gr.themes.Soft()) as demo:

    # ---------- HEADER ----------
    with gr.Row():
        gr.HTML(f"<h2 style='margin:0'>🩺 {ui.get('header',{}).get('mainTitle','AI_MEDICAL_CHATBOT')}</h2>")
        search = gr.Textbox(placeholder="Search patients...", scale=2)
        notif = gr.Button(f"🔔 Notifications ({ui['header']['userProfile']['notifications']})", scale=1)

    with gr.Row():
        # ---------- SIDEBAR ----------
        with gr.Column(scale=1):
            gr.Markdown(f"### {ui['sidebar']['brand']}")
            for item in ui["sidebar"]["nav"]:
                icon = "📊" if item["id"] == "dashboard" else \
                       "👤" if item["id"] == "patients" else \
                       "📑" if item["id"] == "reports" else \
                       "💳"
                label = f"{icon} {'👉 ' if item['active'] else ''}{item['text']}"
                gr.Button(label)

        # ---------- MAIN CONTENT ----------
        with gr.Column(scale=3):
            gr.Markdown(f"### {ui['mainContent']['title']}")

            # Left Column Content
            with gr.Row():
                with gr.Column():
                    for section in ui["mainContent"]["columns"][0]["sections"]:
                        gr.Markdown(f"#### {section['title']}")
                        for comp in section["components"]:
                            if comp["type"] == "fileUploader":
                                gr.File(label=comp["label"], file_types=comp["fileTypes"])
                            elif comp["type"] == "textArea":
                                gr.Textbox(label=comp["label"], placeholder=comp["placeholder"], lines=5)
                            elif comp["type"] == "audioRecorder":
                                gr.Audio(sources=["microphone"], label=comp["label"])
                            elif comp["type"] == "textBlock":
                                gr.Textbox(label=comp["title"], value=comp["content"], interactive=False)
                            elif comp["type"] == "button" and comp["action"] == "download":
                                download_btn = gr.Button(comp["text"])
                                file_out = gr.File(label="Download Patient Report")
                                download_btn.click(download_report, outputs=file_out)

            # Add Patient Records Table
            gr.Markdown("#### Patient Records")
            table = gr.DataFrame(value=patients_data, interactive=False)
            search.change(search_patients, inputs=search, outputs=table)

        # ---------- RIGHT COLUMN ----------
        with gr.Column(scale=1):
            for section in ui["mainContent"]["columns"][1]["sections"]:
                gr.Markdown(f"#### {section['title']}")
                for comp in section["components"]:
                    if comp["type"] == "toggle":
                        contrast = gr.Checkbox(label=comp["label"], value=comp["enabled"])
                        contrast_output = gr.Textbox(label="Mode Status")
                        contrast.change(toggle_contrast, inputs=contrast, outputs=contrast_output)
                    elif comp["type"] == "button" and comp["action"] == "reset":
                        reset_btn = gr.Button(comp["text"])
                        reset_output = gr.Textbox(label="Cache Status")
                        reset_btn.click(reset_cache, outputs=reset_output)
                    elif comp["type"] == "slider":
                        gr.Slider(0, 100, value=comp["value"], label=comp["label"])

# -------------------------
# Run App
# -------------------------
if __name__ == "__main__":
    demo.launch()
