import os
import uuid
import shutil
import json
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Response
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse

from app.config import UPLOADS_DIR, RESULTS_DIR
from app.database import db
from app.inference.pipeline import process_assessment_pipeline
from app.reports.pdf_generator import generate_pdf_report
from app.reports.csv_exporter import generate_csv_export
from app.services.sample_data import ensure_sample_imagery

router = APIRouter()

@router.get("/samples")
def get_sample_datasets():
    samples = ensure_sample_imagery()
    return samples

@router.get("/samples/{sample_index}/image/{img_type}")
def get_sample_image(sample_index: int, img_type: str):
    samples = ensure_sample_imagery()
    if sample_index < 0 or sample_index >= len(samples):
        raise HTTPException(status_code=400, detail="Invalid sample index")
    s = samples[sample_index]
    path = s["pre_image_path"] if img_type == "pre" else s["post_image_path"]
    if os.path.exists(path):
        return FileResponse(path)
    raise HTTPException(status_code=404, detail="Sample image file not found")

@router.get("/assessments")
def list_all_assessments():
    return db.list_assessments()

@router.post("/assessments")
async def create_new_assessment(
    name: str = Form(...),
    disaster_type: str = Form(...),
    event_date: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    pre_image: Optional[UploadFile] = File(None),
    post_image: Optional[UploadFile] = File(None),
    sample_index: Optional[int] = Form(None)
):
    assessment_id = f"asm-{uuid.uuid4().hex[:10]}"
    upload_sub = UPLOADS_DIR / assessment_id
    upload_sub.mkdir(parents=True, exist_ok=True)

    pre_path = ""
    post_path = ""

    if sample_index is not None:
        samples = ensure_sample_imagery()
        if sample_index < 0 or sample_index >= len(samples):
            raise HTTPException(status_code=400, detail="Invalid sample index specified.")
        s = samples[sample_index]
        pre_path = str(upload_sub / "pre.png")
        post_path = str(upload_sub / "post.png")
        shutil.copy(s["pre_image_path"], pre_path)
        shutil.copy(s["post_image_path"], post_path)

    elif pre_image and post_image:
        pre_ext = Path(pre_image.filename).suffix or ".png"
        post_ext = Path(post_image.filename).suffix or ".png"

        pre_path = str(upload_sub / f"pre{pre_ext}")
        post_path = str(upload_sub / f"post{post_ext}")

        with open(pre_path, "wb") as f:
            shutil.copyfileobj(pre_image.file, f)

        with open(post_path, "wb") as f:
            shutil.copyfileobj(post_image.file, f)
    else:
        raise HTTPException(
            status_code=400,
            detail="Please provide both pre-disaster and post-disaster images, or select a sample dataset."
        )

    item_data = {
        "id": assessment_id,
        "name": name,
        "disaster_type": disaster_type,
        "event_date": event_date,
        "location": location,
        "notes": notes,
        "pre_image_path": pre_path,
        "post_image_path": post_path
    }

    created = db.create_assessment(item_data)
    return created

def background_run_pipeline(assessment_id: str, pre_path: str, post_path: str):
    def update_cb(progress: int, stage_text: str):
        db.update_assessment_status(assessment_id, "processing", progress, stage_text)

    try:
        db.update_assessment_status(assessment_id, "processing", 5, "Starting PyTorch CPU pipeline")
        results = process_assessment_pipeline(assessment_id, pre_path, post_path, progress_cb=update_cb)

        breakdown = results.get("damage_breakdown", {})
        no_dam = breakdown.get("no_damage", {}).get("count", 0)
        min_dam = breakdown.get("minor_damage", {}).get("count", 0)
        maj_dam = breakdown.get("major_damage", {}).get("count", 0)
        des_dam = breakdown.get("destroyed", {}).get("count", 0)

        db.save_assessment_results(
            assessment_id=assessment_id,
            duration_seconds=results.get("duration_seconds", 0.0),
            total_buildings=results.get("total_buildings", 0),
            no_damage=no_dam,
            minor_damage=min_dam,
            major_damage=maj_dam,
            destroyed=des_dam,
            assessed_area_sqm=results.get("assessed_area_sqm", 0.0),
            results_dict=results
        )
    except Exception as e:
        import traceback
        err_msg = str(e)
        traceback.print_exc()
        db.update_assessment_status(assessment_id, "failed", 0, "Execution Failed", error_message=err_msg)

