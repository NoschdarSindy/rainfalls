import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { DateRange } from "react-date-range";
import { de } from "react-date-range/dist/locale";
import { Chip } from "@mui/material";
import { intervalViewAtoms } from "../recoil/atoms";


export default function IntervalSelection(props) {
  const [intervalView, setIntervalView] = useRecoilState(
    intervalViewAtoms(props.intervalViewId)
  );

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const minDate = new Date("1979/01/01");
  const maxDate = new Date("2017/12/31");

  const onChange = (item) => {
    setIntervalView({
      mapState: intervalView.mapState,
      interval: {
        startDate: item.range1.startDate,
        endDate: item.range1.endDate
      }
    });
  }

  const renderChip = () => {
    if (intervalView.interval.startDate && intervalView.interval.endDate) {
      return (<Chip
        label={getChipLabel()}
        onDelete={deleteChip}
        variant="outlined"
        className={"chip text-end"}
      />);
    }

    return;
  }

  const getChipLabel = () => {
    if (intervalView.interval.startDate && intervalView.interval.endDate) {
      const dateOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
      return `${intervalView.interval.startDate.toLocaleDateString("de-DE", dateOptions)} to ${intervalView.interval.endDate.toLocaleDateString("de-DE", dateOptions)}`;
    }

    return null;
  }

  const deleteChip = () => {
    setIntervalView({
      mapState: intervalView.mapState,
      interval: {
        startDate: null,
        endDate: null
      }
    });
  }

  return (
    <>
      <Button
        onClick={handleShow}
        variant="primary btn-sm"
        className={"interval-picker-button"}
      >
        Select Interval
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        dialogClassName="interval-picker-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Interval</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DateRange
            ranges={[{
              startDate: intervalView.interval.startDate || minDate,
              endDate: intervalView.interval.endDate || maxDate,
            }]}
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
            Cancel
          </Button>
          <Button variant="primary" onClick={handleClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {renderChip()}
    </>
  );
}
