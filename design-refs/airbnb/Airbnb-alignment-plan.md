# Airbnb Alignment Plan

> Owner: Neos / Byte · Date: 2026-05-17  
> Goal: Bring stayneos.com visual + interaction patterns closer to Airbnb, **without** copying brand identity.  
> Scope: Homepage, Listing detail, Search results, Calendar/pricing.  
> References live under `design-refs/airbnb/<page>/*.png` next to this file; stayneos baselines: `design-refs/stayneos-homepage.png`, `design-refs/stayneos-property-detail.png`.

---

## TL;DR

stayneos 当前页面美学偏「dark hero + 单一长落地页」，而 Airbnb 偏「明亮中性 + 模块化 + 信息密度高 + 强交互组件」。需要对齐的不是色彩品牌，而是 **三件事**：
1. **搜索/查找体验** — Airbnb 的「inline search pill + 类目 chip + 地图模式」是租赁站的事实标准，stayneos 目前用 HeroChatInline 替代搜索，下游缺 chips / 地图，跳失率高。
2. **房源详情页信息架构** — Airbnb 的「图片九宫格 → 标题 → 信息块 → sticky 预订卡 → reviews → 地图 → host」是经过大量 A/B 验证的最佳实践，我们已经做了一部分，缺 sticky booking card 的细节、九宫格 gallery、reviews 评分细分。
3. **预订日历交互** — Airbnb 双月并排日历 + 价格 inline + 最低住宿提示 + clear 按钮，stayneos 目前的日历强度不足。

---

## Page-by-Page Diff

### 1. Homepage  
Refs: `homepage/01-hero.png`, `homepage/02-categories.png`  
Stayneos: `design-refs/stayneos-homepage.png`

| Element | Airbnb | Stayneos 当前 | Gap |
|---|---|---|---|
| Hero | 上方留白 + 搜索 pill (where / when / who) 居中，背景白/明亮 | 全屏 dark video + chat inline | hero 占满 100svh、暗色压抑、无搜索结构化入口 |
| Top nav | sticky 白底，搜索条 collapse 状态 | 透明叠在 hero 上 | 滚动后 nav 没有清晰收起态 |
| 类目导航 | 横向 scrollable 图标 chips（房型/区域） | 无 | 缺整段「快速筛选」入口 |
| 房源卡片网格 | 4 列大图 + 收藏心 + 轮播 + 价格/评分一行 | 有 FeaturedPropertiesSection，但只展示精选 | 卡片紧凑度、收藏交互、轮播能力 |
| Footer | 简洁 link grid + 语言/币种 picker | 类似 | OK |

### 2. Listing detail  
Refs: `listing-detail/01-top.png`, `02-booking-card.png`, `03-reviews.png`  
Stayneos: `design-refs/stayneos-property-detail.png` + `src/app/(booking-flow)/property/[id]/PropertyDetailClient.tsx`

| Element | Airbnb | Stayneos 当前 | Gap |
|---|---|---|---|
| Gallery | 一大 + 四小 九宫格（desktop），手机大轮播 | 单大图 + 缩略图行 | 缺九宫格，「Show all photos」按钮入口 |
| 标题块 | H1 + 一行 sub-info (评分 · reviews · 城市)，紧凑 | 标题 + 多行信息 | 信息压缩 / 评分聚合 |
| 房型 chip | "Entire rental unit · 2 guests · 1 bedroom..." | 散落多行 | 单行 inline 概要 |
| Highlights | 三条带 icon 的 "self check-in / great location / free cancel" | 无 | **P0 缺**：建立 trust 的关键 |
| Amenities | 9 个网格 + "Show all 38 amenities" | 列表平铺 | 需要 grid + modal |
| Booking card | sticky 右侧，价格、日期、宾客数、立即/分期 CTA、税费明细 | 类似但视觉上没那么 "card" | 需要更明显的边框 + shadow + 浮起 |
| Reviews | 总分 + 6 个分项 bar + 滚动 review list + filter | 滚动列表 | 缺评分细分维度 |
| Host card | 头像 + identity verified + 回复率 | 类似 | OK，加 verified badge |
| Location | 地图 + 周边介绍段落 | 有地图 | OK，加段落即可 |

