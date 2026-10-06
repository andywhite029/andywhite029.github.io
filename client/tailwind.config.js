/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 中性基础：纸白 / 炭黑 / 灰阶
        paper: '#FAFAF8',
        'paper-warm': '#F4F3EF',
        ink: '#17171B',
        'ink-soft': '#4A4B52',
        'ink-faint': '#8B8C94',
        line: '#E6E5E0',
        'momenta-blue': '#0068DF',
        'xiaomi-orange': '#FF6900',
        // 光轮智能（取自《光轮智能 BRANDguidelines 2026》色彩系统）
        'gl-blue': '#4123F5',   // 光蓝·主色
        'gl-purple': '#0F053C', // 文紫
        'gl-night': '#07031A',  // 夜黑（章节底色在此基础上渐变）
        'gl-silver': '#F4F4F5', // 雾银
        'gl-mist': '#A6A0C8',   // 深底上的弱化文字（设计用色）
        // 轻舟智航（品牌信息.md 确认主色；hover/soft 为 qcraft-web 官方设计参考值）
        'qc-green': '#15CC8A',
        'qc-deep': '#11B87B',
        'qc-soft': '#E6FAF2',
        'qc-graphite': '#20242B',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
}
