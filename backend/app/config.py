import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
RESULTS_DIR = DATA_DIR / "results"
SAMPLES_DIR = DATA_DIR / "samples"
WEIGHTS_DIR = BASE_DIR / "model_weights"
DB_PATH = DATA_DIR / "terrascope.db"

# Ensure directories exist
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

WEIGHTS_URL = "https://vdurnov.s3.amazonaws.com/xview2_1st_weights.zip"
WEIGHTS_ZIP_PATH = WEIGHTS_DIR / "xview2_1st_weights.zip"

# Damage categories matching xView2 benchmark
DAMAGE_CLASSES = {
    0: {"name": "No Damage", "color": "#16A34A", "rgb": [22, 163, 74]},
    1: {"name": "Minor Damage", "color": "#CA8A04", "rgb": [202, 138, 4]},
    2: {"name": "Major Damage", "color": "#EA580C", "rgb": [234, 88, 12]},
    3: {"name": "Destroyed", "color": "#DC2626", "rgb": [220, 38, 38]}
}
