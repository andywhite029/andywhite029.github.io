# AGENTS.md — Andy 的个人网站

> 本文件面向 AI 编程助手。如果你正在阅读此文件，说明你对本项目一无所知——以下内容将帮助你快速上手。

---

## 项目概览

这是一个基于 **React 18 + Vite + Tailwind CSS** 构建的**单页面个人作品集网站**，使用中文作为内容语言。网站部署在 GitHub Pages 上，域名指向 `andywhite029.github.io`。

网站的核心定位是 Andy 的个人主页，包含以下板块：
- **Hero 首屏**：全屏照片墙背景 + 玻璃态卡片自我介绍
- **关于我**：个人简介、技能特长（进度条）、经历时间轴
- **项目实践**：带封面图的项目卡片展示
- **博客文章**：带标签筛选的文章列表，支持外链跳转
- **页脚**：社交媒体链接与版权信息

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18.3.1 (函数组件 + Hooks) |
| 构建工具 | Vite 5.4.3 |
| 样式 | Tailwind CSS 3.4.10 + 自定义 CSS |
| 动画 | Framer Motion 11.5.4 |
| 图标 | Lucide React 0.441.0 |
| 字体 | Google Fonts: Noto Serif SC, Source Sans 3, JetBrains Mono |
| 图像处理 | Sharp 0.34.5 (构建时压缩), vite-plugin-imagemin (构建时优化) |

---

## 目录结构

```
andywhite029.github.io/
├── .github/workflows/deploy.yml    # GitHub Actions 自动部署到 Pages
├── .gitignore                       # 忽略 node_modules / dist / .env 等
├── client/                          # 前端项目根目录
│   ├── index.html                   # HTML 入口（含中文 SEO meta、字体预加载）
│   ├── package.json                 # npm 配置与脚本
│   ├── vite.config.js               # Vite + React + imagemin 插件配置
│   ├── tailwind.config.js           # 自定义主题（颜色、字体、间距）
│   ├── postcss.config.js            # Tailwind + Autoprefixer
│   ├── scripts/
│   │   └── compress-images.js       # 将 public/photos/ 下的 jpg/png 转为 webp
│   ├── public/
│   │   ├── favicon.svg              # 网站图标
│   │   └── photos/                  # 照片墙图片（均为 .webp 格式）
│   └── src/
│       ├── main.jsx                 # React 渲染入口
│       ├── App.jsx                  # 根组件（仅渲染 <Home />）
│       ├── photos.js                # 照片文件名数组（供 PhotoWall 使用）
│       ├── pages/
│       │   └── Home.jsx             # 唯一页面：包含所有板块的数据与布局
│       ├── components/
│       │   ├── PhotoWall.jsx        # 全屏照片墙（无限循环滚动 + 视差 + 呼吸动画）
│       │   └── Footer.jsx           # 页脚组件
│       ├── hooks/                   # 空目录，预留自定义 Hook
│       ├── assets/                  # 空目录，预留静态资源
│       └── styles/
│           └── index.css            # Tailwind 指令 + 全局样式 + 自定义动画
└── AGENTS.md                        # 本文件
```

---

## 构建与开发命令

所有命令都在 `client/` 目录下执行：

```bash
cd client

# 启动开发服务器
npm run dev

# 构建生产版本（先执行图片压缩，再执行 vite build）
npm run build

# 预览生产构建
npm run preview

# 单独运行图片压缩脚本
npm run compress
```

> **注意**：`npm run build` 会**自动执行图片压缩**。压缩脚本会将 `public/photos/` 下的 `.jpg/.jpeg/.png` 转为 `.webp`，并**删除原始文件**。

---

## 部署流程

1. **推送触发**：向 `main` 分支推送代码时，`.github/workflows/deploy.yml` 自动执行。
2. **CI 步骤**：
   - 检出代码
   - 安装 Node.js 20（缓存 `client/package-lock.json`）
   - 在 `client/` 下执行 `npm ci` 与 `npm run build`
   - 将 `client/dist` 作为 artifact 上传并部署到 GitHub Pages
3. **手动触发**：也可在 GitHub 上通过 `workflow_dispatch` 手动运行。

---

## 代码风格与约定

### 文件规范
- 组件文件使用 `.jsx` 扩展名，纯逻辑文件使用 `.js`
- 全部使用 ES Module（`type: "module"`）
- 组件采用默认导出（`export default function`）

