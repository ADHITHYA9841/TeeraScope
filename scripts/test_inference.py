import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.database.db import init_db, create_assessment
from app.services.sample_data import ensure_sample_imagery
from app.inference.pipeline import process_assessment_pipeline

def test_pipeline():
    print("Testing backend initialization and sample generation...")
    init_db()
    samples = ensure_sample_imagery()
    print(f"Generated {len(samples)} sample datasets:")
    for s in samples:
        print(" -", s["name"])

    sample = samples[0]
    print("\nRunning CPU inference test on sample pair...")
    
    def log_cb(p, text):
        print(f"[{p}%] {text}")

    res = process_assessment_pipeline(
        assessment_id="test-asm-001",
        pre_path=sample["pre_image_path"],
        post_path=sample["post_image_path"],
        progress_cb=log_cb
    )

    print("\nTest completed successfully!")
    print(f"Total Buildings Detected: {res['total_buildings']}")
    print(f"Duration: {res['duration_seconds']}s")
    print(f"Damage Breakdown: {res['damage_breakdown']}")

if __name__ == "__main__":
    test_pipeline()
