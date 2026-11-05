# StayNeos 当前任务簿

更新：2026-10-31（America/Toronto）。这是迁移后的当前任务簿；原始快照仅在迁移机器留存，见 [交接索引](handoff/openclaw/README.md)。

| ID | 任务 | 当前状态 | 证据 / 下一步 |
|---|---|---|---|
| MIG-001 | 代码、工作规则与本地工具链接管 | 本地交付完成；PR 状态以 GitHub 为准 | `codex/project-setup`；typecheck / lint / 264 tests / build / 本地与线上只读 smoke 已通过；实际提交和 PR 以 GitHub 为准 |
| MIG-002 | Cloudflare runtime / D1 配置核对 | 等待生产凭据使用授权 | 当前本机无已登录连接；旧生产凭据的只读使用被自动审批拒绝，未执行 API 请求 |
| MIG-003 | 测试环境全链路 | 待隔离的 D1 / Stripe 测试凭据 | 原 Stripe 凭据为 live；不能用正式环境代替测试环境 |
| LEGACY-PRS | 旧 PR #35 / #36 处置 | 已核对，均 open 且不可直接合并 | #35 改 8 个代码文件；#36 除设计资料也带同批代码，与描述不完全一致。需独立评估后关闭或提取，不在接管中自动合并 |
| AB-101 / AB-102 / AB-103 | 首页、详情、列表设计 | 多项已有后续实现，不能按 5 月快照重做 | main 已有 PR #37/#38 的 sticky / gallery、#39/#40 的筛选 / 分屏地图、#42 的分类 chips、#51 的全屏图库；剩余差距需产品验收 |
| BOOK-008 | 取消 / 退款 | API 已实现，业务验收仍缺 | DELETE 调用 Stripe refund；当前未传 amount，不能声称实现了旧蓝图的分档退款规则。独立核对政策与测试 |
| EMAIL-LIFECYCLE | Pre-arrival 邮件 | 确认仍为 stub | `src/lib/email/index.ts` 中 sendPreArrivalReminder 返回 false，未连到提醒 cron |
| REVIEW-DATA | 房源详情评分与评论 | 发现 mock 内容，待业务处理 | 当前详情组件仍有 mock 六维评分与固定评论，不能当作真实用户评价验收 |
| B7-FOLLOWUP | Wishlist / User / Bookings / Messages SWR | 历史待办仍需独立评估 | 上述主要组件 / context 未发现 useSWR；不在环境迁移中改数据流 |
| CI-FOLLOWUP | CI / 发布核对差异 | 已登记，未改远端策略 | Node 20/24 混用；管理员绕过保护仍可用；保护未要求 E2E；生产 verify 仅副域名；preview 复用生产 D1 配置，隔离情况未确认 |

本地完成、PR 合并、部署分别记录。后续任务补充范围、验证结果、PR、merge SHA 和线上证据；不得把 HTTP 200、mock 数据或跳过的测试作为业务全链路完成证明。
