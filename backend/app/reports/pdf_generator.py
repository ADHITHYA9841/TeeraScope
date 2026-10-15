import os
import json
from pathlib import Path
from typing import Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from app.config import RESULTS_DIR, DAMAGE_CLASSES

def generate_pdf_report(assessment: Dict[str, Any], output_pdf_path: str) -> str:
    results = assessment.get("results") or {}
    breakdown = results.get("damage_breakdown", {})
    model_info = results.get("model_info", {})

    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Clean Palette Styles (No gradients, high contrast professional GIS look)
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F766E') # Forest Green / Dark Teal
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569')
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748B')
    )

    story = []

    # Header section
    story.append(Paragraph("TERRASCOPE — DISASTER DAMAGE INTELLIGENCE", title_style))
    story.append(Paragraph("Official Automated Building Damage Assessment Report | Powered by xView2 1st Place Engine", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=12))

    # Assessment Meta Table
    meta_data = [
        [
            Paragraph("<b>Assessment ID:</b> " + str(assessment.get('id')), body_style),
            Paragraph("<b>Disaster Type:</b> " + str(assessment.get('disaster_type', 'N/A')).title(), body_style)
        ],
        [
            Paragraph("<b>Assessment Name:</b> " + str(assessment.get('name')), body_style),
            Paragraph("<b>Event Date:</b> " + str(assessment.get('event_date', 'N/A')), body_style)
        ],
        [
            Paragraph("<b>Location:</b> " + str(assessment.get('location', 'Unspecified')), body_style),
            Paragraph("<b>Created At:</b> " + str(assessment.get('created_at', ''))[:19], body_style)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Analytical Summary Section
    story.append(Paragraph("1. Damage Summary & Metrics", section_heading))

    total_blds = results.get("total_buildings", 0)
    dur_sec = results.get("duration_seconds", 0.0)
    assessed_area = results.get("assessed_area_sqm", 0.0)

    stats_data = [
        [
            Paragraph("<b>Metric</b>", body_style),
            Paragraph("<b>Value</b>", body_style),
            Paragraph("<b>Description</b>", body_style)
        ],
        [
            Paragraph("Total Detected Buildings", body_style),
            Paragraph(f"<b>{total_blds}</b>", body_style),
            Paragraph("Distinct building structures identified in localized area", body_style)
        ],
        [
            Paragraph("Assessed Structure Footprint", body_style),
            Paragraph(f"<b>{assessed_area} sq.m</b>", body_style),
            Paragraph("Estimated footprint coverage derived from satellite resolution", body_style)
        ],
        [
            Paragraph("Model Execution Duration", body_style),
            Paragraph(f"<b>{dur_sec} seconds</b>", body_style),
            Paragraph("Inference runtime using PyTorch CPU pipeline", body_style)
        ]
    ]

    stats_table = Table(stats_data, colWidths=[150, 110, 280])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 14))

    # Breakdown by Severity Level Table
    story.append(Paragraph("2. Damage Severity Classification Breakdown", section_heading))

    no_dam = breakdown.get("no_damage", {})
    min_dam = breakdown.get("minor_damage", {})
    maj_dam = breakdown.get("major_damage", {})
    des_dam = breakdown.get("destroyed", {})

    severity_data = [
        [
            Paragraph("<b>Damage Category</b>", body_style),
            Paragraph("<b>Count</b>", body_style),
            Paragraph("<b>Percentage</b>", body_style),
            Paragraph("<b>Hex Indicator</b>", body_style)
        ],
        [
            Paragraph("<b>No Damage</b>", body_style),
            Paragraph(str(no_dam.get("count", 0)), body_style),
            Paragraph(f"{no_dam.get('percentage', 0)}%", body_style),
            Paragraph("<font color='#16A34A'>■ #16A34A (Green)</font>", body_style)
        ],
        [
            Paragraph("<b>Minor Damage</b>", body_style),
            Paragraph(str(min_dam.get("count", 0)), body_style),
            Paragraph(f"{min_dam.get('percentage', 0)}%", body_style),
            Paragraph("<font color='#CA8A04'>■ #CA8A04 (Yellow)</font>", body_style)
        ],
        [
            Paragraph("<b>Major Damage</b>", body_style),
            Paragraph(str(maj_dam.get("count", 0)), body_style),
            Paragraph(f"{maj_dam.get('percentage', 0)}%", body_style),
            Paragraph("<font color='#EA580C'>■ #EA580C (Orange)</font>", body_style)
        ],
        [
            Paragraph("<b>Destroyed</b>", body_style),
            Paragraph(str(des_dam.get("count", 0)), body_style),
            Paragraph(f"{des_dam.get('percentage', 0)}%", body_style),
            Paragraph("<font color='#DC2626'>■ #DC2626 (Red)</font>", body_style)
        ]
    ]

    sev_table = Table(severity_data, colWidths=[150, 90, 120, 180])
    sev_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(sev_table)
    story.append(Spacer(1, 14))

    # Check if damage overlay image exists to include in PDF
    overlay_path = RESULTS_DIR / assessment.get('id') / "overlay.png"
    if overlay_path.exists():
        story.append(Paragraph("3. Spatially Aligned Damage Map Visualization", section_heading))
        try:
            img = Image(str(overlay_path), width=400, height=400)
            story.append(img)
            story.append(Spacer(1, 10))
        except Exception as e:
            print("Could not attach overlay image to PDF:", e)

    # Model & Disclaimer Section
    story.append(Spacer(1, 10))
    story.append(Paragraph("4. Technical Engine & Methodological Notes", section_heading))

    engine_name = model_info.get("name", "xView2 First-Place Siam-ResNet U-Net")
    weights_src = model_info.get("weights_source", "xView2 Pretrained Weights")

    tech_text = (
        f"<b>Inference Model:</b> {engine_name}<br/>"
        f"<b>Checkpoints:</b> {weights_src}<br/>"
        f"<b>Execution Engine:</b> PyTorch CPU Multi-threaded Matrix Operations<br/>"
        f"<b>Pipeline:</b> Dual-stage inference combining building localization mask with 4-class Siamese feature concatenation."
    )
    story.append(Paragraph(tech_text, body_style))
    story.append(Spacer(1, 10))

    disclaimer_text = (
        "<b>Notice & Operational Disclaimer:</b> This assessment report is produced automatically by the TerraScope "
        "computer vision damage inference engine based on satellite image pairs. Automated predictions should serve as "
        "preliminary decision support for emergency response teams and must be verified through ground-truth inspections "
        "or secondary GIS verification prior to final tactical deployment."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)
    return output_pdf_path
