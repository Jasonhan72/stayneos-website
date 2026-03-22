import json

for lang, city_text in [('en', 'Select City'), ('zh', '选择城市'), ('fr', 'Sélectionner la ville')]:
    with open(f'messages/{lang}.json', 'r') as f:
        data = json.load(f)
    # Fix top-level
    if 'selectLocation' in data:
        data['selectLocation'] = city_text
    # Fix in search section
    if 'search' in data and 'selectLocation' in data['search']:
        data['search']['selectLocation'] = city_text
    with open(f'messages/{lang}.json', 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'{lang}: updated to "{city_text}"')
