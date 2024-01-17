export default {
  createUser: "Create new user",
  filter: "Filter",
  search: "Search",
  fields: {
    email: "Email",
    firstName: "First Name",
    lastName: "Last Name",
    phoneNumber: "Phone",
    inStock: "In Stock",
    sold: "Sold",
    booked: "Booked",
    purchased: "Purchased",
    available: "Available",
    creationDate: "Creation Date",
    receipts: "Receipts",
  },
  toolTips: {
    inStock:
      "The number of paper copies of one or more titles that the user has handed in and that are in stock at the moment",
    sold: "The number of paper copies of one or more titles that the user has already sold",
    booked:
      "The number of paper copies of one or more titles that the user has booked and not yet purchased",
    purchased:
      "The number of paper copies of one or more titles that the user has already purchased",
    available:
      "The number of titles currently available among those requested by the user",
  },
  payOff: "Pay off user",
  filters: ["With Available", "With Booked", "With Purchased", "With Sold"],
  editUser: {
    title: "Edit User Data",
    discount: "Apply ISEE/voluntary discount",
  },
  inRetrieval: "In retrieval",
  retrieved: "Retrieved and returnable",
  inStockDialog: {
    title: "Books of {0} {1} in Stock",
    retrievableTooltip:
      "Includes the copies that are still present in stock, not lost, not booked",
    retrieveBtn: "Retrieve all the books in the list",
    searchHint: "Insert an ISBN code to add the book to the list",
  },
  booksMovementsDialog: {
    purchasedTitle: "Books purchased by {0} {1}",
    soldTitle: "Books sold by {0} {1}",
    purchasedAt: "Purchased at",
    soldTo: "Sold to",
    theVendor: "The vendor",
    reportProblem: "Report problem",
    solveProblem: "Solve problem",
  },
  actions: "Actions",
  bookedBooksDialog: {
    title: "Books reserved by {0} {1}",
  },
};
