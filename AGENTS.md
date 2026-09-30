# AGENTS.md — Andy 的个人网站

> 本文件面向 AI 编程助手。如果你正在阅读此文件，说明你对本项目一无所知——以下内容将帮助你快速上手。

---

## 项目概览

这是一个基于 **React 18 + Vite + Tailwind CSS** 构建的**单页面个人网站**，部署在 GitHub Pages 上，域名为 `andywhite029.github.io`。

当前版本（2026 年重写）的设计概念是**「暗房（Darkroom）× 终端（Terminal）」双主题**：

- 页面前半段是**暗房氛围**：近黑底色、暗房红光（`#cc1100`）、胶片齿孔边框、红色尘埃粒子、镜头炫光、胶片噪点
- 滚动到「项目实践」板块附近时过渡到**终端氛围**：终端绿光（`#00ff41`）、CRT 电子干扰（Glitch）、色散（ChromaticAberration）、可交互的模拟终端窗口
- 全站**中英双语**（默认英文），右上角按钮一键切换

网站只有一个 `Home` 页面，板块按胶片帧号组织：

| 板块 | 帧号 | 说明 |
|------|------|------|
| Hero | Frame 00 | 大标题 + 副标题（终端光标），GSAP 入场动画 |
| About | Frame 04 | 个人简介段落 + 技能标签 |
| Experience | Frame 12 | 经历时间轴（左侧圆点 + 帧号标记） |
| Projects | Frame 28 | **交互式模拟终端**：`ls projects/` 列出项目，点击查看详情，带快门音效 |
| Contact | Frame 36 | 社交链接 + 版权信息（兼作页脚） |

此外还有贯穿全站的导航与装饰层：桌面端左侧固定 `Sidebar`（帧号导航 + 社交链接）、移动端 `MobileHeader`、左侧 `FilmStripEdge` 胶片齿孔（实时指示滚动进度）、以及三层动态背景（噪点 / 炫光 / 3D 粒子）。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18.3.1（函数组件 + Hooks） |
| 构建工具 | Vite 5.4.3（`@vitejs/plugin-react`） |
| 样式 | Tailwind CSS 3.4.10 + 自定义 CSS |
| 3D 背景 | Three.js 0.167.1 + `@react-three/fiber` 8.18 + `@react-three/postprocessing` 2.19 |
| 动画 | GSAP 3.12.7（ScrollTrigger） |
| 平滑滚动 | Lenis 1.1.18 |
| 图标 | Lucide React 0.441.0 |
| 字体 | Google Fonts：Noto Serif SC、Source Sans 3、JetBrains Mono |
| 图像处理 | Sharp 0.34.5（构建前压缩 + 生成照片数据） |
| 代码规范 | ESLint 9（flat config）+ Prettier 3 |

> 注意：项目**不使用** `vite-plugin-imagemin`。图片压缩统一由 `scripts/compress-images.js` 在 build 前处理（见 `vite.config.js` 中的注释）。

---

## 目录结构

