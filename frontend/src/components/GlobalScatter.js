import { Component } from "react";
import Async from "react-async";
import Plot from "react-plotly.js";
import { DefaultApi as Api } from "../client";

export default class GlobalScatter extends Component {
  async fetchData() {
    return Api.overviewOverviewFieldBinsGet({
      field: this.props.field || "area",
      bins: this.props.bins || 10,
    });
  }

  render() {
    return (
      <Async promiseFn={this.fetchData.bind(this)}>
        {({ data, error }) => {
          if (error) {
            return `Something went wrong loading global reference for ${this.props.field}: ${error.message}`;
          }

          if (data) {
            return (
              <div className="global-scatter-child">
                <Plot
                  data={[
                    {
                      x: data.stat.map((obj) => obj.start_time),
                      y: data.stat.map((obj) => obj.mean),
                      mode: "lines",
                      type: "scatter",
                      name: "mean",
                    },
                    {
                      x: data.stat.map((obj) => obj.start_time),
                      y: data.stat.map((obj) => obj.quantile),
                      mode: "lines",
                      type: "scatter",
                      name: "99% quantile",
                    },
                    {
                      x: data.outliers.map((obj) => obj.start),
                      y: data.outliers.map((obj) => obj.value),
                      mode: "markers",
                      type: "scatter",
                      name: "outliers (> 99.9%)",
                    },
                  ]}
                  layout={{
                    title: `Development of '${this.props.field.replace(
                      "_",
                      " "
                    )}'`,
                  }}
                />
              </div>
            );
          }

          return null;
        }}
      </Async>
    );
  }
}
