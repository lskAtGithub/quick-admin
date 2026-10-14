import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

// ESLint 只负责代码质量；格式化交给 Prettier，故关闭与 Prettier 冲突的风格类规则。
export default [
  { ignores: ['dist/**', 'node_modules/**', '*.db'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      // unplugin-auto-import 注入的全局 API（ref/computed/ElMessage 等）会让 no-undef 误报
      'no-undef': 'off',
      // 与 Prettier 冲突的排版规则交还给 Prettier
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/attributes-order': 'off',
      // 项目习惯
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      // 表单组件按约定接收 reactive formData 作 prop 并 v-model 双向绑定，非缺陷
      'vue/no-mutating-props': 'off',
      // auto-import 下未用引用降级为提醒
      'no-unused-vars': ['warn', { args: 'none' }]
    }
  }
];
