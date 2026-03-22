import json

for lang, from_text, per_month in [('en', 'From', 'Mo'), ('zh', '低至', '月'), ('fr', 'À partir de', '/mois')]:
    with open(f'messages/{lang}.json', 'r') as f:
        data = json.load(f)
    data.setdefault('property', {})['from'] = from_text
    data['property']['perMonth'] = per_month
    with open(f'messages/{lang}.json', 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'{lang}: updated')
