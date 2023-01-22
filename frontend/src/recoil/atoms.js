import { atom, atomFamily } from "recoil";
import _, { LABELS } from "../util";

export const filterModalVisibleAtom = atom({
  key: "filterModalVisible",
  default: false,
});

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
      [_.SEV_INDEX]: {
        label: "Severity index",
        conditions: [
          {
            operator: "gt",
            value: 0,
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

// Track the min and max timestamp of the current interval defined in GlobalTimeline
export const intervalRangeAtom = atom({
  key: "intervalRange",
  default: {
    min: 0,
    max: 0,
  },
});

// Track the min and max timestamp of the current interval defined in GlobalTimeline
export const intervalComparisonCandidateListAtom = atom({
  key: "intervalComparisonCandidateList",
  default: [],
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
        interval: {
          startDate: null,
          endDate: null
        }
      },

      // Rechter IntervalView state
      {
        mapState: {
          eventId: 34,
          bounds: {},
        },
        interval: {
          startDate: null,
          endDate: null
        }
      },
    ][id],
});
