# TerraScope — Disaster Damage Intelligence Platform

## 🚀 Quick Start (Windows)

### Prerequisites (install once)
| Software | Download Link | Version |
|---|---|---|
| **Python** | https://www.python.org/downloads/ | 3.9 or higher |
| **Node.js** | https://nodejs.org/ | 18 or higher |

> ⚠️ During Python installation, make sure to check **"Add Python to PATH"**

---

## ▶️ Running the Application

### Option 1 — Double-click Launcher (Recommended)
1. Copy the entire project folder to your desktop or any location.
2. Double-click **`start.bat`** in the project root.
3. The script will automatically:
   - Create a Python virtual environment
   - Install all Python backend dependencies
   - Install all Node.js frontend dependencies
   - Launch both servers in separate windows
   - Open the dashboard in your browser

> **First run** may take 5–10 minutes to download PyTorch and other dependencies.  
> **Subsequent runs** start in under 10 seconds.

---

### Option 2 — Manual Commands

Open two separate terminal windows:

**Terminal 1 — Backend (FastAPI + PyTorch AI Engine):**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend (React + Vite):**
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Access URLs

| Service | URL |
|---|---|
| **Dashboard UI** | http://127.0.0.1:5173 |
| **Backend API** | http://127.0.0.1:8000 |
| **API Documentation** | http://127.0.0.1:8000/docs |

---

## 🗂️ Project Structure

```
terrascope/
├── start.bat               ← Windows launcher (double-click to run)
├── README.md
├── backend/
│   ├── requirements.txt    ← Python dependencies
│   └── app/
│       ├── main.py         ← FastAPI server
│       ├── inference/      ← xView2 AI pipeline
│       ├── models/         ← Siam-ResNet34 U-Net architecture
│       ├── api/            ← REST endpoints
│       └── reports/        ← PDF & CSV generators
└── frontend/
    ├── package.json        ← Node.js dependencies
    └── src/
        ├── pages/          ← Dashboard, Assessment, History pages
        └── components/     ← 3D Earth, Map Overlay, Slider, etc.
```

---

## 🧠 AI Engine

- **Architecture:** xView2 First-Place Solution — Siamese ResNet34 U-Net
- **Damage Classes:** No Damage · Minor · Major · Destroyed
- **Runtime:** CPU-only (no GPU required)
- **Inference Speed:** ~4–6 seconds per assessment

---

## 📋 Notes

- The backend creates a local SQLite database at `backend/data/terrascope.db`
- Sample assessment datasets are auto-generated on first run
- All assessment results, overlays, and PDF reports are stored in `backend/data/results/`
