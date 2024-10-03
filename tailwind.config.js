const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // 入口html文件
    "./src/**/*.{js,ts,jsx,tsx}" // src目录下的所有文件
  ],
  theme: {
    fontFamily: {
      'sans': ['"Jinbu"', ...defaultTheme.fontFamily.sans] // 默认字体为钉钉进步体，定义在index.css中
    },
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}