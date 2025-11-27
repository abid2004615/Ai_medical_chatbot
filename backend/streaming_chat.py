"""
Production-ready streaming chat backend for MediChat
Integrates with existing database, safety features, and medical context
"""
import os
import asyncio
import json
from typing import List, Optional, AsyncGenerator
from datetime import datetime

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import AsyncGroq
from dotenv import load_dotenv

# Import existing MediChat modules
from database import db
from safety_guardrails import check_safety
from emergency_detection import detect_emergency
from system_prompt import get_system_prompt
from session_memory import session_manager

load_dotenv()

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = "meta-llama/llama-4-scout-17b-16e-instruct"

# FastAPI app
app = FastAPI(title="MediChat Streaming API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatStreamRequest(BaseModel):
    user_id: str
    session_id: str
    message: str
    include_context: bool = True

class ChatMessage(BaseModel):
    role: str
    content: str

# Rate limiting (simple in-memory)
_rate_limits = {}

async def check_rate_limit(user_id: str, max_requests: int = 30, window_seconds: int = 60) -> bool:
    """Simple rate limiting"""
    now = datetime.now().timestamp()
    
    if user_id not in _rate_limits:
        _rate_limits[user_id] = []
    
    # Clean old requests
    _rate_limits[user_id] = [t for t in _rate_limits[user_id] if now - t < window_seconds]
    
    if len(_rate_limits[user_id]) >= max_requests:
        return False
    
    _rate_limits[user_id].append(now)
    return True

async def stream_groq_response(messages: List[dict]) -> AsyncGenerator[str, None]:
    """
    Stream response from Groq API
    Yields Server-Sent Events (SSE) formatted chunks
    """
    client = AsyncGroq(api_key=GROQ_API_KEY)
    
    try:
        stream = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            max_tokens=512,
            temperature=0.15,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta
                if delta.content:
                    # Format as SSE
                    yield f"data: {json.dumps({'content': delta.content})}\n\n"
        
        # Send completion signal
        yield f"data: {json.dumps({'done': True})}\n\n"
        
    except Exception as e:
        error_msg = f"Error streaming response: {str(e)}"
        yield f"data: {json.dumps({'error': error_msg})}\n\n"

def build_medical_context(session_id: str, user_message: str) -> str:
    """Build context from session history and medical knowledge"""
    # Get session history
    history = db.get_session_history(session_id, limit=10)
    
    # Get session memory (past symptoms, diagnoses)
    session_memory = db.get_session_memory(session_id)
    
    # Build context string
    context = ""
    
    # Add session memory if available
    if session_memory.get('has_history'):
        context += "\n\nPATIENT HISTORY:\n"
        
        if session_memory.get('past_symptoms'):
            context += "Previous Symptoms:\n"
            for symptom in session_memory['past_symptoms'][:3]:
                context += f"  • {symptom['symptom']}"
                if symptom.get('severity'):
                    context += f" ({symptom['severity']})"
                context += "\n"
        
        if session_memory.get('past_diagnoses'):
            context += "\nPrevious Diagnoses:\n"
            for diagnosis in session_memory['past_diagnoses'][:2]:
                summary = diagnosis['summary']
                if 'Condition:' in summary:
                    condition = summary.split('Condition:')[1].split('\n')[0].strip()
                    context += f"  • {condition}\n"
    
    # Add recent conversation
    context += "\n\nRECENT CONVERSATION:\n"
    for msg in history[-5:]:
        role = "Patient" if msg['role'] == 'user' else "You"
        context += f"{role}: {msg['content']}\n"
    
    # Add current message
    context += f"Patient: {user_message}\n"
    
    return context

@app.post("/api/chat/stream")
async def chat_stream(request: ChatStreamRequest):
    """
    Streaming chat endpoint
    Returns Server-Sent Events (SSE) stream
    """
    # Rate limiting
    if not await check_rate_limit(request.user_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    # Safety checks
    emergency_check = detect_emergency(request.message)
    if emergency_check['is_emergency']:
        # Return emergency response immediately (non-streaming)
        db.save_message(request.session_id, 'user', request.message, 'text', None)
        db.save_message(request.session_id, 'assistant', emergency_check['message'], None, None)
        
        async def emergency_stream():
            yield f"data: {json.dumps({'content': emergency_check['message'], 'is_emergency': True})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        
        return StreamingResponse(emergency_stream(), media_type="text/event-stream")
    
    safety_check = check_safety(request.message)
    if not safety_check['safe']:
        db.save_message(request.session_id, 'user', request.message, 'text', None)
        db.save_message(request.session_id, 'assistant', safety_check['message'], None, None)
        
        async def safety_stream():
            yield f"data: {json.dumps({'content': safety_check['message'], 'safety_warning': True})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        
        return StreamingResponse(safety_stream(), media_type="text/event-stream")
    
    # Save user message
    db.create_session(request.session_id)
    db.save_message(request.session_id, 'user', request.message, 'text', None)
    
    # Build context
    if request.include_context:
        context = build_medical_context(request.session_id, request.message)
    else:
        context = request.message
    
    # Build messages for AI
    system_prompt = get_system_prompt()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": context}
    ]
    
    # Stream response and collect for saving
    collected_response = []
    
    async def response_stream():
        async for chunk in stream_groq_response(messages):
            collected_response.append(chunk)
            yield chunk
        
        # Save complete response to database
        if collected_response:
            # Extract content from SSE chunks
            full_response = ""
            for chunk in collected_response:
                if chunk.startswith("data: "):
                    try:
                        data = json.loads(chunk[6:])
                        if 'content' in data:
                            full_response += data['content']
                    except:
                        pass
            
            if full_response:
                db.save_message(request.session_id, 'assistant', full_response, None, None)
    
    return StreamingResponse(response_stream(), media_type="text/event-stream")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "MediChat Streaming API"}

@app.post("/api/chat/history")
async def get_chat_history(request: Request):
    """Get chat history for a session"""
    data = await request.json()
    session_id = data.get('session_id')
    limit = data.get('limit', 50)
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    history = db.get_session_history(session_id, limit=limit)
    return {"history": history}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
