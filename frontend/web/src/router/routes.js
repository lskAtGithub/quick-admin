export const staticRoutes = [
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
