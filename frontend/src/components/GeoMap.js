import { useRef } from "react";
import { LeafletMap, Tooltip } from "@unovis/ts";
import { VisLeafletFlowMap, VisLeafletMap } from "@unovis/react";
import dayjs from "dayjs";
import { DefaultApi as Api } from "../client";
import { createRoot } from "react-dom/client";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// Severity-Farben in Ampelanordnung
const severityColors = ["#f00", "#ff0", "#0f0"];

// si < severityRanges[0]: low severity
// si <= severityRanges[1]: medium severity
// else: high severity
const severityRanges = [0.1, 0.7];

const severityColorMap = {
  h: { color: severityColors[0] },
  m: { color: severityColors[1] },
  l: { color: severityColors[2] },
};

const commonMapStyle = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
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
};

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

export default function GeoMap({ intervalViewId, filteredEvents }) {
  // Tooltip für Events
  const eventTooltip = new Tooltip({
    triggers: {
      [LeafletMap.selectors.point]: ({ isCluster, properties }) => {
        if (!isCluster)
          return `<small>
<b>Event #${properties.event_id}</b><br/>
Start time: ${dayjs.unix(properties.start_time).format("DD.MM.YYYY HH:mm")}<br/>
Length: ${properties.length}h<br/>
Position:
[${properties.meanLat.toFixed(3)},
${properties.meanLon.toFixed(3)}]<br>
Area: ${parseFloat(properties.area.toFixed(8))}<br>
SI: ${properties.severity_index}<br>
</small>`;
      },
    },
  });

  // Tooltip für Subevents
  const subEventTooltip = new Tooltip({
    triggers: {
      [LeafletMap.selectors.point]: ({ isCluster, properties }) => {
        if (!isCluster)
          return `<small>
<b>Hour ${properties.hour}</b>
<small>(${dayjs(properties.date).format("DD.MM.YYYY HH:mm")})</small><br>
Position:
[${properties.latitude.toFixed(3)},
${properties.longitude.toFixed(3)}]<br>
Event ID: ${properties.index}<br>
Area: ${parseFloat(properties.area.toFixed(8))}<br>
SI: ${properties.si}<br>
</small>`;
      },
    },
  });

  const createLegend = (referenceAreas, areaToRadiusConverter) => {
    const referenceRadii = referenceAreas.map(areaToRadiusConverter);
    const sampleDiameter = referenceRadii[0] * 2;

    const legendContainer = L.DomUtil.create("div", "legend leaflet-control");
    createRoot(legendContainer).render(
      <small className={"user-select-none"}>
        <b title="Severity index" style={{ cursor: "help" }}>
          SI
        </b>
        <div className={"mb-2"}>
          {referenceRadii.map((radius, i) => {
            return (
              <div key={i}>
                <div
                  className={"legendCircle d-inline-block border-0"}
                  style={{
                    width: sampleDiameter,
                    height: sampleDiameter,
                    backgroundColor: severityColors[i],
                  }}
                ></div>
                &nbsp;
                <span>
                  {i === 0
                    ? `> ${severityRanges[1]}`
                    : i === 1
                    ? `${severityRanges[0]} - ${severityRanges[1]}`
                    : `< ${severityRanges[0]}`}
                </span>
                <br />
              </div>
            );
          })}
        </div>

        <b>Area</b>
        <div
          className={"position-relative"}
          style={{
            height: 2 * referenceRadii.at(-1),
          }}
        >
          {referenceRadii.map((radius, i) => {
            const diameter = 2 * radius;
            return (
              <div className={"position-absolute bottom-0"} key={i}>
                <div>
                  <div
                    className={"legendCircle position-absolute"}
                    style={{
                      width: diameter,
                      height: diameter,
                      bottom: 0,
                      left: referenceRadii.at(-1) - radius,
                    }}
                  >
                    <small
                      className={"position-absolute"}
                      style={{
                        left: referenceRadii.at(-1) + radius + 3,
                        top: -3,
                      }}
                    >
                      {referenceAreas[i]}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </small>
    );

    return legendContainer;
  };

  const mapAreaToRadius = (area) => 6 * Math.sqrt(area);
  const flowMapAreaToRadius = (area) => 25 * Math.sqrt(area);

  let isDetailView = false;

  let ovMapBounds = {};
  let ovMapZoom = 10;

  let flowMapZoom;

  let goingBackToOverview = false;

  const overviewPoints = [];
  let detailData = {
    points: [],
    flows: [],
  };

  const mapRef = useRef(null);
  const flowMapRef = useRef(null);

  const fadeToOverview = () => {
    document.querySelector(
      ".overview-map.overview-map-" + intervalViewId
    ).style.opacity = "1";
    document.querySelector(
      ".overview-map.overview-map-" + intervalViewId
    ).style.visibility = "visible";

    document.querySelector(
      ".flow-map.flow-map-" + intervalViewId
    ).style.opacity = "0";
    document.querySelector(
      ".flow-map.flow-map-" + intervalViewId
    ).style.visibility = "hidden";

    isDetailView = false;
  };

  const handleBackToOverview = () => {
    if (flowMapZoom > ovMapZoom) {
      goingBackToOverview = true;
      flowMapRef.current?.component.zoomToPointById(0, false, 0);
    } else {
      fadeToOverview();
    }
  };

  // Overview Map initialised
  const onMapInit = () => {
    // Legend
    const referenceAreas = [1, 5, 10];
    document
      .querySelector(
        `.overview-map-${intervalViewId} .leaflet-bottom.leaflet-right`
      )
      ?.appendChild(createLegend(referenceAreas, mapAreaToRadius));
  };

  // FlowMap initialised
  const onFlowMapInit = () => {
    // Create "back" button
    const backButtonContainer = L.DomUtil.create("div", "leaflet-control");
    createRoot(backButtonContainer).render(
      <Button
        variant="light"
        size="sm"
        className={"rounded-0 border-secondary shadow-sm map-back-button"}
        title={"Back to Overview"}
        onClick={handleBackToOverview}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </Button>
    );
    document
      .querySelector(`.flow-map-${intervalViewId} .leaflet-top.leaflet-left`)
      ?.appendChild(backButtonContainer);

    // Legend
    const referenceAreas = [0.1, 0.5, 1];
    document
      .querySelector(
        `.flow-map-${intervalViewId}  .leaflet-bottom.leaflet-right`
      )
      .appendChild(createLegend(referenceAreas, flowMapAreaToRadius));
  };

  const ovMapEvents = {
    [LeafletMap.selectors.point]: {
      click: (d) => {
        if (!d.isCluster) {
          // Load clicked event into flowMap
          Api.detailDetailIdGet({
            id: d.id,
          }).then((event) => {
            detailData = {
              points: [],
              flows: [],
            };
            event.timeseries.forEach((subEvent, index) => {
              // Create data points
              detailData.points.push({
                hour: index,
                latitude: subEvent.latitude,
                longitude: subEvent.longitude,
                index: subEvent.index,
                area: subEvent.area,
                date: subEvent.date,
                si: subEvent.severity_index,
              });

              // Create flows between data points
              if (index > 0) {
                const prevSubEvent = event.timeseries[index - 1];
                detailData.flows.push({
                  sourceLatitude: prevSubEvent.latitude,
                  sourceLongitude: prevSubEvent.longitude,

                  targetLatitude: subEvent.latitude,
                  targetLongitude: subEvent.longitude,

                  distance: distance(
                    prevSubEvent.latitude,
                    prevSubEvent.longitude,
                    subEvent.latitude,
                    subEvent.longitude
                  ),
                });
              }
            });

            flowMapRef.current?.component.setData(detailData);
            flowMapRef.current?.component.zoomToPointById(
              0,
              true,
              Math.max(7, ovMapZoom)
            );
            mapRef.current?.component.zoomToPointById(d.id, true);
          });
        }
      },
    },
    [LeafletMap.selectors.background]: {
      click: () => {
        mapRef.current?.component.unselectPoint();
      },
    },
  };

  filteredEvents.forEach((event) => {
    const si = event.severity_index;
    overviewPoints.push({
      ...event,

      // count low, medium or high severity for clusters
      [si < severityRanges[0] ? "l" : si <= severityRanges[1] ? "m" : "h"]: 1,
    });
  });

  const leafletMap = (
    <VisLeafletMap
      ref={mapRef}
      className={
        "overview-map fadable position-absolute overview-map-" + intervalViewId
      }
      style={commonMapStyle}
      data={overviewPoints}
      pointId={(d) => {
        if (!d.cluster) {
          return d.event_id;
        }
      }}
      pointLatitude={(d) => d.meanLat}
      pointLongitude={(d) => d.meanLon}
      pointRadius={(d) => mapAreaToRadius(d.area)}
      colorMap={severityColorMap}
      clusterRadius={(d) =>
        10 +
        25 *
          Math.sqrt(
            ((d.l ?? 0) + (d.m ?? 0) + (d.h ?? 0)) / overviewPoints.length
          )
      }
      clusterRingWidth={5}
      clusteringDistance={85}
      clusterExpandOnClick={false}
      events={ovMapEvents}
      tooltip={eventTooltip}
      onMapMoveZoom={({ bounds, zoomLevel }) => {
        ovMapBounds = bounds;
        ovMapZoom = zoomLevel;
      }}
      onMapInitialized={onMapInit}
      width={"100%"}
      height={"60vh"}
    />
  );

  const leafletFlowMap = (
    <VisLeafletFlowMap
      ref={flowMapRef}
      className={"flow-map position-absolute flow-map-" + intervalViewId}
      style={commonMapStyle}
      tooltip={subEventTooltip}
      pointId={(d) => d.hour}
      pointRadius={(point) => flowMapAreaToRadius(point.area)}
      pointColor={(point) => {
        const si = point.si;
        switch (true) {
          case si < severityRanges[0]: // low severity
            return severityColors[2];
          case si <= severityRanges[1]: // medium severity
            return severityColors[1];
          default: // high severity
            return severityColors[0];
        }
      }}
      flowParticleRadius={1.5}
      flowParticleSpeed={(flow) => {
        return flow.distance / 11000;
      }}
      flowParticleDensity={(flow) => {
        return 300 / flow.distance;
      }}
      flowParticleColor="#111"
      data={{ points: [], flows: [] }}
      onMapMoveZoom={({ zoomLevel }) => {
        flowMapZoom = zoomLevel;
        if (!isDetailView) {
          if (zoomLevel >= ovMapZoom) {
            document.querySelector(
              ".overview-map-" + intervalViewId
            ).style.opacity = "0";
            document.querySelector(
              ".overview-map-" + intervalViewId
            ).style.visibility = "hidden";

            document.querySelector(
              ".flow-map-" + intervalViewId
            ).style.opacity = "1";
            document.querySelector(
              ".flow-map-" + intervalViewId
            ).style.visibility = "visible";
            isDetailView = true;
          }
        } else if (goingBackToOverview) {
          if (zoomLevel <= ovMapZoom) {
            fadeToOverview();
            goingBackToOverview = false;
          }
        }
      }}
      clusterExpandOnClick={true}
      flyToDuration={900}
      fitViewOnInit={false}
      onMapInitialized={onFlowMapInit}
      width={"100%"}
      height={"60vh"}
    />
  );

  return (
    <div className={"position-relative"}>
      {leafletFlowMap}
      {leafletMap}
    </div>
  );
}