```
andywhite029.github.io/
├── .github/workflows/deploy.yml    # GitHub Actions 自动部署到 Pages
├── .gitignore                       # 忽略 node_modules / dist / .env / client/src/photos.js 等
├── client/                          # 前端项目根目录（所有 npm 命令在此执行）
│   ├── index.html                   # HTML 入口（中文 SEO meta、OG/Twitter Card、字体预加载）
│   ├── package.json                 # npm 配置与脚本
│   ├── vite.config.js               # Vite 配置（base 取自环境变量 BASE_URL，默认 '/'）
│   ├── tailwind.config.js           # 自定义主题（暗房红/终端绿配色、字体）
│   ├── postcss.config.js            # Tailwind + Autoprefixer
│   ├── eslint.config.js             # ESLint 9 flat config（react / react-hooks / react-refresh）
│   ├── .prettierrc                  # Prettier 配置
│   ├── scripts/
│   │   └── compress-images.js       # 压缩照片并自动生成 src/photos.js
│   ├── public/
│   │   ├── favicon.svg              # 网站图标
│   │   ├── photos/                  # 照片（均为 .webp；当前 UI 未直接展示）
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   └── src/
│       ├── main.jsx                 # React 渲染入口（StrictMode）
│       ├── App.jsx                  # 根组件：Language → Lenis → ScrollProgress 三层 Provider
│       ├── photos.js                # ⚠️ 自动生成且被 git 忽略；当前无引用方
│       ├── pages/
│       │   └── Home.jsx             # 唯一页面：组装全部板块与装饰层
│       ├── components/
│       │   ├── SceneBackground.jsx  # Three.js 全屏背景（fiber Canvas + 后期特效链）
│       │   ├── DustParticles.jsx    # 1000 颗自定义 Shader 尘埃粒子
│       │   ├── GrainOverlay.jsx     # Canvas 逐帧胶片噪点（mix-blend-overlay）
│       │   ├── FlareOverlay.jsx     # 三个径向渐变镜头炫光（漂移 + 跟随鼠标）
│       │   ├── FilmStripEdge.jsx    # 左侧胶片齿孔边框（滚动进度指示，仅 lg+）
│       │   ├── Sidebar.jsx          # 桌面端左侧固定导航（仅 lg+）
│       │   ├── MobileHeader.jsx     # 移动端顶部吸顶导航（lg 以下）
│       │   ├── LanguageToggle.jsx   # 右上角中英切换按钮
│       │   ├── TerminalCursor.jsx   # 终端闪烁光标（纯 CSS）
│       │   └── sections/
│       │       ├── HeroSection.jsx      # Frame 00 首屏
│       │       ├── AboutSection.jsx     # Frame 04 关于
│       │       ├── ExperienceSection.jsx# Frame 12 经历时间轴
│       │       ├── ProjectsSection.jsx  # Frame 28 交互式终端项目列表
│       │       └── ContactSection.jsx   # Frame 36 联系方式 + 页脚
│       ├── context/
│       │   ├── LanguageContext.jsx      # 语言状态（en / zh，默认 en）
│       │   └── ScrollProgressContext.jsx# 全页滚动进度（0-1）与当前板块索引
│       ├── hooks/
│       │   ├── useLenis.jsx         # LenisProvider：平滑滚动，与 GSAP ticker 同步
│       │   ├── useReducedMotion.js  # 监听 prefers-reduced-motion
│       │   └── useShutterSound.js   # WebAudio 合成快门音效
│       ├── data/
│       │   └── translations.js      # ⚠️ 全部文案（中英双语），改内容就改这里
│       └── styles/
│           └── index.css            # Tailwind 指令 + 全局样式 + CSS 变量 + Lenis 样式
└── AGENTS.md                        # 本文件
```

---

## 构建与开发命令

所有命令都在 `client/` 目录下执行：

```bash
cd client

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本（先压缩图片并生成 photos.js，再执行 vite build）
npm run build

# 预览生产构建
npm run preview

# 单独运行图片压缩脚本（压缩新图 + 重新生成 photos.js）
npm run compress

# 代码检查 / 自动修复 / 格式化
npm run lint
npm run lint:fix
npm run format
```

> **说明**：当前版本的 UI **不再引用** `src/photos.js`（旧版照片墙组件已移除），因此 `npm run dev` 不再依赖该文件。但 `npm run build` 仍会先执行图片压缩脚本——它会压缩新放入的照片并重新生成 `photos.js`（见下文「图像资源管理流程」）。

---

## 部署流程

1. **推送触发**：向 `main` 分支推送代码时，`.github/workflows/deploy.yml` 自动执行。
2. **CI 步骤**：
   - 检出代码
   - 安装 Node.js 20（缓存 `client/package-lock.json`）
   - 在 `client/` 下执行 `npm ci`
   - `actions/configure-pages` 输出 `base_url`，以环境变量 `BASE_URL` 传入 `npm run build`（Vite 用它设置 `base`）
   - 将 `client/dist` 作为 artifact 上传并部署到 GitHub Pages
3. **手动触发**：也可在 GitHub 上通过 `workflow_dispatch` 手动运行。

---

## 代码风格与约定

### 格式化（Prettier）
- 无分号、单引号、缩进 2 空格、行宽 100、ES5 尾随逗号、箭头函数单参数省略括号
- 提交前建议运行 `npm run format`

### Lint（ESLint 9 flat config）
- 启用 `react-hooks` 推荐规则；`react-refresh/only-export-components` 为 warn
- 未使用变量为 warn，以 `_` 开头的变量豁免
- 关闭 `react/prop-types`（项目不使用 PropTypes）

### 文件规范
- 组件文件使用 `.jsx` 扩展名，纯逻辑/数据文件使用 `.js`（`useLenis.jsx` 因含 Provider 组件而用 `.jsx`）
- 全部使用 ES Module（`type: "module"`）
- 页面与组件使用 `export default function`；数据模块使用命名导出常量（`export const translations = {...}`）；Context/Hooks 使用命名导出（`export function useLanguage()` / `export function LanguageProvider()`）

