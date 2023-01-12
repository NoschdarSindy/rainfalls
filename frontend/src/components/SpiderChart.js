import { Component } from "react";
import Async from "react-async";
import ReactECharts from "echarts-for-react";
import { DefaultApi as Api } from "../client";

export default class SpiderChart extends Component {

  constructor(props) {
    super(props);

    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

    this.startA = new Date(this.props.startA).toLocaleDateString(this.props.locale || "en-GB", options);
    this.endA = new Date(this.props.endA).toLocaleDateString(this.props.locale || "en-GB", options);
    this.startB = new Date(this.props.startB).toLocaleDateString(this.props.locale || "en-GB", options);
    this.endB = new Date(this.props.endB).toLocaleDateString(this.props.locale || "en-GB", options);

    this.intervalA = `${this.startA} to ${this.endA}`;
    this.intervalB = `${this.startB} to ${this.endB}`
  }

  async fetchData() {
    return Api.statsStatsStartAEndAStartBEndBGet({
      startA: this.props.startA,
      endA: this.props.endA,
      startB: this.props.startB,
      endB: this.props.endB,
    });
  }

  getOption(data) {
    return ({
      legend: {
        data: [this.intervalA, this.intervalB],
        orient: "vertical", 
        top: "bottom",
        left: "center"
      },
      tooltip: {
        trigger: 'item'
      },
      radar: {
        shape: "circle",
        axisName: {
          padding: 10
        },
        indicator: [
          { name: "Severity Index", max: data.max.severity_index },
          { name: "Length", max: data.max.length },
          { name: "Area", max: data.max.area },
          { name: "Total Events", max: data.max.total_events },
          { name: "Events per Day", max: data.max.events_per_day }
        ]
      },
      series: [
        {
          name: "Interval Comparison",
          type: "radar",
          data: [
            {
              value: data.series.intervalA,
              name: this.intervalA,
              itemStyle: {
                color: "blue"
              },
              label: {
                show: true,
                color: "blue"
              }
            },
            {
              value: data.series.intervalB,
              name: this.intervalB,
              itemStyle: {
                color: "green"
              },
              label: {
                show: true,
                color: "green"
              }
            }
          ]
        }
      ]
    });
  }

  render() {
    return(
      <Async promiseFn={this.fetchData.bind(this)}>
        {({ data, error }) => {
          if (error) {
            return `Something went wrong loading global reference for ${this.props.field}: ${error.message}`;
          }

          if (data) {
            return (
              <div className="plot-view-child">
                <ReactECharts 
                  style={{
                    height: "400px",
                    width: "600px"
                  }}
                  option={this.getOption(data)} />
              </div>
            );
          }

          return null;
        }}
      </Async>
    )
  }
}