import { useRecoilState } from "recoil";
import { filtersAtom } from "../../recoil/atoms";
import { Chip } from "@mui/material";
import _, { LABELS, OPERATORS } from "../../util";
import update from "immutability-helper";
import dayjs from "dayjs";

export default function FilterChip(props) {
  const [filters, setFilters] = useRecoilState(filtersAtom);

  const field = props.field;
  const condition = props.condition;
  const conditionIndex = props.conditionIndex;

  const isOnlyCondition = () => filters[field].conditions.length === 1;

  const deleteChip = () =>
    setFilters(() =>
      update(
        filters,
        isOnlyCondition()
          ? { $unset: [field] }
          : {
              [field]: {
                conditions: { $splice: [[conditionIndex, 1]] },
              },
            }
      )
    );

  const getChipLabel = () => {
    let value = condition.value;
    if (field === _.START_TIME) value = dayjs(value).format("D.M.YYYY");
    return LABELS[field] + " " + OPERATORS[condition.operator] + " " + value;
  };

  return (
    <Chip
      label={getChipLabel()}
      onDelete={deleteChip}
      variant="outlined"
      className={"chip text-end"}
    />
  );
}
