FROM node:20-slim

# Option A (default): Gemini CLI — free tier, no credit card, 1000 req/day
RUN npm install -g @google/gemini-cli

# Option B: OpenCode CLI (agar dusra coding agent bhi chahiye baad mein) —
# upar wali line ke saath yeh bhi add kar sakte ho (dono ek sath rakh sakte ho):
# RUN npm install -g opencode-ai

# Python + Flask wrapper ke liye
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip3 install --break-system-packages -r requirements.txt

COPY agent_wrapper_server.py .

# OpenCode Zen ki API key Railway Variables se aayegi (auth.json ki zaroorat nahi container mein)
ENV OPENCODE_API_KEY=""

# Agar Gemini CLI use kar rahe ho: server/Railway par browser-login kaam nahi karega,
# isliye GOOGLE_API_KEY env var use karna zaroori hai (Google AI Studio se free milti hai, bina card ke)
ENV GOOGLE_API_KEY=""

EXPOSE 5000
CMD ["gunicorn", "agent_wrapper_server:app", "--bind", "0.0.0.0:5000"]
