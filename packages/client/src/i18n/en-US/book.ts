export default {
  noResult: "No books found",
  fields: {
    isbn: "ISBN Code",
    author: "Author",
    title: "Title",
    publisher: "Publisher",
    subject: "Subject",
    coverPrice: "Cover Price",
    status: "Status",
    utility: "Utility",
    availability: "Availability",
    price: "Price",
  },
  addBook: "Add a book",
  addBookDialog: "Add Book",
  filter: "Filter",
  utility: {
    high: "High",
    medium: "Medium",
    low: "Low",
  },
  utilityTooltip: [
    "In warehouse: {warehouse}",
    "All books: {all}",
    "Sold books: {sold}",
    "Active requests: {requestsActive}",
    "Total requests: {requestsTotal}",
    "Utility index: {utilityIndex}",
  ].join("\n"),
  availability: {
    available: "Available",
    notAvailable: "Not Available",
    requested: "Requested",
  },
  filters: {
    options: ["Available", "High Utility", "Medium Utility", "Low Utility"],
    school: "Filter by School",
    schoolFilter: {
      fields: {
        school: "School",
        course: "Course",
        year: "Year",
      },
    },
  },
  deleteBookDialog: {
    title: "Delete copy from the Database",
    message:
      "You're permanently deleting this copy from the database and you will be losing all the data tied to it. Do you wish to proceed?",
  },

  code: "Code",
  originalCode: "Original Code",
  return: "Return",
  retrieveBooksDialog: {
    title: "Retrieve all the books in the list",
    message:
      "The books in the list will be added to the digital stock of Mercatino del Libro and the identifier code of the physical copy will be assigned to each of them. Do you wish to proceed?",
    retrieveBooksBtn: "Retrieve the books",
    tooltip:
      "Insert the books into the digital stock and print the label stickers with the identifier codes to put onto the physical copies.",
    retrieveAndPrint: "Retrieve books and print labels",
  },
  reservedBooksDialog: {
    options: {
      cart: "Put into Cart",
      reserved: "Mark as Reserved",
    },
  },
};