### 3. Search results  
Refs: `search-results/01-search-page.png`, `02-filter-chips.png`

| Element | Airbnb | Stayneos 当前 | Gap |
|---|---|---|---|
| Top filter bar | 横向 scrollable chips（type icons） + 「Filters」按钮 | （未见，可能没有 search 页） | **整页缺失/弱** |
| 卡片网格 | 3-4 列 responsive，hover 阴影，收藏心，价格 + 评分 | 类似但展示数少 | 提升密度 + 分页 / 无限滚动 |
| 地图 split | 右侧 sticky 地图 + 卡片 hover 联动 | 无 | **P1 缺**：高价值 |
| Sort / total count | "1,000+ stays" + Sort dropdown | 无 | 加 results count + sort |
| 移动端 | 底部 map toggle + filter bottom sheet | n/a | 移动适配 |

### 4. Calendar / pricing

Airbnb 模式：
- 两个月并排（desktop），手机单月可滑
- 已订 = 划线 + 不可点（**已与 2026-04-22 Jason 要求一致**）
- 每格价格 inline（动态定价）
- "Clear dates" + "Minimum stay" 提示
- 选定后 booking card 实时拉总价 + cleaning + service fee + 税

stayneos：单月日历 + 简单点选，明细弱。  
Gap：参考 `airbnb-multicalendar-reference.md`（已有），把双月 + 价格 inline + 明细打通。

---

## Priority Plan

### P0 — 直接影响转化，2 周内
1. **Listing trust highlights**（3 条带 icon 的特色行）— 已经部分对齐（commit `6f3915b apply airbnb trust design patterns`），收尾检查所有房源都有 3 条。
2. **Listing gallery 九宫格 + "Show all photos" modal** — desktop 4-up 网格 + mobile carousel + 全屏 lightbox。
3. **Sticky booking card 视觉强化** — 加 border + shadow + sticky positioning，确保滚动时不丢。
4. **Hero 搜索 pill** — 即使保留 HeroChatInline，也要在下方加一条 Airbnb 式 "where / dates / guests" 结构化入口；很多用户不愿打字。

### P1 — 信息密度 + 决策辅助，1 个月
5. **Search results 页 + filter chips + sort + count** — 建独立 `/search` 路由，先没地图也行。
6. **Reviews 细分评分（6 维 bar）** — 后端要新增字段或现场聚合。
7. **类目 chips 导航** — 首页 hero 下方加 horizontal scrollable chips（Downtown / Lake / Pet-friendly / Long-stay…）。
8. **双月日历 + 价格 inline** — 配合 calendar-pricing 截图（待补 P1 阶段截）。

### P2 — Nice to have，2 个月+
9. **Search 地图 split view + hover 联动**。
10. **Amenities grid + "Show all" modal**。
11. **Host verified badge 体系**。
12. **移动端 bottom sheet filter + map toggle**。

---

## 实施约束

- **不动品牌色**：stayneos 的暗色 + accent 色保留，只对齐 layout / spacing / interaction，不要复制 Airbnb 的粉/白配色。
- **每个 P0 单独一个 PR**，先小步走，方便回滚。
- **截图基线**：`design-refs/airbnb/` 是当前 Airbnb 状态（2026-05-17 抓取），后续 Airbnb 改版前不再更新。
- **部署**：照常 `git push origin main` 触发 GH Actions，不本地 `wrangler deploy`（参考 MEMORY.md，`NEXT_PUBLIC_*` build-time 注入）。

---

## 下一步

- Neos 看完批 P0 顺序 → 派 Byte 拆 4 个 P0 任务。
- Byte 执行时每个 P0 起独立分支 `feat/ab-align-<n>-<slug>`，PR 关联本文件章节。
- 已开分支 `design/airbnb-alignment-research` 用于沉淀本目录所有参考资料，截图后续随 Airbnb 改版需要更新时单独提 PR。
