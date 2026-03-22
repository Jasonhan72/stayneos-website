import json

with open('messages/zh.json', 'r') as f:
    zh = json.load(f)

# --- longterm remaining ---
lt = zh['longterm']
lt['form']['leaseDuration'] = '首选租约时长'
lt['form']['selectType'] = '请选择类型'
lt['testimonials'] = lt.get('testimonials', {})
lt['testimonials']['subtitle'] = '看看我们的长租住户如何省钱并享受优质生活。'
lt['usecases'] = lt.get('usecases', {})
lt['usecases']['title'] = '适合您的场景'
lt['usecases']['subtitle'] = '长租方案适用于各种生活和商务场景。'
lt['pricing'] = lt.get('pricing', {})
lt['pricing']['select'] = '选择此方案'
lt['pricing']['title'] = '选择您的节省方案'
lt['pricing']['subtitle'] = '住得越久，省得越多。所有方案均包含优质设施和服务。'
lt['benefits'] = lt.get('benefits', {})
lt['benefits']['title'] = '一切全包'
lt['benefits']['subtitle'] = '所有长租方案均包含优质设施和服务。'

# --- students remaining ---
st = zh['students']
st['form']['programPlaceholder'] = '例如：计算机科学'
st['form']['program'] = '专业/学科'
st['form']['roomType'] = '首选房间类型'
st['form']['tmu'] = '多伦多都会大学'
st['form']['seneca'] = 'Seneca 理工学院'
st['features'] = st.get('features', {})
st['features']['subtitle'] = '每个空间都为学生的成功而设计，从学习区域到社交空间。'
st['universities'] = st.get('universities', {})
st['universities']['title'] = '合作院校'
st['universities']['subtitle'] = '位于多伦多顶尖教育机构附近的战略性位置。'

with open('messages/zh.json', 'w') as f:
    json.dump(zh, f, indent=2, ensure_ascii=False)

print("Fixed remaining English strings in zh.json")