### 样式约定
- **优先使用 Tailwind 工具类**，复杂/重复样式才写自定义 CSS
- 自定义 CSS 写在 `src/styles/index.css`；`.terminal-cursor`（闪烁光标）、`.writing-vertical`（竖排文字）等自定义类定义于此
- 主题色通过 `tailwind.config.js` 的 `extend.colors` 定义，**不要在代码中硬编码十六进制色值**；同一组颜色在 `index.css` 的 `:root` CSS 变量中重复定义了一份，**修改时需两处同步**。当前配色：

| Tailwind 类 | 色值 | 用途 |
|------------|------|------|
| `bg-primary` | `#050303` | 主背景（近黑） |
| `bg-secondary` | `#0a0808` | 次级背景（侧栏、终端标题栏） |
| `bg-terminal` | `#0a0a0f` | 终端窗口背景 |
| `text-primary` | `#e8ddd0` | 主文字（米白） |
| `text-secondary` | `#a89b8c` | 次要文字 |
| `accent-red` / `accent-red-glow` / `accent-red-dark` | `#cc1100` / `#ff2200` / `#550000` | 暗房红（前四个板块的主题色） |
| `accent-green` / `accent-green-dim` | `#00ff41` / `#00aa2a` | 终端绿（项目板块与终端光标） |
| `border` | `#2a1a1a` | 分隔线/边框 |

- **红色 vs 绿色的使用边界**：暗房红用于 Hero/About/Experience/Contact 板块的 `Frame NN //` 标签、时间轴、导航高亮；终端绿仅用于 Projects 板块的终端窗口内部及 `TerminalCursor`。Projects 板块的 Frame 标签也是绿色。

### 命名与注释
- 代码注释主要使用**中文**
- 组件命名使用 PascalCase
- 变量/函数命名使用 camelCase
- CSS 自定义属性（变量）使用 `--kebab-case`

### 响应式断点
- 遵循 Tailwind 默认断点；**`lg` 是移动端与桌面端的分界线**：
  - `lg` 以下：显示 `MobileHeader` 吸顶导航；隐藏 `Sidebar` 和 `FilmStripEdge`
  - `lg` 及以上：显示左侧固定 `Sidebar` 导航 + 胶片齿孔边框，内容区用 `lg:ml-20` 避让齿孔
- 终端窗口在移动端也可正常交互（内部滚动用 `data-lenis-prevent` 与 Lenis 隔离）

---

## 关键模块说明

### 内容与 i18n（`src/data/translations.js` + `src/context/LanguageContext.jsx`）
- 网站的**全部文案**（导航、侧栏、Hero、About、经历、项目、联系）以 `en` / `zh` 两份嵌套对象的形式集中定义在 `translations.js`
- **修改任何内容（新增经历、项目、改文案）都只改这一个文件**，并保持两份语言的 key 结构完全同步（`experience.items`、`projects.items` 等数组要两边等长、同序）
- 项目条目的 `link` 为 `null` 时终端内不渲染外链；`status: 'developing'` 的项目在列表中带 `[DEV-ING]` 标记
- `LanguageContext` 默认语言为 `'en'`，`toggleLanguage()` 在 en/zh 间切换；**不做持久化**，刷新后回到英文
- 组件内标准用法：
  ```jsx
  const { language } = useLanguage()
  const t = translations[language]
  ```

### 滚动体系（`src/hooks/useLenis.jsx` + `src/context/ScrollProgressContext.jsx`）
- `LenisProvider` 创建 Lenis 实例（duration 1.2），通过 `gsap.ticker` 驱动，并用 `lenis.on('scroll', ScrollTrigger.update)` 与 GSAP ScrollTrigger 同步；`prefers-reduced-motion` 时**不创建实例**（Context 值为 `null`）
- `ScrollProgressProvider` 消费 Lenis 实例：监听其 `scroll` 事件得到全页 `progress`（0-1），并按阈值映射为当前板块索引：
  - `SECTIONS = ['hero', 'about', 'experience', 'transition', 'projects', 'contact']`
  - `SECTION_THRESHOLDS = [0, 0.15, 0.32, 0.52, 0.62, 0.9]`
  - Lenis 不可用（reduced-motion）时回退到原生 `window.scroll` 监听
- 对外暴露 `{ scrollProgress, currentSection, sectionName }`；`Sidebar` 用它做导航高亮，`FilmStripEdge` 用它做齿孔高亮，`Home.jsx` 把 `scrollProgress` 传给 `SceneBackground` 驱动 3D 特效
- 注意 `SECTIONS` 中的 `'transition'` 是一个**虚拟板块**（对应暗房→终端的转场区间，无对应 DOM section），`Sidebar`/`MobileHeader` 的导航项不包含它

