import { Col } from "react-bootstrap";
import { Switch } from "@mui/material";
import ListItem from "@mui/material/ListItem";
import OpDropdown from "./OpDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import _, { CONSTRAINTS } from "../../util";
import { useRecoilState } from "recoil";
import { filtersAtom } from "../../recoil/atoms";
import update from "immutability-helper";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import "dayjs/locale/de";
import TextField from "@mui/material/TextField";

export default function Condition(props) {
  const conditionIndex = props.conditionIndex;

  const [filters, setFilters] = useRecoilState(filtersAtom);
  const field = props.field;
  const constraints = CONSTRAINTS[field];
  const getCondition = () => filters[field].conditions[conditionIndex];

  const addCondition = () =>
    setFilters(() =>
      update(filters, {
        [field]: {
          conditions: {
            $push: [constraints.defaultCondition],
          },
        },
      })
    );

  const toggleConditionEnabled = (e) => {
    setFilters(() =>
      update(filters, {
        [field]: {
          conditions: {
            [conditionIndex]: { enabled: { $set: !getCondition().enabled } },
          },
        },
      })
    );
  };

  const deleteCondition = () =>
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

  const isBottomCondition = () =>
    filters[field].conditions.length - 1 === conditionIndex;

  const isOnlyCondition = () => filters[field].conditions.length === 1;

  const handleDatePick = (dayJsObj) => {
    if (dayJsObj.isValid()) {
      setFilters(() =>
        update(filters, {
          [field]: {
            conditions: {
              [conditionIndex]: { value: { $set: dayJsObj } },
            },
          },
        })
      );
    }
  };

  function renderInputElement() {
    if (field === _.START_TIME)
      return (
        <DateTimePicker
          className={"date-picker"}
          value={getCondition().value}
          onChange={handleDatePick}
          key={`${field}.${conditionIndex}.date`}
          inputFormat={"DD.MM.YYYY HH:mm"}
          ampm={false}
          ampmInClock={false}
          renderInput={(params) => (
            <TextField
              {...params}
              inputProps={{
                ...params.inputProps,
                placeholder: undefined,
              }}
            />
          )}
        />
      );
    return (
      <input
        type="number"
        value={getCondition().value}
        className={"form-control"}
        min={constraints.min}
        max={constraints.max}
        pattern="\d+([.,]\d*)?(e[+-]?\d+)?" // allow numbers, including floating point numbers
        step={constraints.step}
        required
        onChange={handleValueChange}
        key={`${field}.${conditionIndex}.input`}
      />
    );
  }

  const handleValueChange = (e) => {
    setFilters(() =>
      update(filters, {
        [field]: {
          conditions: { [conditionIndex]: { value: { $set: e.target.value } } },
        },
      })
    );
  };

  return (
    <>
      <ListItem
        sx={{ width: "fit-content" }}
        key={`${field}.${conditionIndex}.li`}
      >
        <Col xs={1.5}>
          {
            <OpDropdown
              field={field}
              conditionIndex={conditionIndex}
              key={`${field}.${conditionIndex}.op`}
            />
          }
        </Col>
        &nbsp;
        <Col
          className={
            "filter-input-container " +
            (field === _.START_TIME ? "date-picker-container" : "")
          }
        >
          {renderInputElement()}
        </Col>
        <Col xs={4} className={"user-select-none"}>
          <Switch
            checked={getCondition().enabled}
            key={`${field}.${conditionIndex}.switch`}
            onClick={toggleConditionEnabled}
          ></Switch>
          &nbsp;
          <FontAwesomeIcon
            icon={faTrashCan}
            color={"gray"}
            title="Delete condition"
            onClick={deleteCondition}
          />
          &emsp;
          <FontAwesomeIcon
            icon={faPlusCircle}
            color={"gray"}
            title="Add condition below"
            onClick={addCondition}
            className={isBottomCondition() ? "" : "invisible"}
          />
        </Col>
      </ListItem>
    </>
  );
}
