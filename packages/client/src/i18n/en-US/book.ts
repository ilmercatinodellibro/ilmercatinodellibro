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
  returned: "Returned",
};
