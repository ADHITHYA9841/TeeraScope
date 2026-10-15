import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.config import DB_PATH

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            disaster_type TEXT NOT NULL,
            event_date TEXT,
            location TEXT,
            notes TEXT,
            pre_image_path TEXT NOT NULL,
            post_image_path TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            progress INTEGER DEFAULT 0,
            stage TEXT DEFAULT 'Initialized',
            error_message TEXT,
            created_at TEXT NOT NULL,
            duration_seconds REAL DEFAULT 0.0,
            total_buildings INTEGER DEFAULT 0,
            no_damage_count INTEGER DEFAULT 0,
            minor_damage_count INTEGER DEFAULT 0,
            major_damage_count INTEGER DEFAULT 0,
            destroyed_count INTEGER DEFAULT 0,
            assessed_area_sqm REAL DEFAULT 0.0,
            results_json TEXT
        )
    """)
    conn.commit()
    conn.close()

def create_assessment(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO assessments (
            id, name, disaster_type, event_date, location, notes,
            pre_image_path, post_image_path, status, progress, stage, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data['id'], data['name'], data['disaster_type'], data.get('event_date'),
        data.get('location'), data.get('notes'), data['pre_image_path'],
        data['post_image_path'], 'pending', 0, 'Queued', created_at
    ))
    conn.commit()
    conn.close()
    return get_assessment(data['id'])

def update_assessment_status(
    assessment_id: str,
    status: str,
    progress: int = 0,
    stage: str = "",
    error_message: Optional[str] = None
):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE assessments
        SET status = ?, progress = ?, stage = ?, error_message = ?
        WHERE id = ?
    """, (status, progress, stage, error_message, assessment_id))
    conn.commit()
    conn.close()

def save_assessment_results(
    assessment_id: str,
    duration_seconds: float,
    total_buildings: int,
    no_damage: int,
    minor_damage: int,
    major_damage: int,
    destroyed: int,
    assessed_area_sqm: float,
    results_dict: Dict[str, Any]
):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE assessments
        SET status = 'completed', progress = 100, stage = 'Completed',
            duration_seconds = ?, total_buildings = ?, no_damage_count = ?,
            minor_damage_count = ?, major_damage_count = ?, destroyed_count = ?,
            assessed_area_sqm = ?, results_json = ?
        WHERE id = ?
    """, (
        duration_seconds, total_buildings, no_damage, minor_damage,
        major_damage, destroyed, assessed_area_sqm, json.dumps(results_dict),
        assessment_id
    ))
    conn.commit()
    conn.close()

def get_assessment(assessment_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    res = dict(row)
    if res.get('results_json'):
        try:
            res['results'] = json.loads(res['results_json'])
        except Exception:
            res['results'] = None
    else:
        res['results'] = None
    return res

def list_assessments() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assessments ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    items = []
    for r in rows:
        item = dict(r)
        if item.get('results_json'):
            try:
                item['results'] = json.loads(item['results_json'])
            except Exception:
                item['results'] = None
        else:
            item['results'] = None
        items.append(item)
    return items

def delete_assessment(assessment_id: str) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM assessments WHERE id = ?", (assessment_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0
