export function capitalizeFirstLetter(text: string) {
  return text
    .split(" ")
    .map((word: string) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .split("(")
    .map((word: string) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("(")
    .split("+")
    .map((word: string) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("+");
}

export function formatPrice(price: string): string {
  return parseFloat(price).toFixed(2).toLocaleString() + " €";
}

export function formatISBN(isbnCode: string): string {
  return [
    isbnCode.slice(0, 3),
    isbnCode.slice(3, 5),
    isbnCode.slice(5, 10),
    isbnCode.slice(10, 12),
    isbnCode.slice(12, 13),
  ].join("-");
}
