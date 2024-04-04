import { FeedbackType, Role } from "src/@generated/graphql";
import {
  AdditionalMacroIntervalDurationNames,
  AvailableQuickRanges,
} from "src/models/date-time";
import { AvailableRouteNames } from "src/models/routes";
import actions from "./actions";
import auth from "./auth";
import book from "./book";
import contacts from "./contacts";
import events from "./events";
import general from "./general";
import home from "./home";
import manageUsers from "./manage-users";
import myBooks from "./my-books";
import network from "./network";
import reserveBooks from "./reserve-books";
import salableBooks from "./salable-books";
import validators from "./validators";
import warehouse from "./warehouse";

const durationNames = {
  day: "Days",
  week: "Weeks",
  month: "Months",
  year: "Years",
  custom: "Custom",
};

const feedbackType = {
  FEATURE_IMPROVEMENT: "Feature Request",
  NEW_FEATURE: "New Feature",
  BUG: "Bug",
  OTHER: "Other",
} satisfies Record<FeedbackType, string>;

const durations = {
  year: "Year",
  month: "Month",
  intervalsDuration: "Interval's duration",
};

export default {
  actions,
  auth,
  book,
  contacts,
  durationNames,
  durations,
  events,
  general,
  home,
  manageUsers,
  myBooks,
  reserveBooks,
  network,
  salableBooks,
  validators,
  feedbackType,
  warehouse,

  common: {
    or: "Or",
    ok: "OK",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    next: "Next",

    from: "From",
    to: "To",

    genericErrorMessage: "An error occurred! Please try again later.",
    error: "Error",

    search: "Search",
    filterBy: "Filter by {field}",
    name: "Name",
    date: "Date",
    connected: "Connected",
    notConnected: "Not Connected",
  },

  roleMap: {
    ADMIN: "Admin",
    OPERATOR: "Operator",
  } satisfies Record<Role, string>,
  groupingOptions: {
    none: "No grouping",
    hour: "Hours",
    ...durationNames,
  },
  new: {
    f: "New",
    m: "New",
  },
  quickRanges: {
    today: "Today",
    thisWeek: "This week",
    thisMonth: "This month",
    thisYear: "This year",
    yesterday: "Yesterday",
    lastWeek: "Last week",
    lastMonth: "Last month",
    lastYear: "Last year",
    custom: "Custom",
  } satisfies Record<
    AvailableQuickRanges & AdditionalMacroIntervalDurationNames,
    string
  >,
  pushNotifications: {
    unsupported: "Your browser does not support push notifications",
    subscribe: "Subscribe to notifications",
    unsubscribe: "Unsubscribe from notifications",
    subscribing: "Subscribing to notifications...",
    unsubscribing: "Unsubscribing from notifications...",
    subscribeError: "Something went wrong while subscribing to notifications",
    unsubscribeError:
      "Something went wrong while unsubscribing from notifications",
    permissionDenied:
      "You have denied the permission to send notifications. You can change this in your browser settings.",
    subscribeSuccess: "You have successfully subscribed to notifications",
    unsubscribeSuccess: "You have successfully unsubscribed from notifications",

    permissionDialog: {
      title: "Allow Push Notifications",
      message:
        "Do you want to receive notifications? If you press {'\"'}@:pushNotifications.permissionDialog.allow{'\"'}, you will be prompted by the browser. See the image below for an example.",
      allow: "Allow",
      later: "Later",
      imageAlt: {
        chromium: "Notification permission dialog in Chromium based browsers",
        firefox: "Notification permission dialog in Firefox browser",
        safari: "Notification permission dialog in Safari browser",
      },
      imageError: "Could not load the image",
    },
  },
  routesNames: {
    [AvailableRouteNames.Catalog]: "Catalog",
    [AvailableRouteNames.Contacts]: "Contacts",
    [AvailableRouteNames.Events]: "Events",
    [AvailableRouteNames.Home]: "Home",
    [AvailableRouteNames.Theme]: "Theme",
    [AvailableRouteNames.ResetPassword]: "Reset Password",
    [AvailableRouteNames.ForgotPassword]: "Forgot Password",
    [AvailableRouteNames.ChangePassword]: "Change Password",
    [AvailableRouteNames.RolesAndPermissions]: "Roles And Permissions",
    [AvailableRouteNames.RegisterWithToken]: "Invite",
    [AvailableRouteNames.Login]: "Login",
    [AvailableRouteNames.SalableBooks]: "Salable books",
    [AvailableRouteNames.UsersManagement]: "Users and Movements",
    [AvailableRouteNames.MyBooks]: "My Books",
    [AvailableRouteNames.JoinUs]: "Join Us",
    [AvailableRouteNames.WhoWeAre]: "Who we are",
    [AvailableRouteNames.ReserveBooks]: "Reserve Books",
    [AvailableRouteNames.SelectLocation]: "Select Location",
    [AvailableRouteNames.MyData]: "My Data",
    [AvailableRouteNames.Warehouse]: "Warehouse",
  } satisfies Record<AvailableRouteNames, string>,
  sidebar: {
    settings: "Settings",
  },
};
