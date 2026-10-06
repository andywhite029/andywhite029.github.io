# AGENTS.md — Andy 的个人网站

## 当前架构

React 18 + Vite 5 + Tailwind CSS 3 的双语单页作品集，部署到 GitHub Pages。
当前设计为 Through Technology 品牌叙事，旧版暗房、终端、Three.js 背景组件已经移除。
设计方案在 `docs/网站全新设计方案.md`；方案描述目标，不能据此宣称功能已验收。

页面顺序为 Hero（andy）、Lightwheel（guanglun）、QCraft（qcraft）、Momenta、Zeekr、Xiaomi、About、Contact。
PhotographySection 嵌在 About 中。章节 ID 与双语导航集中在 `src/data/translations.js` 的 SECTIONS。

所有 npm 命令在 `client/` 执行：

```sh
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## 核心文件

- `src/App.jsx`：LanguageProvider → MobileProvider → LenisProvider。
- `src/pages/Home.jsx`：组装导航、章节、过渡和详情层。
- `src/components/TopNav.jsx`：桌面作品目录、语言按钮、手机原生 dialog 菜单。
- `src/components/ProgressRail.jsx` / `src/hooks/useActiveSection.js`：按实际章节位置显示进度。
- `src/components/sections/GuanglunSection.jsx`：桌面滚动叙事与手机顺序布局。
- `src/components/GuanglunQcraftTransition.jsx`：前两品牌间转场。
- `src/components/sections/QCraftSection.jsx`：官网项目主案例和两项传播案例。
- `src/components/sections/BrandChapters.jsx`：Momenta、Zeekr、Xiaomi 章节。
- `src/components/ProjectDetails.jsx`：九个案例和六张摄影作品的详情。
- `src/components/Media.jsx`：可见性控制的循环视频、点击后才挂载的案例视频。
- `src/data/translations.js`：全部中英文内容、稳定案例标识、摄影顺序。
- `src/styles/index.css` / `tailwind.config.js`：全局布局和品牌配色。

## 导航和详情

案例 hash 为 `#project/lightwheel-0` 至 `lightwheel-2`、`qcraft-website`、`qcraft-0`、`qcraft-1`、`momenta`、`zeekr`、`xiaomi`。
摄影 hash 为 `#photo/<PHOTO_IDS 中的 ID>`。
详情使用原生 dialog，站内打开后关闭走 history.back；直接分享链接关闭后回到所属章节。
照片切换 replace 当前历史项，避免关闭时需要逐张返回。
详情打开时停止 Lenis、锁定背景滚动，关闭后恢复入口焦点。
改动路由必须检查直接打开、刷新、前进后退、Escape、焦点和滚动恢复。
桌面与手机主要分界是 `md`（768px），不要沿用旧版 lg 分界假设。

## 双语和动画

LanguageContext 默认英文，保存用户选择到 localStorage（andy-site-language），并同步 html lang。
文案同时维护 en/zh 的 key、数组长度和顺序；从 useLanguage 获取当前语言。
GSAP 使用 context / matchMedia 并在 effect cleanup revert。
所有动画接入 useReducedMotion；减少动画时使用静态内容和原生滚动。
循环视频在减少动画或加载失败时显示海报。按需视频失败后可以回到海报重试。

## 资源

上线资产位于 `client/public/assets-v2/`，来源见其中的 `来源记录.json`。
原始素材位于根目录 `素材/`；不要将原始大视频混入发布资产。
`prepare-assets-v2.mjs` 和 `prepare-phase-two.mjs` 是素材加工脚本，需要本地原始文件。
`npm run build` 仍先执行 compress-images.js：把 public/photos 中 JPG/PNG 转 WebP，成功后删除原图，并生成被忽略的 src/photos.js。
当前 UI 不引用 photos.js。照片画廊使用 assets-v2/photography。
官网项目素材、上线页面截图、官方宣传视频和本人制作作品必须明确区分，不得错误归因。

## 风格与验证

ES Module；组件用 JSX，数据和纯逻辑用 JS。沿用现有 Tailwind 与品牌变量。
Prettier：无分号、单引号、2 空格、100 字符行宽。避免全仓格式化造成无关改动。
外链使用 target="_blank" 和 rel="noopener noreferrer"。
当前无自动化测试套件；发布前跑 lint/build，并实际浏览桌面和手机页面。
覆盖案例/摄影入口、历史导航、键盘、双语、菜单、滚动转场、减少动画、慢网络、视频失败、LCP/CLS。
只报告实际执行的检查；未完成项目写入验收记录。

## 发布

`.github/workflows/deploy.yml` 在 main 推送或手动触发时构建部署。
Node 20 + npm ci，BASE_URL 传入 Vite，发布 client/dist。
静态资产目前使用根路径，面向 andywhite029.github.io 根站点。
发布后检查 Actions 成功、线上资源、案例分享链接和手机布局。
