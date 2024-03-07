CREATE OR REPLACE VIEW "BookMeta" AS
SELECT
  book.id as book_id,

  (
    COUNT(book_copy.id) FILTER (WHERE book_copy.returned_at IS NULL) -
    COUNT(completed_sale.id) -
    COUNT(active_problem.id) -
    COUNT(reservation.id) FILTER (WHERE reservation.deleted_at IS NULL) -
    COUNT(cart_item.id)
  ) > 0
  AS is_available
FROM "Book" AS book
LEFT JOIN (
  "BookCopy" AS book_copy
  LEFT JOIN "Sale" AS completed_sale ON completed_sale.book_copy_id = book_copy.id AND completed_sale.refunded_at IS NULL
  LEFT JOIN "Problem" AS active_problem ON active_problem.book_copy_id = book_copy.id AND active_problem.resolved_at IS NULL
) ON book_copy.book_id = book.id
LEFT JOIN "Reservation" AS reservation ON reservation.book_id = book.id
LEFT JOIN "CartItem" AS cart_item ON cart_item.book_id = book.id
GROUP BY book.id;
