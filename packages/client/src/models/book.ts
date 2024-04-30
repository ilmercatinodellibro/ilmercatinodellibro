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

export enum BooksTab {
  DELIVERED = "delivered",
  RESERVED = "reserved",
  REQUESTED = "requested",
  PURCHASED = "purchased",
}

interface Settings {
  maxBooksDimension: number;
  purchaseRate: number;
  reservationDays: number;
  saleRate: number;
}

export type SettingsUpdate =
  | {
      type: "save";
      settings: Settings;
    }
  | { type: "reset" };
