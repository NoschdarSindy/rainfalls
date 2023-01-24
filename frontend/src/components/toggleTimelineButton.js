import { Button } from "react-bootstrap";
import { useState } from "react";
import $ from "jquery";

export default function ToggleTimelineButton() {
  const [toggleTimeline, setToggleTimeline] = useState(true);

  function handleClick() {
    setToggleTimeline(!toggleTimeline);

    if (toggleTimeline) {
      $("#timeline-chart").css("display", "");
    } else {
      $("#timeline-chart").css("display", "none");
    }
  }

  return (
    <Button onClick={handleClick}>
      Toggle Timeline Chart {toggleTimeline ? "on" : "off"}
    </Button>
  );
}
