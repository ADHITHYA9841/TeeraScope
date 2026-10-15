import csv
import io
from typing import Dict, Any

def generate_csv_export(assessment: Dict[str, Any]) -> str:
    results = assessment.get("results") or {}
    buildings = results.get("buildings", [])

    output = io.StringIO()
    writer = csv.writer(output)

    # Write Header
    writer.writerow([
        "Building ID",
        "Damage Class",
        "Severity Index (0-3)",
        "Confidence Score",
        "Area (Pixels)",
        "Centroid X",
        "Centroid Y",
        "BBox X",
        "BBox Y",
        "BBox Width",
        "BBox Height",
        "Prob No Damage",
        "Prob Minor Damage",
        "Prob Major Damage",
        "Prob Destroyed"
    ])

    for bld in buildings:
        probs = bld.get("probabilities", {})
        bbox = bld.get("bbox", [0, 0, 0, 0])
        centroid = bld.get("centroid", [0, 0])

        writer.writerow([
            bld.get("id"),
            bld.get("damage_class"),
            bld.get("damage_severity"),
            bld.get("confidence"),
            bld.get("area_px"),
            centroid[0] if len(centroid) > 0 else 0,
            centroid[1] if len(centroid) > 1 else 0,
            bbox[0] if len(bbox) > 0 else 0,
            bbox[1] if len(bbox) > 1 else 0,
            bbox[2] if len(bbox) > 2 else 0,
            bbox[3] if len(bbox) > 3 else 0,
            probs.get("No Damage", 0.0),
            probs.get("Minor Damage", 0.0),
            probs.get("Major Damage", 0.0),
            probs.get("Destroyed", 0.0)
        ])

    return output.getvalue()
