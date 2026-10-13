export default {
  path: '/system',
  name: 'SystemModule',
  component: () => import('@/layouts/index.vue'),
  redirect: '/system/user',
  children: [
    {
      path: 'user',
      name: 'SystemUser',
      component: () => import('@/views/module_system/user/index.vue'),
      meta: { title: '用户管理', icon: 'ri:user-line', keepAlive: true }
    },
    {
      path: 'role',
      name: 'SystemRole',
      component: () => import('@/views/module_system/role/index.vue'),
      meta: { title: '角色管理', icon: 'ri:team-line', keepAlive: true }
    },
    {
      path: 'menu',
      name: 'SystemMenu',
      component: () => import('@/views/module_system/menu/index.vue'),
      meta: { title: '菜单管理', icon: 'ri:menu-line', keepAlive: true }
    },
    {
      path: 'dict',
      name: 'SystemDict',
      component: () => import('@/views/module_system/dict/index.vue'),
      meta: { title: '字典管理', icon: 'ri:book-2-line', keepAlive: true }
    }
  ]
};
