import constants from "./client/_constants.json";

// Define rules for and behaviour of input elements here
export const CONSTRAINTS = {
  [constants.AREA]: {
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    step: 0.01,
    defaultCondition: { operator: "gte", value: 0, enabled: true },
  },
  [constants.LENGTH]: {
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    step: 1,
    defaultCondition: { operator: "gte", value: 0, enabled: true },
  },
  [constants.SEV_INDEX]: {
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    step: 0.01,
    defaultCondition: { operator: "gte", value: 0, enabled: true },
  },

  // Date picker
  [constants.START_TIME]: {
    defaultCondition: {
      operator: "gte",
      value: 283993200000, // (Mon, 01 Jan 1979 00:00:00 => timestamp in milliseconds)
      enabled: true,
    },
  },
};

export const LABELS = {
  [constants.AREA]: "Area",
  [constants.LENGTH]: "Length",
  [constants.SEV_INDEX]: "Severity index",
  [constants.START_TIME]: "Start date",
};

// Operators and their display values
export const OPERATORS = {
  gte: "≥",
  gt: ">",
  lte: "≤",
  lt: "<",
  eq: "=",
  neq: "≠",
};

export default constants;
