# Final Deployment Guide — GitHub → Railway (2 Services) → Supabase → Website

Yeh guide poore production architecture ko step-by-step deploy karta hai, jaisa plan kiya gaya:

```
GitHub → Railway (n8n + OpenCode Wrapper) → Supabase → Website
```

---

## Step 1: GitHub par upload karo

1. github.com par account banao (agar nahi hai)
2. Naya repository banao: **`AI-Automation-Platform`** (Private rakhna behtar hai, secrets ke liye)
3. Apne computer se yeh commands chalao (is poore folder ke andar se, terminal mein):

```bash
cd AI-Real-Estate-Sales-Employee-v3.0
git init
git add .
git commit -m "Initial upload - AI Automation Platform"
git branch -M main
git remote add origin https://github.com/<tumhara-username>/AI-Automation-Platform.git
git push -u origin main
```

**Zaroori:** `.gitignore` file already bana di gayi hai — yeh `auth.json` aur `.env` files ko GitHub par jaane se rokegi (security ke liye).

---

## Step 2 & 3: Railway account + New Project

Jaisa pehle bataya — railway.app par GitHub se login karo, "New Project" banao.

---

## Step 4: n8n Service Deploy Karo

**Do tareeke hain — dono theek hain:**

### Option A: Railway ka official n8n template use karo (aasan)
1. New Project → **"Deploy a Template"** → search karo `n8n`
2. Official n8n template select karo → Deploy
3. Yeh automatically Postgres bhi attach kar dega Railway ke andar (agar chaho to)

### Option B: Docker Image se (jaisa humne pehle discuss kiya, Supabase ke saath)
1. New Project → "Deploy from Docker Image" → `n8nio/n8n`
2. Environment variables manually daalo (Supabase ke saath — pehle wali guide mein hai)

**Meri recommendation:** Option B use karo agar tum Supabase ko hi single source of truth rakhna chahte ho (jaisa humne plan kiya tha) — data ek hi jagah rahega, confusion nahi hoga.

---

## Step 5: Environment Variables (n8n service ke liye)

```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=<supabase-host>
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=<supabase-user>
DB_POSTGRESDB_PASSWORD=<supabase-password>
N8N_ENCRYPTION_KEY=<random-32-char-string>
WEBHOOK_URL=<railway domain, Step 6 ke baad milega>
N8N_HOST=<railway domain, bina https:// ke>
N8N_PROTOCOL=https
N8N_PORT=5678
```

---

## Step 6: Public Domain generate karo (n8n service ke liye)
Settings → Networking → "Generate Domain" → URL milega, wapas jaake `WEBHOOK_URL` aur `N8N_HOST` update karo.

---

## Step 7: OpenCode Wrapper — Doosri Railway Service

Same project mein **"+ New" → "GitHub Repo"** select karo (wahi repo jo Step 1 mein banaya), lekin **Root Directory** set karo:
```
integrations/
```
Railway automatically `Dockerfile` dhoond kar use karega (jo already `integrations/` folder mein hai).

**Environment Variables (is service ke liye):**
```
OPENCODE_API_KEY=<tumhari-opencode-zen-key>
```

Public domain yahan bhi generate karo — yeh URL n8n ke Workflow 20 mein "Coding Agent" node mein daalna hoga (localhost/host.docker.internal ki jagah, ab dono Railway par hain to seedha internal Railway networking bhi use ho sakta hai, ya public URL).

---

## Step 8: Supabase Connect (already ho chuka hai upar)

Dono services (n8n + Wrapper) same Supabase project use kar rahe hain — yeh already Step 5 mein set ho gaya.

---

## Step 9: Saari Workflows Import Karo (order mein)

n8n ke naye Railway URL par jaake:
```
00-master-controller.json
01-lead-capture-qualification-scoring.json
02-property-matching.json
03-followup-automation.json
04-calendar-appointment-booking.json
05-deal-pipeline-crm.json
06-agent-assignment.json
07-notifications-service.json
08-crm-manager.json
09-customer-support.json
10-knowledge-base-sync.json
20-automation-factory-request-handler.json
21-approve-and-save-template.json
```
Har ek mein credentials lagao (OpenAI, Gmail, Supabase, n8n API key), test karo, phir **Activate** karo.

---

## Step 10: Website Connect Karo

Jahan bhi tumhari website ban rahi hai (Emergent ho ya koi aur), yeh 2 URLs use karni hain:

| Kaam | URL |
|---|---|
| Customer chat/lead intake | `https://<n8n-railway-domain>/webhook/lead-intake` |
| Custom automation request form | `https://<n8n-railway-domain>/webhook/automation-request` |

---

## Final Checklist Before Launch

- [ ] GitHub repo bana aur push ho gaya
- [ ] n8n Railway par deploy + Supabase se connected
- [ ] OpenCode Wrapper Railway par deploy + working
- [ ] Saari 13 workflows imported + credentials lagi + tested
- [ ] Website ke dono forms n8n URLs se connected
- [ ] Ek end-to-end test kiya (website se real message bheja, poora flow chala)

Jab yeh sab ✅ ho jaye — **agency live hai.**
