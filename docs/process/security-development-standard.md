# 安全开发规范（Security Development Standard）

1. 本地 pre-commit 扫描硬编码密钥 + lint。
2. CI 执行安全扫描、回归、性能基准。
3. 生产部署必须经过 Environment 审批。
4. 禁止硬编码密钥、禁止 eval/new Function。
