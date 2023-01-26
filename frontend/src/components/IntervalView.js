import { memo, useCallback, useMemo, useRef, useState } from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";
import {
  filterModalVisibleAtom,
  filtersAtom,
  intervalAtoms,
} from "../recoil/atoms";
import {
  filteredEventsState,
  filtersToQueryParamsState,
} from "../recoil/selectors";
import Async from "react-async";
import Collapse from "react-bootstrap/Collapse";
import GeoMap from "./GeoMap";
import IntervalSelection from "./IntervalSelection";
import OutlierScatter from "./OutlierScatter";
import Table from "./Table";

function IntervalView(props) {
  const filters = useRecoilValue(filtersAtom);
  const filtersToQueryParams = useRecoilValue(filtersToQueryParamsState);
  const filterModalVisible = useRecoilValue(filterModalVisibleAtom);
  const interval = useRecoilValue(intervalAtoms(props.id));
  const mapComponentRef = useRef();

  const [showScatter, setShowScatter] = useState(false);

  function handleToggleScatter() {
    setShowScatter(!showScatter);
  }

  const loadFilteredEvents = useRecoilCallback(
    ({ snapshot }) => {
      return async () => {
        let data = await snapshot.getPromise(
          filteredEventsState({
            filterParams: filtersToQueryParams,
          })
        );

        if (interval.startDate) {
          data = data.filter(
            (entry) => entry.start_time >= interval.startDate.getTime() / 1000
          );
        }

        if (interval.endDate) {
          data = data.filter(
            (entry) => entry.start_time <= interval.endDate.getTime() / 1000
          );
        }

        return data;
      };
    },
    [filters, interval]
  );

  const loadData = useCallback(async () => {
    return await loadFilteredEvents();
  }, [filters, filterModalVisible, interval]);

  const rowClickCallback = (eventId) => {
    mapComponentRef.current?.overviewToDetail(eventId);
  };

  const tableAndMap = useMemo(() => {
    if (!filterModalVisible)
      return (
        <Async promiseFn={loadData}>
          <Async.Pending>
            Loading map...
            <hr />
            Loading table...
          </Async.Pending>
          <Async.Fulfilled>
            {(filteredEvents) => (
              <>
                <Collapse in={showScatter}>
                  <div id="scatterplot">
                    <OutlierScatter interval={interval} />
                  </div>
                </Collapse>
                <Collapse in={!showScatter}>
                  <div id="scatterplot">
                    <Table
                      intervalViewId={props.id}
                      filteredEvents={filteredEvents}
                      rowClickCallback={rowClickCallback}
                    />
                  </div>
                </Collapse>
                <hr />
                <GeoMap
                  ref={mapComponentRef}
                  intervalViewId={props.id}
                  filteredEvents={filteredEvents}
                />
              </>
            )}
          </Async.Fulfilled>
          <Async.Rejected>
            {(error) => {
              console.error(error);
              return "Failed to load map: " + error;
            }}
          </Async.Rejected>
        </Async>
      );
  }, [filters, filterModalVisible, interval, showScatter]);

  return (
    <div className={"interval-mosaic"}>
      <IntervalSelection
        intervalViewId={props.id}
        showScatter={showScatter}
        toggleScatterFunc={handleToggleScatter}
      />
      <hr />
      {tableAndMap}
    </div>
  );
}

export default memo(IntervalView, () => true);
