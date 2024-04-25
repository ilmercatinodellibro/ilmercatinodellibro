export default {
  noResult: "Nessun libro trovato",
  fields: {
    isbn: "Codice ISBN",
    author: "Autore",
    title: "Titolo",
    publisher: "Editore",
    subject: "Materia",
    coverPrice: "Prezzo di Copertina",
    status: "Stato",
    utility: "Utilità",
    availability: "Disponibilità",
    price: "Prezzo",
  },
  addBook: "Aggiungi un libro",
  addBookDialog: "Aggiungi Libro",
  filter: "Filtra",
  utility: {
    high: "Alta",
    medium: "Media",
    low: "Bassa",
  },
  utilityTooltip: [
    "In magazzino: {warehouse}",
    "Tutti i libri: {all}",
    "Libri venduti: {sold}",
    "Richieste attive: {requestsActive}",
    "Richieste totali: {requestsTotal}",
    "Indice di utilità stimata: {utilityIndex}",
  ].join("\n"),
  availability: {
    available: "Disponibile",
    notAvailable: "Non Disponibile",
    requested: "Richiesto",
    reserved: "Prenotato",
  },
  filters: {
    options: ["Disponibili", "Utilità Alta", "Utilità Media", "Utilità Bassa"],
    school: "Filtra per Scuola",
    schoolFilter: {
      fields: {
        school: "Scuola",
        course: "Indirizzo",
        year: "Anno",
      },
    },
  },
  deleteBookDialog: {
    title: "Elimina copia dal database",
    message:
      "Stai eliminando definitivamente questa copia dal database e perderai tutti i dati ad essa connessi. Vuoi procedere?",
  },

  code: "Codice",
  originalCode: "Codice Originale",
  return: "Reso",
  retrieveBooksDialog: {
    title: "Ritira tutti i libri nella lista",
    message:
      "I libri nella lista saranno aggiunti al magazzino digitale del Mercatino del Libro e verrà assegnato a ciascuno di loro il codice identificativo della copia cartacea. Vuoi procedere?",
    retrieveBooksBtn: "Ritira i libri",
    tooltip:
      "Inserisci i libri nel magazzino digitale e stampa le etichette con i codici identificativi da apporre sulle copie cartacee.",
    retrieveAndPrint: "Ritira i libri e stampa etichette",
  },
  reservedBooksDialog: {
    options: {
      cart: "Metti nel Carrello",
      reserved: "Segna come Prenotato",
    },
  },
};
