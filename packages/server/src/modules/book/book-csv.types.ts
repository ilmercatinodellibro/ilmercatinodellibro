export type IngestedCsvRow = [
  school_code: string,
  course_year: string,
  section_year: string,
  school_grade_type: string,
  combination: string,
  subject: string,
  isbn_code: string,
  authors: string,
  title: string,
  subtitle: string,
  volume: string,
  publisher: string,
  price: string,
  new_adoption: string,
  to_buy: string,
  advised: string,
];

export type ParsedCsvRow = [
  isbn_code: string,
  subject: string,
  authors_full_name: string,
  title: string,
  original_price: string,
  publisher_name: string,
  retail_location_id: string,
];
