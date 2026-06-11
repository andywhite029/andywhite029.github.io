# Andy 的个人网站

> 在影像与文字之间寻找意义

一个基于 React 18 + Vite + Tailwind CSS 构建的单页面个人作品集网站，部署在 GitHub Pages。

## 在线预览

🔗 [https://andywhite029.github.io](https://andywhite029.github.io)

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18.3.1 |
| 构建工具 | Vite 5.4.3 |
| 样式 | Tailwind CSS 3.4.10 |
| 动画 | Framer Motion 11.5.4 |
| 图标 | Lucide React 0.441.0 |
| 字体 | Noto Serif SC, Source Sans 3, JetBrains Mono |

## 本地开发

```bash
cd client
npm install
npm run dev
```

## 构建

```bash
cd client
npm run build
```

> `npm run build` 会自动执行图片压缩脚本，将 `public/photos/` 下的 `.jpg/.png` 转为 `.webp`。

## 部署

推送至 `main` 分支即可触发 GitHub Actions 自动部署到 GitHub Pages。

## 项目结构

```
client/
├── index.html              # HTML 入口
├── vite.config.js          # Vite 配置
├── tailwind.config.js      # Tailwind 主题
├── postcss.config.js       # PostCSS 配置
├── eslint.config.js        # ESLint 配置
├── .prettierrc             # Prettier 配置
├── public/
│   ├── favicon.svg
│   ├── photos/             # 照片墙图片（.webp）
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/
│   └── compress-images.js  # 图片压缩脚本
└── src/
    ├── main.jsx            # React 入口
    ├── App.jsx             # 根组件
    ├── photos.js           # 照片数据（自动生成）
    ├── pages/
    │   └── Home.jsx        # 主页面
    ├── components/
    │   ├── PhotoWall.jsx   # 照片墙背景
    │   └── Footer.jsx      # 页脚
    ├── data/
    │   ├── skills.js       # 技能数据
    │   ├── timeline.js     # 经历数据
    │   ├── projects.js     # 项目数据
    │   └── blogPosts.js    # 博客数据
    └── styles/
        └── index.css       # 全局样式
```

## 图片资源管理

向照片墙添加新图片：

1. 将原始 `.jpg` 或 `.png` 放入 `client/public/photos/`
2. 运行 `npm run compress`（或 `npm run build`）生成 `.webp` 并自动更新 `src/photos.js`
3. 提交并推送

## 代码规范

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix

# 格式化
npm run format
```

## License

MIT
