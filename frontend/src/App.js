import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Header from "./components/Header";
import ComparisonView from "./components/ComparisonView";
import IntervalView from "./components/IntervalView";
import WindowManager from "./components/WindowManager";
import ButtonToggleHistogramTimeline from "./components/HistgramTimelineOverviewDetail";
import SelectTimeIntervalButton from "./components/selectedTimeIntervalButton";

const VIEWS = {
  comparison: <ComparisonView title="Comparison" />,
  intervalA: <IntervalView title="Interval A" id={0} />,
  intervalB: <IntervalView title="Interval B" id={1} />,
};

const App = () => (
  <>
    <Header />
    <SelectTimeIntervalButton />
    <ButtonToggleHistogramTimeline />
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
                  <div className="mosaic-window-toolbar-element mosaic-window-title">
                    {props.title}
                  </div>
                  <div className="mosaic-window-toolbar-element mosaic-controls-container">
                    <button
                      title={"Maximize Window"}
                      className="mosaic-default-control expand-button"
                      onClick={() => {
                        WindowManager.maximize(id);
                      }}
                    />
                    <button
                      title={"Close Window"}
                      className="mosaic-default-control close-button"
                      onClick={() => {
                        WindowManager.close(id);
                      }}
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
  </>
);

export default App;
