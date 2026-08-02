# RxFlow PWA — Project Accounts, Keys & Deployment Reference

> **Saved On:** July 31, 2026  
> **Status:** All Services Live & Connected (100% Free Tier)  
> **Live PWA App URL:** [https://rxflow-app.pages.dev](https://rxflow-app.pages.dev)  

---

## 1. 🐙 GitHub Repository

- **Username:** `pranavparekhcontent`
- **Personal Access Token (PAT):** `[CONFIGURED_IN_ENV_PAT]`
- **Repository Name:** `rxflow-app`
- **Web URL:** [https://github.com/pranavparekhcontent/rxflow-app](https://github.com/pranavparekhcontent/rxflow-app)
- **Git Remote URL:** `https://pranavparekhcontent@github.com/pranavparekhcontent/rxflow-app.git`

---

## 2. ☁️ Cloudflare Accounts & Live Deployments

- **Account Email:** `pranavparekhcontent@gmail.com`
- **Global API Key / Token:** `[CLOUDFLARE_API_KEY]`
- **Account ID:** `8d9574bee1f9b46318ae428ce5bae19e`
- **PWA Frontend Project Name:** `rxflow-app` (Cloudflare Pages)
- **Live PWA URL:** [https://rxflow-app.pages.dev](https://rxflow-app.pages.dev)
- **Backend Edge Worker Name:** `rxflow-api` (Cloudflare Workers)
- **Live Worker API URL:** [https://rxflow-api.pranavparekhcontent.workers.dev](https://rxflow-api.pranavparekhcontent.workers.dev)
- **API Health Endpoint:** [https://rxflow-api.pranavparekhcontent.workers.dev/api/v2/health](https://rxflow-api.pranavparekhcontent.workers.dev/api/v2/health)

---

## 3. ⚡ Supabase Postgres Database

- **Project ID:** `hspvkmjpcnkqqpoksveo`
- **Dashboard URL:** [https://supabase.com/dashboard/project/hspvkmjpcnkqqpoksveo](https://supabase.com/dashboard/project/hspvkmjpcnkqqpoksveo)
- **REST API Endpoint:** `https://hspvkmjpcnkqqpoksveo.supabase.co`
- **Public Anon Key:** `sb_publishable_3TIM3tXraS5lUi17ODzs3A_wwB1QGEG`
- **Database Schema Migration:** Located at `supabase/migrations/20260729000000_schema_v3.sql`

---

## 4. 🔄 PowerSync Offline Sync Engine

- **Project Name:** `RxFlow` (US Region)
- **Dashboard URL:** [https://dashboard.powersync.com/org/6a6c1f240fc10700078eca75/projects](https://dashboard.powersync.com/org/6a6c1f240fc10700078eca75/projects)
- **PowerSync Instance Service URL:** `https://6a6c503191ecf2aec48ee8ad.powersync.journeyapps.com`

---

## 💰 5. Monthly Running Cost Analysis

| Component | Platform | Selected Plan | Monthly Cost | Quota Allowance |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend PWA Host** | Cloudflare Pages | **Free Tier** | **₹0 / $0.00** | Unlimited bandwidth, 500 builds/mo |
| **Edge API Gateway** | Cloudflare Workers | **Free Tier** | **₹0 / $0.00** | 100,000 API requests / day |
| **Code Storage** | GitHub | **Free Tier** | **₹0 / $0.00** | Unlimited public & private repos |
| **Cloud Database** | Supabase | **Free Tier** | **₹0 / $0.00** | 500 MB database, 50k monthly active users |
| **Offline Sync Engine** | PowerSync | **Free Tier** | **₹0 / $0.00** | 100 concurrent connections, 100k sync ops/mo |
| **TOTAL COST** | | | **₹0 / mo ($0.00)** | *100% Free Tier Execution* |

---

## 🛠️ 6. Quick Cheat-Sheet Commands for Future Updates

### Update PWA Frontend to Cloudflare Pages:
```cmd
cmd /c "npm run build && set CLOUDFLARE_API_KEY=[CLOUDFLARE_API_KEY] && set CLOUDFLARE_EMAIL=pranavparekhcontent@gmail.com && npx wrangler pages deploy dist --project-name rxflow-app"
```

### Push Code Updates to GitHub:
```powershell
powershell -Command "git add .; git commit -m 'Update RxFlow'; git push origin main"
```

### Redeploy Edge API Worker:
```cmd
cmd /c "set CLOUDFLARE_API_KEY=[CLOUDFLARE_API_KEY] && set CLOUDFLARE_EMAIL=pranavparekhcontent@gmail.com && cd worker && npx wrangler deploy"
```
