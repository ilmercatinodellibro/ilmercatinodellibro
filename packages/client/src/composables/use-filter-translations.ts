import { QSelectOption } from "quasar";
import { useI18nOutsideSetup } from "src/boot/i18n";
import { AvailableBookFilters } from "src/models/book";
import { AvailableManageUserFilterOptions } from "src/models/user";

export enum AvailableFilterPaths {
  Warehouse = "warehouse.filters",
  Book = "book.filters.options",
  ManageUsers = "manageUsers.filters",
}

export enum AvailableWarehouseFilterOptions {
  IsAvailable = "isAvailable",
  IsSold = "isSold",
  HasProblems = "hasProblems",
}

// This type is required to have type inference to the values of the following object
type MapOfAllFilterOptionsValuesType =
  | AvailableWarehouseFilterOptions[]
  | AvailableBookFilters[]
  | AvailableManageUserFilterOptions[];

// This obj allows us to retrieve the filter options of every page while supporting type inference
const MapOfAllFilterOptions = Object.freeze({
  [AvailableFilterPaths.Warehouse]: Object.values(
    AvailableWarehouseFilterOptions,
  ),
  [AvailableFilterPaths.Book]: Object.values(AvailableBookFilters),
  [AvailableFilterPaths.ManageUsers]: Object.values(
    AvailableManageUserFilterOptions,
  ),
} satisfies Record<AvailableFilterPaths, MapOfAllFilterOptionsValuesType>);

const { t } = useI18nOutsideSetup();

export function useTranslatedFilters<T extends MapOfAllFilterOptionsValuesType>(
  filterPath: AvailableFilterPaths,
) {
  // The cast is required so we can keep the type of the enum
  const optionValues = MapOfAllFilterOptions[filterPath] as T;

  const options = optionValues.map((optionValue) => ({
    value: optionValue,
    label: t(`${filterPath}.${optionValue}`),
  })) satisfies QSelectOption[];

  return { options };
}
