import os
import zipfile
import urllib.request
from pathlib import Path

WEIGHTS_DIR = Path(__file__).resolve().parent.parent / "model_weights"
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

WEIGHTS_URL = "https://vdurnov.s3.amazonaws.com/xview2_1st_weights.zip"
ZIP_DEST = WEIGHTS_DIR / "xview2_1st_weights.zip"

def main():
    print(f"TerraScope Model Weights Setup Utility")
    print(f"Target directory: {WEIGHTS_DIR}")
    
    if ZIP_DEST.exists():
        print(f"Found existing zip: {ZIP_DEST}")
    else:
        print(f"Downloading pretrained weights from {WEIGHTS_URL} ...")
        try:
            def report_progress(block_num, block_size, total_size):
                read = block_num * block_size
                if total_size > 0:
                    percent = read * 100 / total_size
                    print(f"\rDownloading: {percent:.1f}% ({read // (1024*1024)}MB / {total_size // (1024*1024)}MB)", end="")
            
            urllib.request.urlretrieve(WEIGHTS_URL, ZIP_DEST, reporthook=report_progress)
            print("\nDownload complete.")
        except Exception as e:
            print(f"\nFailed to download automatically: {e}")
            print("Please manually download https://vdurnov.s3.amazonaws.com/xview2_1st_weights.zip and extract into model_weights/")

    if ZIP_DEST.exists():
        print("Extracting weights...")
        try:
            with zipfile.ZipFile(ZIP_DEST, 'r') as zip_ref:
                zip_ref.extractall(WEIGHTS_DIR)
            print(f"Extracted to {WEIGHTS_DIR}")
        except Exception as e:
            print(f"Error extracting zip: {e}")

if __name__ == "__main__":
    main()
