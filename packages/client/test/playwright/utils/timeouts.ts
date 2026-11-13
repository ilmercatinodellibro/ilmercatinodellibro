/**
 * The authenticated layout loads slowly on a cold dev server. The specs which
 * log in through the form wait this long for it.
 */
export const LOGIN_TIMEOUT_MS = 15_000;
