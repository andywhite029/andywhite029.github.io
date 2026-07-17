# AGENTS.md — Andy 的个人网站

> 本文件面向 AI 编程助手。如果你正在阅读此文件，说明你对本项目一无所知——以下内容将帮助你快速上手。

---

## 项目概览

这是一个基于 **React 18 + Vite + Tailwind CSS** 构建的**单页面个人作品集网站**，使用中文作为内容语言。网站部署在 GitHub Pages 上，域名为 `andywhite029.github.io`。

网站的核心定位是 Andy 的个人主页，包含以下板块（全部在唯一的 `Home` 页面中）：
- **Hero 首屏**：全屏照片墙背景 + 玻璃态卡片自我介绍（逐字入场动画）
- **关于我**：个人简介、技能特长（进度条动画）、经历时间轴
- **项目实践**：带封面图的项目卡片，点击跳转外链
- **博客**：按标签筛选的文章列表，默认显示 5 条，可展开全部；支持外链跳转
- **页脚**：社交媒体链接与版权信息

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18.3.1（函数组件 + Hooks） |
| 构建工具 | Vite 5.4.3（`@vitejs/plugin-react`） |
| 样式 | Tailwind CSS 3.4.10 + 自定义 CSS |
| 动画 | Framer Motion 11.5.4 |
| 图标 | Lucide React 0.441.0 |
| 字体 | Google Fonts：Noto Serif SC、Source Sans 3、JetBrains Mono |
| 图像处理 | Sharp 0.34.5（构建前压缩 + 生成照片数据） |
| 代码规范 | ESLint 9（flat config）+ Prettier 3 |

> 注意：项目**不再使用** `vite-plugin-imagemin`。图片压缩统一由 `scripts/compress-images.js` 在 build 前处理（见 `vite.config.js` 中的注释）。

---

## 目录结构

