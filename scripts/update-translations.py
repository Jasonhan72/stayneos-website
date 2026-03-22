#!/usr/bin/env python3
"""Add missing business page translations to all locale files."""
import json
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

new_en = {
    "solutions": {
        "individual": {"title": "Business Travel", "description": "Individual accommodations for executives and business travelers with premium amenities and 24/7 concierge support.", "f1": "Executive suites", "f2": "Airport transfers", "f3": "Concierge service", "f4": "Flexible check-in"},
        "relocation": {"title": "Employee Relocation", "description": "Temporary housing for relocating employees with move-in ready apartments and local orientation support.", "f1": "Fully furnished", "f2": "Utilities included", "f3": "Local orientation", "f4": "Flexible terms"},
        "group": {"title": "Group Accommodations", "description": "Multiple units for training programs, conferences, or project teams with centralized billing and coordination.", "f1": "Bulk booking discounts", "f2": "Team coordination", "f3": "Centralized billing", "f4": "Meeting spaces"},
        "longterm": {"title": "Long-term Projects", "description": "Extended stays for project teams or extended assignments with cost-effective monthly rates and dedicated support.", "f1": "Extended stay rates", "f2": "Project coordination", "f3": "Regular housekeeping", "f4": "Dedicated account manager"}
    },
    "advantages": {
        "flexible": {"title": "Flexible Terms", "description": "Month-to-month agreements with no long-term commitments. Scale up or down based on your business needs.", "stat": "30-day minimum"},
        "cost": {"title": "Cost Savings", "description": "Save 30-40% compared to hotels for extended stays. All-inclusive pricing with no hidden fees.", "stat": "Up to 40% savings"},
        "manager": {"title": "Dedicated Account Manager", "description": "Personal account manager for seamless booking, billing, and ongoing support throughout your partnership.", "stat": "24/7 support"},
        "billing": {"title": "Streamlined Billing", "description": "Consolidated monthly invoicing with detailed reporting and expense tracking for easy reconciliation.", "stat": "Single invoice"}
    },
    "cases": {
        "saved": "saved", "challengeLabel": "Challenge:", "solutionLabel": "Solution:", "resultLabel": "Result:", "label": "Typical Scenario",
        "tech": {"company": "Tech Startup", "challenge": "Needed 15 units for 6-month project team relocation to Toronto", "solution": "Provided furnished apartments in downtown core with meeting spaces", "result": "Saved $180,000 compared to hotels while improving team productivity"},
        "consulting": {"company": "Consulting Firm", "challenge": "Executive travel program with unpredictable durations", "solution": "Flexible booking system with premium downtown suites", "result": "Reduced accommodation costs by 35% with improved executive satisfaction"},
        "manufacturing": {"company": "Manufacturing Corp", "challenge": "Employee relocation program for new Toronto office", "solution": "Staged move-in process with temporary housing for 50+ employees", "result": "Smooth transition with 95% employee satisfaction rating"}
    },
    "features": {
        "booking": {"title": "Easy Booking", "description": "Online platform for easy reservations and modifications"},
        "reporting": {"title": "Expense Reporting", "description": "Detailed reporting for expense management and budgeting"},
        "support": {"title": "24/7 Support", "description": "Round-the-clock support for urgent needs and modifications"},
        "quality": {"title": "Quality Guarantee", "description": "Vetted properties meeting corporate standards"}
    }
}

new_zh = {
    "solutions": {
        "individual": {"title": "商务差旅", "description": "为高管和商务旅客提供高端住宿，配备优质设施和24/7礼宾服务。", "f1": "行政套房", "f2": "机场接送", "f3": "礼宾服务", "f4": "灵活入住"},
        "relocation": {"title": "员工搬迁", "description": "为搬迁员工提供临时住房，公寓拎包入住，并提供本地指引支持。", "f1": "全套家具", "f2": "水电全包", "f3": "本地指引", "f4": "灵活租期"},
        "group": {"title": "团体住宿", "description": "为培训项目、会议或项目团队提供多套公寓，统一计费和协调管理。", "f1": "团体预订折扣", "f2": "团队协调", "f3": "统一计费", "f4": "会议空间"},
        "longterm": {"title": "长期项目", "description": "为项目团队或长期任务提供延住服务，享受实惠月租和专属支持。", "f1": "长住优惠价", "f2": "项目协调", "f3": "定期保洁", "f4": "专属客户经理"}
    },
    "advantages": {
        "flexible": {"title": "灵活租期", "description": "按月签约，无长期承诺。根据您的业务需求灵活调整。", "stat": "30天起租"},
        "cost": {"title": "节省成本", "description": "长住比酒店节省30-40%。全包价格，无隐藏费用。", "stat": "最高节省40%"},
        "manager": {"title": "专属客户经理", "description": "专属客户经理负责预订、账单和持续支持服务。", "stat": "24/7支持"},
        "billing": {"title": "简化账单", "description": "统一月度账单，提供详细报告和费用追踪，方便对账。", "stat": "统一发票"}
    },
    "cases": {
        "saved": "节省", "challengeLabel": "挑战：", "solutionLabel": "解决方案：", "resultLabel": "成果：", "label": "典型案例",
        "tech": {"company": "科技创业公司", "challenge": "需要15套公寓供6个月项目团队搬迁至多伦多", "solution": "在市中心提供带会议空间的精装公寓", "result": "比酒店节省$180,000，同时提高了团队效率"},
        "consulting": {"company": "咨询公司", "challenge": "高管差旅计划，行程不确定", "solution": "灵活预订系统配合市中心高端套房", "result": "住宿成本降低35%，高管满意度提升"},
        "manufacturing": {"company": "制造业公司", "challenge": "多伦多新办公室员工搬迁计划", "solution": "分阶段入住，为50+员工提供临时住房", "result": "顺利过渡，员工满意度达95%"}
    },
    "features": {
        "booking": {"title": "轻松预订", "description": "在线平台，方便预订和修改"},
        "reporting": {"title": "费用报告", "description": "详细报告，方便费用管理和预算"},
        "support": {"title": "24/7支持", "description": "全天候支持，满足紧急需求"},
        "quality": {"title": "品质保证", "description": "经过审核的房源，符合企业标准"}
    }
}

