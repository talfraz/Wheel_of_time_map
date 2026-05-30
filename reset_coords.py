import json

def reset_all_coordinates():
    file_path = r"d:\google antigravity\WHEELOFTIME\locations.json"
    
    # Load current locations
    with open(file_path, "r", encoding="utf-8") as f:
        locations = json.load(f)
        
    # Reset all coordinates to None (which serializes to null in JSON)
    for loc in locations:
        loc["coords"] = None
        
    # Save back to file
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(locations, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully reset coordinates for all {len(locations)} locations to null!")

if __name__ == "__main__":
    reset_all_coordinates()
