import GeoMap from "./GeoMap";
import { memo } from "react";
import Table from "./Table";
import IntervalSelection from "./IntervalSelection";

function IntervalView(props) {
  return (
    <div className={"interval-mosaic"}>
      <IntervalSelection intervalViewId={props.id} />
      <hr />
      <Table intervalViewId={props.id} />
      <hr />
      <GeoMap intervalViewId={props.id} />
    </div>
  );
}

export default memo(IntervalView, () => true);
