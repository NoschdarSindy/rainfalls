import { useMemo } from "react";
import Async from "react-async";
import ReactECharts from "echarts-for-react";
import { useRecoilValue } from "recoil";
import { filtersToQueryParamsState } from "../recoil/selectors";
import { filterModalVisibleAtom, intervalAtoms } from "../recoil/atoms";
import { DefaultApi as Api } from "../client";

export default function SpiderChart() {
  const filters = useRecoilValue(filtersToQueryParamsState);
  const filterModalVisible = useRecoilValue(filterModalVisibleAtom);
  const intervalA = useRecoilValue(intervalAtoms(0));
  const intervalB = useRecoilValue(intervalAtoms(1));

  const fetchData = async () => {
    let data = [];

    let globalReferenceRange = await Api.spiderSpiderGet({
      start: null,
      end: null,
      filterParams: filters,
    });

    data.push({
      ...globalReferenceRange,
      name: "Global Reference",
      color: "orange",
    });

    if (intervalA && intervalA.startDate && intervalA.endDate) {
      data.push({
        ...(await Api.spiderSpiderGet({
          start: intervalA.startDate.toISOString(),
          end: intervalA.endDate.toISOString(),
          filterParams: filters,
        })),
        name: "Interval A",
        color: "blue",
      });
    }

    if (intervalB && intervalB.startDate && intervalB.endDate) {
      data.push({
        ...(await Api.spiderSpiderGet({
          start: intervalB.startDate.toISOString(),
          end: intervalB.endDate.toISOString(),
          filterParams: filters,
        })),
        name: "Interval B",
        color: "green",
      });
    }

    return data;
  };

  const makePlot = (data) => {
    let names = [];
    let chartData = [];
    let maxValues = {
      severity_index: 0,
      length: 0,
      area: 0,
      events_per_day: 0,
    };

    for (let i = 0; i < data.length; i++) {
      names.push(data[i].name);

      maxValues.severity_index = Math.max(
        maxValues.severity_index,
        data[i].severity_index
      );

      maxValues["length"] = Math.max(maxValues["length"], data[i]["length"]);
      maxValues.area = Math.max(maxValues.area, data[i].area);
      maxValues.events_per_day = Math.max(
        maxValues.events_per_day,
        data[i].events_per_day
      );

      chartData.push({
        value: [
          data[i].severity_index,
          data[i]["length"],
          data[i].events_per_day,
          data[i].area,
        ],
        name: data[i].name,
        itemStyle: {
          color: data[i].color,
        },
        label: {
          show: true,
          color: data[i].color,
          formatter: function (x) {
            return x.value;
          },
        },
      });
    }

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
            data: names,
            orient: "vertical",
            top: "top",
            left: "left",
          },
          tooltip: {
            show: true,
            trigger: "item",
            valueFormatter: function (x) {
              return x;
            },
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
              { name: "Severity Index", max: maxValues.severity_index },
              { name: "Length", max: maxValues["length"] },
              { name: "Events per Day", max: maxValues.events_per_day },
              { name: "Area", max: maxValues.area },
            ],
          },
          series: [
            {
              name: "Interval Comparison",
              type: "radar",
              data: chartData,
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
    }, [filters, filterModalVisible, intervalA, intervalB]);
  };

  return <div className="plot-view-child">{fetchDataAndMakePlot()}</div>;
}
