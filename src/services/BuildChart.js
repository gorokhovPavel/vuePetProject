import lang from 'language/Translate'

export default class BuildChart {

    static addTwoDimGraph( inHeightsData, reportObject ) {

        const { inArr, distanseLine, stepLine } = inHeightsData;
        const firstArr = inArr.find(x=>x.array.length>0);
        const xArrForScale = !firstArr ? [] : firstArr.array.map( (item, index)=> index * stepLine );
        const traceArr = inArr.map( elem=> {
            return {
                y : elem.array,
                x : xArrForScale,
                fill : 'tozeroy',
                type : 'scatter',
                name : elem.name
            }
        });

        const layout = {
            title : `${ lang.getMessages('heightProfile')} ${distanseLine} , ${lang.getMessages('step')} : ${ stepLine.toFixed(1) } ${lang.getMessages('meter') }`,
            legend : {
                x : 0,
                y : -0.2,    
                orientation : 'h',
                traceorder  : 'normal'
            },
            margin: {
                l : 50,
                r : 20,
                b : 30,
                t : 50
            }
        };
    
        if( reportObject )
            Plotly.newPlot('graphPlotChart_' + reportObject.id, traceArr, layout, { displayModeBar: false });
        else
            Plotly.newPlot('graphPlotChart', traceArr, layout, { displayModeBar: false });
    }

    //3d volume
    static addThreeDimGraph( inHeightsData, reportObject ) {

        const { inArr, inPolygonInfo } = inHeightsData;
        document.querySelector('#graphChartInfo').innerHTML=inPolygonInfo[1];
        const layout = {
            title : inPolygonInfo[0], 
            showlegend : false,
            autosize : true,
            margin : {
                l : 10,
                r : 10,
                b : 10,
                t : 35
            }
        };

        const data_z1 = { x:0, z: inArr[0], type: 'surface', showscale: false };
        const data_z2 = { x:0, z: inArr[1], type: 'surface', showscale: false };
        
        if( reportObject )
            Plotly.newPlot('graphPlotChart_' + reportObject.id, [data_z1, data_z2], layout, { displayModeBar: false } );    
        else
            Plotly.newPlot('graphPlotChart', [data_z1, data_z2], layout, { displayModeBar: false } );
    }

    //2d volume
    static addTwoDimVoluemGraph( inArr, reportObject ) {

        //Создаем еще массив, прибавляем на старт нулевое значение
        let upInArr = [ { volume : 0, dataVolume : '01.01.2017' }, ...inArr ];
        //Модифицируем входной, чтобы исключить график с 1ой точкой
        inArr = inArr.length === 1 ? upInArr : inArr;
        //Добавляем 'аналитический' график, что показывает разницу с предыдущей величиной объема
        upInArr = inArr.map( (item,index)=> {
            return {
                volume : ( index > 0 ) ? Math.abs( item.volume - inArr[index-1].volume ) : 0,
                dataVolume : item.dataVolume
            }
        });
        const traceArr = [ inArr, upInArr ].map( (elem, index)=> {
            return {
                y : elem.map( x=>x.volume.toFixed(2) ),
                x : elem.map( x=>x.dataVolume ),
                type  : ( index === 0 ) ? 'scatter' : 'bar',
                marker: ( index === 0 ) ? { color : 'rgb(26, 118, 255)' } : { color : 'rgb(158,202,225)' },
                name : ( index === 0 ) ? lang.getMessages('relToZero') : lang.getMessages('relToStartWork')
            }
        });
        const layout = {
            title : `${lang.getMessages('volumeHistory')} : `,
            yaxis : { title: lang.getMessages('volumeDim') },
            legend : {
                x : 0,
                y : 1,
                traceorder : 'normal',
                font : {
                  family : 'sans-serif',
                  size : 12,
                  color : '#000'
                },
                bgcolor : '#E2E2E2',
                bordercolor : '#FFFFFF',
                borderwidth : 2
            },
            margin : {
                l : 65,
                r : 45,
                b : inArr.length > 5 ? 80 : 45,
                t : 60
            }
        };
    
        if( reportObject )
            Plotly.newPlot('graphPlotChart_' + reportObject.id, traceArr, layout, { displayModeBar: false });    
        else
            Plotly.newPlot('graphPlotChart', traceArr, layout, { displayModeBar: false });
    }

    //redraw graph
    static setResstartChart(inMyDivObj) {
        Plotly.redraw(inMyDivObj);
    }
}