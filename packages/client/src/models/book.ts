export const enum BookCopyFilters {
  RESERVED = "reserved",
  AVAILABLE = "available",
  SOLD = "sold",
  WITH_PROBLEM = "with-problem",
}

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
