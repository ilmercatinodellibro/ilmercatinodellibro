CREATE OR REPLACE VIEW "BookMeta" AS
SELECT
  book_id,

  (copies_count - sales_count - problems_count - reservations_count - cart_items_count) > 0 AS is_available,
  (copies_count - sales_count - problems_count - reservations_count - cart_items_count) as available_count,

  copies_count,
  problems_count,
  sales_count,
  reservations_count,
  cart_items_count
FROM (
  SELECT
    book.id as book_id,

    COUNT(DISTINCT book_copy.id) as copies_count,
    COUNT(DISTINCT active_problem.id) as problems_count,
    COUNT(DISTINCT completed_sale.id) as sales_count,
    COUNT(DISTINCT reservation.id) FILTER (WHERE reservation.deleted_at IS NULL) as reservations_count,
    COUNT(DISTINCT cart_item.id) as cart_items_count
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
  GROUP BY book.id
);
