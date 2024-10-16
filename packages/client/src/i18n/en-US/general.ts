import { Role } from "src/@generated/graphql";

export default {
  mainNavigation: "Main",
  username: "Username",
  safety: "Safety",
  noResults: "No results",
  noElementIsPresent: "No element is present",
  saves: "Saves",
  oopsNothingHere: "Oops. Nothing here",
  goHome: "Go home",
  home: "Home",
  default: "default",
  filters: "Filters",
  confirmRequest: "Confirm request",
  typeAtLeastNChars: "Type at least {charCount} characters",
  helpAndFeedback: "Help and Feedback",
  feedbackRequestSent: "Request sent successfully",
  feedbackRequestError:
    "We weren't able to sent the contact request, contact us via other channels",
  enterMessage: "Enter message",
  userRoleUpdated: "User role updated",
  userRemoved: "User removed",
  inviteSent: "Invitation sent successfully",
  noSearchResults: "There are no results matching your search",
  all: "All",
  cannotLoadImage: "Cannot load image",
  uploadLogo: "Upload logo",
  resetLogo: "Reset Logo",
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  colorPicker: "Color Picker",
  removeUserMessage:
    "You are removing this user from the list of Operators for this Retail Location. Do you wish to proceed?",
  language: "Language",
  myData: "My Data",
  warehouse: "Warehouse",
  reserveBooks: "Reserve Books",
  myBooks: "My Books",
  salableBooks: "Salable Books",
  saveChanges: "Save Changes",
  themeChanged: "Theme changed!",
  leaveWithoutSaving: "Do you want to leave this page without saving?",
  logoSizeMessage:
    "The logo must be a png or svg and it must have a minimum width of 400px",
  tooltips: {
    warehouse: "Contains the list of all registered physical book copies",
    catalog:
      "Contains the list of all the titles that were released by the Ministry for the classes of all the schools of the province",
    usersAndMovements:
      "Contains the features to manage the data of the registered Users and the marketing exchange of books",
    reserveBooks:
      "Access this page to reserve the books that you wish to purchase. You can also request the books which aren't available at the moment.",
    myBooks:
      "Access this page to know the status of the books that you have given us for us to sell, of your reservations, and of the purchases that you have made.",
    salableBooks:
      "Access this page to verify which books we accept among those that you wish to sell.",
  },
  joinUs: "Join us",
  whoWeAre: "Who we are",
  faq: "FAQ",
  loading: "Loading...",
  settings: {
    resetToolTip:
      "Performs a reset of all of the system data to prepare the software for the following year's activities",
    purchaseRate: "Purchase Rate",
    saleRate: "Sale Rate",
    reservationDays: "Number of Days for Reservation",
    maxBooksDimension:
      "Max number of withdrawn books past which fragmentation is disabled",
    registrationEnabled: "Enable the possibility to register",
    payOffEnabled: "Enable the possibility to perform payoffs",
    updateRatesConfirmTitle: "Update the purchase/sale rate?",
    updateRatesConfirmMessage:
      "WARNING: you are updating the purchase and/or sale rate; make sure that this is ONLY done at the beginning or at the end of the Mercatino's activity period.",
    resetMessage:
      "You are performing the reset of all the system data to prepare the software for the following year's activities. Do you wish to proceed?",
    resetButton: "Perform annual reset",
    resetConfirmButton: "Perform reset",
  },
  role: "Role",
  rolesAndPermissions: {
    filters: {
      // customer: "Customers",
      OPERATOR: "Operators",
      ADMIN: "Administrators",
    } satisfies Record<Role, string>,
    addNewOperator: {
      title: "Add Operator",
      message:
        "Operators have the permissions to access the management pages (Warehouse, Catalog, Users and Movements) and their functionalities.",
    },
    operatorAdded: "The operator was successfully added.",
  },
};
