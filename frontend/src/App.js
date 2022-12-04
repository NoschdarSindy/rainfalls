import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";
import React from "react";
import { MosaicContext } from "react-mosaic-component";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";
import HelloWorld from "./components/HelloWorld";
import Header from "./components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ComparisonView from "./components/ComparisonView";
import IntervalView from "./components/IntervalView";

const VIEWS = {
  comparisonView: <ComparisonView title="Comparison" />,
  leftIntervalView: <IntervalView title="Interval A" />,
  rightIntervalView: <IntervalView title="Interval B" />,
};

const App = () => (
  <>
    <Header />
    <Mosaic
      renderTile={(id, path) => (
        <MosaicWindow
          path={path}
          title={VIEWS[id].props.title}
          draggable={false}
          renderToolbar={(props, draggable) => {
            return (
              <div className="mosaic-window-toolbar user-select-none">
                <span className="mosaic-window-title">
                  {VIEWS[id].props.title}
                </span>
                <div className="close-button-container">
                  <MosaicContext.Consumer>
                    {({ mosaicActions }) => (
                      <FontAwesomeIcon
                        icon={faWindowClose}
                        onClick={() => mosaicActions.remove(path)}
                        className={"close-button fa"}
                      />
                    )}
                  </MosaicContext.Consumer>
                </div>
              </div>
            );
          }}
        >
          {VIEWS[id]}
        </MosaicWindow>
      )}
      initialValue={{
        direction: "row",
        splitPercentage: 25,
        first: "comparisonView",
        second: {
          direction: "row",
          first: "leftIntervalView",
          second: "rightIntervalView",
        },
      }}
    />
  </>
);

export default App;
