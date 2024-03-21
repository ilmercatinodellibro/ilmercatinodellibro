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

// TODO: Instead of redirecting to Events, redirect to home page (when implemented)
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: () => ({
      name: useAuthService().isAuthenticated.value
        ? AvailableRouteNames.Events
        : AvailableRouteNames.SelectLocation,
    }),
  },

  {
    path: "/select-location",
    name: AvailableRouteNames.SelectLocation,
    component: () => import("src/pages/select-location.vue"),
    // beforeEnter: redirectIfAuthenticated,
  },

  {
    path: "/:locationId",
    component: () =>
      import(
        useAuthService().isAuthenticated.value
          ? "layouts/authenticated-layout.vue"
          : "layouts/guest-layout.vue"
      ),
    children: [
      {
        path: "",
        redirect: () => ({
          name: useAuthService().isAuthenticated.value
            ? AvailableRouteNames.Events
            : AvailableRouteNames.SelectLocation,
        }),
      },
      {
        path: "contacts",
        name: AvailableRouteNames.Contacts,
        component: () => import("pages/contacts.vue"),
      },
      {
        path: "join-us",
        name: AvailableRouteNames.JoinUs,
        component: () => import("pages/join-us.vue"),
      },
      {
        path: "who-we-are",
        name: AvailableRouteNames.WhoWeAre,
        component: () => import("pages/who-we-are.vue"),
      },
    ],
  },

  {
    path: "/:locationId",
    component: () => import("layouts/guest-layout.vue"),
    beforeEnter: redirectIfAuthenticated,
    children: [
      { path: "", redirect: { name: AvailableRouteNames.SelectLocation } },
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
    path: "/:locationId",
    component: () => import("layouts/authenticated-layout.vue"),
    beforeEnter: redirectIfGuest,
    children: [
      { path: "", redirect: { name: AvailableRouteNames.Events } },
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
        beforeEnter: redirectIfNotAdmin,
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
      {
        path: "my-books",
        name: AvailableRouteNames.MyBooks,
        component: () => import("src/pages/my-books.vue"),
      },
      {
        path: "reserve-books",
        name: AvailableRouteNames.ReserveBooks,
        component: () => import("src/pages/reserve-books.vue"),
      },
      {
        path: "my-data",
        name: AvailableRouteNames.MyData,
        component: () => import("src/pages/my-data.vue"),
      },
      {
        path: "warehouse",
        name: AvailableRouteNames.Warehouse,
        component: () => import("src/pages/warehouse.vue"),
        beforeEnter: redirectIfNotOperatorOrAdmin,
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
