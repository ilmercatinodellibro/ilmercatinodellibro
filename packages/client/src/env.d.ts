declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: "hash" | "history" | "abstract" | undefined;
    VUE_ROUTER_BASE: string | undefined;
    DOMAIN: string;
    GRAPHQL_DOMAIN: string;
    GRAPHQL_PATH: string;
    GRAPHQL_URL: string;
    GRAPHQL_WS_DOMAIN: string;
    GRAPHQL_WS_PATH: string;
    GRAPHQL_WS_URL: string;
    WEB_PUSH_ENABLED: string;
    WEB_PUSH_VAPID_KEY: string;
    FIREBASE_API_KEY: string;
    FIREBASE_APP_ID: string;
    FIREBASE_MESSAGING_SENDER_ID: string;
    FIREBASE_PROJECT_ID: string;

    FACEBOOK_LOGIN_ENABLED: string;
    GOOGLE_LOGIN_ENABLED: string;
  }
}
