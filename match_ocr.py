import json
import os
import re

def clean_text(text):
    # Lowercase and keep only alphanumeric and spaces
    return re.sub(r'[^a-z0-9\s]', '', text.lower()).strip()

def match_locations():
    locations_path = r"d:\google antigravity\WHEELOFTIME\locations.json"
    ocr_path = r"d:\google antigravity\WHEELOFTIME\ocr_raw_results.json"
    
    IMG_HEIGHT = 5079
    
    # Use utf-8-sig to automatically handle and strip UTF-8 BOM if written by PowerShell
    with open(locations_path, "r", encoding="utf-8-sig") as f:
        locations = json.load(f)
        
    with open(ocr_path, "r", encoding="utf-8-sig") as f:
        ocr_lines = json.load(f)
        
    print(f"Loaded {len(locations)} locations and {len(ocr_lines)} OCR text lines.")
    
    matched_count = 0
    
    # We will do a multi-stage matching for maximum recall and precision
    for loc in locations:
        loc_id = loc["id"]
        name_en = loc["name_en"]
        
        # Cleaned search terms
        clean_name = clean_text(name_en)
        # Split into individual words
        words_to_match = [w for w in clean_name.split() if len(w) > 2] # ignore very short words like 'of', 'the'
        if not words_to_match:
            words_to_match = clean_name.split()
            
        best_match = None
        best_score = 0
        
        for line in ocr_lines:
            line_text = line["Text"]
            clean_line = clean_text(line_text)
            
            # Exact or substring match (case insensitive)
            if clean_name in clean_line:
                # Direct match is highest priority
                best_match = line
                best_score = 100
                break
                
            # If multi-word name, check if all words appear in the line
            if len(words_to_match) > 1:
                all_words_present = True
                for word in words_to_match:
                    if word not in clean_line:
                        all_words_present = False
                        break
                if all_words_present:
                    best_match = line
                    best_score = 90
                    continue # keep looking for exact match
                    
            # For special cases like 'Stedding Tsofu' -> match 'Tsofu'
            if "stedding" in clean_name and len(words_to_match) > 1:
                # the second word is usually the unique name
                unique_part = words_to_match[1]
                if unique_part in clean_line:
                    best_match = line
                    best_score = 80
                    continue
                    
            # Single word match check (e.g. 'Tear' in line 'TEAR')
            if len(words_to_match) == 1:
                # Check for word boundaries to avoid matching 'Tear' in 'Tearful'
                pattern = r'\b' + re.escape(words_to_match[0]) + r'\b'
                if re.search(pattern, clean_line):
                    best_match = line
                    best_score = 70
                    continue
                    
        if best_match:
            # We found a match!
            # Calculate pixel center in OCR coordinate system
            ocr_x = best_match["X"] + best_match["Width"] / 2
            ocr_y = best_match["Y"] + best_match["Height"] / 2
            
            # Convert to Leaflet coordinate system:
            # Leaflet Y starts from bottom, JPEG Y starts from top.
            leaflet_x = round(ocr_x)
            leaflet_y = round(IMG_HEIGHT - ocr_y)
            
            loc["coords"] = [leaflet_y, leaflet_x]
            matched_count += 1
            print(f"[OK] MATCHED: '{name_en}' -> OCR line: '{best_match['Text']}' at Leaflet Coords: [{leaflet_y}, {leaflet_x}]")
        else:
            # Keep coords as None if not matched
            loc["coords"] = None
            print(f"[FAIL] NOT MATCHED: '{name_en}'")
            
    # Save the updated locations with coordinates
    with open(locations_path, "w", encoding="utf-8") as f:
        json.dump(locations, f, indent=2, ensure_ascii=False)
        
    print(f"\n==================================================")
    print(f"  Successfully matched {matched_count} / {len(locations)} locations!")
    print(f"  Saved coordinates directly into locations.json")
    print(f"==================================================")

if __name__ == "__main__":
    match_locations()
