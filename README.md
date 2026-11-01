# Andy 的个人网站

> 穿行于科技品牌之间 —— 用真实拍摄的影像和 3D / 动效讲品牌故事

一个基于 React 18 + Vite + Tailwind CSS 的双语单页作品集，以 Lightwheel、QCraft、Momenta、Zeekr、Xiaomi 五个品牌章节串联个人工作经历，部署在 GitHub Pages。

## 在线预览

🔗 [https://andywhite029.github.io](https://andywhite029.github.io)

## 设计要点

「真实影像 + 技术层」：视频和照片保持原样，动效只做叠加，不抢内容的戏。

- **电影感入场序列**：幕布 + 0→100 计数，仅在每次会话首次访问时播放；哈希深链接与 `prefers-reduced-motion` 直接跳过
- **WebGL 首屏**（three.js + @react-three/fiber）：真实拍摄的影片作为视频纹理，叠加指针涟漪、滚动色散/去饱和、暗角与颗粒；约 4,200 颗着色器粒子（窄屏 1,400）随手势推开，点击产生冲击波，滚动时卷入漩涡并淡出。WebGL 不可用时退回原生视频，`prefers-reduced-motion` 时退回海报
- **CSS 3D 光隧道转场**：Lightwheel → QCraft 之间 14 层光环构成隧道，A 图塌缩成中缝、B 图从中展开，光环颜色同步从品牌蓝过渡到品牌绿
- **3D 摄影展廊**：可拖拽环形旋转、`←`/`→` 切换、点击居中照片打开 `#photo/<id>`；移动端与减少动画降级为可访问网格
- **GSAP 动效组件库**：分字滚动揭示（中文按字、英文按词）、指针 3D 倾斜、磁吸按钮、自定义光标、胶片颗粒、滚动提示
- **双语与可访问性**：`en` / `zh` 全量文案对等，尊重 `prefers-reduced-motion`，详情层使用原生 `<dialog>` 并处理历史、焦点和滚动锁

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 框架 | React 18.3.1 |
| 构建 | Vite 5.4.21 |
| 样式 | Tailwind CSS 3.4 |
| 3D | three.js 0.167 + @react-three/fiber 8.18（按需加载，主包不含） |
| 动画 | GSAP 3.15（ScrollTrigger）+ Lenis 1.3 平滑滚动 |
| 图标 | lucide-react |
| 图像处理 | sharp 0.34（构建前压缩脚本） |
| 字体 | Noto Serif SC / Source Sans 3 / JetBrains Mono |

## 本地开发

```bash
cd client
npm install
npm run dev      # http://localhost:5173
npm run lint
npm run build
npm run preview
```

> `npm run build` 会先执行 `scripts/compress-images.js`（压缩 `public/photos/` 中的图片并生成 `src/photos.js`），再执行 `vite build`。
> 若本机 esbuild 在构建时报临时文件 `Access is denied`，把 `TEMP`/`TMP` 指向仓库内的可写目录后重试即可。

## 目录结构

```
client/
├── index.html                         # 入口（SEO meta、字体预加载）
├── tailwind.config.js                 # 品牌配色、字体、等宽字体
└── src/
    ├── pages/Home.jsx                 # 组装：入场 → 导航 → 章节 → 详情层
    ├── components/
    │   ├── Preloader.jsx              # 电影感入场序列（会话内一次）
    │   ├── TopNav.jsx                 # 桌面目录 + 语言切换 + 手机 dialog 菜单
    │   ├── ProgressRail.jsx           # 右侧章节进度导轨
    │   ├── Media.jsx                  # 可见性控制的循环视频 / 按需挂载视频
    │   ├── ProjectDetails.jsx         # 九个案例 + 六张摄影的详情层（hash 路由）
    │   ├── GuanglunQcraftTransition.jsx # CSS 3D 光隧道转场
    │   ├── sections/                  # Hero / Lightwheel / QCraft / 品牌章节 / About / Contact
    │   └── ...
    ├── motion/                        # GSAP 动效组件库（SplitReveal / Tilt3D / Magnetic / CursorHalo / FilmGrain / ScrollCue / Reveal）
    ├── gallery/                       # 3D 摄影展廊 + 网格降级
    ├── three/HeroScene.jsx            # 首屏 WebGL 场景（视频纹理 + 粒子场）
    ├── hooks/                         # useLenis / useReducedMotion / useIsMobile / useActiveSection
    ├── lib/intro.js                   # 入场完成信号
    ├── data/translations.js           # ⚠️ 全部中英文案、章节 ID、摄影顺序
    └── styles/index.css               # Tailwind 指令 + 全局样式与动效类
```

## 内容维护

全部文案、章节 ID（`SECTIONS`）和摄影顺序（`PHOTO_IDS`）集中在 `client/src/data/translations.js`，`en` 与 `zh` 的 key、数组长度和顺序必须保持一致。

## 路由与详情

- 案例：`#project/lightwheel-0` ~ `lightwheel-2`、`qcraft-website`、`qcraft-0`、`qcraft-1`、`momenta`、`zeekr`、`xiaomi`
- 摄影：`#photo/<PHOTO_IDS 中的 ID>`
- 站内打开后关闭走 `history.back()`；直接分享链接关闭后回到所属章节；照片切换使用 replace

改动路由需检查：直接打开、刷新、前进后退、Escape、焦点恢复与背景滚动锁。

## 资源

上线资产在 `client/public/assets-v2/`（来源记录见其中的 `来源记录.json`），原始素材在根目录 `素材/`，不提交大体积原始视频。官网项目素材、上线页面截图和本人制作作品在文案中明确区分。

## 发布

推送到 `main` 触发 `.github/workflows/deploy.yml`：Node 20 + `npm ci` → 构建 `client/dist` → 发布到 GitHub Pages。

## 验证记录

本机实际执行：

- `npx eslint .` → 0 error（仅保留仓库原有的 4 条 react-refresh 警告）
- `npm run build` → 通过；three.js 已拆分为独立 chunk
- 无头 Chrome（CDP）端到端脚本检查：8 个章节渲染、WebGL 上下文与 canvas、画廊 6 张卡片、案例/摄影详情打开与 Escape 关闭、语言切换、`prefers-reduced-motion` 降级（canvas 数 0）、390px 手机布局无横向溢出与菜单开合、运行时无报错

## License

MIT
