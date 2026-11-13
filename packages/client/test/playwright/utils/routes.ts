import { AvailableRouteNames } from "@/models/routes";
import { LOCATION_ID } from "../fixtures";

/*
  The specs navigate by path and assert the current route with a glob, see the
  toHaveRoute matcher. The pages of a retail location live under its id, see
  src/router/routes.ts. The pages whose name the enum does not hold are written
  out here, with the path src/router/routes.ts gives them.
*/

const LOCATION_PATH = `/${LOCATION_ID}`;

/** The paths the specs pass to page.goto() */
export const PATHS = {
  login: `${LOCATION_PATH}/login`,
  forgotPassword: `${LOCATION_PATH}/${AvailableRouteNames.ForgotPassword}`,
  /** A page only a logged in user can open */
  home: `${LOCATION_PATH}/${AvailableRouteNames.Home}`,
} as const;

/** The globs the specs pass to expect(page).toHaveRoute() */
export const ROUTES = {
  login: `${LOCATION_ID}/login`,
  registration: `${LOCATION_ID}/${AvailableRouteNames.Registration}`,
  registrationSent: `${LOCATION_ID}/${AvailableRouteNames.RegistrationSent}`,
  forgotPassword: `${LOCATION_ID}/${AvailableRouteNames.ForgotPassword}`,
  resetPasswordLinkSent: `${LOCATION_ID}/reset-password-link-sent`,
  /** Where a user lands after logging in */
  home: `${LOCATION_ID}/${AvailableRouteNames.Home}`,
} as const;
