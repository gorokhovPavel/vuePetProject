export default class DrawStyles {
  static styleMapBoxDrawList() {
    return [
      //active points
      {
        id: "highlight-active-halo-points",
        filter: [
          "all",
          ["==", "$type", "Point"],
          ["==", "meta", "feature"],
          ["==", "active", "true"]
        ],
        type: "circle",
        paint: {
          "circle-radius": 9,
          "circle-color": "#ccc"
        }
      },
      {
        id: "highlight-active-points",
        filter: [
          "all",
          ["==", "$type", "Point"],
          ["==", "meta", "feature"],
          ["==", "active", "true"]
        ],
        type: "circle",
        paint: {
          "circle-radius": 4,
          "circle-color": "#0033fd"
        }
      },
      //default points
      {
        id: "points-are-halo-blue",
        filter: [
          "all",
          ["==", "$type", "Point"],
          ["==", "meta", "feature"],
          ["==", "active", "false"]
        ],
        type: "circle",
        paint: {
          "circle-radius": 9,
          "circle-color": "#00338d"
        }
      },
      {
        id: "points-are-blue",
        filter: [
          "all",
          ["==", "$type", "Point"],
          ["==", "meta", "feature"],
          ["==", "active", "false"]
        ],
        type: "circle",
        paint: {
          "circle-radius": 4,
          "circle-color": "#ccc"
        }
      },
      //points on active lines and polygons
      {
        id: "gl-draw-polygon-and-line-vertex-halo-active",
        type: "circle",
        filter: [
          "all",
          ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["==", "active", "true"]
        ],
        paint: {
          "circle-radius": 7,
          "circle-color": "#0033fd"
        }
      },
      {
        id: "gl-draw-polygon-and-line-vertex-active",
        type: "circle",
        filter: [
          "all",
          ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["==", "active", "true"]
        ],
        paint: {
          "circle-radius": 4,
          "circle-color": "#ccc"
        }
      },
      //points on default lines and polygons
      {
        id: "gl-draw-polygon-and-line-vertex-halo",
        type: "circle",
        filter: [
          "all",
          ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["==", "active", "false"]
        ],
        paint: {
          "circle-radius": 7,
          "circle-color": "#0033fd"
        }
      },
      {
        id: "gl-draw-polygon-and-line-vertex",
        type: "circle",
        filter: [
          "all",
          ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["==", "active", "false"]
        ],
        paint: {
          "circle-radius": 4,
          "circle-color": "#ccc"
        }
      },
      //active lines
      {
        id: "gl-draw-line-active",
        type: "line",
        filter: [
          "all",
          ["==", "$type", "LineString"],
          ["==", "active", "true"]
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": "#ccc",
          "line-dasharray": [0.2, 1.5],
          "line-width": 7
        }
      },
      //default Lines
      {
        id: "gl-draw-halo-line-static",
        type: "line",
        filter: [
          "all",
          ["==", "$type", "LineString"],
          ["==", "active", "false"]
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": "#ccc",
          "line-width": 8
        }
      },
      {
        id: "gl-draw-line-static",
        type: "line",
        filter: [
          "all",
          ["==", "$type", "LineString"],
          ["==", "active", "false"]
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": "#0033fd",
          "line-width": 1
        }
      },
      //active polygon fill
      {
        id: "gl-draw-polygon-fill",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
        paint: {
          "fill-color": "#ccc",
          "fill-outline-color": "#ccc",
          "fill-opacity": 0.4
        }
      },
      //default polygon fill
      {
        id: "gl-draw-polygon-fill-static",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
        paint: {
          "fill-color": "#0033fd",
          "fill-outline-color": "#0033fd",
          "fill-opacity": 0.1
        }
      },
      //active polygon line
      {
        id: "gl-draw-polygon-stroke",
        type: "line",
        filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": "#ccc",
          "line-dasharray": [0.4, 4],
          "line-width": 3
        }
      },
      //default polygon line
      {
        id: "gl-draw-halo-polygon-stroke-static",
        type: "line",
        filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": "#ccc",
          "line-width": 4
        }
      },
      {
        id: "gl-draw-polygon-stroke-static",
        type: "line",
        filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": "#0033fd",
          "line-width": 1
        }
      }
    ];
  }
}
