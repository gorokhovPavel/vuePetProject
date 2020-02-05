import html2canvas from 'html2canvas'
import buildChart from '../services/BuildChart'
import ext from '../services/AddExtension'

export default class PageGenerator {

    //Формируем первую страницу "Введение"
    static firstPage( name, text ) {
        return [
            {
                text : "Введение",
                style : "header"
            },{
                text : "Цель выполнения работ:",
                style : "subheader"
            },{
                text : "Осуществление независимого мониторинга за производством строительных работ на объекте «" 
                    + name + "» с применением БПЛА и использованием программного комплекса, разработанного Исполнителем.",
                style : "section"
            },{
                text : "Объект контроля:",
                style : "subheader"
            },{
                text : text,
                style : "section"
            },{
                text : "Методология",
                style : "subheader"
            },{
                text : "Мониторинг строительного объекта с применением БПЛА осуществляется для оперативной отчетности и контроля выполнения строительных процессов. Посредством мониторинга решаются следующие задачи – контроль выработки грунта при земляных работах, контроль соответствия план-факту, контроль исполнения задач подрядными организациями в срок. Мониторинг с помощью БПЛА является дополняющим инструментом контроля к проводимым замерам геодезических служб.",
                style : "section"
            },{
                text : "Для проведения мониторинга используется БПЛА роторного типа (квадракоптер), способный летать в автоматическом режиме по заданным координатам и производить фотосъемку. Отснятые изображения с помощью фотограмметрических методов позволяют получить следующие материалы, используемые для контроля и анализа работ на объекте: ортофотоплан (детальный план местности), ЦМР (цифровая модель рельефа), 3х-мерная текстурированная модель объекта. Все эти данные при последующей обработки могут быть использованы для количественной оценки производимых работ. В некоторых случаях, точность получаемых данных (объемы грунта) могут отличаться от производимых традиционном геодезическим методом, в следствии нахождения и перемещения строительной техники по объекту мониторинга.",
                style : "section"
            },{
                text : "Для сбора, хранения и анализа данных, полученных при мониторинге используется веб-система, разработанная исполнителем. Которая позволяет как просматривать, так и анализировать данные в режиме онлайн.",
                style : "section"
            }
        ];
    }

    //Получаем страницу "карта обьектов"
    static async getMainMapPage( snapshotMap, mapObjectTxt ) {
        return new Promise( function ( resolve ) {
            try {

                const pages = [];
                const txt = 'Карта объекта';
                const header = [{
                    pageBreak : 'before',
                    style : 'header',
                    text : txt
                }];
                pages.push(header);

                const dataUrl = require('mapbox-print-canvas');
                dataUrl
                    .build()
                    .format('a4')
                    .print( snapshotMap, mapboxgl )
                    .then( url => {
                        
                        const img = [{
                            image : url,
                            width : 390,
                            height : 460,
                            alignment : 'center'
                        }];
                        pages.push( img );

                        const endTxt = [
                            { text : 'Объект мониторинга', style : 'subheader' },
                            { text : mapObjectTxt }
                        ];
                        pages.push(endTxt);

                        resolve(pages);
                    });
            }
            catch (e) {
                console.error(e);
            }
        });
    }

    //Получаем страницу "карта высот"
    static async getColorMapPage( snapshotMap ) {
        return new Promise( (resolve, reject)=> {
            try {
                const txt = 'Карта высот';
                const pages = new Array();
                const header = [{
                    text : txt,
                    style : 'header',
                    pageBreak : 'before'
                }];
                pages.push(header);

                const headTxt = [{
                    text : 'В системе доступна цифровая карта высот для всех периодов съемки, на изображении ниже представлен результат за выбранный период'
                }];
                pages.push(headTxt);

                const dataUrl = require('mapbox-print-canvas');
                dataUrl
                    .build()
                    .format('a4')
                    .print( snapshotMap, mapboxgl )
                    .then( url => {
                        const img = [{
                            image : url,
                            width : 390,
                            height : 460,
                            alignment : 'center'
                        }];
                        pages.push(img);
                        resolve(pages);
                    });
            }
            catch (e) {
                reject(e);
            }
        });
    }

