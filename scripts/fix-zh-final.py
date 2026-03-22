import json

with open('messages/zh.json', 'r') as f:
    zh = json.load(f)

# --- hosts ---
h = zh['hosts']
h['calculator'] = h.get('calculator', {})
h['calculator']['title'] = '计算您的潜在收入'
h['calculator']['guarantee'] = '无论入住率如何，均有稳定月租收入，外加专业管理服务。'
h['process'] = h.get('process', {})
h['process']['title'] = '流程介绍'
h['process']['subtitle'] = '四个简单步骤，开始获得稳定收入。'
h['hero'] = h.get('hero', {})
h['hero']['calculateCta'] = '计算您的收入'
h['hero']['subtitle'] = '获得有保障的月收入，零空置风险。加入我们的房东合作伙伴计划。'
h['advantages'] = h.get('advantages', {})
h['advantages']['subtitle'] = '加入数百位房产业主，将闲置房产转化为稳定收入来源。'

# --- marketInsights ---
mi = zh['marketInsights']
mi['form']['interests'] = '感兴趣的领域'
mi['form']['reportType'] = '首选报告类型'
mi['form']['custom'] = '定制研究'
mi['form']['selectReport'] = '请选择报告类型'
mi['stats'] = mi.get('stats', {})
mi['stats']['subtitle'] = '多伦多高端行政住宿市场的最新数据。'
mi['neighborhoods'] = mi.get('neighborhoods', {})
mi['neighborhoods']['subtitle'] = '多伦多高端社区行政住宿对比分析。'
mi['insights'] = mi.get('insights', {})
mi['insights']['subtitle'] = '当前市场状况和新兴趋势的专家分析。'
mi['hero'] = mi.get('hero', {})
mi['hero']['downloadCta'] = '下载报告'
mi['hero']['subtitle'] = '多伦多行政住宿市场综合分析和趋势报告。'
mi['forecasts'] = mi.get('forecasts', {})
mi['forecasts']['subtitle'] = '多伦多行政住宿市场的专家预测和分析。'

with open('messages/zh.json', 'w') as f:
    json.dump(zh, f, indent=2, ensure_ascii=False)

print("Done - final fixes applied")
