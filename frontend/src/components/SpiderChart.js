import { useMemo, useState } from "react";
import Async from "react-async";
import ReactECharts from "echarts-for-react";
import { useRecoilValue } from "recoil";
import { filtersToQueryParamsState } from "../recoil/selectors";
import { filterModalVisibleAtom } from "../recoil/atoms";
import { DefaultApi as Api } from "../client";

export default function SpiderChart(props) {
  const filters = useRecoilValue(filtersToQueryParamsState);
  const filterModalVisible = useRecoilValue(filterModalVisibleAtom);
  const dateOptions = { year: "numeric", month: "2-digit", day: "2-digit" };

  const startDateA = new Date(props.startA).toLocaleDateString(
    "de-DE",
    dateOptions
  );
  const endDateA = new Date(props.endA).toLocaleDateString(
    "de-DE",
    dateOptions
  );
  const startDateB = new Date(props.startB).toLocaleDateString(
    "de-DE",
    dateOptions
  );
  const endDateB = new Date(props.endB).toLocaleDateString(
    "de-DE",
    dateOptions
  );

  const intervalA = `${startDateA} to ${endDateA}`;
  const intervalB = `${startDateB} to ${endDateB}`;

  const fetchData = () => {
    return Api.spiderSpiderGet({
      intervalA: `${props.startA}--${props.endA}`,
      intervalB: `${props.startB}--${props.endB}`,
    });
  };

  const makePlot = (data) => {
    console.log(data);
    return (
      <ReactECharts
        className={"spider-chart"}
        style={{
          height: "450px",
          width: "100%",
          background: "white",
        }}
        option={{
          legend: {
            data: [intervalA, intervalB],
            orient: "vertical",
            top: "top",
            left: "left",
          },
          tooltip: {
            show: true,
            trigger: "item",
          },
          radar: {
            shape: "circle",
            scale: true,
            radius: "60%",
            axisName: {
              padding: 10,
            },
            splitArea: {
              areaStyle: {
                color: ["rgba(0, 0, 0, 0.1)", "rgba(0, 0, 0, 0.2)"],
                shadowBlur: 10,
              },
            },
            indicator: [
              { name: "Severity Index", max: data.max.severity_index },
              { name: "Length", max: data.max.length },
              { name: "Events per day", max: data.max.events_per_day },
              { name: "Area", max: data.max.area },
            ],
          },
          series: [
            {
              name: "Interval Comparison",
              type: "radar",
              data: [
                {
                  value: data.series.intervalA,
                  name: intervalA,
                  itemStyle: {
                    color: "blue",
                  },
                  label: {
                    show: true,
                    color: "blue",
                    formatter: function (x) {
                      return x.value;
                    },
                  },
                },
                {
                  value: data.series.intervalB,
                  name: intervalB,
                  itemStyle: {
                    color: "green",
                  },
                  label: {
                    show: true,
                    color: "green",
                    formatter: function (x) {
                      return x.value;
                    },
                  },
                },
              ],
            },
          ],
        }}
      />
    );
  };

  const fetchDataAndMakePlot = () => {
    return useMemo(() => {
      if (!filterModalVisible)
        return (
          <Async promiseFn={fetchData}>
            <Async.Pending>
              <span className="plot-pending-message">Creating Plot...</span>
            </Async.Pending>
            <Async.Fulfilled>
              {(response) => makePlot(response)}
            </Async.Fulfilled>
          </Async>
        );
    }, [filters, filterModalVisible]);
  };

  return <div className="plot-view-child">{fetchDataAndMakePlot()}</div>;
}
