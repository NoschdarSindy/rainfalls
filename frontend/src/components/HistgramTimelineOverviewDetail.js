import Async from "react-async";
import { useMemo, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  filtersAtom,
  filterModalVisibleAtom,
  intervalRangeAtom,
} from "../recoil/atoms";
import { filtersToQueryParamsState } from "../recoil/selectors";
import { DefaultApi as Api } from "../client";
import Highcharts from "highcharts";
import Highstock from "highcharts/highstock";
import Exporting from "highcharts/modules/exporting";
import drilldown from "highcharts/modules/drilldown";
import HighchartsReact from "highcharts-react-official";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";

Exporting(Highcharts);
drilldown(Highcharts);

export default function ButtonToggleHistogramTimeline() {
  // Load user defined query filters from stored state
  const queryFiltersAsParams = useRecoilValue(filtersToQueryParamsState);

  const filters = useRecoilValue(filtersAtom);

  const filterModalVisible = useRecoilValue(filterModalVisibleAtom);

  const setIntervalRange = useSetRecoilState(intervalRangeAtom);

  const [showTimeline, setShowTimeline] = useState(false);

  let range = {};

  const histOptions = useMemo(
    () => ({
      chart: {
        type: "column",
        events: {
          drilldown: function (event) {
            let [year, month] = event.seriesOptions.name.split("-");

            if (month && !isNaN(month) && !isNaN(year)) {
              range = {
                start: Date.UTC(year, month - 1, 1),
                end: Date.UTC(
                  year,
                  month - 1,
                  getLastDayOfMonth(year, month),
                  23,
                  59
                ),
              };
            } else if (!isNaN(year)) {
              range = {
                start: Date.UTC(year, 0, 1),
                end: Date.UTC(year, 11, 31, 23, 59),
              };
            } else {
              range = {};
            }

            updateTimelineRange();
          },

          drillup: function (event) {
            let [year, month] = event.seriesOptions.name.split("-");

            if (month && !isNaN(month) && !isNaN(year)) {
              range = {
                start: Date.UTC(year, month - 1, 1),
                end: Date.UTC(
                  year,
                  month - 1,
                  getLastDayOfMonth(year, month),
                  23,
                  59
                ),
              };
            } else if (!isNaN(year)) {
              range = {
                start: Date.UTC(year, 0, 1),
                end: Date.UTC(year, 11, 31, 23, 59),
              };
            } else {
              range = {};
            }
            updateTimelineRange();
          },
        },
      },
      title: {
        align: "left",
        text: "Overview over Heavy Rain events, grouped by year",
      },
      accessibility: {
        announceNewData: {
          enabled: true,
        },
      },
      xAxis: {
        type: "category",
      },
      yAxis: {
        title: {
          text: "Number of events",
        },
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: "{point.y}",
          },
          // point: { events: { click: (event) => console.log(event) } },
        },
      },

      tooltip: {
        enabled: false,
        // headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        // pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>',
      },

      series: [
        {
          name: "Heavy Rain Events Overview",
          colorByPoint: false,
          data: [], // added in fetchDataAndMakePlot
        },
      ],
      drilldown: {
        breadcrumbs: {
          position: {
            align: "right",
          },
        },
        series: [], // added in fetchDataAndMakePlot
      },
    }),
    []
  );

  function getLastDayOfMonth(year, month) {
    // backend sends months as 1-12, JS Date uses 0-11, so we would do
    // month - 1 to convert to JS style, then (month - 1) + 1 to get the next month
    return new Date(year, month, 0).getDate();
  }

  function getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);

    return date.toLocaleString("en-US", { month: "long" });
  }

  function concatYearMonth(year, month) {
    return [String(year), "-", String(month)].join("");
  }

  async function histFetchDataAndMakePlot() {
    const response = await Api.overviewHistogramOverviewHistogramGet({
      filterParams: queryFiltersAsParams,
    });

    let plotData = [];
    let drilldownData = [];

    for (const [yearNumber, monthDict] of Object.entries(response)) {
      let yearCount = 0;
      let monthDrilldowns = [];

      for (const [monthNumber, dayDict] of Object.entries(monthDict)) {
        let monthCount = Object.values(dayDict).reduce((a, b) => a + b, 0);

        monthDrilldowns.push({
          name: getMonthName(monthNumber),
          drilldown: concatYearMonth(yearNumber, monthNumber),
          y: monthCount,
        });

        drilldownData.push({
          id: concatYearMonth(yearNumber, monthNumber),
          name: concatYearMonth(yearNumber, monthNumber),
          data: Object.entries(dayDict),
        });

        yearCount += monthCount;
      }

      let yearData = { name: yearNumber, drilldown: yearNumber, y: yearCount };
      let yearDrilldown = {
        name: yearNumber,
        id: yearNumber,
        data: monthDrilldowns,
      };

      plotData.push(yearData);
      drilldownData.push(yearDrilldown);
    }

    histOptions.series[0].data = plotData;
    histOptions.drilldown.series = drilldownData;
  }

  const timelineOptions = useMemo(
    () => ({
      rangeSelector: {
        selected: 5,
        inputDateFormat: "%d.%m.%Y %H:%M",
        inputEditDateFormat: "%%d.%m.%Y %H:%M",
      },
      xAxis: {
        events: {
          setExtremes: (event) => {
            let intervalRange = { min: event.min, max: event.max };
            setIntervalRange(() => intervalRange);
          },
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
          // point: { events: { click: (event) => console.log(event) } },
        },
      },

      tooltip: {
        valueDecimals: 2,
        split: true,
      },
      legend: {
        enabled: true,
        layout: "vertical",
        align: "right",
        verticalAlign: "top",
        floating: true,
      },

      //multiSeriesData will be added to this object later on
    }),
    []
  );

  async function timelineFetchDataAndMakePlot() {
    const response = await Api.queryQueryGet({
      filterParams: queryFiltersAsParams,
    });

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

      //update options to add the data
      timelineOptions.series = multiSeriesData;
    }
  }

  function afterChartCreationCallback(chart) {
    setIntervalRange({ min: chart.xAxis[0].min, max: chart.xAxis[0].max });
    updateTimelineRange();
  }

  function updateTimelineRange() {
    const chart = timelineChart.current?.chart;

    // the if-statement only continues if the timeline is done rendering
    if (chart) {
      chart.xAxis[0].setExtremes(range.start, range.end);
    }
  }

  const timelineChart = useRef(null);

  return (
    <>
      {useMemo(() => {
        if (!filterModalVisible)
          return (
            <div>
              <Async promiseFn={histFetchDataAndMakePlot}>
                <Async.Pending>Creating Plot...</Async.Pending>
                <Async.Fulfilled>
                  {() => (
                    <div id="histogram-chart">
                      <HighchartsReact
                        highcharts={Highcharts}
                        options={histOptions}
                        constructorType={"chart"}
                      />
                    </div>
                  )}
                </Async.Fulfilled>
              </Async>
            </div>
          );
      }, [filters, filterModalVisible])}

      <Button
        className={"timeline-button"}
        onClick={() => setShowTimeline(!showTimeline)}
      >
        {showTimeline ? "Hide" : "Show"} Timeline
      </Button>
      <Collapse in={showTimeline}>
        <div>
          {useMemo(() => {
            if (!filterModalVisible)
              return (
                <Async promiseFn={timelineFetchDataAndMakePlot}>
                  <Async.Pending>Creating Plot...</Async.Pending>
                  <Async.Fulfilled>
                    {() => (
                      <>
                        <HighchartsReact
                          highcharts={Highstock}
                          ref={timelineChart}
                          options={timelineOptions}
                          constructorType={"stockChart"}
                          callback={afterChartCreationCallback}
                        />
                      </>
                    )}
                  </Async.Fulfilled>
                </Async>
              );
          }, [filters, filterModalVisible])}
        </div>
      </Collapse>
    </>
  );
}
