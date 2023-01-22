import React, { memo, useCallback, useMemo } from "react";
import GeoMap from "./GeoMap";
import { useRecoilCallback, useRecoilValue } from "recoil";
import { filterModalVisibleAtom, filtersAtom } from "../recoil/atoms";
import {
  filteredEventsState,
  filtersToQueryParamsState,
} from "../recoil/selectors";
import Async from "react-async";
import Table from "./Table";
import IntervalSelection from "./IntervalSelection";

function IntervalView(props) {
  const filters = useRecoilValue(filtersAtom);
  const filtersToQueryParams = useRecoilValue(filtersToQueryParamsState);
  const filterModalVisible = useRecoilValue(filterModalVisibleAtom);

  const loadFilteredEvents = useRecoilCallback(
    ({ snapshot }) => {
      return async () => {
        return await snapshot.getPromise(
          filteredEventsState({
            filterParams: filtersToQueryParams,
          })
        );
      };
    },
    [filters]
  );

  const loadData = useCallback(async () => {
    return await loadFilteredEvents();
  }, [filters, filterModalVisible]);

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
                <Table
                  intervalViewId={props.id}
                  filteredEvents={filteredEvents}
                />
                <hr />
                <GeoMap
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
  }, [filters, filterModalVisible]);

  return (
    <div className={"interval-mosaic"}>
      <IntervalSelection intervalViewId={props.id} />
      <hr />
      {tableAndMap}
    </div>
  );
}

export default memo(IntervalView, () => true);
