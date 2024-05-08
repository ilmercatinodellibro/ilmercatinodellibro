import { useApolloClient } from "@vue/apollo-composable";
import { until } from "@vueuse/core";
import jwtDecode, { JwtPayload } from "jwt-decode";
import { LocalStorage } from "quasar";
import { computed, readonly, ref, watch } from "vue";
import { NavigationGuard, Router, useRouter } from "vue-router";
import { UpdateUserPayload } from "src/@generated/graphql";
import {
  CurrentUserFragment,
  useLoginMutation as useBaseLoginMutation,
  useRegisterMutation as useBaseRegisterMutation,
  useRegisterWithTokenMutation as useBaseRegisterWithTokenMutation,
  useRefreshTokenMutation,
} from "./auth.graphql";

const AUTH_TOKEN_KEY = "auth-token";
const AUTH_USER_KEY = "auth-user";

const isAuthenticated = ref(LocalStorage.has(AUTH_TOKEN_KEY));

// "?? undefined" bit is to remove null values and replace them with undefined
const token = ref(LocalStorage.getItem<string>(AUTH_TOKEN_KEY) ?? undefined);
watch(token, (newToken) => {
  if (newToken !== undefined) {
    LocalStorage.set(AUTH_TOKEN_KEY, newToken);
  } else {
    LocalStorage.remove(AUTH_TOKEN_KEY);
  }

  isAuthenticated.value = newToken !== undefined;
});

// "?? undefined" bit is to remove null values and replace them with undefined
const user = ref(
  LocalStorage.getItem<CurrentUserFragment>(AUTH_USER_KEY) ?? undefined,
);
watch(user, (newUser) => {
  if (newUser !== undefined) {
    LocalStorage.set(AUTH_USER_KEY, newUser);
  } else {
    LocalStorage.remove(AUTH_USER_KEY);
  }
});

const AUTHENTICATED_DEFAULT_ROUTE_NAME = "home";
const REGISTRATION_SENT_ROUTE_NAME = "registration-sent";
const GUEST_DEFAULT_ROUTE_NAME = "login";

export function useLoginMutation() {
  const router = useRouter();

  const loginMutationComposable = useBaseLoginMutation();

  async function login(
    ...params: Parameters<typeof loginMutationComposable.login>
  ) {
    if (isAuthenticated.value) {
      throw new Error("Already authenticated, can't login again");
    }

    const { data } = await loginMutationComposable.login(...params);

    token.value = data.jwt;
    user.value = data.user;
    void router.push({ name: AUTHENTICATED_DEFAULT_ROUTE_NAME });
  }

  return { ...loginMutationComposable, login };
}

export function useRegisterMutation() {
  const router = useRouter();

  const registerMutationComposable = useBaseRegisterMutation();

  async function register(
    ...params: Parameters<typeof registerMutationComposable.register>
  ) {
    if (isAuthenticated.value) {
      throw new Error("Already authenticated, can't register");
    }
    await registerMutationComposable.register(...params);
    void router.push({ name: REGISTRATION_SENT_ROUTE_NAME });
  }

  return { ...registerMutationComposable, register };
}

export function useRegisterWithTokenMutation() {
  const registerWithTokenMutationComposable =
    useBaseRegisterWithTokenMutation();

  async function registerWithToken(
    ...params: Parameters<
      typeof registerWithTokenMutationComposable.registerWithToken
    >
  ) {
    if (isAuthenticated.value) {
      throw new Error("Already authenticated, can't register");
    }
    await registerWithTokenMutationComposable.registerWithToken(...params);
  }

  return { ...registerWithTokenMutationComposable, registerWithToken };
}

let hasTokenRefreshSystemBeenInitialized = false;
export function initTokenRefresh(router: Router) {
  if (hasTokenRefreshSystemBeenInitialized) {
    return;
  }

  let accessTokenRefreshTimeout: number | undefined;

  async function keepAccessTokenFresh() {
    const { logout } = useLogoutMutation(router);
    const { refreshToken } = useRefreshTokenMutation();

    if (!token.value) {
      return;
    }

    const { iat: tokenIssueTime, exp: tokenExpirationTime } =
      jwtDecode<JwtPayload>(token.value);

    if (!tokenIssueTime || !tokenExpirationTime) {
      logout();
      throw new Error("Invalid access token");
    }

    const tokenValidityDuration = tokenExpirationTime - tokenIssueTime;
    const tokenRefreshTime = tokenIssueTime + tokenValidityDuration / 2;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = tokenExpirationTime - currentTime;
    const timeUntilRefresh = tokenRefreshTime - currentTime;

    if (timeUntilExpiration <= 0) {
      logout();
      throw new Error("Access token expired");
    }

    if (timeUntilRefresh <= 0) {
      try {
        const { data: jwt } = await refreshToken();
        token.value = jwt;
      } catch (error) {
        logout();
        throw new Error("Could not refresh the access token");
      }
    }

    // Refresh the access token when it reaches its half-life
    accessTokenRefreshTimeout = window.setTimeout(
      keepAccessTokenFresh,
      (tokenValidityDuration / 2) * 1000,
    );
  }

  onLogin(() => {
    void keepAccessTokenFresh();
  });

  onLogout(() => {
    clearTimeout(accessTokenRefreshTimeout);
  });

  hasTokenRefreshSystemBeenInitialized = true;
}

