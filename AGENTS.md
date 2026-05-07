# AGENTS.md — Andy 个人网站

> 本文件供 AI 编程助手阅读。项目主要使用中文进行注释和界面文案，以下文档使用中文撰写。

---

## 项目概述

本项目是 **Andy 的个人博客与作品集网站**（`andywhite029.github.io`），一个融合日式极简主义与瑞士现代排版美学的单页应用。网站以「留白即美」为核心理念，通过玻璃拟态（Glassmorphism）UI、呼吸感动效和沉浸式照片墙背景，营造诗意化的数字阅读体验。

项目采用前后端分离的双目录结构：
- **`client/`** — React 18 + Vite 构建的静态前端，部署至 GitHub Pages
- **`server/`** — Express.js 轻量后端，提供小说（连载）数据的 REST API，开发时使用

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + Vite 5 |
| 样式方案 | Tailwind CSS 3 + 自定义 CSS 变量 |
| 动画库 | Framer Motion |
| 图标 | Lucide React |
| 字体 | Google Fonts（Noto Serif SC、Source Sans 3、JetBrains Mono） |
| 后端 | Express 4 + CORS |
| 图片处理 | Sharp（构建脚本） |
| 部署 | GitHub Actions → GitHub Pages |

---

## 项目结构

```
├── client/                 # 前端（Vite + React）
│   ├── public/             # 静态资源（favicon、photos/ 照片墙图片）
│   ├── scripts/            # 构建辅助脚本
│   │   ├── compress-images.js    # 将 public/photos/ 下的 jpg/png 转为 webp
│   │   └── compress-photos.js    # 从外部目录批量导入并压缩照片，同时生成 src/photos.js
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   │   ├── Footer.jsx
│   │   │   ├── NovelSection.jsx    # 小说展示与阅读器
│   │   │   └── PhotoWall.jsx       # 全屏照片墙背景（Canvas 级动画）
│   │   ├── hooks/
│   │   │   └── useNovels.js        # 封装小说 API 请求
│   │   ├── pages/
│   │   │   ├── Home.jsx            # 首页（Hero / 关于 / 项目 / 博客 / 小说）
│   │   │   └── Admin.jsx           # 小说管理后台（通过 ?admin=1 进入）
│   │   ├── styles/
│   │   │   └── index.css           # 全局样式、Tailwind 指令、滚动条、玻璃边框
│   │   ├── App.jsx                 # 根组件：根据 URL 参数渲染 Home 或 Admin
│   │   ├── main.jsx                # React 应用入口
│   │   └── photos.js               # 照片墙文件名列表（由 compress-photos.js 自动生成）
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js              # Vite + vite-plugin-imagemin 配置
│   ├── tailwind.config.js          # 自定义颜色、字体、间距
│   └── postcss.config.js
│
├── server/                 # 后端（Express）
│   ├── data/
│   │   └── novels.json     # 小说数据持久化存储（JSON 文件）
│   ├── index.js            # Express 服务入口，提供 /api/novels CRUD
│   └── package.json
│
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions：构建并部署到 GitHub Pages
├── .vscode/launch.json     # VS Code 调试配置（vite dev / npm run dev）
└── SPEC.md                 # 产品设计规格书（中文）
```

---

## 构建与运行命令

### 前端（`client/` 目录）

```bash
# 开发服务器
npm run dev

# 生产构建（先执行图片压缩，再 vite build）
npm run build

# 预览生产构建
npm run preview

# 仅压缩 public/photos/ 中的图片（jpg/png → webp）
npm run compress
```

### 后端（`server/` 目录）

```bash
# 启动服务（默认端口 3001）
npm start

# 开发模式（Node.js --watch 自动重启）
npm run dev
```

> **注意**：前后端各自拥有独立的 `package.json` 和 `node_modules`，没有根级 monorepo 配置。开发时需要分别在两个目录中执行 `npm install`。

---

## 代码组织规范

### 模块系统
- 全项目统一使用 **ES Modules**（`"type": "module"`），包括 Node.js 后端脚本。
- 使用 `import.meta.url` + `fileURLToPath` 获取 `__dirname` 等 CommonJS 变量。

### 组件风格
- 函数组件 + Hooks，无类组件。
- 组件文件使用大驼峰命名（如 `NovelSection.jsx`）。
- 通用局部组件（如 `GlassCard`、`Modal`）直接定义在使用它们的页面文件中，未抽离到 `components/` 目录——这是项目的现有惯例。

