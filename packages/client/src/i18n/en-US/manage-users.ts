import { ReceiptType } from "src/@generated/graphql";

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
    requested: "Requested",
    purchased: "Purchased",
    creationDate: "Creation Date",
    receipts: "Receipts",
    reserved: "Reserved",
    cart: "Cart",
  },
  tooltips: {
    inStock:
      "The number of paper copies of one or more titles that the user has handed in and that are in stock at the moment",
    sold: "The number of paper copies of one or more titles that the user has already sold",
    reserved:
      "The number of titles that the user has reserved and not yet purchased. The list also includes the Requested books and the Available ones",
    requested:
      "The number of paper copies of one or more titles that the user has requested and not yet purchased",
    purchased:
      "The number of paper copies of one or more titles that the user has already purchased",
    available:
      "The number of titles currently available among those requested by the user",
  },
  payOff: "Pay off user",
  payOffDisabled: "User payoffs are currently disabled.",
  filters: {
    withAvailable: "With Available",
    withRequested: "With Requested",
    withPurchased: "With Purchased",
    withSold: "With Sold",
  },
  editUser: {
    title: "Edit User Data",
    createUser: "Create a New User",
    discount: "Apply ISEE/volunteer discount",
    notes: "Notes",

    downloadData: "Download Data",
    downloadDataSuccess: "The account data will be downloaded shortly",
    downloadDataFailed:
      "Could not download the account data. Please contact the support.",
    deleteUser: "Delete User",
    deleteUserSuccess: "The user has been scheduled for deletion in 7 days",
    deleteUserFailed: "Could not delete the user",
    cancelUserDeletion: "Cancel User Deletion",
    cancelUserDeletionSuccess: "The user's deletion has been canceled",
    cancelUserDeletionFailed: "Could not cancel the user's deletion",
  },
  inRetrieval: "In retrieval",
  retrieved: "Retrieved",
  searchHint: "Insert an ISBN code to add the book to the list",
  inStockDialog: {
    title: "Books of {0} in Stock",
    retrievableTooltip:
      "Includes the copies that are still present in stock, lost or requested",
    retrieveBtn: "Retrieve all the books in the list",
    deleteBookBtnTooltip: "Delete permanently this copy from the database",
    errors: {
      noBook: "No book with the ISBN {0} was found",
      retrieval: "There was an error during the retrieval of the books",
    },
  },
  booksMovementsDialog: {
    purchasedTitle: "Books purchased by {0}",
    soldTitle: "Books sold by {0}",
    purchasedAt: "Purchased at",
    soldTo: "Sold to",
    purchasedBy: "Purchased by",
    reportProblem: "Report problem",
    solveProblem: "Solve problem",
    problemType: "Problem type",
    details: "Details",
    problemTypes: {
      LOST: "Lost",
      INCOMPLETE: "Incomplete",
      CUSTOM: "Custom",
    },
    howResolved: "How was the problem resolved?",
    problemsHistory: "Problems History",
    noProblems: "This copy hasn't had any problem yet",
    reportedBy: "Reported By",
    resolutionDate: "Resolution Date",
    solution: "Solution",
    resolvedBy: "Resolved By",
  },
  actions: "Actions",
  requestedBooksDialog: {
    title: "Books requested by {0}",
    titleNoName: "Requested books",
    deleteAll: "Delete All",
    moveIntoReserved: "Move Available into Reserved",
    moveIntoCart: "Move Available into Cart",
    booksRequested: "",
  },
  reservedBooksDialog: {
    title: "Books reserved by {0}",
    deleteAllReserved: "Delete all Reserved Books",
    moveAllIntoCart: "Put Reserved and Available Books into the Cart",
    reservedIntoCart: "Put Reserved Books into the Cart",
    requestStatus: "Request Status",
    confirmDialog: {
      title: "Delete all Reserved Books",
      message:
        'You are deleting all the the books that were reserved by this customer. The books will be marked as "Available". Do you wish to proceed?',
      confirmButton: "Delete All",
    },
    bookReserved: "Reserved {0}.",
    requestsReserved: "Reserved {0} copies of requested books.",
  },
  payOffUserDialog: {
    title: "Check Out User {0}",
    soldBooksCountLabel: "Total of the User's Books Sold to Others",
    totalPayOffLabel: "Total Money Settleable to the User",
    totalCheckedOutLabel: "Total Settled to the User",
    info: "Use the checkboxes of the rows to activate the bulk actions",
    buyPrice: "Acquisition price",
    buyPriceTooltip:
      "It's the price of the book agreed upon with the original owner of the book and corresponds to the amount that is guaranteed to them in case it's sold",
    publicPrice: "Public Price",
    publicPriceTooltip:
      "It's the price at which the books is sold by the Mercatino and corresponds to the acquisition price increased by the percentage withheld by the Mercatino",
    booksInStock: "Books in Stock",
    soldBooks: "Sold Books",
    returnedBooks: "Returned Books",
    returnOptions: {
      donate: "Donate to the Mercatino",
      return: "Return",
      reimburse: "Reimburse",
    },
    problemsError: "Could not report problems for all the copies.",
    returnAndDonate: "Return money and donate books",
    returnEverything: "Return money and books ({0} €)",
    confirms: {
      disclaimer:
        "You won't be able to cancel this action from the pay-off dialog. Do you wish to proceed?",
      donate: {
        title:
          "Donate book to Mercatino del Libro | Donate books to Mercatino del Libro",
        label:
          "You are donating this copy of the book to Mercatino del Libro. | You are donating these copies of the book(s) to Mercatino del Libro.",
        confirmLabel: "Donate book | Donate books",
      },
      reimburse: {
        title:
          "Reimburse book to the customer | Reimburse books to the customer",
        label:
          "You are repaying this copy of the book to its owner customer. | You are repaying these copies of the book(s) to their owner customer.",
        confirmLabel: "Reimburse book | Reimburse books",
      },
      returnAndDonate: {
        disclaimer:
          "The books in the list below will be donated by the customer to Mercatino del Libro. You will not be able to cancel this action. Do you wish to proceed?",
        tableTitle: "Books Donated to the Mercatino",
        buttonText: "Return money and donate books ({0} €)",
      },
      returnEverything: {
        title: "Return money and books",
        disclaimer:
          "The books in the list below will be returned to the customer as they are the legitimate owner. You will not be able to cancel this action. Do you wish to proceed?",
        tableTitle: "Books in return",
      },
      confirmError: "Could not finish the settlement of the selected customer.",
    },
  },
  goToCart: "Go to the cart",
  returnBookTitle: "Return the Book",
  returnBook: "Return Book",
  moneyToGive: "Money to return to the Customer",
  iseeInfoTooltip:
    "Is this user entitled to the discount and does the total to be returned take it into account?",
  cartDialog: {
    title: "Cart of {0}",
    emptyCart: "Empty the cart",
    autoEmptyDisclaimer:
      "Remember: you cannot keep the available books stuck in the cart for too long, therefore it will automatically be emptied in: {0}",
    sellBooks: "Sell books ({0})",
    totalBooks: "Total books to sell",
    discount: "ISEE/voluntary discount",
    total: "Total",
    empty: {
      title: "Empty the cart?",
      message:
        "Do you really wish to empty the cart of the current user and return their books among the lists of the reserved and requested books?",
      emptyCart: "Empty cart",
    },
    confirm: {
      title: "Sell books?",
      message:
        "Confirm the sale of the books inside the cart for a total of {0}?",
      sell: "Sell",
    },
  },
  receiptsDialog: {
    title: "Receipts",
    createdBy: "Created by",
    resend: "Send again",
    downloadSuccess: "The receipt download will begin shortly",
    resendSuccess:
      "A new copy of the receipt of {type} has been sent to the user's email address",
    type: {
      PURCHASE: "Purchase | Purchases",
      WITHDRAWAL: "Withdrawal | Withdrawals",
    } satisfies Record<ReceiptType, string>,
    noRegistration: "There are no withdrawal receipts",
    noPurchase: "There are no purchase receipts",
  },
};
