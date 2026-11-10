# 发布与维护记录

## 固定目标

- GitHub 账户：`Xuke916`。
- 仓库：https://github.com/Xuke916/portfolio-scroll-study
- 本地 Git 远端名：`github`；发布分支：`main`。
- GitHub Pages 目标：https://xuke916.github.io/portfolio-scroll-study/
- 原站点：https://scroll-portfolio-study-1103.wiry-clock-1007.chatgpt.site/
- 原站点 ID：`appgprj_6ae9bb5f35c481918485f9d904ba247f`。
- 当前配置日期：2026-11-10。

## 当前状态

GitHub 官方浏览器授权已完成；私有仓库已创建。首次代码推送、Pages 启用和线上验证正在配置中，不能将目标 URL 视为已经发布成功。完成后本节会更新为实际验证结果。

## 以后在本对话中的默认流程

1. 读取本项目的 `AGENTS.md`，同步 `github/main` 并检查工作区，保留用户自己的未提交修改。
2. 在 `dist/` 完成所需修改，保留其他已确认的设计、内容、动画和交互。
3. 运行 `pnpm install --frozen-lockfile`（仅依赖缺失或变化时）和 `pnpm check`；视觉、交互变动再用浏览器检查相应桌面和手机布局。
4. 检查提交内容，提交并推送至同一个 GitHub 仓库的 `main` 分支。不得强制推送覆盖其他提交。
5. `.github/workflows/pages.yml` 自动执行检查、上传 `dist/`、发布 GitHub Pages，并逐个下载线上文件验证 HTTP 200 和 SHA-256 与源码一致。检查失败时不会发布新版本。
6. 等待本次 GitHub Actions 运行完成，处理实际失败，返回网站和提交/运行链接；不能只报告“已推送”。
7. 需要同时保持原 `chatgpt.site` 副本一致时，继续使用该 Sites 项目的原有保存、发布流程；GitHub Pages 工作流不包含 Sites 的访问凭证，也不会自行更改原站点。

用户明确说“只预览”时：只修改、检查和展示本地预览，**不推送 `main`、不手动触发工作流、不发布到 Sites**，等用户确认后再执行第 4 步及以后。

## 工作流和边界

- 网站是纯静态 HTML/CSS/JS，没有数据库、服务器接口、登录系统或需要服务端执行的功能。
- 采用相对资源路径和 hash 路由。`#work`、`#life`、`#work/project-03` 在仓库子目录下可直接分享、刷新和后退，无需 404 重写。
- 首页流体使用浏览器 WebGL/Canvas；屏幕缩放、滚动时间线、横向项目、图片放大和 Money Ball 示例均在浏览器执行。
- 当前发布版本没有网页视频播放器；用户提供的 MKV 是参考录屏，不是网站资源，不上传到 GitHub。以后确需展示视频时使用网页可播放的 MP4/WebM 并检查相对路径和文件大小。
- GitHub Actions 使用仓库临时的 `GITHUB_TOKEN` 和 Pages OIDC 权限，没有手工保存的访问令牌。第三方发布组件固定到已核实的提交 SHA。
- 公开 Pages 站点的访问不代表仓库必须公开；是否能从私有仓库发布取决于 GitHub 账户计划。不得在未经用户明确同意的情况下将仓库改为公开。
- 只发布 `dist/`。原始简历/文档、参考录屏、私人文件、工具、日志和依赖缓存均不进入站点。

## 本地命令

需要 Node.js 24.15 或更新版本，以及项目声明的 pnpm 11.25.0。

```sh
pnpm install --frozen-lockfile
pnpm check
node preview.mjs --base /portfolio-scroll-study/
```

本地预览地址：`http://127.0.0.1:4317/portfolio-scroll-study/`。省略 `--base` 时仍可在根目录预览。

发布后核对：

```sh
node scripts/verify-live.mjs https://xuke916.github.io/portfolio-scroll-study/
```

GitHub 登录由官方浏览器授权完成，凭证存储在系统凭证管理中。不要在聊天、项目文件、提交、工作流日志里粘贴密码或令牌。
