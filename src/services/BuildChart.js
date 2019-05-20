import lang from 'language/Translate'

export default class BuildChart {
    static addTwoDimGraph(inArr, distanseLine, stepLine, reportObject) {
        let indexYarr = 0;
    
        let xArrForScale = inArr[0].map(x => {
            indexYarr++;
            return indexYarr * stepLine;
        });
    
        let trace1 = {
            y: inArr[0],
            x: xArrForScale,

            fill : 'tozeroy',
            type : 'scatter',
            name : lang.getMessages('mainLayerName')
        };
    
        let trace2 = {
            y: inArr[1],
            x: inArr[1] ? xArrForScale : null,

            fill: 'tonexty',
            type: 'scatter',
            name: lang.getMessages('addLayerName')
        };
    
        let layout = {
    
            title: `${lang.getMessages('heightProfile')} ${distanseLine} , ${lang.getMessages('step')} : ${ stepLine.toFixed(1) } ${lang.getMessages('meter')}`,
    
            legend: {
                x: 0,
                y: -0.2,    
                orientation: 'h',
                traceorder: 'normal'
            },
    
            margin: {
                l: 50,
                r: 20,
                b: 30,
                t: 50
            }
        };
    
        if(!reportObject.isReport)
            Plotly.newPlot('graphPlotChart', [trace1, trace2], layout, { displayModeBar: false });
        else
            Plotly.newPlot('graphPlotChart_' + reportObject.id, [trace1, trace2], layout, { displayModeBar: false });
    }

    //test
    static addTwoDimGraphTest(inArr, distanseLine, stepLine) {

        let indexYarr = 0;
    
        let xArrForScale = inArr[0].map(x => {
    
            indexYarr++;
            return indexYarr * stepLine;
        });
    
        let trace1 = {
    
            y: inArr[0],
            x: xArrForScale,
    
            fill : 'tozeroy',
            type : 'scatter',
            name : lang.getMessages('mainLayerName')
        };
    
        let trace2 = {
    
            y: inArr[1],
            x: inArr[1] ? xArrForScale : null,
    
            fill: 'tonexty',
            type: 'scatter',
            name: lang.getMessages('addLayerName')
        };
    
        let layout = {
    
            title: `${lang.getMessages('heightProfile')} ${distanseLine} , ${lang.getMessages('step')} : ${ stepLine.toFixed(1) } ${lang.getMessages('meter')}`,
    
            legend: {
    
                x: 0,
                y: -0.2,    
                orientation: 'h',
                traceorder: 'normal'
            },
    
            margin: {
    
                l: 50,
                r: 20,
                b: 30,
                t: 50
            }
        };
    
        Plotly.newPlot('graphPlotChart', [trace1, trace2], layout, { displayModeBar: false } );
    }

    //3d
    static addThreeDimGraph( inArr, inPolygonInfo, reportObject ){

        document.querySelector('#graphChartInfo').innerHTML=inPolygonInfo[1];

        let layout = {

            title      : inPolygonInfo[0], 

            showlegend : false,
            autosize   : true,

            margin : {

                l : 40,
                r : 0,
                b : 10,
                t : 25
            }
        };

        let data_z1 = { x:0, z: inArr[0], type: 'surface', name: lang.getMessages('mainLayerName'), showscale: false };
        let data_z2 = { x:0, z: inArr[1], type: 'surface', name: lang.getMessages('addLayerName'),  showscale: false };
        
        if(!reportObject.isReport)
            Plotly.newPlot('graphPlotChart', [data_z1, data_z2], layout, { displayModeBar: false } );
        else
            Plotly.newPlot('graphPlotChart_' + reportObject.id, [data_z1, data_z2], layout, { displayModeBar: false } );
    }

    //sdvs
    static setResstartChart(inMyDivObj){

        Plotly.redraw(inMyDivObj);
    }

    static addTwoDimGraphTest(inArr, distanseLine, stepLine) {

        let indexYarr = 0;
    
        let xArrForScale = inArr.map(x => {
    
            indexYarr++;
            return indexYarr;
        });
    
        let trace1 = {
    
            y: inArr,
            x: xArrForScale,
    
            type : 'scatter',
            name : lang.getMessages('volume')
        };
    
        let layout = {
    
            title: `${lang.getMessages('volumeHistory')} ${distanseLine}`,
    
            legend: {
    
                x: 0,
                y: -0.2,    
                orientation: 'h',
                traceorder: 'normal'
            },
    
            margin: {
    
                l: 50,
                r: 20,
                b: 30,
                t: 50
            }
        };
    
        Plotly.newPlot('graphPlotChart', [trace1], layout, { displayModeBar: false } );
    }
}