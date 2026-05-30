import json
import os

def append_locations():
    file_path = r"d:\google antigravity\WHEELOFTIME\locations.json"
    
    # Load current locations
    with open(file_path, "r", encoding="utf-8") as f:
        current_locs = json.load(f)
        
    # Get set of existing IDs to prevent duplicates
    existing_ids = {loc["id"] for loc in current_locs}
    
    # List of new unmapped locations (in Python, null is None)
    new_locs = [
        # --- Capitals ---
        {
            "id": "bandar_eban",
            "name_en": "Bandar Eban",
            "name_he": "בנדר אבן",
            "desc_en": "The capital of Arad Doman, a major merchant seaport on the Aryth Ocean.",
            "desc_he": "עיר הבירה של ארד דומאן, עיר נמל מסחרית גדולה לחוף האוקיינוס האריתי.",
            "category": "capital",
            "coords": None
        },
        {
            "id": "tanchico",
            "name_en": "Tanchico",
            "name_he": "טנצ'יקו",
            "desc_en": "The capital of Tarabon, a massive ancient city built on three peninsulas, famous for its grand palaces and canals.",
            "desc_he": "עיר הבירה של טראבון, עיר עתיקה עצומה הבנויה על שלושה חצאי איים, המפורסמת בארמונותיה המפוארים ובתעלותיה.",
            "category": "capital",
            "coords": None
        },
        {
            "id": "chachin",
            "name_en": "Chachin",
            "name_he": "צ'אצ'ין",
            "desc_en": "The capital of Kandor, a heavily fortified city built on a steep hill in the Borderlands.",
            "desc_he": "עיר הבירה של קנדור, עיר מבוצרת בכבדות הבנויה על גבעה תלולה בארצות הספר בצפון.",
            "category": "capital",
            "coords": None
        },
        {
            "id": "fal_moran",
            "name_en": "Fal Moran",
            "name_he": "פאל מוראן",
            "desc_en": "The capital city of Shienar, built on high ground to guard the borderlands against the Great Blight.",
            "desc_he": "עיר הבירה של שינאר, הבנויה על גבעה נישאה כדי לשמור על ארצות הספר מפני השממה הגדולה.",
            "category": "capital",
            "coords": None
        },
        {
            "id": "far_madding",
            "name_en": "Far Madding",
            "name_he": "פאר מאדינג",
            "desc_en": "An independent, ancient city-state built in the middle of a lake, protected by a unique Ter'angreal that prevents all channeling of the One Power.",
            "desc_he": "עיר-מדינה עתיקה ועצמאית הבנויה בלב אגם, המוגנת על ידי חפץ כוח (Ter'angreal) ייחודי המונע לחלוטין תיעול של הכוח האחד בתחומיה.",
            "category": "capital",
            "coords": None
        },
        {
            "id": "mayene",
            "name_en": "Mayene",
            "name_he": "מיין",
            "desc_en": "A rich city-state in the far southeast, famous for its oilfish trade and ruled by the First of Mayene.",
            "desc_he": "עיר-מדינה עשירה בקצה הדרום-מזרחי, המפורסמת במסחר בשמן דגים ונשלטת על ידי 'הראשון של מיין' (First of Mayene).",
            "category": "capital",
            "coords": None
        },
        {
            "id": "lugard",
            "name_en": "Lugard",
            "name_he": "לוגארד",
            "desc_en": "The capital of Murandy, a major trading hub situated at the crossroads of several trade routes, famous for its thieves and taverns.",
            "desc_he": "עיר הבירה של מורנדי, מרכז מסחרי חשוב השוכן בצומת של מספר נתיבי סחר, וידוע לשמצה בגנביו ובפונדקיו הרבים.",
            "category": "capital",
            "coords": None
        },
        
        # --- Cities ---
        {
            "id": "fal_dara",
            "name_en": "Fal Dara",
            "name_he": "פאל דארה",
            "desc_en": "A highly disciplined fortress city in Shienar, located near Tarwin's Gap, famous for its peace and iron defense against Trollocs.",
            "desc_he": "עיר מבצר ממושמעת ומאורגנת ביותר בשינאר, השוכנת בסמוך למעבר טארווין, ומפורסמת בהגנת הברזל של מול הטרולוקים.",
            "category": "city",
            "coords": None
        },
        {
            "id": "shol_aran",
            "name_en": "Shol Aran",
            "name_he": "שול אראן",
            "desc_en": "A spired city in Arafel in the northern Borderlands.",
            "desc_he": "עיר צריחים באראפל שבארצות הספר הצפוניות.",
            "category": "city",
            "coords": None
        },
        {
            "id": "canluum",
            "name_en": "Canluum",
            "name_he": "קנלום",
            "desc_en": "A walled borderland city in Arafel, a vital defense post near the Mountains of Dhoom.",
            "desc_he": "עיר ספר מוקפת חומה באראפל, המהווה עמדת הגנה חיונית סמוך להרי דום בצפון.",
            "category": "city",
            "coords": None
        },
        {
            "id": "katar",
            "name_en": "Katar",
            "name_he": "קאטאר",
            "desc_en": "A high-altitude city located in the Mountains of Mist, famous for its iron ore mines.",
            "desc_he": "עיר הררית גבוהה השוכנת בלב הרי הערפל, הידועה במכרות הברזל העשירים שלה.",
            "category": "city",
            "coords": None
        },
        {
            "id": "salidar",
            "name_en": "Salidar",
            "name_he": "סאלידאר",
            "desc_en": "An abandoned city in Altara, chosen as the secret headquarters for the rebel Aes Sedai who opposed Elaida.",
            "desc_he": "עיר נטושה באלטארה, שנבחרה לשמש כמפקדה הסודית של האס סדאי המורדות שהתנגדו לאליידה.",
            "category": "city",
            "coords": None
        },
        {
            "id": "malden",
            "name_en": "Malden",
            "name_he": "מאלדן",
            "desc_en": "A city in southern Altara, captured by the Shaido Aiel during the later books.",
            "desc_he": "עיר בדרום אלטארה, שנכבשה על ידי שבט השאידו אייל במהלך הספרים המאוחרים.",
            "category": "city",
            "coords": None
        },
        {
            "id": "godan",
            "name_en": "Godan",
            "name_he": "גודאן",
            "desc_en": "A port city in Tear, situated on the southern coast near Mayene.",
            "desc_he": "עיר נמל בממלכת טיר, השוכנת בחוף הדרומי סמוך למיין.",
            "category": "city",
            "coords": None
        },
        {
            "id": "aringill",
            "name_en": "Aringill",
            "name_he": "ארינגיל",
            "desc_en": "A major port city on the River Erinin, serving as Andor's main port for trade with Cairhien.",
            "desc_he": "עיר נמל מרכזית על נהר הארינין, המשמשת כנמל הראשי של אנדור למסחר עם קאירהיין.",
            "category": "city",
            "coords": None
        },
        {
            "id": "mehar",
            "name_en": "Mehar",
            "name_he": "מהאר",
            "desc_en": "A city in northern Saldaea in the Borderlands.",
            "desc_he": "עיר בצפון סלדאה בארצות הספר הצפוניות.",
            "category": "city",
            "coords": None
        },
        {
            "id": "cold_rocks_hold",
            "name_en": "Cold Rocks Hold",
            "name_he": "מצודת סלעים קרים",
            "desc_en": "A major Aiel hold belonging to the Taardad Aiel, built in a rugged canyon.",
            "desc_he": "מצודת אייל מרכזית השייכת לשבט הטאראדד אייל, הבנויה בתוך קניון סלעי קשוח.",
            "category": "city",
            "coords": None
        },
        
        # --- Ruins ---
        {
            "id": "shadar_logoth",
            "name_en": "Shadar Logoth",
            "name_he": "שאדאר לוגות",
            "desc_en": "Formerly Aridhol, a ruined city consumed by a dark, non-Shadow malevolence known as Mashadar. (Contains a Waygate).",
            "desc_he": "נקראה בעבר ארידהול; עיר עתיקה והרוסה שנבלעה על ידי ישות מרושעת ואפלה שאינה קשורה לאדון האופל, המכונה מאשאדאר (Mashadar). (מכילה שער דרכים).",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "manetheren",
            "name_en": "Manetheren",
            "name_he": "מנתרן",
            "desc_en": "The mountain-home ruins of the legendary ancient nation of Manetheren, which fell in the Trolloc Wars. (Contains a Waygate).",
            "desc_he": "חורבותיה ההרריות של המעצמה העתיקה והמפוארת מנתרן, שנפלה במלחמות הטרולוקים לאחר הגנה הירואית. (מכילה שער דרכים).",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "harad_dakar",
            "name_en": "Harad Dakar",
            "name_he": "חארד דקאר",
            "desc_en": "An ancient ruined city located in Shienar near the Spine of the World.",
            "desc_he": "עיר עתיקה והרוסה השוכנת בשינאר בסמוך לשדרת העולם.",
            "category": "landmark",
            "coords": None
        },

        # --- Steddings ---
        {
            "id": "stedding_tsofu",
            "name_en": "Stedding Tsofu",
            "name_he": "סטדינג צופו",
            "desc_en": "One of the most famous Ogier steddings, located in Cairhien, where Rand and his companions met the Ogier elders.",
            "desc_he": "אחד הסטדינגים המפורסמים ביותר של האוגיר, השוכן בקאירהיין. שם נפגשו רנד וחבריו עם זקני האוגיר והשתמשו בפורטל אבן.",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "stedding_saishen",
            "name_en": "Stedding Saishen",
            "name_he": "סטדינג סאישן",
            "desc_en": "An Ogier stedding located in Saldaea.",
            "desc_he": "סטדינג של אוגיר השוכן בסלדאה בצפון.",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "stedding_chiantal",
            "name_en": "Stedding Chiantal",
            "name_he": "סטדינג צ'יאנטל",
            "desc_en": "An Ogier stedding located in Kandor.",
            "desc_he": "סטדינג של אוגיר השוכן בקנדור בצפון.",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "stedding_sholoon",
            "name_en": "Stedding Sholoon",
            "name_he": "סטדינג שולון",
            "desc_en": "An Ogier stedding located in Arafel.",
            "desc_he": "סטדינג של אוגיר השוכן באראפל בצפון.",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "stedding_jinsiun",
            "name_en": "Stedding Jinsiun",
            "name_he": "סטדינג ג'ינסיוון",
            "desc_en": "An Ogier stedding located in southern Andor near the Forest of Shadows.",
            "desc_he": "סטדינג של אוגיר השוכן בדרום אנדור, בסמוך ליער הצללים.",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "stedding_shangtai",
            "name_en": "Stedding Shangtai",
            "name_he": "סטדינג שאנגטאי",
            "desc_en": "A major Ogier stedding located in the Spine of the World, home of Loial. (Contains a Waygate).",
            "desc_he": "סטדינג מרכזי וגדול של אוגיר השוכן בשדרת העולם, ביתו המקורי של לויאל (Loial). (מכיל שער דרכים).",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "stedding_jongai",
            "name_en": "Stedding Jongai",
            "name_he": "סטדינג ג'ונגאי",
            "desc_en": "An Ogier stedding located in western Saldaea.",
            "desc_he": "סטדינג של אוגיר השוכן במערב סלדאה.",
            "category": "landmark",
            "coords": None
        },

        # --- Landmarks ---
        {
            "id": "eye_of_the_world",
            "name_en": "The Eye of the World",
            "name_he": "עין העולם",
            "desc_en": "A pool of pure, untainted Saidin guarded by the Green Man in the Great Blight, crucial in the first book.",
            "desc_he": "בריכה של סאידין (Saidin) טהור ולא מזוהם, המוגנת על ידי האיש הירוק (Green Man) במעמקי השממה הגדולה.",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "dumais_wells",
            "name_en": "Dumai's Wells",
            "name_he": "בארות דומאי",
            "desc_en": "A set of water wells in the Caralain Grass, site of the historic, brutal battle between Shaido Aiel, Aes Sedai, and Asha'man.",
            "desc_he": "קבוצת בארות מים בערבות קראלין, אתר הקרב ההיסטורי והאכזרי שבו השתמשו האשא'מן בכוחם כדי לחלץ את הדרקון שנשבה.",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "tower_of_ghenjei",
            "name_en": "Tower of Ghenjei",
            "name_he": "מגדל ג'נג'אי",
            "desc_en": "A massive, seamless tower made of shiny, unbreakable metal, serving as a portal to the realms of the Aelfinn and Eelfinn.",
            "desc_he": "מגדל עצום ובלתי ניתן להריסה העשוי ממתכת מבריקה ללא חיבורים, המשמש כפורטל כניסה לעולמם של האלפין והאלפין (Aelfinn & Eelfinn).",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "hawkwing_statue",
            "name_en": "Hawkwing's Statue",
            "name_he": "פסל הוקווינג",
            "desc_en": "A colossal monument erected in Andor, dedicated to the legendary High King Artur Hawkwing.",
            "desc_he": "מונומנט עצום מימדים שהוקם באנדור לזכרו של המלך הגדול המיתולוגי ארתור הוקווינג.",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "black_tower",
            "name_en": "The Black Tower",
            "name_he": "המגדל השחור",
            "desc_en": "The training academy and city for male channelers (Asha'man), founded by Rand al'Thor on a farm in Andor.",
            "desc_he": "האקדמיה והעיר של המתעלים הזכרים (Asha'man), שהוקמה על ידי רנד אל'תור בחווה מבודדת באנדור.",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "alcair_dal",
            "name_en": "Alcair Dal",
            "name_he": "אלקאיר דאל",
            "desc_en": "A massive canyon in the Aiel Waste, the sacred gathering place where Rand declared himself the Car'a'carn.",
            "desc_he": "קניון עצום בשממת האייל, מקום המפגש המקודש שבו הכריז רנד אל'תור על עצמו כקאר'א'קארן (מנהיג שבטי האייל).",
            "category": "landmark",
            "coords": None
        },

        # --- Towns/Villages ---
        {
            "id": "taren_ferry",
            "name_en": "Taren Ferry",
            "name_he": "מעבורת טארן",
            "desc_en": "A village in the Two Rivers, famous for its ferry across the Taren River and its suspicious, clever inhabitants.",
            "desc_he": "כפר בצפון שני הנהרות, המפורסם במעבורת שלו החוצה את נהר הטארן, ובתושביו הפקחים והחשדנים.",
            "category": "city",
            "coords": None
        },
        {
            "id": "watch_hill",
            "name_en": "Watch Hill",
            "name_he": "גבעת התצפית",
            "desc_en": "A village built on a high hill in the Two Rivers, centered around a large white stone spring.",
            "desc_he": "כפר הבנוי על גבעה נישאה בשני הנהרות, ובמרכזו מעיין מים מאבן לבנה גדולה.",
            "category": "city",
            "coords": None
        },
        {
            "id": "deven_ride",
            "name_en": "Deven Ride",
            "name_he": "מעלה דבן",
            "desc_en": "A village in the southern part of the Two Rivers, famous for its apple orchards and deep wells.",
            "desc_he": "כפר בחלק הדרומי של שני הנהרות, המפורסם במטעי התפוחים שלו ובבארות המים העמוקות שלו.",
            "category": "city",
            "coords": None
        },
        {
            "id": "hinderstap",
            "name_en": "Hinderstap",
            "name_he": "הינדרסטאפ",
            "desc_en": "A cursed, walled village near Murandy where the inhabitants go violently insane every night, only to wake up completely normal and resurrected the next morning.",
            "desc_he": "כפר מקולל מוקף חומה ליד מורנדי, שבו התושבים הופכים למטורפים רצחניים בכל לילה מחדש, ומתעוררים לחיים בריאים לחלוטין בבוקר שלמחרת.",
            "category": "city",
            "coords": None
        },
        {
            "id": "so_habor",
            "name_en": "So Habor",
            "name_he": "סו האבור",
            "desc_en": "A town in northern Amadicia, haunted by ghosts and decaying food due to the thinning of the Pattern.",
            "desc_he": "עיירה בצפון אמדיסיה, שנרדפת על ידי רוחות רפאים ומזון נרקב במהירות בעקבות היחלשות מארג הזמן (The Pattern).",
            "category": "city",
            "coords": None
        },
        {
            "id": "seven_towers",
            "name_en": "Seven Towers",
            "name_he": "שבעת המגדלים",
            "desc_en": "The ruins of the magnificent capital city of Malkier, now swallowed by the Great Blight.",
            "desc_he": "חורבות עיר הבירה המפוארת של מלכיר האבודה, שנבלעה כעת על ידי השממה הגדולה.",
            "category": "landmark",
            "coords": None
        },
        {
            "id": "so_eban",
            "name_en": "So Eban",
            "name_he": "סו אבן",
            "desc_en": "A town in eastern Amadicia near the river Eldar.",
            "desc_he": "עיירה במזרח אמדיסיה השוכנת סמוך לנהר האלדאר.",
            "category": "city",
            "coords": None
        },
        {
            "id": "maderin",
            "name_en": "Maderin",
            "name_he": "מאדרין",
            "desc_en": "A busy trading town located on the border between Altara and Amadicia.",
            "desc_he": "עיירת סחר סואנת השוכנת על הגבול שבין אלטארה לאמדיסיה.",
            "category": "city",
            "coords": None
        },
        {
            "id": "jurador",
            "name_en": "Jurador",
            "name_he": "ג'וראדור",
            "desc_en": "A town in Altara, famous for its olive groves and leather manufacturing.",
            "desc_he": "עיירה באלטארה, הידועה במטעי הזיתים שלה ובמפעלי עיבוד העורות שלה.",
            "category": "city",
            "coords": None
        },
        {
            "id": "remen",
            "name_en": "Remen",
            "name_he": "רמן",
            "desc_en": "A river town in Murandy, where Perrin met Gaul the Aielman and saved him from a cage.",
            "desc_he": "עיירת נהר במורנדי, שבה פגש פרין לראשונה את גאול (Gaul) האייל והציל אותו מכלוב תלוי.",
            "category": "city",
            "coords": None
        },
        {
            "id": "samara",
            "name_en": "Samara",
            "name_he": "סמארה",
            "desc_en": "A city in Ghealdan situated on the River Eldar, where Nynaeve and Elayne met the Prophet.",
            "desc_he": "עיירה בגהאלדן השוכנת על נהר האלדאר, שבה נפגשו נינאב ואליין לראשונה עם 'הנביא'.",
            "category": "city",
            "coords": None
        }
    ]
    
    # Filter out duplicates just in case
    added_count = 0
    for loc in new_locs:
        if loc["id"] not in existing_ids:
            current_locs.append(loc)
            existing_ids.add(loc["id"])
            added_count += 1
            
    # Save back to file
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(current_locs, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully appended {added_count} new unmapped locations to locations.json!")

if __name__ == "__main__":
    append_locations()
