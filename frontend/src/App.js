import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";
import Header from "./components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ComparisonView from "./components/ComparisonView";
import IntervalView from "./components/IntervalView";
import WindowManager from "./components/WindowManager";


const VIEWS = {
  comparison: <ComparisonView title="Comparison" />,
  intervalA: <IntervalView title="Interval A" />,
  intervalB: <IntervalView title="Interval B" />
};

const App = () => (
  <>
    <Header />
    <div id="mosaic-frame">
      <Mosaic
        renderTile={(id, path) => (
          <div id={`${id}-mosaic`}>
            <MosaicWindow
              path={path}
              title={VIEWS[id].props.title}
              draggable={false}
              renderToolbar={(props) => {
                return (
                  <div className="mosaic-window-toolbar user-select-none">
                    <span className="mosaic-window-title">
                      {props.title}
                    </span>
                    <div className="close-button-container">
                      <FontAwesomeIcon
                        id={`${id}-close-icon`}
                        icon={faWindowClose}
                        onClick={() => {
                          WindowManager.close(id);
                        }}
                        className={"close-button fa"}
                      />
                    </div>
                  </div>
                );
              }}
            >
              {VIEWS[id]}
            </MosaicWindow>
          </div>
        )}
        initialValue={{
          direction: "row",
          splitPercentage: 25,
          first: "comparison",
          second: {
            direction: "row",
            first: "intervalA",
            second: "intervalB",
          },
        }}
      />
    </div>
  </>
);

export default App;
