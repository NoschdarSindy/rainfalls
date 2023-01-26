import { useMemo, useState } from "react";
import ReactSelect, { components } from "react-select";
import Async from "react-async";
import Plot from "react-plotly.js";
import { useRecoilValue } from "recoil";
import { filtersToQueryParamsState } from "../recoil/selectors";
import { filterModalVisibleAtom } from "../recoil/atoms";
import { DefaultApi as Api } from "../client";

export default function OutlierScatter(props) {
  const filters = useRecoilValue(filtersToQueryParamsState);

  const items = [
    {
      value: "area",
      label: "Area",
      disabled: filters.includes("field=") && !filters.includes("field=area"),
    },
    {
      value: "length",
      label: "Length",
      disabled: filters.includes("field=") && !filters.includes("field=length"),
    },
    {
      value: "severity_index",
      label: "Severity Index",
      disabled:
        filters.includes("field=") && !filters.includes("field=severity_index"),
    },
  ];

  const enabledItems = items.filter((obj) => {
    return !obj.disabled;
  });

  const [state, setState] = useState({
    selected: enabledItems[0].value,
  });

  const fetchData = async () => {
    console.log(filters);
    console.log(props.interval);

    if (props.interval && props.interval.startDate && props.interval.endDate) {
      let filterParamsWithIntervalRange = filters;
      let startTimestamp = props.interval.startDate.toISOString();
      let endTimestamp = props.interval.endDate.toISOString();

      filterParamsWithIntervalRange += `&start_time__gte=${startTimestamp}`;
      filterParamsWithIntervalRange += `&start_time__lte=${endTimestamp}`;

      console.log(filterParamsWithIntervalRange);

      return await Api.overviewOverviewGet({
        filterParams: filterParamsWithIntervalRange,
      });
    } else {
      return await Api.overviewOverviewGet({ filterParams: filters });
    }
  };

  const makePlot = (data) => {
    return (
      <Plot
        data={[
          {
            x: data.stat[state.selected].map((obj) => obj.start_time),
            y: data.stat[state.selected].map((obj) => obj.mean),
            mode: "lines",
            type: "scatter",
            name: "mean",
          },
          {
            x: data.stat[state.selected].map((obj) => obj.start_time),
            y: data.stat[state.selected].map((obj) => obj.quantile),
            mode: "lines",
            type: "scatter",
            name: "99% quantile",
          },
          {
            x: data.outliers[state.selected].map((obj) => obj.start),
            y: data.outliers[state.selected].map((obj) => obj[state.selected]),
            mode: "markers",
            type: "scatter",
            name: "outliers (> 99.9%)",
          },
        ]}
        layout={{
          title: `Development of '${state.selected.replace("_", " ")}'`,
          width: 600,
          height: 400,
        }}
        config={{
          displaylogo: false,
          responsive: true,
        }}
      />
    );
  };

  const fetchDataAndMakePlot = () => {
    return useMemo(
      () => (
        <Async promiseFn={fetchData}>
          <Async.Pending>
            <span className="plot-pending-message">Creating Plot...</span>
          </Async.Pending>
          <Async.Fulfilled>{(response) => makePlot(response)}</Async.Fulfilled>
        </Async>
      ),
      [state, filters, useRecoilValue(filterModalVisibleAtom)]
    );
  };

  return (
    <div className="plot-view-child outlier-scatter">
      <ReactSelect
        className={"outlier-scatter-select"}
        options={enabledItems}
        onChange={(selected) => {
          setState({
            selected: selected.value,
          });
        }}
        value={enabledItems.find((obj) => obj.value === state.selected)}
        components={{
          Option: (props) => {
            return (
              <div>
                <components.Option {...props}>{props.label}</components.Option>
              </div>
            );
          },
        }}
      />
      {fetchDataAndMakePlot()}
    </div>
  );
}