### 样式约定
- **优先使用 Tailwind 工具类**，复杂/重复样式才写自定义 CSS
- 自定义 CSS 写在 `src/styles/index.css`，通过 Tailwind 的 `@layer utilities` 注册
- 主题色通过 `tailwind.config.js` 的 `extend.colors` 定义，不要在代码中硬编码十六进制色值
- 玻璃态卡片使用组合类 `bg-bg-primary/70 backdrop-blur-md rounded-3xl shadow-lg gradient-border`

### 命名与注释
- 代码注释主要使用**中文**
- 组件命名使用 PascalCase
- 变量/函数命名使用 camelCase
- CSS 自定义属性（变量）使用 `--kebab-case`

### 响应式断点
- 遵循 Tailwind 默认断点：`sm:`、`md:`、`lg:`、`xl:`、`2xl:`
- 主要布局在 `md:`（768px）处切换

---

## 关键模块说明

### PhotoWall 照片墙 (`src/components/PhotoWall.jsx`)
- 使用**双缓冲循环布局**：每列渲染两套相同照片，实现首尾无缝循环滚动
- 支持**视差滚动**（不同列速度不同）和**呼吸动画**（正弦波浮动）
- 图片预加载时计算宽高比，用于瀑布流布局
- **无障碍**：检测 `prefers-reduced-motion: reduce`，在偏好减少动画时禁用动画
- 图片批量加载（每批 10 张），避免并发过多请求
- 照片列表由 `src/photos.js` 提供，**新增照片需手动更新该文件**

### Home 页面 (`src/pages/Home.jsx`)
- 单文件包含所有板块的数据与渲染逻辑
- 数据以数组常量形式内联定义：`skills`、`timeline`、`projects`、`blogPosts`
- **修改内容（如经历、项目、文章）直接编辑此文件中的常量**
- Hero 区域有**鼠标跟随光晕效果**（仅桌面端）
- 技能进度条使用 Framer Motion 的 `whileInView` 实现进入视口动画
- 博客支持按标签筛选（`全部`、`论文`、`新闻`），默认显示 5 条，可展开全部

### 图片压缩脚本 (`scripts/compress-images.js`)
- 使用 `sharp` 库将 `public/photos/` 下的 `.jpg/.jpeg/.png` 转为 `.webp`
- 限制最大宽度 800px，质量 75%
- **转换成功后删除原始文件**
- 输出压缩比例日志
- 该脚本在 `npm run build` 时自动执行，也可通过 `npm run compress` 单独运行

---

## 图像资源管理流程

向照片墙添加新图片的标准流程：

1. 将原始 `.jpg` 或 `.png` 图片放入 `client/public/photos/`
2. 运行 `npm run compress`（或 `npm run build`）生成 `.webp`
3. **更新 `client/src/photos.js`**，在数组中添加新的 `.webp` 文件名
4. 提交并推送，`GitHub Actions` 会自动部署

> **切勿**将未压缩的原始大图直接推送到仓库——这会导致构建产物体积膨胀。

---

## 测试策略

本项目**当前没有自动化测试套件**。由于这是一个纯静态展示型个人网站，功能以渲染和动画为主，验证方式以**本地预览**和**部署后检查**为主。

推荐的验证步骤：
1. `npm run dev` 检查开发环境渲染是否正常
2. `npm run build` 确认构建无错误
3. `npm run preview` 检查生产构建效果
4. 推送后检查 GitHub Actions 状态与线上页面

---

## 安全与隐私注意事项

- **无后端/无 API**：纯静态站点，没有数据库或服务器端逻辑
- **无环境变量**：当前未使用 `.env`，`.gitignore` 已将其排除
- **外链跳转**：博客文章和项目卡片中包含外部链接（如微信公众号、起点新闻），使用 `target="_blank" rel="noopener noreferrer"` 防止标签页钓鱼
- **Social Links**：Footer 中的 GitHub/Twitter/LinkedIn/Email 链接目前为占位符（指向示例地址），实际使用时应替换为真实地址
- **图片版权**：`public/photos/` 中的图片为个人摄影作品，注意版权合规

---

## 常见问题

**Q: 修改了经历/项目/博客数据后页面没更新？**
A: 这些是 `Home.jsx` 中的内联常量，确认修改保存后重新运行 `npm run dev` 或 `npm run build`。

**Q: 新增了照片但照片墙没显示？**
A: 检查三步：① 原始图是否被压缩为 `.webp`；② `src/photos.js` 是否加入了新文件名；③ 构建后 `dist/photos/` 是否包含该文件。

**Q: 动画在部分设备上卡顿？**
A: `PhotoWall` 已做 `prefers-reduced-motion` 降级处理。如仍卡顿，可在 `PhotoWall.jsx` 中检查 `containerHeight` 或降低 `totalLoops` 值。
