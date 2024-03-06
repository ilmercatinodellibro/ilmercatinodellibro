import { parse, transform } from "csv";

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

export type IngestedStateSchoolRow = [
  school_year: string,
  geographical_area: string,
  region: string,
  province: string,
  reference_institute_code: string,
  reference_institute_denomination: string,
  school_code: string,
  school_denomination: string,
  school_address: string,
  school_postal_code: string,
  school_municipality_code: string,
  municipality_description: string,
  school_features_description: string,
  description_typology_school_instruction_grade: string,
  directors_indication_venue: string, // This name makes no sense if we check its content
  all_encompassing_directors_indication_venue: string,
  school_email_address: string,
  school_pec_address: string,
  school_website: string,
  school_venue: string,
];

export type IngestedEquivalentSchoolRow = [
  school_year: string,
  geographical_area: string,
  region: string,
  province: string,
  school_code: string,
  school_denomination: string,
  school_address: string,
  school_postal_code: string,
  school_municipality_code: string,
  municipality_description: string,
  description_typology_instruction_grade: string,
  school_email_address: string,
  school_pec_address: string,
  school_website: string,
];

export interface SchoolCsvConfiguration {
  sourceFileName: string;
  csvParser: ReturnType<typeof parse>;
  csvTransformer: ReturnType<typeof transform>;
  removeDestination?: boolean;
}
