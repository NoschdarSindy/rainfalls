import GeoMap from "./GeoMap";
import { memo } from "react";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import Table from "./Table";

function IntervalView(props) {
  const VIEWS = {
    top: <Table intervalViewId={props.id} />,
    bottom: <GeoMap intervalViewId={props.id} />,
  };

  return (
    <Mosaic
      className={"interval-mosaic"}
      renderTile={(id, path) => {
        return (
          <div id={`${id}-mosaic`}>
            <MosaicWindow
              path={path}
              draggable={false}
              renderToolbar={() => false}
            >
              {VIEWS[id]}
            </MosaicWindow>
          </div>
        );
      }}
      initialValue={{
        direction: "column",
        splitPercentage: 25,
        first: "top",
        second: "bottom",
      }}
    />
  );
}

export default memo(IntervalView, () => true);
