CREATE OR REPLACE VIEW "BookMeta" AS
SELECT
  book.id as book_id,

  (
    COUNT(DISTINCT book_copy.id) -
    COUNT(DISTINCT completed_sale.id) -
    COUNT(DISTINCT active_problem.id) -
    COUNT(DISTINCT reservation.id) FILTER (WHERE reservation.deleted_at IS NULL) -
    COUNT(DISTINCT cart_item.id)
  ) > 0
  AS is_available
FROM "Book" AS book
LEFT JOIN (
  -- If the book copy has been returned, we don't care about pending reservations, problems, etc
  -- for what it matters in relation to its availability
  (SELECT * FROM "BookCopy" WHERE returned_at IS NULL) AS book_copy
  -- Refunded sales shouldn't be considered to determine availability
  LEFT JOIN "Sale" AS completed_sale ON completed_sale.book_copy_id = book_copy.id AND completed_sale.refunded_at IS NULL
  -- Problems which has been resolved already shouldn't be considered to determine availability
  LEFT JOIN "Problem" AS active_problem ON active_problem.book_copy_id = book_copy.id AND active_problem.resolved_at IS NULL
) ON book_copy.book_id = book.id
-- Reservations with a connected sale shouldn't be considered to determine availability, even if the sale has been refunded
LEFT JOIN "Reservation" AS reservation ON reservation.book_id = book.id AND reservation.sale_id IS NULL
LEFT JOIN "CartItem" AS cart_item ON cart_item.book_id = book.id
GROUP BY book.id;
