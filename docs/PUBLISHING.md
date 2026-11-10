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

GitHub 官方浏览器授权已完成，账户为 `Xuke916`。用户于 2026-11-10 明确同意公开该仓库并启用免费 Pages；仓库已改为公开。Pages 使用 GitHub Actions 发布，HTTPS 已启用。

首次同步提交：`b615e89f8543bfede6fe9f02888c7c30279b5da9`。首次完整发布的检查、部署和线上验证均已成功：[GitHub Actions 运行记录](https://github.com/Xuke916/portfolio-scroll-study/actions/runs/42827455436)。

- 37 个可发布文件通过静态检查；其中 36 个有内容的线上文件全部返回 HTTP 200，并与源码逐字节一致。`.nojekyll` 是零字节的 Pages 配置文件。
- 自动检查涵盖 15 种视窗大小（320×568 至 2560×1440）、路由与返回、菜单、滚轮/触控/键盘、流体接管与暂停、头盔描边，以及 Money Ball 示例和图片放大逻辑。
- 浏览器中已确认首页人物图片、流体画布、灰色缩图、双栏入口到专业作品的页面切换与仓库子目录资源路径正常。
- 后续浏览器连接连续超时，未完成所有内页的实机复核；横向浏览、项目详情、手机布局和 Money Ball 规则的完整验证来自已通过的自动检查，不冒充完整人工实机测试。
- 当前页面没有视频播放器，也没有应发布的视频文件；参考 MKV 未上传。
- 当前源码及 34 次历史提交的文件名和凭证模式检查通过；未上传原始简历、参考录屏或依赖缓存。

后续状态以同一工作流中对应提交的运行结果为准；不得用历史的成功记录代替新提交的发布结果。

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
