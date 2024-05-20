import { BookQueryFilter } from "src/@generated/graphql";
import { RetailLocationSettingsFragment } from "src/services/retail-location.graphql";

export const enum BookCopyStatuses {
  LOST = "lost",
  RETURNED = "returned",
  DONATED = "donated",
  INCOMPLETE = "incomplete",
  NOT_AVAILABLE = "not-available",
}

enum BookUtilityCategory {
  LOW_UTILITY,
  MEDIUM_UTILITY,
  HIGH_UTILITY,
}

export type UtilityCategory = keyof typeof BookUtilityCategory;

export type BookCompleteFilters = keyof Omit<BookQueryFilter, "search">;
/*| UtilityCategory*/

export interface SchoolFilters {
  selectedSchoolCodes: string[];
  selectedSchoolCourseIds: string[];
}

export const COURSE_YEARS = [1, 2, 3, 4, 5] as const;

export interface CourseDetails {
  year: (typeof COURSE_YEARS)[number];
  school: string;
  course: string;
}

export interface TableFilters {
  filters: string[];
  searchQuery: string;
  schoolFilters?: SchoolFilters;
}

export enum BooksTab {
  DELIVERED = "delivered",
  RESERVED = "reserved",
  REQUESTED = "requested",
  PURCHASED = "purchased",
}

export type SettingsUpdate =
  | {
      type: "save";
      settings: RetailLocationSettingsFragment;
    }
  | { type: "reset" };
