# Andy 的个人网站

> 在暗房红光与终端绿光之间工作

一个基于 React 18 + Vite + Tailwind CSS 构建的单页面个人网站，以「暗房 × 终端」双主题呈现，支持中英双语切换，部署在 GitHub Pages。

## 在线预览

🔗 [https://andywhite029.github.io](https://andywhite029.github.io)

## 特性

- **暗房 → 终端双主题**：页面前半段为暗房红光氛围（胶片齿孔、红色炫光、红色粒子），滚动到项目区附近过渡为终端绿光（电子干扰、色散、绿色终端窗口）
- **Three.js 粒子背景**：1000 颗自定义 Shader 粒子，随滚动从暗房红渐变为终端绿，支持鼠标视差、靠近闪烁与转场空间扭曲
- **胶片元素**：页面左侧为 35mm 胶片齿孔边框，随滚动实时高亮当前帧；各板块以 `Frame NN //` 编号
- **交互式终端**：项目板块是一个可点击的模拟终端——`ls projects/` 列出项目，点击项目执行 `cat` 查看详情，并触发 WebAudio 合成的快门音效
- **中英双语**：右上角一键切换 EN / 中文，全部文案集中维护在 `translations.js`
- **平滑滚动**：Lenis 与 GSAP ScrollTrigger 联动驱动画面的入场动画
- **无障碍**：全站尊重 `prefers-reduced-motion`，偏好减少动画时自动关闭 3D 背景、滚动动画与音效

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18.3.1 |
| 构建工具 | Vite 5.4.3 |
| 样式 | Tailwind CSS 3.4.10 |
| 3D 背景 | Three.js 0.167（@react-three/fiber 8 + @react-three/postprocessing 2.19） |
| 动画 | GSAP 3.12（ScrollTrigger）+ Lenis 1.1 平滑滚动 |
| 图标 | Lucide React 0.441.0 |
| 字体 | Noto Serif SC, Source Sans 3, JetBrains Mono |
| 图像处理 | Sharp 0.34.5 |

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

> `npm run build` 会先执行 `scripts/compress-images.js`（将 `public/photos/` 下的 `.jpg/.png` 压缩为 `.webp` 并重新生成 `src/photos.js`），再执行 `vite build`。

## 部署

推送至 `main` 分支即可触发 GitHub Actions 自动部署到 GitHub Pages。

## 项目结构

```
client/
├── index.html                  # HTML 入口（中文 SEO meta、字体预加载）
├── vite.config.js              # Vite 配置（base 取自环境变量 BASE_URL）
├── tailwind.config.js          # Tailwind 主题（暗房红 / 终端绿配色）
├── postcss.config.js           # PostCSS 配置
├── eslint.config.js            # ESLint 9 flat config
├── .prettierrc                 # Prettier 配置
├── public/
│   ├── favicon.svg
│   ├── photos/                 # 照片（.webp）
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/
│   └── compress-images.js      # 图片压缩脚本（构建前自动运行）
└── src/
    ├── main.jsx                # React 入口（StrictMode）
    ├── App.jsx                 # 根组件（Language / Lenis / ScrollProgress 三层 Provider）
    ├── photos.js               # 照片数据（自动生成，当前未被 UI 引用）
    ├── pages/
    │   └── Home.jsx            # 主页面（组装全部板块与装饰层）
    ├── components/
    │   ├── SceneBackground.jsx # Three.js 全屏背景（粒子 + Bloom/Glitch 等后期特效）
    │   ├── DustParticles.jsx   # 自定义 Shader 尘埃粒子
    │   ├── GrainOverlay.jsx    # Canvas 胶片噪点
    │   ├── FlareOverlay.jsx    # 镜头炫光（漂移 + 轻微跟随鼠标）
    │   ├── FilmStripEdge.jsx   # 左侧胶片齿孔边框（滚动进度指示）
    │   ├── Sidebar.jsx         # 桌面端左侧固定导航
    │   ├── MobileHeader.jsx    # 移动端顶部导航
    │   ├── LanguageToggle.jsx  # 中英切换按钮
    │   ├── TerminalCursor.jsx  # 终端闪烁光标
    │   └── sections/           # Hero / About / Experience / Projects / Contact 五个板块
    ├── context/
    │   ├── LanguageContext.jsx       # 语言状态（en / zh）
    │   └── ScrollProgressContext.jsx # 全页滚动进度与当前板块
    ├── hooks/
    │   ├── useLenis.jsx        # Lenis 平滑滚动（与 GSAP 同步）
    │   ├── useReducedMotion.js # 减少动画偏好检测
    │   └── useShutterSound.js  # WebAudio 合成快门音效
    ├── data/
    │   └── translations.js     # ⚠️ 全部文案（中英双语），改内容就改这里
    └── styles/
        └── index.css           # Tailwind 指令 + 全局样式 + CSS 变量
```

## 内容维护

网站全部文案（导航、介绍、经历、项目、联系方式）以中英双语形式集中在 `client/src/data/translations.js`。**修改内容只需编辑该文件**，注意 `en` 与 `zh` 两边的 key 结构保持同步。

## 图片资源管理

向照片目录添加新图片：

1. 将原始 `.jpg` 或 `.png` 放入 `client/public/photos/`
2. 运行 `npm run compress`（或 `npm run build`）生成 `.webp` 并自动更新 `src/photos.js`
3. 提交并推送

> 注意：压缩脚本会在转换成功后**删除原始文件**。当前版本 UI 未直接展示这些照片，`src/photos.js` 暂无引用方。

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