### 3D 背景（`SceneBackground.jsx` + `DustParticles.jsx`）
- `SceneBackground`：固定全屏的 fiber `<Canvas>`（`fixed inset-0 z-0 pointer-events-none`），根据 `scrollProgress` 计算两种强度：
  - **转场扭曲（warp）**：`scrollProgress` 在 0.45–0.65 之间时最强（峰值在 0.55），触发 `Glitch` 电子干扰并增强 Bloom
  - **终端强度**：`scrollProgress > 0.5` 后生效，触发 `ChromaticAberration` 色散
  - 后期特效链（`EffectComposer`）：Bloom + Noise + Vignette + Glitch（条件渲染）+ ChromaticAberration（条件渲染）
  - `prefers-reduced-motion` 时直接 `return null`，不渲染 Canvas
- `DustParticles`：1000 颗粒子，**自定义 vertex/fragment shader**：
  - `uScrollProgress` 驱动颜色混合：暗房红 → 终端绿（`smoothstep(0.4, 0.6, ...)`），终端区额外叠加亮度脉冲
  - `uWarp` 驱动粒子向中心收缩并沿视线拉伸（空间扭曲）
  - `uMouse` 实现轻微视差 + 鼠标靠近时的眨眼闪烁
  - 每帧只更新 shader uniforms（`useFrame`），不触发 React 重渲染

### 页面板块（`src/components/sections/`）
- 每个板块顶部都有 `Frame NN // Name` 的 mono 小字标签（Projects 用绿色，其余用红色），文案来自 translations
- Hero/About/Experience/Projects 的入场动画统一模式：`gsap.context()` + `fromTo` + ScrollTrigger（`start: 'top 75%'` 或 `'top 80%'`，`toggleActions: 'play none none reverse'`），cleanup 用 `ctx.revert()`；`reducedMotion` 时整个 effect 跳过。**新增动画请沿用这个模式**
- `ExperienceSection`：时间轴条目渲染 `t.experience.items`，左侧圆点 + `FRAME NN` 标记（帧号由索引算出：`index * 2 + 12`）
- `ProjectsSection`：**交互式模拟终端**，核心是一个 `history` 数组状态机，entry 有四种类型——`command`（输入的命令）、`list`（项目列表，可点击）、`project`（项目详情）、`output`（带光标的空提示行）：
  - 初始 500ms 后自动执行 `ls projects/` 展示项目列表
  - 点击列表项 = 执行 `runCommand('cat <slug>', project)`，追加命令行 + 详情 + 新提示行，并触发快门音效
  - 终端内容区 `max-h-[65vh] overflow-y-auto`，history 变化时自动滚到底部；`data-lenis-prevent` 防止 Lenis 劫持终端内部滚动
- `ContactSection`：GitHub / Email 为真实链接，Twitter / LinkedIn 仅为占位文字（文案在 translations 的 `contact.twitterPlaceholder` / `contact.linkedinPlaceholder`）；底部版权年份自动取当前年

### 装饰层组件
- `FilmStripEdge`：左侧 20 宽的胶片边框（仅 `lg+`），14 个齿孔，根据 `scrollProgress` 实时高亮最近的一个（红底发光）；上下分别有竖排 `ISO 400` 和 `KODAK 35MM` 字样
- `GrainOverlay`：全屏 Canvas 逐帧生成随机噪点（alpha=8），`mix-blend-overlay` 混合，`aria-hidden`
- `FlareOverlay`：三个径向渐变炫光，`requestAnimationFrame` 直接写 `style.transform`（不触发 React 重渲染），主/次炫光缓慢漂移并轻微跟随鼠标
- `LanguageToggle`：右上角 fixed 按钮，当前语言高亮为红色

### 音效（`src/hooks/useShutterSound.js`）
- 用 WebAudio 现场合成快门声：80ms 噪声缓冲 + 2000Hz bandpass 滤波 + 指数衰减增益，无音频资源文件
- AudioContext 懒创建并复用；浏览器自动播放策略可能阻止音频，用 try/catch 静默失败
- `prefers-reduced-motion` 时不发声

### 无障碍（`src/hooks/useReducedMotion.js`）
- 监听 `prefers-reduced-motion: reduce`（含运行时变化），以下模块全部接入了该开关：
  - `SceneBackground` 不渲染 3D 背景
  - `LenisProvider` 不创建 Lenis（回退原生滚动）
  - 各板块 GSAP 入场动画跳过
  - `useShutterSound` 静音
  - `index.css` 中还有全局 CSS 降级（动画/过渡时长压到 0.01ms）
