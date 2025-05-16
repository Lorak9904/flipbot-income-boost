# 🔁 FlipIt – Fullstack Reselling Automation Tool

**FlipIt** is a smart automation tool that helps users resell second-hand items (like clothes, electronics, or furniture) across marketplaces like **Facebook Marketplace, OLX, and Vinted** — without relying on public APIs.

It uses AI to generate optimized listings from just photos, handles marketplace login with cookies, and posts items automatically.

---

## 🧭 Project Structure

- `backend/` – FastAPI API with AI integration and listing logic
- `frontend/` – React + TypeScript interface for listing and user interaction
- `extension/` – (Optional) Chrome plugin for extracting Facebook cookies

---

## 📦 Features

- 🔐 JWT-based authentication
- 🖼️ Upload photos → get title, category, price, description
- 🤖 OpenAI-powered AI listing assistant
- 🛒 Facebook Marketplace posting via cookies
- 🛠️ OLX & Vinted integration in progress
- ⚡ Mobile-friendly, no Puppeteer or headless browsers used

---

## ⚙️ Tech Stack

| Layer       | Tech                                     |
|-------------|------------------------------------------|
| Frontend    | React, TypeScript, Tailwind CSS, Vite    |
| Backend     | FastAPI, Tortoise ORM, PostgreSQL, JWT   |
| AI/ML       | OpenAI API (Vision + Text)               |
| Deployment  | Docker, Nginx, DigitalOcean/VPS          |

---

# 🚀 Getting Started

## 🐳 Run Fullstack with Docker

### 1. Clone the repo
```bash
git clone https://github.com/Lorak9904/FlipIt.git --recurse-submodules
cd FlipIt
```

### 2. Set up `.env` file
Create two environment files:

#### Backend – `backend/.env`
```env
DATABASE_URL=postgres://flipit:flipit@db:5432/flipit
JWT_SECRET_KEY=your_jwt_secret
OPENAI_API_KEY=sk-...
```

#### Frontend – `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Run Docker Compose
```bash
docker-compose up --build
```

The frontend will be available at:  
📍 `http://localhost:5173`

The backend API will be at:  
📍 `http://localhost:8000`

---

# 📂 Backend – `backend/`

## 📦 Summary

Handles auth, image uploads, AI generation, and posting logic.

### 💻 Run Locally (without Docker)

```bash
cd backend
pip install -r requirements.txt

# Set up DB
aerich init -t app.db.TORTOISE_ORM
aerich init-db
aerich migrate
aerich upgrade

# Start server
uvicorn app.main:app --reload
```

### 🔐 API Highlights

| Method | Endpoint                  | Description                         |
|--------|---------------------------|-------------------------------------|
| POST   | `/api/auth/register`      | Register user                       |
| POST   | `/api/auth/login/email`   | Login with email/password           |
| POST   | `/api/manual-connect`     | Save FB cookie/token                |
| POST   | `/api/items/propose`      | AI-generated listing from images    |
| POST   | `/api/items/post`         | [Planned] Listing submission        |

---

# 🎨 Frontend – `frontend/`

## 📦 Summary

Built with React + TypeScript using Vite. Communicates with backend via `fetch` and Bearer tokens.

### 💻 Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open your browser at:  
📍 `http://localhost:5173`

### 🔧 Scripts

| Script            | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start dev server                |
| `npm run build`   | Build production files          |
| `npm run preview` | Preview production build        |

---

# 🔐 Authentication

- JWT is issued by backend and stored in `localStorage`
- Managed globally via `AuthContext` in frontend

---

# 🤖 AI Integration

FlipIt uses **OpenAI GPT-4** for:
- Analyzing uploaded images
- Generating title, description, category, price
- (Planned) enhancing image backgrounds

OpenAI API is used securely from backend only.

---

# 🛠️ Current Status

- ✅ Facebook integration – **working**
- 🧠 AI listing assistant – **active**
- 🛠️ OLX & Vinted – **in development**
- 🧪 Image enhancement – **functionally ready**, UI pending

---

# 🧑‍💻 Developer Notes

- Make sure to use real cookies/tokens for Facebook manual connect
- Devtools + network reverse-engineering used in place of APIs
- Works even on mobile devices without headless browser dependencies

---

# 📄 License

MIT – free for personal or experimental use.

---

# 🙋 Support

For bugs, suggestions, or help:  
- Open an issue  
- Or contact [LinkedIn](https://www.linkedin.com/in/karol-obrebski/)
