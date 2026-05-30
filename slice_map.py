import os
from PIL import Image

def slice_image():
    img_path = r"d:\google antigravity\WHEELOFTIME\afavl8.jpeg"
    output_dir = r"d:\google antigravity\WHEELOFTIME\slices"
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("Opening image...")
    img = Image.open(img_path)
    width, height = img.size
    print(f"Image dimensions: {width} x {height}")
    
    # 4 columns, 3 rows
    cols = 4
    rows = 3
    
    slice_w = width // cols
    slice_h = height // rows
    
    for r in range(rows):
        for c in range(cols):
            x1 = c * slice_w
            y1 = r * slice_h
            
            # Make sure we cover the entire image including round-off errors at the edges
            x2 = (c + 1) * slice_w if c < cols - 1 else width
            y2 = (r + 1) * slice_h if r < rows - 1 else height
            
            crop_rect = (x1, y1, x2, y2)
            print(f"Cropping Segment Row {r}, Col {c} -> Bounds: {crop_rect}")
            
            cropped = img.crop(crop_rect)
            cropped_path = os.path.join(output_dir, f"slice_{r}_{c}.png")
            cropped.save(cropped_path, "PNG")
            
    print("All slices saved successfully!")

if __name__ == "__main__":
    slice_image()
