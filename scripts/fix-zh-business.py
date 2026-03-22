import json

with open('messages/zh.json', 'r') as f:
    zh = json.load(f)

biz = zh['business']

# Fix hero
biz['hero']['title'] = '企业住宿解决方案'
biz['hero']['subtitle'] = '为商务旅客、员工搬迁和项目团队提供一站式住宿方案。降低成本，简化流程，为您的企业提供优质住房。'
biz['hero']['ctaQuote'] = '获取报价'
biz['hero']['ctaBrowse'] = '探索方案'

# Fix solutions
biz['solutions']['title'] = '满足各种需求的方案'
biz['solutions']['subtitle'] = '从商务差旅人员到大型项目团队，我们为您的企业提供完美的住宿解决方案。'

# Fix advantages
biz['advantages']['subtitle'] = '通过我们全面的企业解决方案，升级您的企业住宿策略。'

# Fix cases
biz['cases']['subtitle'] = '了解领先企业如何通过 NEOS 优化住宿策略。'

# Fix features
biz['features']['subtitle'] = '企业级功能，简化企业住宿管理。'

# Fix stats
biz['stats']['savings'] = '比酒店平均节省'

# Fix form
biz['form']['title'] = '获取定制报价'
biz['form']['subtitle'] = '告诉我们您的需求，我们的团队将为您的企业定制方案。'
biz['form']['companyNamePlaceholder'] = '您的公司名称'
biz['form']['contactNamePlaceholder'] = '您的全名'
biz['form']['emailPlaceholder'] = 'your@company.com'
biz['form']['jobTitlePlaceholder'] = '您的职位'
biz['form']['accommodationType'] = '住宿类型'
biz['form']['selectType'] = '请选择'
biz['form']['individual'] = '个人差旅'
biz['form']['group'] = '团体住宿'
biz['form']['projectTeam'] = '项目团队'
biz['form']['numberOfUnits'] = '公寓数量'
biz['form']['selectUnits'] = '请选择'
biz['form']['duration'] = '预计住宿时长'
biz['form']['selectDuration'] = '请选择'
biz['form']['months'] = '个月'
biz['form']['selectBudget'] = '请选择预算范围'
biz['form']['requirementsPlaceholder'] = '请描述您的住宿需求、首选地点、特殊要求、时间安排及其他细节，以帮助我们为您量身定制方案...'
biz['form']['submit'] = '提交报价请求'
biz['form']['success']['title'] = '报价请求已提交！'
biz['form']['success']['message'] = '感谢您的关注！我们的商务团队将分析您的需求，并在24小时内联系您提供定制方案和报价。'

with open('messages/zh.json', 'w') as f:
    json.dump(zh, f, indent=2, ensure_ascii=False)

print("Fixed 31 English strings in zh.json business section")
