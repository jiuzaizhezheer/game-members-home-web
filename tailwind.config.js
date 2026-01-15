/** @type {import('tailwindcss').Config} */
export default {
  // 指定 Tailwind 需要扫描的文件路径，用于按需生成样式
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // 主题配置，可在此扩展或覆盖默认样式
  theme: {
    extend: {},
  },
  // 插件列表，可引入第三方插件或自定义插件
  plugins: [],
}
