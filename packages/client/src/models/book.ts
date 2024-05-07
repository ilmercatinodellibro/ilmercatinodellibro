import {
  BookQueryFilter,
  UpdateRetailLocationSettingsInput,
} from "src/@generated/graphql";
import { RetailLocationFragment } from "src/services/retail-location.graphql";

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
  schoolCodes: string[];
  courses: string[];
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

export type SettingsUpdateInput = Omit<
  UpdateRetailLocationSettingsInput,
  "retailLocationId"
>;

export type Settings = Pick<RetailLocationFragment, "buyRate" | "sellRate"> &
  SettingsUpdateInput;

export type SettingsUpdate =
  | {
      type: "save";
      settings: SettingsUpdateInput;
    }
  | { type: "reset" };
