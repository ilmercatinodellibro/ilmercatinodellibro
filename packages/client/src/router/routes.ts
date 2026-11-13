import type { RouteRecordRaw } from "vue-router";
import { AvailableRouteNames } from "@/models/routes";
import ErrorNotFoundPage from "@/pages/error-not-found.vue";
import {
  redirectIfAuthenticated,
  redirectIfGuest,
  redirectIfNotAdmin,
  redirectIfNotOperatorOrAdmin,
  redirectIfNotUser,
  useAuthService,
} from "@/services/auth";
import { useRetailLocationService } from "@/services/retail-location";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect() {
      const { isAuthenticated } = useAuthService();
      if (!isAuthenticated.value) {
        return { name: AvailableRouteNames.SelectLocation };
      }

      const { selectedLocationId } = useRetailLocationService();
      return {
        name: AvailableRouteNames.Home,
        params: {
          // TODO: Use and enforce the user's preferred location (when implemented)
          locationId: selectedLocationId.value ?? "re",
        },
      };
    },
  },

  {
    path: "/select-location",
    name: AvailableRouteNames.SelectLocation,
    component: () => import("@/pages/select-location.vue"),
    beforeEnter: redirectIfAuthenticated,
  },

  {
    path: "/:locationId",
    // Vite only resolves aliases in import() calls with a static path, so each layout gets its own call
    component: () =>
      useAuthService().isAuthenticated.value
        ? import("@/layouts/authenticated-layout.vue")
        : import("@/layouts/guest-layout.vue"),
    children: [
      {
        path: "",
        redirect: () => ({
          name: useAuthService().isAuthenticated.value
            ? AvailableRouteNames.Home
            : AvailableRouteNames.SelectLocation,
        }),
      },
      {
        path: "contacts",
        name: AvailableRouteNames.Contacts,
        component: () => import("@/pages/contacts.vue"),
      },
      {
        path: "join-us",
        name: AvailableRouteNames.JoinUs,
        component: () => import("@/pages/join-us.vue"),
      },
      {
        path: "who-we-are",
        name: AvailableRouteNames.WhoWeAre,
        component: () => import("@/pages/who-we-are.vue"),
      },
    ],
  },

  {
    path: "/:locationId",
    component: () => import("@/layouts/guest-layout.vue"),
    beforeEnter: redirectIfAuthenticated,
    children: [
      { path: "", redirect: { name: AvailableRouteNames.SelectLocation } },
      {
        path: "login",
        name: "login",
        component: () => import("@/pages/login.vue"),
        props: ({ query }) => ({ emailVerified: !!query.emailVerified }),
      },

      // The server will redirect to this route after dealing with the social provider
      ...(import.meta.env.SOCIAL_LOGIN_ENABLED
        ? [
            {
              path: "login/social",
              name: "social-login",
              component: () => import("@/pages/social-login-redirect.vue"),
            },
          ]
        : []),

      {
        path: "registration",
        name: AvailableRouteNames.Registration,
        component: () => import("@/pages/register.vue"),
      },
      {
        path: "registration-sent",
        name: AvailableRouteNames.RegistrationSent,
        component: () => import("@/pages/registration-sent.vue"),
      },
      {
        path: "reset-password-link-sent",
        name: "reset-password-link-sent",
        component: () => import("@/pages/reset-password-link-sent.vue"),
      },
      {
        path: "forgot-password",
        name: AvailableRouteNames.ForgotPassword,
        component: () => import("@/pages/forgot-password.vue"),
      },
      {
        path: AvailableRouteNames.ChangePassword,
        name: AvailableRouteNames.ChangePassword,
        component: () => import("@/pages/reset-forgot-password.vue"),
        props: ({ query }) => ({ token: query.token as string }),
      },
      {
        path: AvailableRouteNames.RegisterWithToken,
        name: AvailableRouteNames.RegisterWithToken,
        component: () => import("@/pages/register.vue"),
        props: ({ query }) => ({
          token: query.token as string,
          email: query.email as string,
        }),
      },
    ],
  },

  {
    path: "/:locationId",
    component: () => import("@/layouts/authenticated-layout.vue"),
    beforeEnter: redirectIfGuest,
    children: [
      { path: "", redirect: { name: AvailableRouteNames.Home } },

      {
        path: "",
        beforeEnter: redirectIfNotUser,
        children: [
          {
            path: "home",
            name: AvailableRouteNames.Home,
            component: () => import("@/pages/home.vue"),
          },
          {
            path: "reserve-books",
            name: AvailableRouteNames.ReserveBooks,
            component: () => import("@/pages/reserve-books.vue"),
          },
          {
            path: "my-books",
            name: AvailableRouteNames.MyBooks,
            component: () => import("@/pages/my-books.vue"),
          },
          {
            path: "salable-books",
            name: AvailableRouteNames.SalableBooks,
            component: () => import("@/pages/salable-books.vue"),
          },
          {
            path: "faq",
            name: AvailableRouteNames.FAQ,
            component: () => import("@/pages/faq.vue"),
          },
        ],
      },

      {
        path: "",
        beforeEnter: redirectIfNotOperatorOrAdmin,
        children: [
          {
            path: "users-management",
            name: AvailableRouteNames.UsersManagement,
            component: () => import("@/pages/manage-users.vue"),
          },
          {
            path: "warehouse",
            name: AvailableRouteNames.Warehouse,
            component: () => import("@/pages/warehouse.vue"),
          },
          {
            path: "books-catalog",
            name: AvailableRouteNames.Catalog,
            component: () => import("@/pages/catalog.vue"),
          },
        ],
      },

      {
        path: "",
        beforeEnter: redirectIfNotAdmin,
        children: [
          {
            path: "edit-info",
            name: AvailableRouteNames.EditInfo,
            component: () => import("@/pages/edit-info.vue"),
          },
          {
            path: "roles-and-permissions",
            name: AvailableRouteNames.RolesAndPermissions,
            component: () => import("@/pages/roles-and-permissions.vue"),
          },
          {
            path: "statistics",
            name: AvailableRouteNames.Statistics,
            component: () => import("@/pages/statistics-page.vue"),
          },
        ],
      },

      {
        path: "my-data",
        name: AvailableRouteNames.MyData,
        component: () => import("@/pages/my-data.vue"),
      },
      {
        path: "reset-password",
        name: AvailableRouteNames.ResetPassword,
        component: () => import("@/pages/reset-password.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    name: "error",
    component: ErrorNotFoundPage,
  },
];

export default routes;
