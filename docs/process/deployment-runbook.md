# 部署操作手册

- 前置：CI 全绿，安全扫描通过。
- 流程：quality-gates -> approval -> deploy-production -> smoke。
- 回滚：回退到上一成功 commit 并重新部署。
