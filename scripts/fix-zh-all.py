import json

with open('messages/zh.json', 'r') as f:
    zh = json.load(f)

# --- aboutPage ---
zh['aboutPage']['missionLabel'] = '我们的使命'
zh['aboutPage']['whyLabel'] = '为什么选择我们'
zh['aboutPage']['commitLabel'] = '我们的承诺'

# --- hosts ---
h = zh['hosts']
h['form']['title'] = '立即发布您的房源'
h['form']['subtitle'] = '填写以下表格，我们的团队将在24小时内与您联系。'
h['form']['firstNamePlaceholder'] = '请输入名字'
h['form']['lastNamePlaceholder'] = '请输入姓氏'
h['form']['propertyAddressPlaceholder'] = '请输入房产地址'
h['form']['message'] = '介绍您的房产'
h['form']['messagePlaceholder'] = '请描述您的房产、目前状况、装修情况及其他相关信息...'
h['form']['selectType'] = '请选择类型'
h['form']['success'] = h['form'].get('success', {})
h['form']['success']['title'] = '申请已提交！'
h['form']['success']['message'] = '感谢您的关注！我们的团队将在48小时内审核您的申请并与您联系。'
h['form']['submit'] = '提交申请'
h['form']['submitting'] = '提交中...'
h['form']['companyName'] = '公司名称'
h['form']['companyNamePlaceholder'] = '您的公司名称'
h['form']['emailPlaceholder'] = 'your@email.com'
h['form']['phonePlaceholder'] = '+1 (555) 000-0000'
h['form']['requirements'] = '具体需求'
h['form']['requirementsPlaceholder'] = '请描述您的房产及需求...'

# --- longterm ---
lt = zh['longterm']
lt['hero']['subtitle'] = '通过我们灵活的长租方案，为延住大幅节省开支。'
lt['hero']['savingsCta'] = '查看优惠'
lt['advantages']['subtitle'] = '除了节省费用，长住还能带来稳定、便利和归属感。'
lt['form']['title'] = lt['form'].get('title', '获取长租报价')
lt['form']['subtitle'] = '告诉我们您的长期住房需求，我们将为您定制个性化方案和报价。'
lt['form']['submit'] = '获取报价和优惠'
lt['form']['message'] = '请描述您的需求'
lt['form']['messagePlaceholder'] = '请描述您的长期住房需求、具体要求、预算范围及其他细节...'
lt['form']['selectLocation'] = '请选择区域'
lt['form']['location'] = '首选区域'
lt['form']['moveInDate'] = '期望入住日期'
lt['form']['success'] = lt['form'].get('success', {})
lt['form']['success']['title'] = '报价请求已提交！'
lt['form']['success']['message'] = '感谢您的关注！我们的团队将分析您的需求，并在24小时内联系您提供定制方案。'
lt['form']['firstName'] = '名字'
lt['form']['lastName'] = '姓氏'
lt['form']['firstNamePlaceholder'] = '请输入名字'
lt['form']['lastNamePlaceholder'] = '请输入姓氏'
lt['form']['email'] = '邮箱'
lt['form']['emailPlaceholder'] = 'your@email.com'
lt['form']['phone'] = '电话'
lt['form']['phonePlaceholder'] = '+1 (555) 000-0000'
lt['form']['duration'] = '住宿时长'
lt['form']['selectDuration'] = '请选择'
lt['form']['budget'] = '月度预算'
lt['form']['selectBudget'] = '请选择预算范围'