### 样式约定
- **Tailwind CSS** 为首要样式方案，负责布局、间距、颜色、响应式。
- **自定义 CSS 变量** 在 `index.css` 的 `:root` 中定义，与 `tailwind.config.js` 的 `theme.extend.colors` 保持同步。
- 玻璃拟态卡片使用 `.gradient-border` 类实现渐变边框 + 背景模糊。
- 设计令牌（Design Tokens）：
  - 主背景 `#FAFAF9`，次背景 `#F5F5F4`
  - 主文字 `#1C1917`，次文字 `#78716C`
  - 强调色 `#E2A3AD`，悬停 `#A4697B`

### 无障碍
- 代码中已包含 `prefers-reduced-motion` 媒体查询，尊重用户减少动画的系统偏好。
- 照片墙动画在检测到该偏好时会自动禁用。

---

## 关键功能与架构细节

### 1. 照片墙背景（PhotoWall）
- 全屏固定背景（`-z-10`），多列瀑布流布局。
- 图片从 `public/photos/` 加载，文件名列表由 `src/photos.js` 导出。
- **自动生成**：运行 `node scripts/compress-photos.js [源目录]` 可批量导入外部图片，自动压缩至 ≤1MB，并按文件名排序生成 `photos.js`。
- 滚动时配合 `requestAnimationFrame` 实现视差循环滚动动画；支持 `prefers-reduced-motion`。

### 2. 小说系统
- **数据存储**：后端以纯 JSON 文件（`server/data/novels.json`）持久化，无数据库。
- **API 端点**：
  - `GET /api/novels` — 获取全部小说（公开）
  - `GET /api/novels/:id` — 获取单本小说（公开）
  - `POST /api/auth/login` — 管理员登录，成功后返回 Bearer Token
  - `POST /api/novels` — 创建小说（需鉴权）
  - `POST /api/novels/:id/chapters` — 创建章节（需鉴权）
  - `PUT /api/novels/:novelId/chapters/:chapterId` — 更新章节（需鉴权）
  - `DELETE /api/novels/:novelId/chapters/:chapterId` — 删除章节（需鉴权）
- **前端消费**：`useNovels.js` 在开发环境直连 `localhost:3001`，生产环境回退到相对路径 `/api`。
- **管理后台**：`App.jsx` 检测 `?admin=1` URL 参数，切换到 `Admin.jsx`，提供小说的增删改查界面。

### 3. 部署流程
- GitHub Actions 工作流 `.github/workflows/deploy.yml`：
  1. 在 `push` 到 `main` 分支时触发
  2. 检出代码 → Setup Node 20 → `npm ci` → `npm run build`
  3. 将 `./dist` 目录上传并部署到 GitHub Pages
- ~~**重要**：工作流中的 `npm ci` 和 `npm run build` 默认在仓库根目录执行，但实际的 `package.json` 位于 `client/` 内。当前工作流可能需要调整 `working-directory` 才能正确构建，这是已知需要留意的点。~~（已修复：已添加 `working-directory: ./client` 和 `cache-dependency-path`）

---

## 测试策略

**当前项目未配置任何测试框架**，也没有测试文件。

如需添加测试，建议：
- 前端：Vitest（与 Vite 原生集成）+ React Testing Library
- 后端：Node.js 内置 Test Runner 或 Jest

---

## 安全与注意事项

1. **Admin 面板鉴权**：已实现基于 Bearer Token 的登录机制。`Admin.jsx` 进入时先检测 `localStorage` 中的 `admin_token`，未登录则显示密码输入界面；后端所有写操作（POST/PUT/DELETE）均通过 `requireAuth` 中间件校验 Token。默认密码为 `andy029`，可通过环境变量 `ADMIN_PASSWORD` 修改。Token 存储在服务器内存中，服务重启后失效。
2. **CORS**：后端已全局开启 `cors()`，开发时允许跨域；生产部署时若前后端同源，可收紧配置。
3. **文件存储**：小说数据存储在服务器本地 JSON 文件中，无并发锁机制。在高并发写入场景下可能丢失数据。
4. **环境变量**：项目未使用 `.env` 文件。后端端口通过 `process.env.PORT` 读取，前端 API 地址在 `useNovels.js` 中通过 `import.meta.env.DEV` 判断。
5. **图片版权**：`public/photos/` 中的照片为个人摄影作品，修改或替换时需注意版权归属。

---

## 开发建议

- 修改 UI 文案时，注意保持中文语境的一致性。
- 添加新照片时，优先使用 `compress-photos.js` 脚本，避免直接放入大体积原图。
- 调整颜色主题时，务必同步更新 `tailwind.config.js` 和 `index.css` 中的 `:root` 变量。
- 动画性能敏感区域（如 PhotoWall）避免使用 React state 驱动每帧更新，现有实现已通过 `ref` + `requestAnimationFrame` + 直接操作 `style.transform` 进行优化。
