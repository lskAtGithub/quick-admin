import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 相对于 src/ 解析别名目标，与参考项目 resolvePath 行为一致
const resolvePath = (p) => path.resolve(__dirname, 'src', p)

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolvePath(''),
      '@views': resolvePath('views'),
      '@imgs': resolvePath('assets/images'),
      '@icons': resolvePath('assets/images/svg'),
      '@utils': resolvePath('utils'),
      '@stores': resolvePath('store'),
      '@plugins': resolvePath('plugins'),
      '@styles': resolvePath('styles'),
      '@api': resolvePath('api'),
      '@fa_imgs': resolvePath('assets/fa_imgs'),
    },
  },
})