    //страница с точками детектора изменений
    static async getChangesPage( imgUrl, imgScaleUrl ) {
        const current = this;
        return new Promise( async function ( resolve, reject ) {
            try {
                const changesImg = await current._getImg( imgUrl, false );
                const changesScaleImg = await current._getImg( imgScaleUrl, true );
                const page = [{
                        pageBreak : 'before',
                        text : 'Детектор изменений',
                        style : 'header'
                    }, {
                        image : changesImg,
                        width : 390,
                        height : 290,
                        alignment : 'center'
                    }, {
                        image : changesScaleImg,
                        width : 340,
                        alignment : 'center',
                        margin : [ 0, 0, 20, 0 ]
                    }
                ];
                resolve(page);
            }
            catch (e) {
                reject(e)
            }
        });
    }

    static async get3DPage( imgUrl ) {
        return new Promise( async (resolve, reject)=> {
            try {
                const changesImg = await this._getImg( imgUrl, false );
                const page = [
                    {
                        pageBreak : 'before',
                        text : '3D-модель',
                        style : 'header'
                    }, {
                        text : 'В системе доступна 3D-модель площадки и 3D-облако точек.'
                    }, {
                        image : changesImg,
                        width : 390,
                        height : 290,
                        alignment : 'center'
                    },
                ];
                resolve( page );
            } catch (e) {
                reject(e)
            }
        });
    }

    static async _getImg( imgUrl, isScale ) {
        return new Promise(function (resolve, reject) {
            try {
                const image = new Image( 390, 290 );
                image.onload = function () {
                    const canvas = document.createElement('canvas');
                    if ( !isScale ) {
                        canvas.width = 1750;
                        canvas.height = 1400;
                    }
                    canvas.getContext('2d').drawImage(this, 0, 0);
                    const url = canvas.toDataURL('image/png');
                    delete canvas.image;

                    resolve(url);
                };

                image.src = imgUrl;
            }
            catch (e) {
                reject(e);
            }
        });
    }

    //Будем получать страницу геоплана
    static async getGeoPlan( snapshotMap ) {

    }

