/* In the future we should be able to use
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
  but as of now the average targeted platform may cause compatibility issues */
export const formatPrice = (price: string | number): string =>
  `${parseFloat(price.toString()).toFixed(2).toString()} €`;
