// PostCSS 配置：注册 Tailwind CSS 与 Autoprefixer 插件
export default {
  plugins: {
    // Tailwind CSS 的 PostCSS 插件，用于处理 Tailwind 指令并生成对应样式
    '@tailwindcss/postcss': {},
    // Autoprefixer 插件，自动添加浏览器厂商前缀以确保样式兼容性
    autoprefixer: {},
  },
}
