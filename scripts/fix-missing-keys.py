import json

missing_translations = {
    "en": {
        "dashboard": {
            "confirmCancel": "Are you sure you want to cancel this booking?",
            "totalBookings": "Total Bookings"
        },
        "longterm": {
            "form": {
                "areas": {
                    "downtown": "Downtown Core",
                    "yorkville": "Yorkville",
                    "liberty": "Liberty Village",
                    "midtown": "Midtown",
                    "northYork": "North York",
                    "waterfront": "Waterfront"
                }
            }
        },
        "property": {
            "showLess": "Show Less"
        }
    },
    "zh": {
        "dashboard": {
            "confirmCancel": "确定要取消这个预订吗？",
            "totalBookings": "总预订数"
        },
        "longterm": {
            "form": {
                "areas": {
                    "downtown": "市中心",
                    "yorkville": "约克维尔",
                    "liberty": "自由村",
                    "midtown": "中城区",
                    "northYork": "北约克",
                    "waterfront": "湖滨区"
                }
            }
        },
        "property": {
            "showLess": "收起"
        }
    },
    "fr": {
        "dashboard": {
            "confirmCancel": "Êtes-vous sûr de vouloir annuler cette réservation ?",
            "totalBookings": "Total des réservations"
        },
        "longterm": {
            "form": {
                "areas": {
                    "downtown": "Centre-ville",
                    "yorkville": "Yorkville",
                    "liberty": "Liberty Village",
                    "midtown": "Midtown",
                    "northYork": "North York",
                    "waterfront": "Front de mer"
                }
            }
        },
        "property": {
            "showLess": "Voir moins"
        }
    }
}

def deep_merge(base, additions):
    for key, value in additions.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            deep_merge(base[key], value)
        else:
            base[key] = value

for lang in ['en', 'zh', 'fr']:
    with open(f'messages/{lang}.json', 'r') as f:
        data = json.load(f)
    deep_merge(data, missing_translations[lang])
    with open(f'messages/{lang}.json', 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'{lang}: patched')

print("Done!")
