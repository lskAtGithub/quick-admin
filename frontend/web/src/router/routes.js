import { ROOT_LAYOUT_ROUTE_NAME, HOME_ROUTE_NAME } from "@/constants/router";

export { HOME_PAGE_PATH } from "@/constants/router";

export const staticRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@views/login/index.vue"),
    meta: { title: "登录", public: true, isHideTab: true },
  },
  {
    path: "/401",
    component: () => import("@views/exception/401/index.vue"),
    meta: { title: "401", public: true, isHideTab: true },
  },
  {
    path: "/403",
    component: () => import("@views/exception/403/index.vue"),
    meta: { title: "403", public: true, isHideTab: true },
  },
  {
    path: "/404",
    component: () => import("@views/exception/404/index.vue"),
    meta: { title: "404", public: true, isHideTab: true },
  },
  {
    path: "/500",
    component: () => import("@views/exception/500/index.vue"),
    meta: { title: "500", public: true, isHideTab: true },
  },
  {
    path: "/redirect/:path(.*)",
    component: () => import("@views/redirect/index.vue"),
    meta: { isHideTab: true },
  },
  {
    path: "/",
    name: ROOT_LAYOUT_ROUTE_NAME,
    component: () => import("@/layouts/index.vue"),
    redirect: "/home",
    children: [
      {
        path: "home",
        name: HOME_ROUTE_NAME,
        component: () => import("@views/home/index.vue"),
        meta: { title: "menus.home.title", icon: "ri:home-smile-2-line", keepAlive: true, fixedTab: true },
      },
      {
        path: "profile",
        name: "FastlinkProfile",
        component: () => import("@views/fastlink/current/profile.vue"),
        meta: { title: "个人中心", icon: "ri:user-line", keepAlive: true, isHide: true },
      },
      {
        path: "system/user",
        name: "SystemUser",
        component: () => import("@views/module_system/user/index.vue"),
        meta: { title: "用户管理", icon: "ri:user-line", keepAlive: true },
      },
      {
        path: "system/role",
        name: "SystemRole",
        component: () => import("@views/module_system/role/index.vue"),
        meta: { title: "角色管理", icon: "ri:team-line", keepAlive: true },
      },
      {
        path: "system/menu",
        name: "SystemMenu",
        component: () => import("@views/module_system/menu/index.vue"),
        meta: { title: "菜单管理", icon: "ri:menu-line", keepAlive: true },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "CatchAll404",
    redirect: "/404",
  },
];
