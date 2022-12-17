import { useState } from "react";
import { CheckboxDropdown } from "./CheckboxDropdown";
import { Button, Col, Row } from "react-bootstrap";
import HelpModal from "./HelpModal";
import FilterModal from "./filter/FilterModal";

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
            <CheckboxDropdown items={state.items} />
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
      <FilterModal />
    </header>
  );
}
