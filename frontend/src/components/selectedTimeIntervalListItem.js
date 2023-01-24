import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DateRangeIcon from "@mui/icons-material/DateRange";
import DeleteIcon from "@mui/icons-material/Delete";

import { useRecoilState } from "recoil";
import {
  intervalAtoms,
  intervalComparisonCandidateListAtom,
} from "../recoil/atoms";

export default function SelectedTimeIntervalListItem(props) {
  const [intervalList, setIntervalList] = useRecoilState(
    intervalComparisonCandidateListAtom
  );
  const [intervalA, setIntervalA] = useRecoilState(intervalAtoms(0));
  const [intervalB, setIntervalB] = useRecoilState(intervalAtoms(1));

  const localeOpts = { timeZone: "UTC" };
  const start = new Date(props.intervalRange.min).toLocaleString(
    "de-DE",
    localeOpts
  );
  const end = new Date(props.intervalRange.max).toLocaleString(
    "de-DE",
    localeOpts
  );

  const label = start + " - " + end;

  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  function addToInterval(index, interval, setInterval, override = false) {
    if (!override && (interval.startDate || interval.endDate)) {
      return false;
    }

    setInterval({
      startDate: new Date(intervalList[index].min),
      endDate: new Date(intervalList[index].max),
    });
    handleCloseModal();
    return true;
  }

  function handleDelete(index) {
    setIntervalList((oldIntervalList) => {
      let newList = [...oldIntervalList];
      newList.splice(index, 1);

      return newList;
    });
  }

  function handleInsert(index) {
    if (addToInterval(index, intervalA, setIntervalA)) {
      return;
    }

    if (addToInterval(index, intervalB, setIntervalB)) {
      return;
    }

    handleShowModal();
  }

  return (
    <>
      <ListItem
        secondaryAction={
          <IconButton
            onClick={() => handleDelete(props.intervalIndex)}
            edge="end"
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        }
      >
        <Tooltip
          title="Add to Interval View"
          onClick={() => handleInsert(props.intervalIndex)}
        >
          <ListItemAvatar>
            <DateRangeIcon color="primary" />
          </ListItemAvatar>
        </Tooltip>
        <ListItemText primary={label} secondary={props.intervalIndex} />
      </ListItem>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        className="select-interval-view-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Select an Interval View</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            The currently choosen interval in the selected view will be
            replaced.
          </div>
          <div className="select-interval-view">
            <Button
              variant="primary"
              onClick={() =>
                addToInterval(
                  props.intervalIndex,
                  intervalA,
                  setIntervalA,
                  true
                )
              }
            >
              Interval A
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                addToInterval(
                  props.intervalIndex,
                  intervalB,
                  setIntervalB,
                  true
                )
              }
            >
              Interval B
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