    static async volumePage( math, polygons, dateBetweenObj ) {
        try {
            let pages = new Array();

            const { mainDate, additionalDate } = dateBetweenObj;
            const newMainDate = ext.getDateFromStr( mainDate );
            const newAdditionalDate = ext.getDateFromStr( additionalDate );

            for ( let item of polygons ) {
                
                const header = [{
                    pageBreak : 'before',
                    text : 'Измерения объема выполненных работ',
                    style : 'header'
                }];
                pages.push(header);

                const subheader = [{
                    text : item.properties.name,
                    style : 'subheader'
                }];
                pages.push(subheader);

                const { heightsData } = item.chartData;

                const heightsDataFiltered = heightsData.filter( x=> ( ext.getDateFromStr(x.dataVolume) >= newAdditionalDate && ext.getDateFromStr(x.dataVolume) <= newMainDate ) );
                const reportObject = { id : item.id };

                buildChart.addTwoDimVoluemGraph( heightsDataFiltered, reportObject );

                //Добавляем 'аналитический' график, что показывает разницу с предыдущей величиной объема
                const upHeightsData = heightsDataFiltered.map( (item,index)=> {
                    return {
                        dataVolume : item.dataVolume,
                        dateVolumeDt : ext.getDateFromStr(item.dataVolume),
                        diffVolume : ( index > 0 ) ? +(Math.abs( item.volume - heightsData[ index - 1 ].volume )).toFixed(2) : 0,
                        volume : +item.volume.toFixed(2)
                    }
                });

                const diffVolumeArr = upHeightsData
                    .filter( x=> ( x.dateVolumeDt >= newAdditionalDate && x.dateVolumeDt <= newMainDate ) )
                    .map( x=> x.diffVolume );
                
                const totalValue = diffVolumeArr.reduce( (x,y)=> x+y, 0 );
                const middleValue = totalValue/diffVolumeArr.length;

                // const info = await math.getVolume( item, true, true, true );
                // const perimetr = { text: ["Периметр: ", { text: info.perimetr + " m", color: "blue" }] };
                // const area = { text: ["Площадь: ", { text: info.area + " m^2", color: "blue" }] };

                const totalVolume = { text : [ 'Общий объем извлеченого грунта: ', { text : +totalValue.toFixed(2) + ' m^3', color : 'blue' }] };
                const averageVolume = { text : [ 'Cреднее значение извлеченного грунта за заданные даты: ', { text : +middleValue.toFixed(2) + ' m^3', color : 'blue' }] };
                const txt = [{
                        ul : [ '', '', totalVolume, averageVolume ],
                        margin : [ 0, 5 ]
                    },{
                        text : 'На графике представлены изменения по объему извлекаемого грунта относительно нулевой отметки, за весь период мониторинга',
                        margin : [ 0, 5 ]
                    }
                ];

                pages.push(txt)

                await html2canvas(
                    document.querySelector( '#graphPlotChart_' + item.id ), { logging : false }
                ).then(canvas => {
                    const pageImg = [{
                        image : canvas.toDataURL( 'image/png' ),
                        width : 480,
                        height : 290,
                        alignment : 'center',
                        margin : [ 0, 10 ]
                    }];
                    pages.push(pageImg);
                });

                const tblHeader = [
                    [
                        { text : 'Дата', style : 'tableHeader' }, 
                        { text : 'Объем', style : 'tableHeader' }, 
                        { text : 'Разница с последней съемкой', style : 'tableLastHeader' }
                    ]
                ];
                const tblBody = upHeightsData.map( item=> {
                    return [
                        { text : item.dataVolume, margin : [ 0, 10, 0, 0 ] },
                        { text : item.volume, margin : [ 0, 10, 0, 0 ] },
                        { text : item.diffVolume, margin : [ 0, 10, 0, 0 ] }
                    ]
                });
                const tblDataObj = [ ...tblHeader, ...tblBody ];
                const tblForReport = ext.getTAbleForReport( tblDataObj );
                pages.push( tblForReport );
            }
            return pages;
        }
        catch (e) {
            ///not sure may be need redo all method for promise
            console.log(e);
        }
    }