export function useLogoutMutation(router = useRouter()) {
  const { client } = useApolloClient();

  function logout() {
    if (!isAuthenticated.value) {
      throw new Error("No authenticated session, can't logout");
    }
    token.value = undefined;
    user.value = undefined;
    // Wipe out the storage completely to avoid user data being leaked (settings, etc)
    LocalStorage.clear();
    void client.clearStore();
    void router.push({ name: GUEST_DEFAULT_ROUTE_NAME });
  }

  return { logout };
}

type LoginHook = (user: CurrentUserFragment) => void | Promise<void>;
type LogoutHook = () => void | Promise<void>;

const onLoginHooks: LoginHook[] = [];
const onLogoutHooks: LogoutHook[] = [];

watch(
  isAuthenticated,
  async (isNowAuthenticated, wasAuthenticated) => {
    // This works the first time when reading from LocalStorage
    // because `wasAuthenticated` is undefined in that case
    if (isNowAuthenticated && !wasAuthenticated) {
      await until(() => !!user.value).toBe(true);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await Promise.allSettled(onLoginHooks.map((hook) => hook(user.value!)));
    }

    if (!isNowAuthenticated && wasAuthenticated) {
      await Promise.allSettled(onLogoutHooks.map((hook) => hook()));
    }
  },
  { immediate: true },
);

function onLogin(hook: LoginHook) {
  onLoginHooks.push(hook);

  // If the user is already logged in, call the hook immediately
  if (isAuthenticated.value) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    void hook(user.value!);
  }
}

function onLogout(hook: LogoutHook) {
  onLogoutHooks.push(hook);
}

function updateCurrentUser({
  email,
  firstname,
  lastname,
  dateOfBirth,
  delegate,
  phoneNumber,
}: UpdateUserPayload) {
  if (!user.value || !isAuthenticated.value) {
    return;
  }

  user.value = {
    ...user.value,
    email: email && email.length > 0 ? email : user.value.email,
    firstname,
    lastname,
    dateOfBirth,
    delegate,
    phoneNumber: phoneNumber ?? "",
  };
}

function getJwtHeader(authToken = token.value) {
  return {
    // It's important for the header name to be lowercase as JWT passport strategy only parses lowercase header names
    // This only comes up when using the graphql-ws link as http link apparently lowercases the header names
    // See https://github.com/mikenicholson/passport-jwt/issues/179
    authorization: authToken ? `Bearer ${authToken}` : "",
  };
}

const hasAdminRole = computed(() => user.value?.role === "ADMIN");
const hasOperatorRole = computed(() => user.value?.role === "OPERATOR");
const hasUserRole = computed(() => user.value?.role === null);

// This composable is meant to work even outside a Vue component context
// DO NOT directly use stuff that requires a Vue context (e.g. using `useRouter`) nor return methods that use them
export function useAuthService() {
  return {
    onLogin,
    onLogout,
    updateCurrentUser,
    getJwtHeader,
    hasAdminRole,
    hasOperatorRole,
    hasUserRole,
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
  };
}

export const redirectIfAuthenticated: NavigationGuard = (to, from, next) => {
  const { isAuthenticated } = useAuthService();

  if (isAuthenticated.value && to.name !== AUTHENTICATED_DEFAULT_ROUTE_NAME) {
    next({ name: AUTHENTICATED_DEFAULT_ROUTE_NAME });
  } else {
    next();
  }
};

export const redirectIfGuest: NavigationGuard = (to, from, next) => {
  const { isAuthenticated } = useAuthService();

  if (!isAuthenticated.value && to.name !== GUEST_DEFAULT_ROUTE_NAME) {
    next({ name: GUEST_DEFAULT_ROUTE_NAME });
  } else {
    next();
  }
};

export const redirectIfNotAdmin: NavigationGuard = () => {
  const { hasAdminRole } = useAuthService();

  if (!hasAdminRole.value) {
    return { name: AUTHENTICATED_DEFAULT_ROUTE_NAME };
  }
};

export const redirectIfNotOperatorOrAdmin: NavigationGuard = () => {
  const { hasAdminRole, hasOperatorRole } = useAuthService();

  if (!hasAdminRole.value && !hasOperatorRole.value) {
    return { name: AUTHENTICATED_DEFAULT_ROUTE_NAME };
  }
};
