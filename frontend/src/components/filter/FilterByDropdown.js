import ReactSelect from "react-select";
import { useRecoilState, useRecoilValue } from "recoil";
import { filterByDropdownItemsAtom } from "../../recoil/atoms";
import { filtersAtom } from "../../recoil/atoms";
import { CONSTRAINTS } from "../../util";

export default function FilterByDropdown() {
  const filterByDropdownItems = useRecoilValue(filterByDropdownItemsAtom);
  const [filters, setFilters] = useRecoilState(filtersAtom);

  function handleChange(selected) {
    setFilters((prevState) => ({
      ...prevState,
      [selected.field]: {
        ...selected,
        conditions: [CONSTRAINTS[selected.field].defaultCondition],
      },
    }));
  }

  const items = filterByDropdownItems.filter(
    (item) =>
      !Object.keys(filters)
        .map((field) => field)
        .includes(item.field)
  );

  return (
    <ReactSelect
      options={items}
      placeholder={"Filter by..."}
      onChange={handleChange}
      hideSelectedOptions={false}
      isClearable={false}
      isSearchable={false}
      controlShouldRenderValue={false}
      blurInputOnSelect={true}
      isOptionSelected={(o) => false}
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
