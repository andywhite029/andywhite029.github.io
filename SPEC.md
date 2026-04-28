# Personal Blog & Portfolio - SPEC.md

## 1. Concept & Vision

一个优雅的个人博客与作品集网站，融合极简主义与诗意美学。以「留白即美」为核心理念，通过精心设计的排版、呼吸感的布局和微妙的动效，营造沉浸式阅读体验。网站本身即是一件数字艺术品。

## 2. Design Language

### Aesthetic Direction
日式极简 + 瑞士现代排版，灵感来自 Dieter Rams 的设计原则与日本「侘寂」美学。

### Color Palette
```
--bg-primary: #FAFAF9        // 暖白底色
--bg-secondary: #F5F5F4       // 卡片背景
--text-primary: #1C1917       // 主文字（石墨黑）
--text-secondary: #78716C      // 次要文字
--accent: #DC2626             // 点睛红
--accent-hover: #B91C1C
--border: #E7E5E4
```

### Typography
- 标题: `Noto Serif SC` (中文衬线，优雅庄重)
- 正文: `Source Sans 3` (西文无衬线，清晰易读)
- 代码: `JetBrains Mono`
- 字号系统: 12 / 14 / 16 / 20 / 24 / 32 / 48 / 64px

### Spatial System
- 基础单位: 8px
- 间距序列: 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128px
- 最大内容宽度: 720px (阅读最佳宽度)
- 页面最大宽度: 1200px

### Motion Philosophy
- 入场动画: opacity 0→1, translateY 20px→0, 500ms ease-out, 交错 80ms
- 悬停反馈: transform scale 1.02, 200ms ease
- 页面切换: 淡入淡出 300ms
- 滚动视差: 图片轻微浮动，-0.1 scroll ratio

## 3. Layout & Structure

### 页面架构
```
┌─────────────────────────────────────┐
│           Header (固定透明)          │
├─────────────────────────────────────┤
│                                     │
│            Hero Section              │
│      (全屏引言 + 头像/签名)           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│           About Section             │
│        (个人简介 + 技能图)            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│          Portfolio Grid             │
│       (作品卡片瀑布流布局)            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│           Blog List                 │
│        (文章列表 + 分类)             │
│                                     │
├─────────────────────────────────────┤
│            Footer                   │
│        (社交链接 + 版权)              │
└─────────────────────────────────────┘
```

### Responsive Strategy
- Desktop (>1024px): 完整布局
- Tablet (768-1024px): 简化侧边距
- Mobile (<768px): 单列堆叠，汉堡菜单

## 4. Features & Interactions

### Core Features
1. **首页展示**
   - 大标题引言打字机效果
   - 头像区域带呼吸光环
   - 向下滚动提示箭头

2. **关于我**
   - 个人照片（支持裁剪上传）
   - 技能标签云（悬停显示熟练度）
   - 时间线展示经历

3. **作品集**
   - 卡片网格，支持分类筛选
   - 悬停显示项目名称和简介
   - 点击跳转详情或外部链接

4. **博客**
   - 文章列表，支持标签筛选
   - 阅读时间估算
   - 预计开发：Markdown 渲染支持

5. **导航**
   - 滚动时 Header 背景模糊
   - 当前 section 高亮指示
   - 移动端汉堡菜单

### Interaction Details
- 链接悬停: 下划线从左向右展开
- 按钮悬停: 背景色渐变，轻微上浮
- 卡片悬停: 阴影加深，边框微红
- 图片加载: 骨架屏占位

## 5. Component Inventory

### Header
- Logo/名字（左侧）
- 导航链接：首页、关于、作品、博客（右侧）
- 移动端：汉堡图标
- 状态：透明/模糊背景（滚动后）

### HeroSection
- 标语文字（支持打字机效果）
- 头像/签名档
- 滚动提示箭头

### AboutSection
- 照片 + 简介
- 技能标签
- 时间线

### PortfolioCard
- 封面图
- 标题 + 描述
- 技术栈标签
- 悬停遮罩

### BlogCard
- 发布日期
- 标题
- 摘要
- 阅读时间
- 标签

### Footer
- 社交图标链接
- 版权信息
- 备案号（可选）

## 6. Technical Approach

### Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Noto Serif SC, Source Sans 3)

### Project Structure
```
src/
├── components/     # 可复用组件
├── pages/          # 页面组件
├── styles/         # 全局样式
├── assets/         # 静态资源
├── App.jsx
└── main.jsx
```

### 部署目标
- 开发环境: Vite Dev Server
- 生产构建: Vite Build (静态文件)
- 部署平台: 预留 Vercel/Netlify 配置