new_fr = {
    "solutions": {
        "individual": {"title": "Voyages d'affaires", "description": "Hébergement individuel pour cadres et voyageurs d'affaires avec équipements premium et conciergerie 24h/24.", "f1": "Suites exécutives", "f2": "Transferts aéroport", "f3": "Service conciergerie", "f4": "Enregistrement flexible"},
        "relocation": {"title": "Relocalisation d'employés", "description": "Logement temporaire pour les employés en relocalisation avec appartements prêts à vivre et accompagnement local.", "f1": "Entièrement meublé", "f2": "Charges incluses", "f3": "Orientation locale", "f4": "Conditions flexibles"},
        "group": {"title": "Hébergement de groupe", "description": "Plusieurs unités pour programmes de formation, conférences ou équipes de projet avec facturation centralisée.", "f1": "Réductions de groupe", "f2": "Coordination d'équipe", "f3": "Facturation centralisée", "f4": "Espaces de réunion"},
        "longterm": {"title": "Projets long terme", "description": "Séjours prolongés pour équipes de projet avec tarifs mensuels avantageux et support dédié.", "f1": "Tarifs longue durée", "f2": "Coordination de projet", "f3": "Ménage régulier", "f4": "Gestionnaire de compte dédié"}
    },
    "advantages": {
        "flexible": {"title": "Conditions flexibles", "description": "Contrats mensuels sans engagement long terme. Adaptez selon vos besoins.", "stat": "Minimum 30 jours"},
        "cost": {"title": "Économies", "description": "Économisez 30-40% par rapport aux hôtels. Tarification tout inclus, sans frais cachés.", "stat": "Jusqu'à 40% d'économies"},
        "manager": {"title": "Gestionnaire de compte dédié", "description": "Un gestionnaire personnel pour les réservations, la facturation et le support continu.", "stat": "Support 24/7"},
        "billing": {"title": "Facturation simplifiée", "description": "Facturation mensuelle consolidée avec rapports détaillés et suivi des dépenses.", "stat": "Facture unique"}
    },
    "cases": {
        "saved": "économisé", "challengeLabel": "Défi :", "solutionLabel": "Solution :", "resultLabel": "Résultat :", "label": "Scénario typique",
        "tech": {"company": "Startup technologique", "challenge": "15 unités nécessaires pour une relocalisation d'équipe de 6 mois à Toronto", "solution": "Appartements meublés au centre-ville avec espaces de réunion", "result": "180 000 $ économisés par rapport aux hôtels, productivité améliorée"},
        "consulting": {"company": "Cabinet de conseil", "challenge": "Programme de voyages cadres avec durées imprévisibles", "solution": "Système de réservation flexible avec suites premium au centre-ville", "result": "Coûts d'hébergement réduits de 35%, satisfaction des cadres améliorée"},
        "manufacturing": {"company": "Entreprise manufacturière", "challenge": "Programme de relocalisation pour nouveau bureau à Toronto", "solution": "Processus d'emménagement progressif pour 50+ employés", "result": "Transition fluide avec 95% de satisfaction des employés"}
    },
    "features": {
        "booking": {"title": "Réservation facile", "description": "Plateforme en ligne pour réservations et modifications"},
        "reporting": {"title": "Rapports de dépenses", "description": "Rapports détaillés pour la gestion des dépenses"},
        "support": {"title": "Support 24/7", "description": "Support en tout temps pour besoins urgents"},
        "quality": {"title": "Garantie qualité", "description": "Propriétés vérifiées répondant aux normes corporatives"}
    }
}

def deep_merge(base, additions):
    for key, value in additions.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            deep_merge(base[key], value)
        else:
            base[key] = value

for lang, new_keys in [('en', new_en), ('zh', new_zh), ('fr', new_fr)]:
    with open(f'messages/{lang}.json', 'r') as f:
        data = json.load(f)
    deep_merge(data.setdefault('business', {}), new_keys)
    with open(f'messages/{lang}.json', 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'{lang}: updated')

print("Done!")
