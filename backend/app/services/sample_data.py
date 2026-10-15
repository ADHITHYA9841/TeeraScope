import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
from app.config import SAMPLES_DIR

def create_synthetic_disaster_pair(disaster_name: str, width: int = 800, height: int = 800):
    sample_sub = SAMPLES_DIR / disaster_name.lower().replace(" ", "_")
    sample_sub.mkdir(parents=True, exist_ok=True)
    pre_path = sample_sub / "pre.png"
    post_path = sample_sub / "post.png"

    if pre_path.exists() and post_path.exists():
        return str(pre_path), str(post_path)

    # Seed for reproducibility per disaster type
    seed_map = {"turkey_earthquake": 101, "hurricane_ian": 202, "maui_wildfire": 303}
    np.random.seed(seed_map.get(disaster_name.lower().replace(" ", "_"), 404))

    # Base ground terrain (Satellite view: Roads, grass, earth)
    ground_pre = Image.new("RGB", (width, height), (220, 215, 200))
    draw_pre = ImageDraw.Draw(ground_pre)

    # Roads network
    draw_pre.line([(0, 400), (width, 400)], fill=(120, 120, 125), width=24)
    draw_pre.line([(400, 0), (400, height)], fill=(120, 120, 125), width=24)
    draw_pre.line([(0, 150), (width, 150)], fill=(130, 130, 135), width=16)
    draw_pre.line([(0, 650), (width, 650)], fill=(130, 130, 135), width=16)
    draw_pre.line([(180, 0), (180, height)], fill=(130, 130, 135), width=16)
    draw_pre.line([(620, 0), (620, height)], fill=(130, 130, 135), width=16)

    # Green patches
    draw_pre.rectangle([20, 20, 160, 130], fill=(160, 190, 140))
    draw_pre.rectangle([420, 420, 600, 630], fill=(150, 185, 135))
    draw_pre.rectangle([640, 180, 780, 380], fill=(140, 180, 130))

    # Draw grid of 36 buildings in pre-disaster
    building_rects = []
    roof_colors = [(180, 70, 60), (200, 160, 120), (70, 100, 140), (210, 210, 215), (140, 110, 90)]

    for row in range(6):
        for col in range(6):
            # Calculate coordinates avoiding roads
            bx = 40 + col * 120 + (15 if col >= 3 else 0)
            by = 40 + row * 120 + (15 if row >= 3 else 0)
            bw = np.random.randint(40, 65)
            bh = np.random.randint(40, 65)
            rect = [bx, by, bx + bw, by + bh]
            building_rects.append(rect)
            
            color = roof_colors[(row * 6 + col) % len(roof_colors)]
            draw_pre.rectangle(rect, fill=color, outline=(40, 40, 45), width=2)
            # Add roof details
            draw_pre.rectangle([bx+4, by+4, bx+bw-4, by+bh-4], outline=(255, 255, 255, 120), width=1)

    # Convert pre to numpy
    pre_arr = np.array(ground_pre)

    # Post disaster creation with realistic damage patterns
    ground_post = ground_pre.copy()
    draw_post = ImageDraw.Draw(ground_post)
    post_arr = np.array(ground_post)

    disaster_clean = disaster_name.lower()
    if "earthquake" in disaster_clean:
        # Earthquake: rubble, cracks, partial collapse (major/destroyed)
        for idx, rect in enumerate(building_rects):
            bx1, by1, bx2, by2 = rect
            damage_level = np.random.choice([0, 1, 2, 3], p=[0.2, 0.25, 0.3, 0.25])
            if damage_level == 3: # Destroyed: Grey debris pile, rubble texture
                draw_post.rectangle(rect, fill=(140, 135, 130), outline=(90, 85, 80), width=2)
                # Scatter debris pixels
                for _ in range(30):
                    dx = np.random.randint(bx1 - 10, bx2 + 10)
                    dy = np.random.randint(by1 - 10, by2 + 10)
                    draw_post.ellipse([dx, dy, dx+4, dy+4], fill=(110, 105, 100))
            elif damage_level == 2: # Major: Cracks & dark rubble hole
                draw_post.rectangle(rect, fill=(160, 110, 90), outline=(60, 40, 30), width=2)
                draw_post.line([(bx1, by1), (bx2, by2)], fill=(40, 30, 20), width=3)
            elif damage_level == 1: # Minor: Minor roof discolouration
                draw_post.rectangle(rect, fill=(170, 90, 80), outline=(40, 40, 45), width=2)

    elif "wildfire" in disaster_clean:
        # Wildfire: Burnt black/charcoal patches, destroyed roofs
        for idx, rect in enumerate(building_rects):
            bx1, by1, bx2, by2 = rect
            damage_level = np.random.choice([0, 1, 2, 3], p=[0.1, 0.2, 0.35, 0.35])
            if damage_level >= 2: # Charcoal black burned roof
                draw_post.rectangle(rect, fill=(45, 42, 40), outline=(20, 18, 15), width=2)
                # Add ash spots around building
                for _ in range(25):
                    dx = np.random.randint(bx1 - 15, bx2 + 15)
                    dy = np.random.randint(by1 - 15, by2 + 15)
                    draw_post.ellipse([dx, dy, dx+5, dy+5], fill=(70, 65, 60))
            elif damage_level == 1:
                draw_post.rectangle(rect, fill=(110, 80, 60), outline=(40, 30, 20), width=2)

    else: # Hurricane / Flood
        # Water/mud staining, debris, blown roofs
        for idx, rect in enumerate(building_rects):
            bx1, by1, bx2, by2 = rect
            damage_level = np.random.choice([0, 1, 2, 3], p=[0.25, 0.3, 0.25, 0.2])
            if damage_level == 3: # Blown away roof to floor plan
                draw_post.rectangle(rect, fill=(180, 175, 160), outline=(70, 70, 75), width=3)
                draw_post.line([(bx1, by1+15), (bx2, by1+15)], fill=(100, 100, 105), width=2)
            elif damage_level == 2:
                draw_post.rectangle(rect, fill=(130, 140, 120), outline=(50, 60, 50), width=2)

    # Save generated PIL images
    ground_pre.save(pre_path)
    ground_post.save(post_path)

    return str(pre_path), str(post_path)

def ensure_sample_imagery():
    samples = [
        {"name": "Turkey Earthquake Assessment", "type": "earthquake", "location": "Kahramanmaraş, Turkey"},
        {"name": "Hurricane Ian Damage Assessment", "type": "hurricane", "location": "Fort Myers, Florida, USA"},
        {"name": "Maui Wildfire Assessment", "type": "wildfire", "location": "Lahaina, Hawaii, USA"}
    ]
    created_samples = []
    for s in samples:
        pre_path, post_path = create_synthetic_disaster_pair(s["name"])
        created_samples.append({
            "name": s["name"],
            "disaster_type": s["type"],
            "location": s["location"],
            "pre_image_path": pre_path,
            "post_image_path": post_path
        })
    return created_samples
