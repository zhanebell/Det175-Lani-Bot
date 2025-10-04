"""
Lani Bot Backend - Stateless Flask API for Detachment 175 Chatbot
Proxies requests to Groq API with gpt-oss-120b model
"""

import os
import json
import time
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from collections import defaultdict
from functools import wraps

from flask import Flask, request, Response, jsonify, stream_with_context
from flask_cors import CORS
import requests
from werkzeug.exceptions import TooManyRequests, BadRequest, Unauthorized

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "20"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "300"))  # 5 minutes
TURNSTILE_SECRET = os.getenv("TURNSTILE_SECRET", "")
MAX_CONTEXT_TOKENS = 16000  # Target context limit
MAX_OUTPUT_TOKENS = 1024

# Enable CORS with strict origin checking
CORS(app, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "X-Turnstile-Token"],
        "max_age": 3600
    }
})

# Rate limiting storage (in-memory, per IP)
rate_limit_store: Dict[str, List[float]] = defaultdict(list)


def get_client_ip() -> str:
    """Extract client IP from request headers (considering proxies)"""
    if request.headers.get("X-Forwarded-For"):
        return request.headers.get("X-Forwarded-For").split(",")[0].strip()
    return request.remote_addr or "unknown"


def check_rate_limit(ip: str) -> bool:
    """Check if IP has exceeded rate limit"""
    now = time.time()
    # Clean old entries
    rate_limit_store[ip] = [t for t in rate_limit_store[ip] if now - t < RATE_LIMIT_WINDOW]
    
    if len(rate_limit_store[ip]) >= RATE_LIMIT_REQUESTS:
        return False
    
    rate_limit_store[ip].append(now)
    return True


def verify_turnstile_token(token: str) -> bool:
    """Verify Cloudflare Turnstile token"""
    if not TURNSTILE_SECRET or TURNSTILE_SECRET == "test-secret":
        logger.warning("Turnstile verification skipped (no secret configured)")
        return True
    
    try:
        response = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            json={"secret": TURNSTILE_SECRET, "response": token},
            timeout=5
        )
        result = response.json()
        return result.get("success", False)
    except Exception as e:
        logger.error(f"Turnstile verification error: {e}")
        return False


def rate_limit_required(f):
    """Decorator to enforce rate limiting"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip = get_client_ip()
        if not check_rate_limit(ip):
            logger.warning(f"Rate limit exceeded for IP: {ip}")
            raise TooManyRequests("Too many requests. Please try again later.")
        return f(*args, **kwargs)
    return decorated_function


def load_llab_content(llab_numbers: List[int]) -> str:
    """Load and concatenate LLAB text files"""
    # Try Docker path first, then local development path
    docker_path = Path("/app/Data/LLAB Data")
    local_path = Path(__file__).parent.parent / "Data" / "LLAB Data"
    base_path = docker_path if docker_path.exists() else local_path
    content_parts = []
    
    for num in llab_numbers:
        file_path = base_path / f"LLAB{num}.txt"
        try:
            if file_path.exists():
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    content_parts.append(content)
                    logger.info(f"Loaded LLAB{num}.txt ({len(content)} chars)")
        except Exception as e:
            logger.error(f"Error loading LLAB{num}.txt: {e}")
    
    return "\n\n---\n\n".join(content_parts)


def load_static_questions(llab_numbers: List[int]) -> Dict[str, List[Dict]]:
    """Load static questions filtered by LLAB numbers"""
    # Try Docker path first, then local development path
    docker_path = Path("/app/Data/Static Questions")
    local_path = Path(__file__).parent.parent / "Data" / "Static Questions"
    base_path = docker_path if docker_path.exists() else local_path
    questions = {"aircraft": [], "ranks": []}
    
    # Load aircraft questions
    try:
        with open(base_path / "aircraftQuestions.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            for section in data.get("aircraft", []):
                if section.get("llab") in llab_numbers:
                    questions["aircraft"].extend(section.get("questions", []))
    except Exception as e:
        logger.error(f"Error loading aircraft questions: {e}")
    
    # Load rank questions
    try:
        with open(base_path / "rankQuestions.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            for category in ["cadetRanks", "enlistedRanks", "officerRanks"]:
                for section in data.get(category, []):
                    if section.get("llab") in llab_numbers:
                        questions["ranks"].extend(section.get("questions", []))
    except Exception as e:
        logger.error(f"Error loading rank questions: {e}")
    
    return questions


def build_system_prompt(llab_numbers: List[int], quiz_mode: str) -> str:
    """Build dynamic system prompt based on selected LLABs and quiz mode"""
    llab_content = load_llab_content(llab_numbers)
    
    prompt = f"""You are Lani Bot, an intelligent study assistant for Detachment 175 cadets preparing for Warrior Knowledge and General Cadet Knowledge assessments.