@router.post("/assessments/{assessment_id}/process")
def start_assessment_processing(assessment_id: str, background_tasks: BackgroundTasks):
    item = db.get_assessment(assessment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    if item['status'] == 'processing':
        return item

    background_tasks.add_task(
        background_run_pipeline,
        assessment_id=assessment_id,
        pre_path=item['pre_image_path'],
        post_path=item['post_image_path']
    )

    db.update_assessment_status(assessment_id, "processing", 10, "Initializing")
    return db.get_assessment(assessment_id)

@router.get("/assessments/{assessment_id}")
def get_assessment_details(assessment_id: str):
    item = db.get_assessment(assessment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return item

@router.get("/assessments/{assessment_id}/results")
def get_assessment_results_data(assessment_id: str):
    results_path = RESULTS_DIR / assessment_id / "results.json"
    if not results_path.exists():
        item = db.get_assessment(assessment_id)
        if item and item.get("results"):
            return item["results"]
        raise HTTPException(status_code=404, detail="Inference results not ready or found.")
    
    with open(results_path, "r") as f:
        return json.load(f)

@router.get("/assessments/{assessment_id}/images/{img_type}")
def get_assessment_image(assessment_id: str, img_type: str):
    item = db.get_assessment(assessment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    if img_type == "pre" and os.path.exists(item['pre_image_path']):
        return FileResponse(item['pre_image_path'])
    elif img_type == "post" and os.path.exists(item['post_image_path']):
        return FileResponse(item['post_image_path'])
    else:
        raise HTTPException(status_code=404, detail=f"Image type '{img_type}' not found.")

@router.get("/assessments/{assessment_id}/results/{filename}")
def get_result_file(assessment_id: str, filename: str):
    file_path = RESULTS_DIR / assessment_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Result file not found.")
    return FileResponse(str(file_path))

@router.get("/assessments/{assessment_id}/snippets/{filename}")
def get_snippet_file(assessment_id: str, filename: str):
    file_path = RESULTS_DIR / assessment_id / "snippets" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Snippet image not found.")
    return FileResponse(str(file_path))

@router.get("/assessments/{assessment_id}/report")
def download_pdf_assessment_report(assessment_id: str):
    item = db.get_assessment(assessment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    if item['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Assessment is not completed yet.")

    pdf_filename = f"TerraScope_Report_{assessment_id}.pdf"
    pdf_path = str(RESULTS_DIR / assessment_id / pdf_filename)

    generate_pdf_report(item, pdf_path)

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=pdf_filename
    )

@router.get("/assessments/{assessment_id}/export")
def download_csv_export(assessment_id: str):
    item = db.get_assessment(assessment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    if item['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Assessment is not completed yet.")

    csv_data = generate_csv_export(item)

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=TerraScope_Export_{assessment_id}.csv"}
    )

@router.delete("/assessments/{assessment_id}")
def delete_existing_assessment(assessment_id: str):
    item = db.get_assessment(assessment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    # Cleanup directories
    upload_sub = UPLOADS_DIR / assessment_id
    results_sub = RESULTS_DIR / assessment_id

    if upload_sub.exists():
        shutil.rmtree(upload_sub, ignore_errors=True)
    if results_sub.exists():
        shutil.rmtree(results_sub, ignore_errors=True)

    success = db.delete_assessment(assessment_id)
    return {"success": success, "message": f"Assessment {assessment_id} deleted."}
