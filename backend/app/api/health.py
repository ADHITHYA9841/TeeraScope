from fastapi import APIRouter
from app.models.xview2_net import ModelManager

router = APIRouter()

@router.get("/health")
def get_health():
    mgr = ModelManager.get_instance()
    return {
        "status": "healthy",
        "service": "TerraScope — Disaster Damage Intelligence API",
        "version": "1.0.0",
        "model_loaded": mgr.is_loaded
    }