# --- marketInsights ---
mi = zh['marketInsights']
mi['charts'] = mi.get('charts', {})
mi['charts']['title'] = '市场数据可视化'
mi['charts']['subtitle'] = '交互式图表，展示市场趋势、定价数据和需求指标。'
mi['charts']['rentalTrendsDesc'] = '24个月不同房型的历史租金走势。'
mi['charts']['occupancyRatesDesc'] = '多伦多各主要行政住宿区域的入住率对比。'
mi['charts']['demandSourcesDesc'] = '按行业和公司规模划分的企业住宿需求分布。'
mi['charts']['forecastModelDesc'] = '租金、入住率和市场状况的预测模型。'
mi['form'] = mi.get('form', {})
mi['form']['subtitle'] = '获取我们的综合市场分析报告，包括详细的定价数据和行业洞察。'
mi['form']['jobTitlePlaceholder'] = '您的职位'
mi['form']['lastNamePlaceholder'] = '请输入姓氏'
mi['form']['firstNamePlaceholder'] = '请输入名字'
mi['form']['companyPlaceholder'] = '您的公司名称'
mi['form']['emailPlaceholder'] = 'your@email.com'
mi['form']['phonePlaceholder'] = '+1 (555) 000-0000'
mi['form']['success'] = mi['form'].get('success', {})
mi['form']['success']['title'] = '报告下载准备就绪！'
mi['form']['success']['message'] = '感谢您的关注！我们的市场分析团队将在24小时内将完整报告发送到您的邮箱。'
mi['form']['submit'] = '下载报告'
mi['form']['submitting'] = '提交中...'
mi['form']['selectInterest'] = '请选择'
mi['form']['title'] = '获取完整市场报告'
mi['form']['messagePlaceholder'] = '请告诉我们您对哪些市场数据或区域特别感兴趣...'

# --- neighborhoods ---
nb = zh['neighborhoods']
nb['facts'] = nb.get('facts', {})
nb['facts']['subtitle'] = '行政旅客和商务人士的必备指南。'
nb['data'] = nb.get('data', {})
if 'downtown' in nb['data']:
    nb['data']['downtown']['name'] = '市中心 / Grange Park（238 Simcoe St）'
    if 'features' in nb['data']['downtown']:
        nb['data']['downtown']['features']['1'] = '紧邻 AGO、OCAD、多伦多大学 St. George 校区'
if 'north-york' in nb['data']:
    nb['data']['north-york']['name'] = '北约克 / Yonge-Sheppard（28 Avondale Ave）'
if 'waterfront' in nb['data']:
    nb['data']['waterfront']['name'] = '湖滨区 / Sugar Wharf（55 Cooper St）'
    if 'features' in nb['data']['waterfront']:
        nb['data']['waterfront']['features']['4'] = '邻近 Scotiabank Arena、Rogers Centre、Jack Layton 渡轮码头'
nb['cta'] = nb.get('cta', {})
nb['cta']['title'] = '准备好找到您在多伦多的理想居所了吗？'
nb['cta']['subtitle'] = '浏览我们精选的各优质社区行政公寓。'

# --- students ---
st = zh['students']
st['audience'] = st.get('audience', {})
st['audience']['2'] = '医学研究员 / 住院医师'
st['form'] = st.get('form', {})
st['form']['title'] = '申请学生住房'
st['form']['subtitle'] = '准备好预订您在多伦多的学生住房了吗？填写申请表，我们的团队将在24小时内与您联系。'
st['form']['lastNamePlaceholder'] = '请输入姓氏'
st['form']['firstNamePlaceholder'] = '请输入名字'
st['form']['selectUniversity'] = '请选择学校'
st['form']['studio'] = '独立套房'
st['form']['shared'] = '合租房间'
st['form']['cc'] = 'Centennial College'
st['form']['ocad'] = 'OCAD 大学'
st['form']['gbc'] = 'George Brown College'
st['form']['submit'] = '提交申请'
st['form']['submitting'] = '提交中...'
st['form']['emailPlaceholder'] = 'your@email.com'
st['form']['phonePlaceholder'] = '+1 (555) 000-0000'
st['form']['selectBudget'] = '请选择预算范围'
st['form']['selectDuration'] = '请选择'
st['form']['success'] = st['form'].get('success', {})
st['form']['success']['title'] = '申请已提交！'
st['form']['success']['message'] = '感谢您的申请！我们的团队将在24小时内审核并与您联系。'
st['form']['messagePlaceholder'] = '请描述您的住房需求、偏好及其他细节...'
st['form']['message'] = '其他需求'

with open('messages/zh.json', 'w') as f:
    json.dump(zh, f, indent=2, ensure_ascii=False)

print("Fixed all remaining English strings in zh.json")
