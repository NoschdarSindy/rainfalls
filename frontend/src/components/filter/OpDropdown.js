import ReactSelect from "react-select";
import { useRecoilState } from "recoil";
import { filtersAtom } from "../../recoil/atoms";
import update from "immutability-helper";
import { OPERATORS } from "../../util";

const options = Object.keys(OPERATORS).map((operator) => ({
  value: operator,
  label: OPERATORS[operator],
}));

export default function OpDropdown(props) {
  const [filters, setFilters] = useRecoilState(filtersAtom);
  const field = props.field;
  const conditionIndex = props.conditionIndex;

  const handleChange = (selected) => {
    setFilters(() =>
      update(filters, {
        [field]: {
          conditions: {
            [conditionIndex]: { operator: { $set: selected.value } },
          },
        },
      })
    );
  };

  return (
    <ReactSelect
      options={options}
      isSearchable={false}
      value={options.find(
        (o) => o.value === filters[field].conditions[conditionIndex].operator
      )}
      hideSelectedOptions={true}
      onChange={handleChange}
      styles={{
        control: (baseStyles, state) => ({
          ...baseStyles,
          padding: 0,
          width: "fit-content",
        }),
        menu: (provided, state) => ({
          ...provided,
          width: "fit-content",
        }),
      }}
    />
  );
}
