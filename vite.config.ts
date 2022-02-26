import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 8000,
    proxy: {
      '/tran': {
        target: 'http://dict.youdao.com', // 后端服务实际地址
        changeOrigin: true, //开启代理
        rewrite: path => path.replace(/^\/tran/, '')
      }
    }
  }

})
