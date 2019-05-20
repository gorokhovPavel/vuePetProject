export default class DrawStyles {

    static styleMapBoxDrawList() {
        
        return [

            //active points
            {
                'id' : 'highlight-active-halo-points',
                'filter' : ['all',
                    [ '==', '$type', 'Point' ],
                    [ '==', 'meta', 'feature'],
                    [ '==', 'active', 'true']
                ],
                'type' : 'circle',
                'paint' : {
                    'circle-radius': 9,
                    'circle-color': '#fff'
                }
            },

            {
                'id' : 'highlight-active-points',
                'filter' : ['all',
                    [ '==', '$type', 'Point' ],
                    [ '==', 'meta', 'feature'],
                    [ '==', 'active', 'true']
                ],
                'type' : 'circle',
                'paint' : {
                    'circle-radius': 4,
                    'circle-color': '#0033fd'
                }
            },

            //default points
            {
                'id': 'points-are-halo-blue',
                'filter': ['all',
                  ['==', '$type', 'Point'],
                  ['==', 'meta', 'feature'],
                  ['==', 'active', 'false']
                ],
                'type': 'circle',
                'paint': {
                  'circle-radius': 9,
                  'circle-color': '#00338d'
                }
            },

            {
                'id': 'points-are-blue',
                'filter': ['all',
                  ['==', '$type', 'Point'],
                  ['==', 'meta', 'feature'],
                  ['==', 'active', 'false']
                ],
                'type': 'circle',
                'paint': {
                  'circle-radius': 4,
                  'circle-color': '#fff'
                }
            },

            //points on active lines and polygons
            {
                'id': 'gl-draw-polygon-and-line-vertex-halo-active',
                'type': 'circle',
                'filter': ['all', 
                    ['==', 'meta', 'vertex'], 
                    ['==', '$type', 'Point'], 
                    ['==', 'active', 'true']
                ],
                'paint': {
                    'circle-radius' : 5,
                    'circle-color'  : '#0033fd'
                }
            },
            
            {
                'id': 'gl-draw-polygon-and-line-vertex-active',
                'type': 'circle',
                'filter': ['all', 
                    ['==', 'meta', 'vertex'], 
                    ['==', '$type', 'Point'], 
                    ['==', 'active', 'true']
                ],
                'paint': {
                    'circle-radius' : 2,
                    'circle-color'  : '#fff',
                }
            },

            //points on default lines and polygons
            {
                'id': 'gl-draw-polygon-and-line-vertex-halo',
                'type': 'circle',
                'filter': ['all', 
                    ['==', 'meta', 'vertex'], 
                    ['==', '$type', 'Point'], 
                    ['==', 'active', 'false']
                ],
                'paint': {
                    'circle-radius' : 5,
                    'circle-color'  : '#0033fd'
                }
            },
            
            {
                'id': 'gl-draw-polygon-and-line-vertex',
                'type': 'circle',
                'filter': ['all', 
                    ['==', 'meta', 'vertex'], 
                    ['==', '$type', 'Point'], 
                    ['==', 'active', 'false']
                ],
                'paint': {
                    'circle-radius' : 2,
                    'circle-color'  : '#fff',
                }
            },

            //active lines
            {
                'id': 'gl-draw-line-active',
                'type': 'line',
                'filter': ['all', 
                    ['==', '$type',  'LineString'], 
                    ['==', 'active', 'true' ]
                ],
                'layout': {
                  'line-cap': 'round',
                  'line-join': 'round'
                },
                'paint': {
                  'line-color': '#fff',
                  'line-dasharray': [0.2, 2],
                  'line-width': 3
                }
            },

            //default Lines
            {
                'id': 'gl-draw-halo-line-static',
                'type': 'line',
                'filter': ['all', 
                    ['==', '$type',  'LineString'],  
                    ['==', 'active', 'false']
                ],
                'layout': {
                  'line-cap': 'round',
                  'line-join': 'round'
                },
                'paint': {
                  'line-color': '#fff',
                  'line-width': 4
                }
            },

            {
                'id': 'gl-draw-line-static',
                'type': 'line',
                'filter': ['all', 
                    ['==', '$type',  'LineString'], 
                    ['==', 'active', 'false']
                ],
                'layout': {
                  'line-cap': 'round',
                  'line-join': 'round'
                },
                'paint': {
                  'line-color': '#0033fd',
                  'line-width': 1
                }
            },

            //active polygon fill
            {
                'id': 'gl-draw-polygon-fill',
                'type': 'fill',
                'filter': ['all', 
                    ['==', '$type', 'Polygon'], 
                    ['==', 'active', 'false']
                ],
                'paint': {
                    'fill-color': '#fff',
                    'fill-outline-color': '#fff',
                    'fill-opacity': 0.2
                }
            },
            
            //default polygon fill
            {
                'id': 'gl-draw-polygon-fill-static',
                'type': 'fill',
                'filter': ['all', 
                    ['==', '$type', 'Polygon'], 
                    ['==', 'active', 'true']
                ],
                'paint': {
                    'fill-color': '#0033fd',
                    'fill-outline-color': '#0033fd',
                    'fill-opacity': 0.1
                }
            },

            //active polygon line
            {
                'id' : 'gl-draw-polygon-stroke',
                'type': 'line',
                'filter': ['all', 
                    ['==', '$type', 'Polygon'], 
                    ['==', 'active', 'true']
                ],
                'layout' : {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                'paint' : {
                    'line-color'     : '#fff',
                    'line-dasharray' : [0.2, 2],
                    'line-width'     : 3
                }
            },

            //default polygon line
            {
                'id': 'gl-draw-halo-polygon-stroke-static',
                'type': 'line',
                'filter': ['all', 
                    ['==', '$type', 'Polygon'], 
                    ['==', 'active', 'false']
                ],
                'layout': {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                'paint': {
                    'line-color': '#fff',
                    'line-width': 4
                }
            },

            {
                'id': 'gl-draw-polygon-stroke-static',
                'type': 'line',
                'filter': ['all', 
                    ['==', '$type', 'Polygon'], 
                    ['==', 'active', 'false']
                ],
                'layout': {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                'paint': {
                    'line-color': '#0033fd',
                    'line-width': 1
                }
            }
        ]
    }
}