export const staticRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@views/login/index.vue"),
    meta: { title: "登录", public: true },
  },
  {
    path: "/",
    component: () => import("@/layouts/index.vue"),
    redirect: "/home",
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@views/home/index.vue"),
        meta: { title: "首页" },
      },
    ],
  },
];
