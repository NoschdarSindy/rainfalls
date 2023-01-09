import { atom, atomFamily } from "recoil";
import _, { LABELS } from "../util";

export const filterByDropdownItemsAtom = atom({
  key: "filterByDropdownItems",
  default: [_.AREA, _.LENGTH, _.SEV_INDEX, _.START_TIME].map((field) => ({
    field: field,
    label: LABELS[field],
  })),
});

export const filtersAtom = atom({
  key: "filters",
  default:
    // Example
    {
      [_.LENGTH]: {
        label: "Length",
        conditions: [
          {
            operator: "lt",
            value: 123,
            enabled: true,
          },
          {
            operator: "neq",
            value: 1,
            enabled: false,
          },
        ],
      },
      [_.AREA]: {
        label: "Area",
        conditions: [
          {
            operator: "gt",
            value: 13,
            enabled: true,
          },
        ],
      },
    },
});

// Backs up the state of filters when opening the FilterModal,
// in order to restore it in case the user clicks Cancel
export const previousFiltersAtom = atom({
  key: "previousFilters",
  default: {},
});

export const intervalViewAtoms = atomFamily({
  key: "intervalView",
  default: (id) =>
    [
      // Linker IntervalView state
      {
        mapState: {
          eventId: 0,
          bounds: {},
        },
      },

      // Rechter IntervalView state
      {
        mapState: {
          eventId: 34,
          bounds: {},
        },
      },
    ][id],
});
