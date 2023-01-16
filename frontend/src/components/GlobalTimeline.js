import Async from "react-async";
import Highcharts from "highcharts/highstock";
import Exporting from "highcharts/modules/exporting";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { filtersToQueryParamsState } from "../recoil/selectors";
import {
  filterModalVisibleAtom,
  filtersAtom,
  intervalRangeAtom,
} from "../recoil/atoms";
import { DefaultApi as Api } from "../client";
import { useMemo } from "react";

Exporting(Highcharts);

export default function GlobalTimeline() {
  // Load user defined query filters from stored state
  const queryFiltersAsParams = useRecoilValue(filtersToQueryParamsState);

  // Store current interval min and max timestamp in state
  const setIntervalRange = useSetRecoilState(intervalRangeAtom);

  const filterModalVisible = useRecoilValue(filterModalVisibleAtom);
  const filters = useRecoilValue(filtersAtom);

  function saveIntervalRangeToState(event) {
    let intervalRange = { min: event.min, max: event.max };
    setIntervalRange(() => intervalRange);
  }

  function fetchData() {
    return Api.queryQueryGet({ filterParams: queryFiltersAsParams });
  }

  function afterChartCreationCallback(createdChart) {
    // Put any functionality here that should happen after the chart is (re-) rendered
    //
    // console.log(createdChart.rangeSelector);
  }

  function makePlot(response) {
    // sort results by start time (posix timestamp in ms)
    let results = response.results.sort((a, b) => a.start_time - b.start_time);
    let numResults = results.length;

    let multiSeriesData = [
      { name: "severity_index", data: new Array(numResults) },
      { name: "length", data: new Array(numResults) },
      { name: "area", data: new Array(numResults) },
    ];

    for (let i = 0; i < numResults; i++) {
      let startTimeMilliseconds = results[i].start_time * 1000;

      multiSeriesData[0].data[i] = [
        startTimeMilliseconds,
        results[i].severity_index,
      ];
      multiSeriesData[1].data[i] = [startTimeMilliseconds, results[i].length];
      multiSeriesData[2].data[i] = [startTimeMilliseconds, results[i].area];
    }

    Highcharts.stockChart(
      "container",
      {
        rangeSelector: {
          selected: 5,
          inputDateFormat: "%d.%m.%Y %H:%M",
          inputEditDateFormat: "%%d.%m.%Y %H:%M",
        },
        xAxis: {
          events: {
            setExtremes: saveIntervalRangeToState,
          },
        },
        yAxis: {
          labels: {
            formatter: function () {},
          },
          plotLines: [
            {
              value: 0,
              width: 2,
              color: "silver",
            },
          ],
        },

        plotOptions: {
          series: {
            showInNavigator: true,
            point: { events: { click: (event) => console.log(event) } },
          },
        },

        tooltip: {
          valueDecimals: 2,
          split: true,
        },

        series: multiSeriesData,
      },
      (createdChart) => {
        afterChartCreationCallback(createdChart);
      }
    ); // return chart instance);
  }

  function fetchDataAndMakePlot() {
    return useMemo(() => {
      if (!filterModalVisible)
        return (
          <Async promiseFn={fetchData}>
            <Async.Pending>Creating Plot...</Async.Pending>
            <Async.Fulfilled>
              {(response) => makePlot(response)}
            </Async.Fulfilled>
          </Async>
        );
    }, [filterModalVisible, filters]);
  }

  return (
    <figure className="highcharts-figure">
      <div id="container"></div>
      {fetchDataAndMakePlot()}
    </figure>
  );
}