```
andywhite029.github.io/
├── .github/workflows/deploy.yml    # GitHub Actions 自动部署到 Pages
├── .gitignore                       # 忽略 node_modules / dist / .env / client/src/photos.js 等
├── client/                          # 前端项目根目录（所有 npm 命令在此执行）
│   ├── index.html                   # HTML 入口（含中文 SEO meta、OG/Twitter Card、字体预加载）
│   ├── package.json                 # npm 配置与脚本
│   ├── vite.config.js               # Vite 配置（base 取自环境变量 BASE_URL，默认 '/'）
│   ├── tailwind.config.js           # 自定义主题（颜色、字体、间距）
│   ├── postcss.config.js            # Tailwind + Autoprefixer
│   ├── eslint.config.js             # ESLint 9 flat config（react / react-hooks / react-refresh）
│   ├── .prettierrc                  # Prettier 配置
│   ├── scripts/
│   │   └── compress-images.js       # 压缩照片并自动生成 src/photos.js
│   ├── public/
│   │   ├── favicon.svg              # 网站图标
│   │   ├── photos/                  # 照片墙图片（均为 .webp，含项目封面图）
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   └── src/
│       ├── main.jsx                 # React 渲染入口（StrictMode）
│       ├── App.jsx                  # 根组件（仅渲染 <Home />）
│       ├── photos.js                # ⚠️ 自动生成且被 git 忽略，仓库中不存在
│       ├── pages/
│       │   └── Home.jsx             # 唯一页面：所有板块的布局与交互
│       ├── components/
│       │   ├── PhotoWall.jsx        # 全屏照片墙背景（无限循环 + 视差 + 呼吸动画）
│       │   └── Footer.jsx           # 页脚组件
│       ├── data/                    # 内容数据模块（改内容就改这里）
│       │   ├── skills.js            # 技能特长（name + level 百分比）
│       │   ├── timeline.js          # 经历时间轴（year/company/title/desc）
│       │   ├── projects.js          # 项目卡片（title/desc/tags/image/link）
│       │   └── blogPosts.js         # 博客文章（id/title/excerpt/date/readTime/tags/link）
│       └── styles/
│           └── index.css            # Tailwind 指令 + 全局样式 + 自定义工具类/动画
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

> **重要**：`src/photos.js` 由脚本自动生成且被 `.gitignore` 排除，**仓库克隆下来后该文件不存在**。首次运行 `npm run dev` 之前，必须先执行一次 `npm run compress`（或 `npm run build`），否则会因找不到 `../photos` 模块而报错。

> **注意**：`npm run build` 会自动执行图片压缩。压缩脚本会将 `public/photos/` 下的 `.jpg/.jpeg/.png` 转为 `.webp`，并**删除原始文件**。

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
- 组件文件使用 `.jsx` 扩展名，纯逻辑/数据文件使用 `.js`
- 全部使用 ES Module（`type: "module"`）
- 页面与复杂组件使用命名导出 + `export default function`；数据模块使用命名导出常量（`export const skills = [...]`）

### 样式约定
- **优先使用 Tailwind 工具类**，复杂/重复样式才写自定义 CSS
- 自定义 CSS 写在 `src/styles/index.css`；`.gradient-border`、`.mouse-glow` 等自定义类也定义于此
- 主题色通过 `tailwind.config.js` 的 `extend.colors` 定义（`bg-primary`、`text-primary`、`accent` 等），不要在代码中硬编码十六进制色值；同一组颜色在 `index.css` 的 `:root` CSS 变量中重复定义了一份，修改时需两处同步
- 玻璃态卡片使用组合类 `bg-bg-primary/70 backdrop-blur-md rounded-3xl shadow-lg gradient-border`（`Home.jsx` 中封装为 `GlassCard` 组件）

### 命名与注释
- 代码注释主要使用**中文**
- 组件命名使用 PascalCase
- 变量/函数命名使用 camelCase
- CSS 自定义属性（变量）使用 `--kebab-case`

### 响应式断点
- 遵循 Tailwind 默认断点：`sm:`、`md:`、`lg:`、`xl:`、`2xl:`
- 各板块内容宽度随断点逐级收窄（`sm:w-11/12` → `2xl:w-1/2`）

---

## 关键模块说明

### 内容数据（`src/data/`）
- 网站的全部文案内容（技能、经历、项目、博客）以 `export const` 数组形式定义在四个独立数据文件中
- **修改内容（如新增经历、项目、文章）直接编辑对应的数据文件**，无需改动页面代码
- 博客的标签筛选列表由 `blogPosts` 数据自动推导（`['全部', ...new Set(...)]`），新增标签无需改代码
- 博客文章 `link` 为 `null` 时渲染为纯卡片，否则整卡可点击跳转外链

### PhotoWall 照片墙（`src/components/PhotoWall.jsx`）
- 照片数据来自**自动生成**的 `src/photos.js`（包含文件名和预计算的 `aspectRatio` 宽高比），加载时做 Fisher-Yates 洗牌
- 使用**双缓冲循环布局**：每列渲染两套相同照片，实现首尾无缝循环滚动
- 支持**视差滚动**（不同列速度不同，系数 0.85–1.15）和**呼吸动画**（正弦波浮动 + 微妙缩放）
- 列数根据窗口宽度动态计算（`minColumnWidth: 180`，最少 2 列、最多 10 列）
- 动画通过 `requestAnimationFrame` 直接写 `el.style.transform`，不触发 React 重渲染；DOM 元素与动画参数预先缓存到 ref
- **无障碍**：监听 `prefers-reduced-motion: reduce`，偏好减少动画时停止动画循环；`index.css` 中也有全局 CSS 降级
- **切勿手动编辑 `src/photos.js`**——它会被 `npm run compress` 覆盖

### Home 页面（`src/pages/Home.jsx`）
- 唯一页面，包含 Hero、关于我、项目实践、博客四个 section 及 `Footer`
- Hero 区域有**鼠标跟随光晕效果**（仅 `md:` 以上显示；通过直接写 CSS 变量 `--mouse-x/--mouse-y` 实现，避免每帧触发 React 重渲染）
- 技能进度条、各板块入场均使用 Framer Motion 的 `whileInView`
- 博客支持标签筛选（`selectedTag`）与「查看更多/收起」（默认 5 条）

### 图片压缩脚本（`scripts/compress-images.js`）
- 使用 `sharp` 将 `public/photos/` 下的 `.jpg/.jpeg/.png` 转为 `.webp`（最大宽度 800px，质量 75%），**转换成功后删除原始文件**
- 随后扫描所有 `.webp` 文件，读取宽高比，按文件名排序后生成 `src/photos.js`
- 项目封面图（如 `projects.js` 中引用的 `momenta-wicv.webp`）与照片墙图片混放在同一目录，都会进入照片墙

---

## 图像资源管理流程

向照片墙添加新图片的标准流程：

1. 将原始 `.jpg` 或 `.png` 图片放入 `client/public/photos/`
2. 运行 `npm run compress`（或 `npm run build`）——自动生成 `.webp` 并**自动更新 `src/photos.js`**
3. 提交并推送，`GitHub Actions` 会自动部署

> **切勿**将未压缩的原始大图直接推送到仓库——这会导致构建产物体积膨胀。也**不要**手动编辑 `src/photos.js`。

---

## 测试策略

本项目**当前没有自动化测试套件**。由于这是一个纯静态展示型个人网站，功能以渲染和动画为主，验证方式以**本地预览**和**部署后检查**为主。

推荐的验证步骤：
1. `npm run lint` 确认无 lint 错误
2. `npm run dev` 检查开发环境渲染是否正常
3. `npm run build` 确认构建无错误
4. `npm run preview` 检查生产构建效果
5. 推送后检查 GitHub Actions 状态与线上页面

---

## 安全与隐私注意事项

- **无后端/无 API**：纯静态站点，没有数据库或服务器端逻辑
- **无环境变量**：当前未使用 `.env`，`.gitignore` 已将其排除
- **外链跳转**：博客文章和项目卡片中包含外部链接（如微信公众号、起点新闻），使用 `target="_blank" rel="noopener noreferrer"` 防止标签页钓鱼——新增外链时保持此写法
- **Social Links**：`Footer.jsx` 中 GitHub 链接为真实地址，Twitter/LinkedIn/Email 仍为占位符（文件内有 `⚠️ 请替换` 注释）
- **图片版权**：`public/photos/` 中的图片为个人摄影作品，注意版权合规

---

## 常见问题

**Q: 克隆仓库后 `npm run dev` 报错找不到 `../photos` 模块？**
A: `src/photos.js` 是自动生成且被 git 忽略的文件。先运行一次 `npm run compress`（或 `npm run build`）生成它。

**Q: 修改了经历/项目/博客数据后页面没更新？**
A: 这些数据在 `src/data/` 下的四个文件中，确认修改保存后重新运行 `npm run dev` 或 `npm run build`。

**Q: 新增了照片但照片墙没显示？**
A: 检查三步：① 是否运行了 `npm run compress` 生成 `.webp`；② `src/photos.js` 是否已重新生成并包含新文件；③ 构建后 `dist/photos/` 是否包含该文件。

**Q: 动画在部分设备上卡顿？**
A: `PhotoWall` 已做 `prefers-reduced-motion` 降级处理。如仍卡顿，可在 `PhotoWall.jsx` 中调低 `totalLoops` 下限（当前为 10）或增大 `minColumnWidth` 以减少列数和 DOM 节点。
