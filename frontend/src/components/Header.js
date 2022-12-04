import { DefaultApi as Api } from "./../client/services/DefaultApi";
import Async from "react-async";
import React, { useState } from "react";
import { Example as ViewDropdown } from "./CheckboxDropdown";
import { Button, Col, Row } from "react-bootstrap";
import { Chip } from "@mui/material";
import HelpModal from "./HelpModal";

export default function Header() {
  const [state, setState] = useState({
    items: [
      { value: "comparison", label: "Comparison", isSelected: true },
      { value: "intervalA", label: "Interval A", isSelected: true },
      { value: "intervalB", label: "Interval B", isSelected: true },
    ],
  });

  return (
    <header className={"container m-0 p-1 mw-100"}>
      <Row className="pb-1">
        <Col>
          <h5>Temporal development of heavy rainfalls</h5>
        </Col>
        <Col className="text-end">
          <div className="d-inline text-start control btn-sm p-0 h-75">
            <ViewDropdown items={state.items} />
          </div>
          &nbsp;
          <Button variant="secondary btn-sm align-top" className="p-1">
            Save
          </Button>
          &nbsp;
          <Button variant="secondary btn-sm align-top">Restore</Button>
          &nbsp;
          <HelpModal />
        </Col>
      </Row>
      <Row className="border-top pt-1">
        <Col className="col-md-auto align-bottom">
          <Button variant="primary" className="btn-sm">
            Add filter
          </Button>
          &nbsp;
          <Chip
            label="Filter 1"
            variant="outlined"
            onDelete={() => {}}
            className={"chip"}
          />
          &nbsp;
          <Chip
            label="Filter 2"
            variant="outlined"
            onDelete={() => {}}
            className={"chip text-end"}
          />
        </Col>
        <Col className="text-end">123,456 results</Col>
      </Row>
    </header>
  );
}
