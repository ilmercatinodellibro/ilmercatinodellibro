export const enum BookCopyStatuses {
  LOST = "lost",
  RETURNED = "returned",
  DONATED = "donated",
  INCOMPLETE = "incomplete",
  NOT_AVAILABLE = "not-available",
}

export const enum BookCopyFilters {
  RESERVED = "reserved",
  AVAILABLE = "available",
  SOLD = "sold",
  WITH_PROBLEM = "with-problem",
}

export type BookCopyStatus =
  | BookCopyStatuses
  | Exclude<BookCopyFilters, "with-problem" | "reserved">;

export interface SchoolFilters {
  schoolCodes: string[];
  courses: string[];
}

export const COURSE_YEARS = [1, 2, 3, 4, 5] as const;

export interface CourseDetails {
  year: (typeof COURSE_YEARS)[number];
  school: string;
  course: string;
}
