# Hugging Face Spaces — Free n8n Deployment Guide

## Zaroori samajhna (limitations, honestly)

✅ **Free hai, koi credit card nahi chahiye**
✅ **Docker support hai**
⚠️ **Free tier Space "sleep" ho sakta hai** lambi inactivity ke baad — pehli request thodi slow ho sakti hai (Space "jaagne" mein 10-30 seconds lag sakte hain)
⚠️ **Storage ephemeral hai** — isiliye humne database ko Supabase Postgres se connect kiya hai (is guide mein), taake workflows/credentials safe rahein chahe Space restart ho

Yeh **free launch ke liye theek hai**, lekin jaise hi paisa aana shuru ho, VPS (jaisa pehle discuss kiya) par move karna better hoga reliability ke liye.

---

## Setup Steps

### Step 1: Supabase Postgres details lo
Supabase Dashboard → Project Settings → Database → yeh 5 values copy karo:
- Host
- Database name (usually `postgres`)
- Port (usually `5432`)
- User
- Password

### Step 2: Hugging Face Space banao
1. huggingface.co par sign up karo
2. "+ New" → "Space"
3. SDK: **Docker**
4. Hardware: **CPU Basic (Free)**
5. Space create karo

### Step 3: Dockerfile upload karo
Is folder ka `Dockerfile` Space ke "Files" tab mein upload karo (ya copy-paste karke naya file banao).

### Step 4: Secrets add karo
Space ke **Settings → Variables and secrets → New secret** mein yeh sab ek-ek karke add karo:

```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=<supabase-host>
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=<supabase-user>
DB_POSTGRESDB_PASSWORD=<supabase-password>
N8N_ENCRYPTION_KEY=<koi-bhi-random-32-character-string-banao-aur-yaad-rakho>
WEBHOOK_URL=https://<tumhara-username>-<space-name>.hf.space/
N8N_HOST=<tumhara-username>-<space-name>.hf.space
N8N_PROTOCOL=https
```

**N8N_ENCRYPTION_KEY zaroori hai** — isko generate karne ke liye kisi bhi random string generator se 32 characters bana lo, aur isko **kahin safe save karo** (agar yeh change ho gayi, saari saved credentials permanently corrupt ho jayengi).

### Step 5: Space ko rebuild/restart karo
Secrets add karne ke baad Space automatically rebuild hoga. 2-5 minute lagenge.

### Step 6: Apna n8n kholo
```
https://<tumhara-username>-<space-name>.hf.space
```
Pehli baar owner account banao (email/password), phir workflows import karna shuru karo — jaisa laptop par kiya tha.

---

## Website se connect karna

Tumhari website ke forms/chat widget ab is URL par POST karenge:
```
https://<tumhara-username>-<space-name>.hf.space/webhook/lead-intake
```

---

## Jab business grow ho jaye — VPS par move karna

Jab 2-3 paying clients ho jayein aur reliability critical ho jaye, isi Supabase database ko rakhte hue sirf n8n ko VPS par move kar sakte ho (data waisa hi rahega, kyunki woh Supabase mein hai, HF Space mein nahi tha).
