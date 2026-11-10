# Portfolio — Scroll Study

XU KE 的个人作品集。保留道奇蓝主题、首页人物与头盔流体、连续滚动、专业作品、日常生活和 Money Ball 项目页。

- 代码仓库：https://github.com/Xuke916/portfolio-scroll-study
- GitHub Pages 目标：https://xuke916.github.io/portfolio-scroll-study/（实际启用状态见下方发布记录）
- 原站点：https://scroll-portfolio-study-1103.wiry-clock-1007.chatgpt.site/
- [发布状态与更新流程](docs/PUBLISHING.md)

## 修改与发布约定

以后在当前对话中提出的网站修改，默认在完成检查后提交并推送到本仓库 `main`，由 GitHub Actions 自动检查和发布 GitHub Pages；继续跟进本次运行与线上验证结果。

明确说“只预览”时，只提供本地预览，等确认后才推送和发布。不要将凭证、私人文档、原始简历、参考录屏或依赖缓存提交到仓库。

## 预览与检查

使用 Node.js 24.15+、pnpm 11.25.0：

```sh
pnpm install --frozen-lockfile
pnpm check
node preview.mjs
```

预览地址：`http://127.0.0.1:4317/`。模拟 GitHub Pages 仓库子目录：

```sh
node preview.mjs --base /portfolio-scroll-study/
```

自动检查覆盖网页资源、子目录路径、页面路由、浏览器后退、菜单、滚轮/触控/键盘、15 种视窗大小、流体交接与暂停、头盔描边及 Money Ball 的交互规则。浏览器视觉检查用于补充，不能用模拟测试替代实际观感。

## 项目结构

```text
dist/                       实际发布的网页、代码、图片
  content.js                姓名、简介、经历、项目和图片路径
  app.js                    首页滚动与鼠标交互
  fluid-hero.js             流体与自动/鼠标接管
  helmet-ink.js             照片对齐的头盔描边
  pages.js                  专业作品、日常生活、独立项目与转场
  moneyball.js              Money Ball 内容与规则演示
  assets/                   网站使用的图片
tests/                      可跨电脑运行的交互检查
scripts/check-site.mjs       发布前检查入口
scripts/verify-live.mjs      上线后逐文件核对
.github/workflows/pages.yml  自动检查、发布和线上资源验证
preview.mjs                 本地预览服务器
```

网站无需打包构建，直接发布 `dist/`。pnpm 依赖仅用于开发检查，不会进入浏览器或发布目录。`.nojekyll` 防止 GitHub 对静态目录执行 Jekyll 处理。

## 内容与链接

在 `dist/content.js` 编辑内容，将图片放入 `dist/assets/`，使用 `assets/...` 相对路径。保留现有 `slug` 可保持旧链接有效。

- `name`：左上角姓名。
- `heroImage` / `heroHelmetImage`：人物与头盔透明 PNG；保持画布和人物位置一致。
- `message.lines`：灰色人物后方、持续缓慢移动的两排大字。
- `gallery`：首页八张图片与标题。
- `pages.work.projects`：项目01、项目02、项目03、other work，每项一个封面，点击进入独立页面。
- `pages.life.profile`：日常生活中的简介、经历、项目、设计技能、工具与记录。
- `pages.work.projects[2].playtestPhotos`：Money Ball 的四个试玩照片预留位。
- `footer`：页尾照片、标题与社交链接。

可以直接分享 `#intro`、`#message`、`#gallery`、`#explore`、`#work`、`#life`、`#work/project-03` 等链接。hash 路由不依赖服务器重写，适用于 GitHub Pages 的仓库子目录。

专业作品使用黑底，日常生活和 Money Ball 使用白底，强调色为道奇蓝 `#1E90FF`。灰色人物阶段停止鼠标晃动；蓝白场景使用渐变过渡；全屏页面切换使用等宽线形 X。

项目和网站素材版权归相应权利人所有。源码公开与否不授予照片、作品或品牌素材的再使用许可。
