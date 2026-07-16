# Railway — Free n8n Deployment Guide

## Zaroori samajhna

✅ Railway trial genuinely **credit card nahi maangta** (GitHub se sign up)
✅ $5 free credit milta hai, 30 din tak
⚠️ **30 din/$5 khatam hone ke baad**, card ke bina sirf $1/month ka bahut limited tier milta hai — is halat mein database ke saath n8n chalana mushkil ho jayega
⚠️ Isliye Railway ko **abhi turant launch** ke liye use karo, lekin dhyan rakho ke ~30 din mein iska replacement plan chahiye hoga (VPS ya prepaid card se Hobby plan)

Yahan bhi humne **Supabase Postgres** use kiya hai data ke liye (Railway ka apna storage bhi trial khatam hone par risk mein aa sakta hai).

---

## Setup Steps

### Step 1: Railway account
1. railway.app → "Login with GitHub"
2. Card nahi maangega

### Step 2: Naya Project — Docker Image se deploy karo
1. "New Project" → "Deploy from Docker Image"
2. Image: `n8nio/n8n`

### Step 3: Environment Variables (Project → Variables tab)

```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=<supabase-host>
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=<supabase-user>
DB_POSTGRESDB_PASSWORD=<supabase-password>
N8N_ENCRYPTION_KEY=<random-32-character-string-yaad-rakho>
N8N_PROTOCOL=https
N8N_PORT=5678
WEBHOOK_URL=<railway-domain-baad-mein-milega-yahan-update-karna>
```

**Supabase details wahi hain jo Hugging Face setup mein use ki thi** (Project Settings → Database).

### Step 4: Public Domain generate karo
1. Project → Settings → **"Networking"** → **"Generate Domain"**
2. Yeh ek URL dega jaisa: `https://tumhara-project.up.railway.app`
3. Is URL ko wapas jaake `WEBHOOK_URL` variable mein update karo (Step 3 mein jo blank chhoda tha)

### Step 5: Redeploy
Variables update karne ke baad Railway automatically redeploy karega. 1-2 minute wait karo.

### Step 6: n8n kholo
```
https://tumhara-project.up.railway.app
```
Owner account banao, workflows import karna shuru karo.

---

## Website se connect karna
```
https://tumhara-project.up.railway.app/webhook/lead-intake
```

---

## 30 Din Baad Kya Karna Hai

Credit khatam hone se pehle reminder milega email par. Us waqt yeh options honge:
1. **Prepaid/virtual card** bana kar Hobby plan ($5/month) le lo — data safe rahega (Supabase mein hai)
2. **VPS** par migrate karo (Supabase database wahi rahega, sirf n8n move karna hoga)
3. **Hugging Face Spaces** wale free setup par switch karo (jo already ban chuka hai `integrations/huggingface-deployment/` mein)

Kyunki data Supabase mein hai (Railway ke andar nahi), migration bahut aasan hoga — sirf naya n8n instance start karke wahi environment variables daalne honge.