**Your Role:**
- Help cadets study and test their knowledge on the selected LLAB topics
- Ask quiz questions based on the provided LLAB content
- Provide clear, accurate explanations when cadets answer incorrectly
- Be encouraging, professional, and helpful
- Stay focused on Det 175/Air Force topics only

**Quiz Mode:** {quiz_mode}

**LLAB Topics Selected:** {', '.join(f'LLAB {n}' for n in llab_numbers)}

**Important Guidelines:**
1. Generate questions directly from the LLAB content below
2. For multiple choice questions, provide 4 options (A, B, C, D)
3. After the cadet answers, confirm if correct and explain the answer
4. If the cadet asks to focus on different LLABs, politely inform them to reload the page
5. Keep responses concise and focused
6. Do not make up information - only use the provided LLAB content

**LLAB Content:**
{llab_content}

Begin by greeting the cadet and asking if they're ready for their first question."""
    
    return prompt


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"ok": True, "service": "lani-bot-api"}), 200


@app.route("/chat", methods=["POST"])
@rate_limit_required
def chat():
    """
    Main chat endpoint - streams responses from Groq API
    Expects: {
        "messages": [...],
        "llab_numbers": [1, 2, 3],
        "quiz_mode": "mixed|static_only|ai_only",
        "turnstile_token": "..."
    }
    """
    if not GROQ_API_KEY:
        logger.error("GROQ_API_KEY not configured")
        return jsonify({"error": "Server configuration error"}), 500
    
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            raise BadRequest("No JSON data provided")
        
        messages = data.get("messages", [])
        llab_numbers = data.get("llab_numbers", [])
        quiz_mode = data.get("quiz_mode", "mixed")
        turnstile_token = data.get("turnstile_token") or request.headers.get("X-Turnstile-Token")
        
        if not messages:
            raise BadRequest("Messages array is required")
        
        if not llab_numbers:
            raise BadRequest("At least one LLAB must be selected")
        
        # Verify Turnstile token
        if not verify_turnstile_token(turnstile_token):
            raise Unauthorized("Invalid Turnstile token")
        
        # Build system prompt if not already in messages
        if not messages or messages[0].get("role") != "system":
            system_prompt = build_system_prompt(llab_numbers, quiz_mode)
            messages = [{"role": "system", "content": system_prompt}] + messages
        
        # Prepare Groq API request
        groq_payload = {
            "model": "openai/gpt-oss-120b",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": MAX_OUTPUT_TOKENS,
            "stream": True
        }
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        logger.info(f"Sending request to Groq API (LLABs: {llab_numbers}, mode: {quiz_mode})")
        
        # Stream response from Groq
        def generate():
            try:
                with requests.post(
                    f"{GROQ_BASE_URL}/chat/completions",
                    json=groq_payload,
                    headers=headers,
                    stream=True,
                    timeout=60
                ) as groq_response:
                    
                    if groq_response.status_code != 200:
                        error_text = groq_response.text
                        logger.error(f"Groq API error: {groq_response.status_code} - {error_text}")
                        yield f"data: {json.dumps({'error': 'AI service error'})}\n\n"
                        return
                    
                    for line in groq_response.iter_lines():
                        if line:
                            line_text = line.decode("utf-8")
                            if line_text.startswith("data: "):
                                data_content = line_text[6:]
                                if data_content.strip() == "[DONE]":
                                    yield "data: [DONE]\n\n"
                                    break
                                # Forward Groq's SSE format directly (already has "data: " prefix)
                                yield f"{line_text}\n\n"
            
            except requests.exceptions.Timeout:
                logger.error("Groq API timeout")
                yield f"data: {json.dumps({'error': 'Request timeout'})}\n\n"
            except Exception as e:
                logger.error(f"Streaming error: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return Response(
            stream_with_context(generate()),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no"
            }
        )
    
    except (BadRequest, Unauthorized, TooManyRequests) as e:
        return jsonify({"error": str(e)}), e.code
    except Exception as e:
        logger.error(f"Unexpected error in /chat: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/static-question", methods=["POST"])
@rate_limit_required
def get_static_question():
    """
    Endpoint to fetch a random static question
    Expects: { "llab_numbers": [1, 2, 3] }
    """
    try:
        data = request.get_json()
        llab_numbers = data.get("llab_numbers", [])
        
        if not llab_numbers:
            raise BadRequest("At least one LLAB must be selected")
        
        questions = load_static_questions(llab_numbers)
        all_questions = questions["aircraft"] + questions["ranks"]
        
        if not all_questions:
            return jsonify({"question": None}), 200
        
        # Return random question
        import random
        question = random.choice(all_questions)
        
        return jsonify({"question": question}), 200
    
    except BadRequest as e:
        return jsonify({"error": str(e)}), e.code
    except Exception as e:
        logger.error(f"Error in /static-question: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Internal error: {e}")
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    app.run(host="0.0.0.0", port=port, debug=False)
