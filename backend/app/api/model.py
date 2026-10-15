from fastapi import APIRouter
from app.models.xview2_net import ModelManager

router = APIRouter()

@router.get("/model/status")
def get_model_status():
    mgr = ModelManager.get_instance()
    return mgr.get_status()
