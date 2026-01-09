import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5101,
    proxy: {
      // 配置Socket.io代理
      '/socket.io': {
        target: 'http://localhost:5102',
        ws: true,
        changeOrigin: true
      },
      // 配置API代理
      '/api': {
        target: 'http://localhost:5102',
        changeOrigin: true
      }
    }
  }
})