    //Страница профиль поверхности для линий
    static async surfacePage( mapObj ) {
        try {

            const [ { lineItem, dateObj }, pages ] = [ mapObj, [] ];
            const { mainDate, additionalDate } = dateObj;
            const newMainDate = ext.getDateFromStr( mainDate );
            const newAdditionalDate = ext.getDateFromStr( additionalDate );

            const header = [{
                text : 'Профиль поверхности',
                style : 'header',
                pageBreak : 'before',
            }];
            pages.push( header );

            const objName = [{
                text : lineItem.properties.name,
                style : 'subheader'
            }];
            pages.push( objName );

            const surface = await this._flyToSurface( mapObj );
            pages.push( surface );
            
            const reportObject = { id : lineItem.id };
            const heights = { ...lineItem.chartData.heightsData };
            const heightsArray = heights.inArr.map( item=> {
                return { ...item, date : ext.getDateFromStr( item.name ) }
            });
            
            const heightsArrayFiltered = heightsArray.filter( x=> ( x.date >= newAdditionalDate && x.date <= newMainDate ) );
            
            const newHeightsArr = heights;
            newHeightsArr.inArr = heightsArrayFiltered;
            
            buildChart.addTwoDimGraph( newHeightsArr, reportObject );

            if ( heightsArrayFiltered.length > 1 ) {
                const tblHeader = [
                    [
                        { text : 'Дата съемки', style : 'tableLastHeader' }, 
                        { text : 'Максимальная высота', style : 'tableLastHeader' }, 
                        { text : 'Минимальная высота', style : 'tableLastHeader' }, 
                        { text : 'Средняя высота', style : 'tableLastHeader' }
                    ]
                ];

                const tblBody = heightsArrayFiltered.map( item=> {

                    let [ min, max, sum, aver ] = [ 0, 0, 0, 0 ];
                    const newHeights = item.array
                        .map( x=> +x )
                        .filter( x=> ( x !== 0 ) );
                    
                    if( newHeights.length > 0 ) {
                        min = newHeights.length > 0 ? Math.min( ...newHeights ).toFixed(2) : 0;
                        max = newHeights.length > 0 ? Math.max( ...newHeights ).toFixed(2) : 0;
                        sum = newHeights.reduce((a, b) => a + b, 0);
                        aver = (sum / newHeights.length).toFixed(2);
                    }

                    const finalRes = [
                        {
                            text : item.name,
                            margin : [0, 10, 0, 0]
                        },{
                            text : `${max} m`,
                            margin : [0, 10, 0, 0]
                        },{
                            text : `${min} m`,
                            margin : [0, 10, 0, 0]
                        },{
                            text : `${aver} m`,
                            margin : [0, 10, 0, 0]
                        }
                    ];

                    return finalRes;
                });

                const tblDataObj = [ ...tblHeader, ...tblBody ];
                const tblForReport = ext.getTAbleForReport( tblDataObj );
                pages.push( tblForReport );
            }

            await html2canvas(
                document.querySelector( '#graphPlotChart_' + lineItem.id ), { logging: false }
            ).then(canvas => {
                const pageImg = [{
                    image : canvas.toDataURL("image/png"),
                    width : 450,
                    height : 300,
                    alignment : 'center'
                }];
                pages.push(pageImg);
            });
            return pages;
        }
        catch (e) { 
            console.log(e);
            return null; 
        }
    }

    //Перемещаемся непосредственно к фигуре, которую будем наблюдать на графике
    //26.03.2019 - на текущий момент перестали использовать данную функцию, в будущем,
    //если в обозримом будущем она не понадобится - удалить. (Это же касается и функции _calcCenterOfObject)
    static async _flyToSurface( mapObj ) {
        return new Promise( (resolve, reject)=> {
            try {
                
                const { instrument, snapshotMap, lineItem } = mapObj;
                const { centerLat, centerLon } = instrument.stateData.mapModel.map;

                snapshotMap.flyTo({
                    center : [ centerLon, centerLat ],
                    zoom : 14.1
                });
              
                snapshotMap.on( 'moveend', ()=>{

                    instrument.setImagesForReportDrawObjects( snapshotMap, lineItem );
                    const dataUrl = require('mapbox-print-canvas');
                    
                    dataUrl
                        .build()
                        .format('a4')
                        .print( snapshotMap, mapboxgl )
                        .then( url => {
                                const img = [{
                                    image : url,
                                    width : 300,
                                    height : 320,
                                    alignment : 'center'
                                }];
                                resolve(img);
                            }
                        ).catch(e => reject(e));
                });
            }
            catch (e) { reject(e); }
        });
    }

    //получаем центр фигуры, чтобы отрбразить на карте
    static _calcCenterOfObject(coords) {
        let sumX = 0;
        let sumY = 0;

        let x = 0;
        let y = 0;

        if (coords.type == "line") {
            for (let i = 0; i < coords.array.length; i++) {
                sumX += coords.array[i][0];
                sumY += coords.array[i][1];
            }

            x = sumX / coords.array.length;
            y = sumY / coords.array.length;
        }

        if (coords.type == "polygon") {
            let length = 0;
            for (let i = 0; i < coords.array.length; i++) {
                for (let j = 0; j < coords.array[i].length; j++) {
                    sumX += coords.array[i][j][0];
                    sumY += coords.array[i][j][1];
                }
                length += coords.array[i].length;
            }

            x = sumX / length;
            y = sumY / length;
        }

        return { x, y };
    }
}