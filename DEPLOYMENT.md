# Deploying IndiaTrade to Public

To make your website public, you need to deploy the **Backend** (API) and the **Frontend** (UI).

## Option A: Using Render (Recommended for both)

Render.com is a free/cheap platform that supports both Node.js and React.

### Step 1: Deploy Backend (Node.js)

1. Push your code to **GitHub**.
2. Go to [Render.com](https://render.com) and create a **New Web Service**.
3. Connect your GitHub repo.
4. **Root Directory**: `backend`
5. **Build Command**: `npm install`
6. **Start Command**: `node server.js`
7. Click **Deploy**.
8. **Copy the URL** provided by Render (e.g., `https://indiatrade-api.onrender.com`).

### Step 2: Deploy Frontend (Vite)

1. Create a **New Static Site** on Render (or Vercel/Netlify).
2. Connect the same GitHub repo.
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Publish Directory**: `dist`
6. **Environment Variables** (Crucial!):
    * Key: `VITE_API_URL`
    * Value: `https://indiatrade-api.onrender.com` (The URL from Step 1)
7. Click **Deploy**.

## Option B: Vercel (Frontend only)

If you prefer Vercel for the frontend:

1. Import your GitHub repo to Vercel.
2. Select `Root Directory` as `frontend`.
3. Add the Environment Variable: `VITE_API_URL` = `YOUR_BACKEND_RUL`.
4. Deploy.
