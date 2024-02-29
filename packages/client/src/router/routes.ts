import { RouteRecordRaw } from "vue-router";
import { AvailableRouteNames } from "src/models/routes";
import ErrorNotFoundPage from "src/pages/error-not-found.vue";
import {
  redirectIfAuthenticated,
  redirectIfGuest,
  redirectIfNotAdmin,
  redirectIfNotOperatorOrAdmin,
  useAuthService,
} from "src/services/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () =>
      import(
        `layouts/${
          useAuthService().isAuthenticated.value
            ? "authenticated-layout"
            : "guest-layout"
        }.vue`
      ),
    children: [
      {
        path: "/",
        redirect: {
          name: useAuthService().isAuthenticated.value
            ? AvailableRouteNames.Events
            : "login",
        },
      },
      {
        path: "contacts",
        name: "contacts",
        component: () => import("pages/contacts.vue"),
      },
    ],
  },
  {
    path: "/",
    component: () => import("layouts/guest-layout.vue"),
    beforeEnter: redirectIfAuthenticated,
    children: [
      { path: "/", redirect: { name: "login" } },
      {
        path: "login",
        name: "login",
        component: () => import("src/pages/login.vue"),
        props: ({ query }) => ({ emailVerified: !!query.emailVerified }),
      },
      {
        path: "registration",
        name: "registration",
        component: () => import("src/pages/register.vue"),
      },
      {
        path: "registration-sent",
        name: "registration-sent",
        component: () => import("src/pages/registration-sent.vue"),
      },
      {
        path: "reset-password-link-sent",
        name: "reset-password-link-sent",
        component: () => import("src/pages/reset-password-link-sent.vue"),
      },
      {
        path: "forgot-password",
        name: AvailableRouteNames.ForgotPassword,
        component: () => import("src/pages/forgot-password.vue"),
      },
      {
        path: AvailableRouteNames.ChangePassword,
        name: AvailableRouteNames.ChangePassword,
        component: () => import("src/pages/reset-forgot-password.vue"),
        props: ({ query }) => ({ token: query.token as string }),
      },
      {
        path: AvailableRouteNames.RegisterWithToken,
        name: AvailableRouteNames.RegisterWithToken,
        component: () => import("src/pages/register-with-token.vue"),
        props: ({ query }) => ({
          token: query.token as string,
          email: query.email as string,
        }),
      },
    ],
  },
  {
    path: "/",
    component: () => import("layouts/authenticated-layout.vue"),
    beforeEnter: redirectIfGuest,
    children: [
      { path: "/", redirect: { name: AvailableRouteNames.Events } },
      {
        path: "events",
        name: AvailableRouteNames.Events,
        component: () => import("src/pages/events.vue"),
      },

      {
        path: "theme",
        name: AvailableRouteNames.Theme,
        component: () => import("src/pages/theme.vue"),
        beforeEnter: redirectIfNotAdmin,
      },
      {
        path: "reset-password",
        name: AvailableRouteNames.ResetPassword,
        component: () => import("src/pages/reset-password.vue"),
      },
      {
        path: "roles-and-permissions",
        name: AvailableRouteNames.RolesAndPermissions,
        component: () => import("src/pages/roles-and-permissions.vue"),
      },
      {
        path: "books-catalog",
        name: AvailableRouteNames.Catalog,
        component: () => import("src/pages/catalog.vue"),
      },
      {
        path: "users-management",
        name: AvailableRouteNames.UsersManagement,
        beforeEnter: redirectIfNotOperatorOrAdmin,
        component: () => import("src/pages/manage-users.vue"),
      },
      {
        path: "salable-books",
        name: AvailableRouteNames.SalableBooks,
        component: () => import("src/pages/salable-books.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: ErrorNotFoundPage,
  },
];

export default routes;
