import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resolvePath = (p) => path.resolve(__dirname, p)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: env.VITE_BASE_URL || '/',
    plugins: [
      vue(),
      tailwindcss(),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'pinia',
          '@vueuse/core',
          'vue-i18n',
          { axios: [['default', 'axios']] },
          {
            'element-plus/es': [
              'ElMessage',
              'ElMessageBox',
              'ElNotification',
              'ElLoading',
            ],
          },
        ],
        dirs: ['./src/hooks/core'],
        dts: false,
        resolvers: [ElementPlusResolver(), IconsResolver()],
        vueTemplate: true,
      }),
      Components({
        dirs: ['src/components', 'src/layouts', 'src/**/components'],
        dts: false,
        resolvers: [ElementPlusResolver(), IconsResolver()],
      }),
      Icons({ autoInstall: false }),
      ElementPlus({ useSource: false }),
      ...(mode === 'development' ? [vueDevTools()] : []),
    ],
    resolve: {
      alias: {
        '@': resolvePath('src'),
        '@views': resolvePath('src/views'),
        '@imgs': resolvePath('src/assets/images'),
        '@icons': resolvePath('src/assets/images/svg'),
        '@utils': resolvePath('src/utils'),
        '@stores': resolvePath('src/store'),
        '@plugins': resolvePath('src/plugins'),
        '@styles': resolvePath('src/styles'),
        '@api': resolvePath('src/api'),
        '@qa_imgs': resolvePath('src/assets/qa_imgs'),
      },
    },
    server: {
      host: true,
      port: Number(env.VITE_PORT) || 5173,
      proxy: env.VITE_API_BASE_URL
        ? {
            [env.VITE_APP_BASE_API]: {
              target: env.VITE_API_BASE_URL,
              secure: false,
              changeOrigin: true,
            },
          }
        : undefined,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@styles/core/mixin.scss" as *;`,
        },
      },
    },
  }
})
