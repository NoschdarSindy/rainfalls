import { useMemo, useState } from "react";
import ReactSelect, { components } from "react-select";
import { Slider, Typography } from "@mui/material";
import Plot from "react-plotly.js";
import { useRecoilValue } from "recoil";
import { filtersToQueryParamsState } from "../recoil/selectors";
import * as Helper from "../helper/ArrayMath";

export default function OutlierScatter(props) {
  const filters = useRecoilValue(filtersToQueryParamsState);
  const events = props.filteredEvents;
  const maxBins = 40;
  const minBinEntries = 5;
  const defaultQuantile = 98.0;
  const defaultOutlier = 99.9;
  const [quantileValue, setQuantileValue] = useState(defaultQuantile);
  const [outlierLimit, setOutlierLimit] = useState(defaultOutlier);

  const handleQuantileChange = (event, value) => setQuantileValue(value);

  const handleOutlierChange = (event, value) => setOutlierLimit(value);

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

  const createChunks = (events, bins, entriesPerBin) => {
    if (events.length == 0) {
      return null;
    }

    if (events.length < bins * entriesPerBin) {
      if (events.length > entriesPerBin) {
        return createChunks(
          events,
          Math.floor(events.length / entriesPerBin),
          entriesPerBin
        );
      } else {
        return createChunks(events, events.length, 1);
      }
    }

    return Helper.chunks(events, bins);
  };

  const getLinearData = (data, func, func_params, probs = enabledItems) => {
    if (!data) {
      return null;
    }

    const result = {
      area: [],
      length: [],
      severity_index: [],
    };

    for (let i = 0; i < data.length; i++) {
      const date = new Date(
        data[i][Math.floor(data[i].length / 2)].start_time * 1000
      );
      probs.forEach((item) => {
        result[item.value].push({
          index: date,
          value: func(data[i], item.value, func_params),
        });
      });
    }

    return result;
  };

  const data = createChunks(events, maxBins, minBinEntries);
  const mean = getLinearData(data, Helper.mean);

  const makePlot = () => {
    if (!data) {
      return <div>No data loaded...</div>;
    }
    const quantile = getLinearData(data, Helper.quantile, quantileValue / 100, [
      { value: state.selected },
    ]);
    const outlier = Helper.outlier(events, state.selected, outlierLimit / 100);
    const outlier_index = [];
    outlier.forEach((entry) => {
      outlier_index.push(new Date(entry.start_time * 1000));
    });

    return (
      <Plot
        data={[
          {
            x: mean[state.selected].map((obj) => obj.index),
            y: mean[state.selected].map((obj) => obj.value),
            mode: "lines",
            type: "scatter",
            name: "mean",
          },
          {
            x: quantile[state.selected].map((obj) => obj.index),
            y: quantile[state.selected].map((obj) => obj.value),
            mode: "lines",
            type: "scatter",
            name: `${quantileValue}% quantile`,
          },
          {
            x: outlier_index,
            y: outlier.map((obj) => obj[state.selected]),
            mode: "markers",
            type: "scatter",
            name: `outliers (> ${outlierLimit}%)`,
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

  const makeSlider = (title, min, max, defaultValue, onChange) => {
    return (
      <>
        <Typography className={"slider-description"}>{title}</Typography>
        <Slider
          size={"small"}
          min={min}
          max={max}
          defaultValue={defaultValue}
          onChangeCommitted={onChange}
          valueLabelDisplay={"on"}
          valueLabelFormat={(value) => `${value}%`}
          step={0.1}
          marks={[
            { value: min, label: `${min}%` },
            { value: max, label: `${max}%` },
          ]}
        />
      </>
    );
  };

  return (
    <div className="plot-view-child outlier-scatter">
      <div className="outlier-scatter-config">
        <ReactSelect
          className={"outlier-scatter-select outlier-scatter-config-element"}
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
                  <components.Option {...props}>
                    {props.label}
                  </components.Option>
                </div>
              );
            },
          }}
        />
        <div className={"outlier-scatter-config-element slider-box"}>
          <div className={"slider-box-element"}>
            {makeSlider(
              "Quantile Line",
              80.0,
              100.0,
              defaultQuantile,
              handleQuantileChange
            )}
          </div>
          <div className={"slider-box-element"}>
            {makeSlider(
              "Outlier Threshold",
              95.0,
              100.0,
              defaultOutlier,
              handleOutlierChange
            )}
          </div>
        </div>
      </div>
      {useMemo(() => makePlot(), [events, state, quantileValue, outlierLimit])}
    </div>
  );
}
