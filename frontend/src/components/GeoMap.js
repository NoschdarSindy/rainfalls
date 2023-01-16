import { useRecoilState, useRecoilValue } from "recoil";
import { DefaultApi as Api } from "../client";
import Async from "react-async";
import { VisLeafletFlowMap } from "@unovis/react";
import { LeafletMap, Tooltip } from "@unovis/ts";
import dayjs from "dayjs";
import { intervalViewAtoms } from "../recoil/atoms";

export default function GeoMap(props) {
  const [intervalView, setIntervalView] = useRecoilState(
    intervalViewAtoms(props.intervalViewId)
  );

  let state = {
    data: {
      points: [],
      flows: [],
    },
    zoom: undefined,
  };

  //Tooltip appears when hovering over a subevent
  const tooltip = new Tooltip({
    triggers: {
      [LeafletMap.selectors.point]: ({ isCluster, properties }) => {
        if (!isCluster)
          return `<small>
<b>Hour ${properties.hour}</b>
<small>(${dayjs(properties.date).format("DD.MM.YYYY HH:mm")})</small><br>
Position:
[${properties.latitude.toFixed(2)},
${properties.longitude.toFixed(2)}]<br>
Index: ${properties.index}<br>
Area: ${parseFloat(properties.area.toFixed(8))}<br>
SI: ${properties.si}<br>
</small>`;
      },
    },
  });

  //Calc distance between two points
  const distance = (lat1, lon1, lat2, lon2) => {
    const p = 0.017453292519943295; // Math.PI / 180
    const c = Math.cos;
    return (
      12742 *
      Math.asin(
        Math.sqrt(
          0.5 -
            c((lat2 - lat1) * p) / 2 +
            (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2
        )
      )
    );
  };

  async function loadData() {
    const event = await Api.detailDetailIdGet({
      id: intervalView.mapState.eventId,
    });
    event.timeseries.forEach((subEvent, index) => {
      // Create data points
      state.data.points.push({
        hour: index,
        latitude: subEvent.latitude,
        longitude: subEvent.longitude,
        index: subEvent.index,
        area: subEvent.area,
        date: subEvent.date,
        si: subEvent.severity_index,

        radius: Math.sqrt(subEvent.size) * 3,
      });

      // Create flows between data points
      if (index > 0) {
        let prevSubEvent = event.timeseries[index - 1];
        state.data.flows.push({
          sourceLatitude: prevSubEvent.latitude,
          sourceLongitude: prevSubEvent.longitude,

          targetLatitude: subEvent.latitude,
          targetLongitude: subEvent.longitude,
        });
      }
    });
  }

  return (
    <Async promiseFn={loadData}>
      <Async.Pending>Loading map...</Async.Pending>
      <Async.Fulfilled>
        {() => (
          <VisLeafletFlowMap
            tooltip={tooltip}
            style={{
              version: 8,
              glyphs:
                "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
              sources: {
                "gray-canvas": {
                  type: "raster",
                  tiles: [
                    "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
                  ],
                },
              },
              layers: [
                {
                  id: "base",
                  source: "gray-canvas",
                  type: "raster",
                },
              ],
            }}
            pointRadius={(point) => point.radius}
            pointColor={(point) => {
              const si = point.si;
              switch (true) {
                case si === 0: // no severity
                  return "#0f0";
                case si >= 0.7: // high severity
                  return "#f00";
                default: // medium severity
                  return "#ff0";
              }
            }}
            flowParticleRadius={1}
            flowParticleSpeed={(flow) => {
              const d = distance(
                flow.sourceLatitude,
                flow.sourceLongitude,
                flow.targetLatitude,
                flow.targetLongitude
              );
              return Math.sqrt(d) / 6000;
            }}
            flowParticleDensity={() => {
              return state.zoom * 5;
            }}
            flowParticleColor="#111"
            fitViewPadding={[-300, -300]}
            data={state.data}
            clusterExpandOnClick={true}
            onMapMoveZoom={({ zoomLevel }) => {
              state.zoom = zoomLevel;
            }}
          />
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
}
