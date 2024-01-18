export default {
  noResult: "No books found",
  fields: {
    isbn: "ISBN Code",
    author: "Author",
    title: "Title",
    publisher: "Publisher",
    subject: "Subject",
    price: "Cover Price",
    status: "Status",
    utility: "Utility",
  },
  addBook: "Add a book",
  addBookDialog: "Add Book",
  filter: "Filter",
  utility: {
    high: "High",
    medium: "Medium",
    low: "Low",
  },
  availability: {
    available: "Available",
    notAvailable: "Not Available",
  },
  filters: {
    options: ["Available", "High Utility", "Medium Utility", "Low Utility"],
    school: "Filter by School",
    schoolFilter: {
      fields: {
        school: "School",
        address: "Address",
      },
    },
  },
  deleteBookDialog: {
    title: "Delete copy from the Database",
    message:
      "You're permanently deleting this copy from the database and you will be losing all the data tied to it. Do you wish to proceed?",
  },

  conditions: "Conditions",
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
    retrieveAndPrint: "Retrieve the books and print the label stickers", // TODO: Ask what is the best wording
  },
};
