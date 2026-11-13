// Some requests are slow on a busy machine or a slow database, such as hashing
// a password, loading the widgets of a dashboard or reading the last
// measurements of a device. The default 5 seconds of an assertion is too tight
// for those.
export const SLOW_SERVER_TIMEOUT_MS = 30_000;

/**
 * The authenticated layout loads slowly on a cold dev server. The specs which
 * log in through the form wait this long for it.
 */
export const LOGIN_TIMEOUT_MS = 15_000;