- **新增动画/音效时必须同样接入 `useReducedMotion`**

### 图片压缩脚本（`scripts/compress-images.js`）
- 使用 `sharp` 将 `public/photos/` 下的 `.jpg/.jpeg/.png` 转为 `.webp`（最大宽度 800px，质量 75%），**转换成功后删除原始文件**
- 随后扫描所有 `.webp` 文件，读取宽高比，按文件名排序后生成 `src/photos.js`
- ⚠️ 当前版本 UI 没有引用 `src/photos.js`（旧版照片墙已删除），但该管线仍保留用于维护照片库；未来若要恢复照片展示可直接使用

---

## 图像资源管理流程

向照片目录添加新图片的标准流程：

1. 将原始 `.jpg` 或 `.png` 图片放入 `client/public/photos/`
2. 运行 `npm run compress`（或 `npm run build`）——自动生成 `.webp` 并**自动更新 `src/photos.js`**
3. 提交并推送，`GitHub Actions` 会自动部署

> **切勿**将未压缩的原始大图直接推送到仓库——这会导致构建产物体积膨胀。也**不要**手动编辑 `src/photos.js`。

---

## 测试策略

本项目**当前没有自动化测试套件**。由于这是一个纯静态展示型个人网站，功能以渲染和动画为主，验证方式以**本地预览**和**部署后检查**为主。

推荐的验证步骤：
1. `npm run lint` 确认无 lint 错误
2. `npm run dev` 检查开发环境渲染是否正常（重点检查：3D 粒子背景、滚动转场、终端交互、中英切换）
3. `npm run build` 确认构建无错误
4. `npm run preview` 检查生产构建效果
5. 推送后检查 GitHub Actions 状态与线上页面

---

## 安全与隐私注意事项

- **无后端/无 API**：纯静态站点，没有数据库或服务器端逻辑
- **无环境变量**：当前未使用 `.env`，`.gitignore` 已将其排除
- **外链跳转**：项目和经历条目中的外部链接（如微信公众号、公司官网）使用 `target="_blank" rel="noopener noreferrer"` 防止标签页钓鱼——新增外链时保持此写法
- **Social Links**：`Sidebar.jsx` 与 `ContactSection.jsx` 中 GitHub 和 Email 为真实地址；Twitter/LinkedIn 仍为占位符（文案在 `translations.js` 的 `contact.twitterPlaceholder` / `contact.linkedinPlaceholder`）
- **图片版权**：`public/photos/` 中的图片为个人摄影作品，注意版权合规

---

## 常见问题

**Q: 修改文案/经历/项目内容要改哪里？**
A: 全部在 `src/data/translations.js`。注意 `en` 和 `zh` 两份的 key 结构与数组顺序必须保持同步。

**Q: 想新增一个页面板块，涉及哪些改动？**
A: ① `sections/` 下新建组件；② `Home.jsx` 挂载；③ `translations.js` 双语添加文案；④ `ScrollProgressContext.jsx` 的 `SECTIONS` 和 `SECTION_THRESHOLDS` 加入新板块并调整阈值；⑤ `Sidebar.jsx` 的 `NAV_ITEMS`（和 `MobileHeader.jsx` 的 `NAV_ITEMS`）加入导航项与帧号。

**Q: `npm run dev` 之前需要先跑 `npm run compress` 吗？**
A: 不需要。当前版本没有组件引用 `src/photos.js`，dev 服务器可以直接启动（旧版照片墙才有此要求）。

**Q: 中英切换后某些部分没变？**
A: 检查该组件是否通过 `useLanguage()` + `translations[language]` 取文案。硬编码的中文（如 `MobileHeader` 的「影像 × 代码」副标题）是刻意保留的。

**Q: 动画在部分设备上卡顿？**
A: 全站已做 `prefers-reduced-motion` 降级。如仍卡顿，可考虑：调低 `DustParticles.jsx` 的 `PARTICLE_COUNT`（当前 1000）、降低 `GrainOverlay` 的 Canvas 分辨率、或给 `SceneBackground` 的 Canvas 降 `dpr`（当前上限为 2）。

**Q: 终端内滚动被页面平滑滚动劫持？**
A: 终端内容区已有 `data-lenis-prevent` 属性隔离 Lenis。新增需要内部滚动的容器时，记得加同样的属性。
