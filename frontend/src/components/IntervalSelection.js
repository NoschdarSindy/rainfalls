import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { DateRange } from "react-date-range";
import { de, enGB } from "react-date-range/dist/locale";
import { Chip } from "@mui/material";
import {
  intervalAtoms,
  intervalComparisonCandidateListAtom,
} from "../recoil/atoms";

export default function IntervalSelection(props) {
  const [interval, setInterval] = useRecoilState(
    intervalAtoms(props.intervalViewId)
  );

  const [show, setShow] = useState(false);
  const [intervalList, setIntervalList] = useRecoilState(
    intervalComparisonCandidateListAtom
  );

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const minDate = new Date("1979/01/01");
  const maxDate = new Date("2017/12/31");

  const onChange = (item) => {
    setInterval({
      startDate: item.range1.startDate,
      endDate: item.range1.endDate,
    });

    let intervalName = props.intervalViewId == 0 ? "Interval A" : "Interval B";

    setActiveOnInterval(
      intervalName,
      item.range1.startDate,
      item.range1.endDate
    );
  };

  function setActiveOnInterval(intervalName, startDate, endDate) {
    setIntervalList((oldIntervalList) => {
      let newList = [];

      for (let i = 0; i < oldIntervalList.length; i++) {
        let newItem = { ...oldIntervalList[i] };

        if (newItem.activeIntervalName == intervalName) {
          // The Date Picker component takes the local browser TZ offset into
          // consideration when creating the Date objects, so we end up with
          // GMT+1 Dates. Internally, Dates are represented as milliseconds since
          // epoch in UTC time. In the GMT+1 to UTC convervsion, we lose 1 hour,
          // that is the reason why I'm adding it back here

          // copy dates to not mess with the date picker ui elements
          let utcStart = new Date(startDate.getTime());
          let utcEnd = new Date(endDate.getTime());

          // since we have no control over hours and minutes in the date picker,
          // we set some sensible defaults
          utcStart.setHours(0);
          utcStart.setMinutes(0);
          utcEnd.setHours(23);
          utcEnd.setMinutes(59);

          // add 1 hour - will roll over properly to the next day if needed
          utcStart = utcStart.setTime(startDate.getTime() + 1 * 60 * 60 * 1000);
          utcEnd = utcEnd.setTime(utcEnd.getTime() + 1 * 60 * 60 * 1000);

          newItem.min = utcStart;
          newItem.max = utcEnd;

          // create a copy of the original interval range, so we don't lose it
          let oldItemCopy = { ...oldIntervalList[i] };
          oldItemCopy.activeIntervalName = undefined;
          newList.push(oldItemCopy);
        }

        newList.push(newItem);
      }

      return newList;
    });
  }

  const renderChip = () => {
    if (interval.startDate && interval.endDate) {
      return (
        <Chip
          label={getChipLabel()}
          onDelete={deleteChip}
          variant="outlined"
          className={"chip text-end"}
        />
      );
    }

    return;
  };

  const getChipLabel = () => {
    if (interval.startDate && interval.endDate) {
      const dateOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
      return `${new Date(interval.startDate).toLocaleDateString(
        "de-DE",
        dateOptions
      )} to ${new Date(interval.endDate).toLocaleDateString(
        "de-DE",
        dateOptions
      )}`;
    }

    return null;
  };

  const deleteChip = () => {
    setInterval({
      startDate: null,
      endDate: null,
    });
  };

  return (
    <>
      <Button
        onClick={handleShow}
        variant="primary btn-sm"
        className={"interval-picker-button"}
      >
        Adjust Interval
      </Button>

      <Button
        onClick={props.toggleScatterFunc}
        variant="primary btn-sm"
        aria-controls="scatterplot"
        aria-expanded={props.showScatter}
      >
        Toggle Scatterplot {props.showScatter ? "off" : "on"}
      </Button>

      {props.button}

      <Modal
        show={show}
        onHide={handleClose}
        dialogClassName="interval-picker-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Adjust Interval</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DateRange
            ranges={[
              {
                startDate: new Date(interval.startDate) || minDate,
                endDate: new Date(interval.endDate) || maxDate,
              },
            ]}
            onChange={onChange}
            locale={de}
            dateDisplayFormat={"dd.MM.yyyy"}
            startDatePlaceholder={"Begin"}
            endDatePlaceholder={"End"}
            minDate={minDate}
            maxDate={maxDate}
            months={2}
            editableDateInputs={true}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {renderChip()}
    </>
  );
}
