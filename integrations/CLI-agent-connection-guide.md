# CLI Agent + n8n Connection Guide

## Kya banaya gaya hai

`agent-wrapper-server.py` — yeh tumhare CLI coding agent (jaise `opencode`) ko ek HTTP API mein badal deta hai, taake n8n usse baat kar sake (kyunki n8n sirf HTTP calls kar sakta hai, CLI commands direct nahi chala sakta).

---

## Confirmed: OpenCode ka asli command

Maine OpenCode ki official documentation check ki — yeh confirm ho gaya:

```bash
opencode run "yahan tumhari request/prompt"
```

Yeh **bina interactive TUI khole** seedha jawab print karke exit ho jata hai — bilkul scripting/automation ke liye design kiya gaya hai. Wrapper script mein yeh already set kar diya hai.

### Ek zaroori setting: model specify karna
OpenCode multiple AI providers support karta hai. Agar zaroorat pade, command mein model bhi daal sakte ho:
```bash
opencode run --model anthropic/claude-sonnet-4-5 "yahan prompt"
```
Agar tumne pehle se `opencode auth login` se default model set kiya hai, to `--model` flag zaroori nahi.

### Faster option (agar speed chahiye): `opencode serve`
Har request par OpenCode dobara start hone mein thoda time lagta hai (cold start). Agar bahut zyada requests aane wali hain, ek behtar tareeka:
```bash
# Ek terminal mein hamesha chalta rakho:
opencode serve

# Phir har request isse "attach" ho ke jaye (tez hoti hai):
opencode run --attach http://localhost:4096 "prompt"
```
Abhi MVP ke liye simple `opencode run` hi kaafi hai — baad mein zaroorat pade to `serve` mode try karna.

---

## Ab tumhare paas 2 agent options hain

| | OpenCode Zen | Gemini CLI |
|---|---|---|
| Free tier | Model-dependent, paid credits chahiye | 1,000 requests/day, bilkul free |
| Card chahiye | Nahi (jo tum kar rahe ho) | Nahi |
| Setup complexity | auth.json file banani padi | Zyada aasan — API key ya Google login |
| Server/Railway par | Auth.json copy karna padega | GOOGLE_API_KEY env var (aasan) |

**Local laptop testing ke liye:** `gemini` command se Google login kar sakte ho (browser khulega)
**Railway/server ke liye:** Google AI Studio (aistudio.google.com) se **free API key** lo (card nahi chahiye), aur `GOOGLE_API_KEY` environment variable mein daal do

### Gemini CLI Setup (agar switch karna ho)

```bash
npm install -g @google/gemini-cli
gemini -p "test message"
```

Wrapper script (`agent_wrapper_server.py`) aur `Dockerfile` dono mein already **comment kiya hua option** hai — bas ek line uncomment karni hai OpenCode ki jagah Gemini use karne ke liye. Dono files mein "Option B" / "ALTERNATIVE: Gemini CLI" dhoondo.

---

## Setup Steps (OpenCode ke liye, jaisa abhi chal raha hai) (updated)

### Step 1: Flask install karo
```bash
pip install flask
```

### Step 2: Command already sahi set hai
`agent-wrapper-server.py` mein command already confirm ho chuka hai (`opencode run {prompt}`) — koi badlaव ki zaroorat nahi, seedha Step 3 par jao.

### Step 3: Server chalao
```bash
python agent-wrapper-server.py
```
Terminal mein yeh dikhega:
```
Agent Wrapper Server starting...
Test URL: http://localhost:5000/health
```

### Step 4: Test karo (browser ya curl se)
Browser mein kholo: `http://localhost:5000/health`
Response aana chahiye: `{"status": "running"}`

### Step 5: n8n se connect karo

**Agar n8n Docker mein hai** (jaisa tumhara hai):
1. Workflow 20 (`20-automation-factory-request-handler.json`) kholo n8n mein
2. Node **"Coding Agent: Generate New Workflow"** par jao
3. Uska URL badal do (abhi OpenAI API hai) → apne wrapper server ke URL se:
```
http://host.docker.internal:5000/generate
```
4. Body mein `requirement_text` field pass hoga (already set hai node mein)

**Agar n8n bhi laptop par directly hai (Docker nahi):**
```
http://localhost:5000/generate
```

---

## Test karne ka tareeka (poora connection)

Terminal mein yeh curl command chalao (jaise customer request simulate karo):
```bash
curl -X POST http://localhost:5000/generate -H "Content-Type: application/json" -d "{\"requirement_text\": \"Mujhe ek automation chahiye jo restaurant ke liye table booking handle kare\"}"
```

Agar response mein tumhare agent ka output aaye, matlab wrapper server sahi kaam kar raha hai. Phir n8n se test karo (Workflow 20 ko "Execute workflow" se chalao dummy webhook data ke sath).

---

## Common Issues

| Problem | Fix |
|---|---|
| `host.docker.internal` kaam nahi kar raha | Docker Desktop settings mein check karo "Enable host networking" on hai ya nahi |
| Agent ka command output JSON nahi hai (plain text hai) | Workflow 20 ke "Validate Generated JSON" node ko update karna hoga taake plain text ko bhi handle kare |
| Timeout error aa raha hai | Script mein `timeout=120` ko badha do (jaise 300 seconds) agar agent slow hai |
| Permission denied | Terminal mein script ko admin/sudo se chalane ki zaroorat pad sakti hai, ya CLI tool ka path check karo |

---

## Agla Step

Apna exact CLI command bata do, main `agent-wrapper-server.py` ko usi hisaab se final kar deta hoon, taake copy-paste karke seedha chalao.
