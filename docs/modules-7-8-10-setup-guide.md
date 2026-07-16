# Modules 7, 8, 10 — Setup Guide (Non-n8n Modules)

Yeh 3 modules n8n workflow JSON nahi bante — inhe alag tools chahiye. Yahan step-by-step setup hai.

---

## Module 7 — Voice AI System

**Tool chahiye:** [Vapi.ai](https://vapi.ai) (sabse aasan, n8n se direct connect hota hai) ya Twilio + OpenAI Realtime API (zyada control, zyada technical)

### Setup (Vapi se):
1. Vapi.ai par account banao, phone number buy karo (~$2/month + per-minute cost)
2. Vapi dashboard mein "Assistant" banao:
   - System prompt: same jo humare Workflow 1 mein AI Conversation node mein hai
   - Voice: koi bhi natural-sounding voice choose karo (Vapi ready-made voices deta hai)
3. Vapi ka **Webhook URL** apne n8n ke Workflow 1 ke webhook se connect karo — jab call end ho, Vapi transcript + summary n8n ko bhej dega
4. n8n mein ek naya node add karo jo is transcript ko wahi "Extract Structured Data" logic se process kare (jaisa Workflow 1 mein hai)

**Cost estimate:** $0.05-0.15 per minute call — MVP ke liye budget rakho $50-100/month testing ke liye.

---

## Module 8 — Analytics Dashboard

**Tool chahiye:** [Google Looker Studio](https://lookerstudio.google.com) (bilkul FREE, Google Sheets se direct connect hota hai)

### Setup:
1. Looker Studio kholo → "Create" → "Report"
2. Data source add karo → **Google Sheets** select karo → apni "Leads" sheet connect karo
3. Charts add karo (drag-and-drop):
   - **Bar chart**: `lead_tier` (HOT/WARM/COLD) ka count
   - **Line chart**: `timestamp` ke hisaab se leads over time
   - **Table**: `area` wise kitne leads aaye
   - **Scorecard**: Total leads, Total HOT leads, Conversion %
4. Report ko share/embed kar sakte ho apni team ke saath

**Time lagega:** 30-45 minute pehli baar setup karne mein, bilkul free hai.

---

## Module 10 — Admin Control Panel

**Tool chahiye:** Lovable (jaisa humne pehle discuss kiya)

### Lovable Prompt (copy-paste kar sakte ho):

```
Build a simple admin dashboard for a real estate AI sales system with:

1. A "Leads" table view (connected to Google Sheets via API or Supabase)
   showing: customer_name, phone, area, budget_aed, lead_score, lead_tier, status
   - Filterable by lead_tier (HOT/WARM/COLD) and status
   - Sortable by lead_score

2. An "Agents" management page:
   - List of agents with name, phone, email, specialty area, languages
   - Add/Edit/Remove agent functionality

3. A "Settings" page:
   - Toggle to turn AI responses on/off
   - Field to update the AI's system prompt
   - Field to update WhatsApp/Email alert recipient

Use a clean, professional dashboard layout with a sidebar navigation.
Connect to Supabase for the backend.
```

**Setup time:** 1-2 din Lovable ke saath iterate karke.

---

## Priority — kya pehle karna chahiye

1. **Analytics (Module 8)** — sabse aasan aur free, turant kar sakte ho
2. **Admin Panel (Module 10)** — jab tumhare paas 2-3 clients ho jayein tabhi zaroorat padegi
3. **Voice AI (Module 7)** — sabse mehenga aur complex, isko sabse aakhir mein add karo (jab MVP se paisa aana shuru ho jaye)
