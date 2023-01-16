import GeoMap from "./GeoMap";
import { memo } from "react";
import Table from "./Table";

function IntervalView(props) {
  return (
    <div className={"interval-mosaic"}>
      Ich bin ein IntervalView
      <hr />
      <Table intervalViewId={props.id} />
      <hr />
      <GeoMap intervalViewId={props.id} />
    </div>
  );
}

export default memo(IntervalView, () => true);
