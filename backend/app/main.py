import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import DATA_DIR
from app.database.db import init_db
from app.models.xview2_net import ModelManager
from app.api import health, model, assessments

app = FastAPI(
    title="TerraScope — Disaster Damage Intelligence API",
    description="Backend API for building damage assessment using xView2 First-Place PyTorch Inference Engine",
    version="1.0.0"
)

# CORS setup for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    # Pre-initialize PyTorch CPU model engine in background thread for fast startup
    def pre_load():
        try:
            ModelManager.get_instance().initialize()
        except Exception as e:
            print(f"Model initialization background note: {e}")

    threading.Thread(target=pre_load, daemon=True).start()

# Mount API Routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(model.router, prefix="/api", tags=["Model"])
app.include_router(assessments.router, prefix="/api", tags=["Assessments"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
