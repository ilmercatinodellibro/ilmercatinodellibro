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
import manageUsers from "./manage-users";
import myBooks from "./my-books";
import network from "./network";
import salableBooks from "./salable-books";
import validators from "./validators";

const durationNames = {
  day: "Giorni",
  week: "Settimane",
  month: "Mesi",
  year: "Anni",
  custom: "Personalizzato",
};

const feedbackType = {
  FEATURE_IMPROVEMENT: "Miglioramento di una funzionalità",
  NEW_FEATURE: "Nuova funzionalità",
  BUG: "Bug",
  OTHER: "Altro",
} satisfies Record<FeedbackType, string>;

const durations = {
  year: "Anno",
  month: "Mese",
  intervalsDuration: "Durata degli intervalli",
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
  manageUsers,
  myBooks,
  network,
  salableBooks,
  validators,
  feedbackType,

  common: {
    or: "Oppure",
    ok: "OK",
    close: "Chiudi",
    cancel: "Annulla",
    delete: "Elimina",
    back: "Indietro",
    next: "Avanti",

    from: "Da",
    to: "A",

    confirm: "Conferma",
    save: "Salva",
    add: "Aggiungi",
    edit: "Modifica",

    genericErrorMessage: "Si è verificato un errore! Riprova più tardi.",
    error: "Errore",

    search: "Cerca",
    filterBy: "Filtra per {field}",

    name: "Nome",
    date: "Data",
    connected: "Connesso",
    notConnected: "Non Connesso",
  },

  roleMap: {
    ADMIN: "Amministratore",
    OPERATOR: "Operatore",
    USER: "Utente Base",
  } satisfies Record<Role, string>,
  groupingOptions: {
    none: "Nessun raggruppamento",
    hour: "Ore",
    ...durationNames,
  },
  new: {
    f: "Nuova",
    m: "Nuovo",
  },
  quickRanges: {
    today: "Oggi",
    thisWeek: "Settimana corrente",
    thisMonth: "Mese corrente",
    thisYear: "Anno corrente",
    yesterday: "Ieri",
    lastWeek: "Settimana scorsa",
    lastMonth: "Mese scorso",
    lastYear: "Anno scorso",
    custom: "Personalizzato",
  } satisfies Record<
    AvailableQuickRanges & AdditionalMacroIntervalDurationNames,
    string
  >,
  pushNotifications: {
    unsupported: "Il tuo browser non supporta le notifiche push",
    subscribe: "Iscriviti alle notifiche",
    unsubscribe: "Annulla iscrizione alle notifiche",
    subscribing: "Iscrizione alle notifiche in corso...",
    unsubscribing: "Annullamento iscrizione alle notifiche in corso...",
    subscribeError:
      "Si è verificato un errore durante l'iscrizione alle notifiche",
    unsubscribeError:
      "Si è verificato un errore durante l'annullamento dell'iscrizione alle notifiche",
    permissionDenied:
      "Hai negato il permesso di inviare notifiche. Puoi cambiarlo nelle impostazioni del tuo browser.",
    subscribeSuccess: "Ti sei iscritto con successo alle notifiche",
    unsubscribeSuccess: "Ti sei disiscritto con successo dalle notifiche",

    permissionDialog: {
      title: "Permetti le notifiche push",
      message: "Vuoi ricevere le notifiche?",
      allow: "Permetti",
      later: "Più tardi",
      imageAlt: {
        chromium:
          "Finestra di dialogo del permesso di notifica nei browser basati su Chromium",
        firefox:
          "Finestra di dialogo del permesso di notifica nel browser Firefox",
        safari:
          "Finestra di dialogo del permesso di notifica nel browser Safari",
      },
      imageError: "Impossibile caricare l'immagine",
    },
  },
  routesNames: {
    [AvailableRouteNames.Contacts]: "Contatti",
    [AvailableRouteNames.Events]: "Eventi",
    [AvailableRouteNames.Catalog]: "Catalogo libri",
    [AvailableRouteNames.Theme]: "Tema",
    [AvailableRouteNames.ResetPassword]: "Reimposta password",
    [AvailableRouteNames.ForgotPassword]: "Password dimenticata",
    [AvailableRouteNames.ChangePassword]: "Cambia password",
    [AvailableRouteNames.RolesAndPermissions]: "Ruoli e autorizzazioni",
    [AvailableRouteNames.RegisterWithToken]: "Invitare",
    [AvailableRouteNames.Login]: "Login",
    [AvailableRouteNames.SalableBooks]: "Libri vendibili",
    [AvailableRouteNames.UsersManagement]: "Utenti e Movimenti",
    [AvailableRouteNames.MyBooks]: "I Miei Libri",
  } satisfies Record<AvailableRouteNames, string>,
  sidebar: {
    settings: "Impostazioni",
  },
};
