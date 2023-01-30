import { useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Button, Col, Row } from "react-bootstrap";
import { CheckboxDropdown } from "./CheckboxDropdown";
import HelpModal from "./HelpModal";
import FilterModal from "./filter/FilterModal";
import * as atoms from "../recoil/atoms";

export default function Header() {
  const [state, setState] = useState({
    items: [
      { value: "comparison", label: "Comparison", isSelected: true },
      { value: "intervalA", label: "Interval A", isSelected: true },
      { value: "intervalB", label: "Interval B", isSelected: true },
    ],
  });

  const recoilAtoms = [];

  for (const key of Object.keys(atoms)) {
    const obj = atoms[key];

    if (typeof obj == "object") {
      recoilAtoms.push({
        key: key,
        state: useRecoilValue(obj),
        set: useSetRecoilState(obj),
      });
    } else if (typeof obj == "function") {
      for (let i = 0; i < 2; i++) {
        recoilAtoms.push({
          key: key,
          index: i,
          state: useRecoilValue(obj(i)),
          set: useSetRecoilState(obj(i)),
        });
      }
    }
  }

  const restoreFile = useRef(null);

  const handleRestoreFileInput = () => {
    restoreFile.current?.click();
  };

  const handleRestoreFileUpload = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      restoreData(JSON.parse(e.target.result));
    };
  };

  const restoreData = (data) => {
    for (let i = 0; i < data.length; i++) {
      recoilAtoms[i].set(data[i].state);
    }
  };

  const exportData = (data) => {
    const fileData = JSON.stringify(data);
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = `${new Date().toISOString().slice(0, -5)}-export.json`;
    link.href = url;
    link.click();
  };

  const handleExport = () => {
    exportData(recoilAtoms);
  };

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
          <Button
            variant="secondary btn-sm align-top"
            className="p-1"
            onClick={handleExport}
          >
            Save
          </Button>
          &nbsp;
          <input
            type="file"
            className="d-none"
            ref={restoreFile}
            onChange={handleRestoreFileUpload}
          />
          <Button
            variant="secondary btn-sm align-top"
            onClick={handleRestoreFileInput}
          >
            Restore
          </Button>
          &nbsp;
          <HelpModal />
        </Col>
      </Row>
      <FilterModal />
    </header>
  );
}
