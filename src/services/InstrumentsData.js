import '@mapbox/mapbox-gl-draw/css'
import mapboxDraw from '@mapbox/mapbox-gl-draw/js'
import lang from 'language/Translate'
import drawStyles from 'services/DrawStyles'
import MathCalcHeight from 'services/MathCalcHeight'
import buildChart from 'services/BuildChart'
import ext from 'services/AddExtension'

export default class Instrument {

    constructor( inStateObj, inCommitObj, inDispatchObj ) {
        this.stateData = inStateObj;
        this.commitData = inCommitObj;
        this.dispatchData = inDispatchObj;
        this.mathCalcHeight = new MathCalcHeight();
    }

    //Выдаем коллекцию текущих объектов карты
    getFetureList( inElemId ) {

        let [ mapObjFinList, mapObjDrawItem, mapObjDrawlist ] = [ null, null, this.stateData.mapObjListDraw ];
        const mapObjServerList = this.stateData.mapObjListServer;
        
        try {
            mapObjDrawlist = mapObjDrawlist.getAll().features;
            mapObjFinList = mapObjServerList.map( item=> {
                mapObjDrawItem = mapObjDrawlist.find( x=> x.id === item.id );
                if( mapObjDrawItem )
                    item.geometry = mapObjDrawItem.geometry;
                return item;
            });
        } catch( error ) {
            mapObjFinList = mapObjServerList || [];
        }

        mapObjFinList = !inElemId ? mapObjFinList : mapObjFinList.filter( x => x.id === inElemId );
        return mapObjFinList;
    }

    //Объявление нового объекта с измерялками
    getMapBoxDraw() {
        return new mapboxDraw({
            displayControlsDefault : true,
            styles : drawStyles.styleMapBoxDrawList(),
            controls : {
                polygon : true,
                line_string : true,
                point : true,
                trash : true
            }
        });
    }

    //Акативация нового инструмента
    setPropForMark( inItem ){
        let drawTypeName = null;
        switch( inItem ){
            //Линия 
            case 2 : drawTypeName = '.mapbox-gl-draw_line'; break;
            //Полигон 
            case 3 : drawTypeName = '.mapbox-gl-draw_polygon'; break;
            //Точка 
            case 1 : 
            case 4 :
            case 5 :
            case 6 : drawTypeName = '.mapbox-gl-draw_point'; break;
            //Корзина (удаление) 
            case 0 : drawTypeName = '.mapbox-gl-draw_trash'; break;
        }
        const buttonDraw = document.querySelector( drawTypeName );
        if( buttonDraw ) document.querySelector( drawTypeName ).click();
    }

    //Вызов действия объекта карты
    async setActionInstrumnentGoMath( inSelObjDraw ) {
        
        const nameAction = 'setActionMathCalc';
        const sureMathCalcTitle = lang.getMessages('sureMathCalc');

        if( !inSelObjDraw ) {
            inSelObjDraw = ext.getSelectDraw( this.stateData.mapObjListDraw );
        }

        if( !inSelObjDraw ) return;

        if( inSelObjDraw.geometry.type === 'LineString' || inSelObjDraw.geometry.type === 'Polygon' ) {
            this.commitData( 'setCurrentMapValue', { field : 'activeModal', value : true });
            this.commitData( 'setCurrentMapValue', { field : 'activeModalTitle', value : sureMathCalcTitle });
            this.commitData( 'setCurrentMapValue', { 
                field : 'activeConfrmDialogAction', 
                value : {
                    nameAction : nameAction,
                    dataAction : inSelObjDraw
                } 
            });
        } else {
            this.dispatchData( nameAction, inSelObjDraw );
        }
    }

    //Удаление объекта
    setDeleteExistObject( inSelObjDraw ) {
        
        const sureDelTitle = lang.getMessages('sureDelObj');
        
        if( !inSelObjDraw ) {
            inSelObjDraw = ext.getSelectDraw( this.stateData.mapObjListDraw );
        }
        this.commitData( 'setCurrentMapValue', { field : 'activeModal', value : true });
        this.commitData( 'setCurrentMapValue', { field : 'activeModalTitle', value : sureDelTitle });
        this.commitData( 'setCurrentMapValue', { 
            field : 'activeConfrmDialogAction', 
            value : {
                nameAction : 'setActionDelMapObj',
                dataAction : inSelObjDraw
            }
        });
    }

    //Клик на карту - проходим по инструментам, смотрим, на какой нажали
    async setPreparePopupProp( inEvent ) {

        let curDrawItem = null;
        let inInst = this.stateData.currentInstrument;
        let selectDrawItem = ext.getSelectDraw( this.stateData.mapObjListDraw );

        try {
            const dataDrawArr = this.stateData.mapObjListDraw.getAll().features;
            curDrawItem = dataDrawArr[ dataDrawArr.length - 1 ];
        } catch(exc) {
            console.log(exc);
            curDrawItem = {};
        }

        const mathCalcHeightWithModel = new MathCalcHeight( 
            this.stateData.mapModel, 
            this.stateData.currentMainIndex, 
            this.stateData.currentAddIndex, 
            this.stateData.selectedDataCheckArr 
        );

        //Выходим, если нет объекта в режиме редактирования
        if( !curDrawItem ) 
            return;
        
        //Если было произведено "отпускание" мыши - просто перерисывываем форму
        if( inEvent.type === 'mouseup' ) {
            if(selectDrawItem) this.setImagesForDrawObjects( selectDrawItem.id );
        } 
        //Ну а если был произведен клик - делаем расчеты или открываем всплывающее окно 
        //else if( inInst ){
            //Высотная метка
            if ( inInst === 1 ) {

                let heightsData = 0;
                let heightsDataText = '';
                const mathData = await mathCalcHeightWithModel.getHeightsLine( curDrawItem, false, this.stateData.isActiveAddLayer );

                try {
                    heightsData = mathData.heightsData.inArr[0].toFixed(2);
                    heightsDataText =  `${lang.getMessages('heightOnPoint')} : ${heightsData}${lang.getMessages('meter')}`
                } catch(error) {
                    heightsData = -1;
                }
                
                this.setAddPopUp( curDrawItem, [ inEvent.lngLat.lng, inEvent.lngLat.lat ], heightsData );
                this.commitData( 'setCurrentMapValue', { field : 'currentInstrument', value : 0 } );
                this._setDataHeightsToDraw( { heightsData : heightsDataText }, curDrawItem );

                return;
            }
            //Обычные метки
            else if ( inInst > 3 ) {
                this.commitData( 'setCurrentMapValue', { field : 'currentInstrument', value : inInst } );
                this._setDataHeightsToDraw( { heightsData : '' }, curDrawItem );
                return;
            }
            //Линия и Полигон
            else if ( inInst === 2 || inInst === 3 ) {

                if( !curDrawItem.geometry ) return;
                
                if( inInst === 2 && curDrawItem.geometry.coordinates.length >= 2 ){
                    this.setAddPopUp( curDrawItem, [ inEvent.lngLat.lng, inEvent.lngLat.lat ] );
                } else if ( inInst === 3 && curDrawItem.geometry.coordinates[0].length > 3 ){
                    let coord  = this.mathCalcHeight.getStartCoord( curDrawItem );
                    this.setAddPopUp( curDrawItem, [ coord[0], coord[1] ] );
                }
            }
            //Клик на имеющийся объект
            else if ( selectDrawItem ) {
                this.setImagesForDrawObjects( selectDrawItem.id );
                const curDrawList = this.getFetureList( selectDrawItem.id );
                curDrawItem = curDrawList.length>0 ? this.getFetureList( selectDrawItem.id )[0] : selectDrawItem;
                this.setAddPopUp( curDrawItem, [ inEvent.lngLat.lng, inEvent.lngLat.lat ] );  
            }
        //}        
    }
    
    //Двойной клик на карту - смотрим, попали ли на какой-нибудь объект 
    async setRequestActionInstr( inSelDraw ) {
        
        //Перегружаем сервис вычислений
        let resMathData = null;
        const measurItem = this.stateData.currentInstrument;
        const mathCalcHeightWithModel = new MathCalcHeight(
            this.stateData.mapModel, 
            this.stateData.currentMainIndex, 
            this.stateData.currentAddIndex, 
            this.stateData.selectedDataCheckArr 
        );
        this.commitData( 'setCurrentMapValue', { field : 'show3DPanel', value : false });

        //Если пусто - выходим
        if ( !inSelDraw && measurItem === 0 ) return;
        
        const stateSelDraw = this.getFetureList( inSelDraw.id );
        const {isRecount} = inSelDraw;
        inSelDraw = ( stateSelDraw && stateSelDraw.length > 0 ) ? stateSelDraw[0] : inSelDraw;
        
        //Метки
        if( measurItem > 3 || inSelDraw.geometry.type === 'Point' ) {
            if( inSelDraw.chartData ) {
                const {chartData} = inSelDraw;
                this.commitData( 'setCurrentMapValue', { field : 'nameObject', value : chartData.name });
                this.commitData( 'setCurrentMapValue', { field : 'dateObject', value : chartData.date });
                this.commitData( 'setCurrentMapValue', { field : 'commentObject', value : chartData.heightsData });
            }
        }
        //Линия
        if ( measurItem === 2 || inSelDraw.geometry.type === 'LineString' ) {
            if( inSelDraw.chartData && !isRecount ) {
                buildChart.addTwoDimGraph( inSelDraw.chartData.heightsData, null );
            } else {
                resMathData = await mathCalcHeightWithModel.getHeightsLine( inSelDraw, false, this.stateData.isActiveAddLayer );                    
            }
        }
        //Полигон
        else if ( measurItem === 3 || inSelDraw.geometry.type === 'Polygon' ) {
            if( this.stateData.is3dVolume && inSelDraw.chartData.useThreeDCheck ) {
                this.commitData( 'setCurrentMapValue', { field : 'show3DPanel', value : true });  
            }
            if( inSelDraw.chartData && !isRecount ) {
                if( inSelDraw.chartData.useThreeDCheck ) {
                    this.commitData( 'setCurrentMapValue', { field : 'show3DPanel', value : true });  
                    buildChart.addThreeDimGraph( inSelDraw.chartData.heightsData, null );
                } else {
                    buildChart.addTwoDimVoluemGraph( inSelDraw.chartData.heightsData, null );
                }
            } else {
                resMathData = await mathCalcHeightWithModel.getVolume( inSelDraw, false, this.stateData.isActiveAddLayer, this.stateData.is3dVolume );
            }
        }     

        //Добавляем результат расчета к общей коллекции элементов
        this._setDataHeightsToDraw( resMathData, inSelDraw );
    }   

    //Добавляем полученные данные к текущему объекту, обновляем общую коллекцию 
    _setDataHeightsToDraw( inResMathData, inDrawSel ) {
        if( inResMathData ) {
            const objListServer = this.stateData.mapObjListServer || [];
            inDrawSel.measurItem = this.stateData.currentInstrument;
            inDrawSel.chartData = inResMathData;

            this.commitData( 'setCurrentMapValue', { field : 'mapObjListServer', value : [ ...objListServer, inDrawSel ] });
            //Заносим в хранилище Id вызванного объекта
            this.commitData( 'setCurrentMapValue', { field : 'instrumentCurrentId', value : inDrawSel.id });  
        }      
    }

    //Замена дефолтовых маркеров на более красивые
    setImagesForDrawObjects( inDrawId ) {

        const inMapObj = this.stateData.curMap;
        this._deleteSorceAndLayersFromMap( inDrawId, null );
        const inIsMarkersActive = this.stateData.isMarkersActive;
        const inIsMeasureActive = this.stateData.isMeasureActive;
        const inTblMapObj = this.stateData.mapObjListTable;
        const inListOfColors = ext.getListColor();
        const featureDrawList = this.getFetureList( inDrawId );
      
        if( !featureDrawList || !inMapObj ) return;

        featureDrawList.forEach( item => {
            if( item ) {

                let imgForDraw = '';
                let drawType = item.geometry.type;
                let drawCoord = item.geometry.coordinates;
                let drawTypeView = item.properties.type;
                let inColor = ext.getValueFromNum( inListOfColors, item.properties.numColor );
                let isReport = item.properties.isReport !== null ? item.properties.isReport : true;

                if( inTblMapObj ) {
                    const elemFromTblMapObj = inTblMapObj.find( x => x.id === item.id );
                    inColor  = elemFromTblMapObj ? ext.getValueFromNum( inListOfColors, elemFromTblMapObj.numColor ) : inListOfColors[0].value;
                    isReport = elemFromTblMapObj ? elemFromTblMapObj.isReport : false;
                }

                if( drawType !== 'LineString' && drawType !== 'Polygon' && drawTypeView && inIsMarkersActive ) {
                    imgForDraw = require(`content/images/${drawTypeView}Draw.png`);
                    inMapObj.loadImage( imgForDraw, ( error, image ) => {
                        inMapObj.addImage( `imgDraw${item.id}`, image );
                        inMapObj.addLayer({
                            id   : `points${item.id}`,
                            type : 'symbol',
                            source : {
                                type : 'geojson',
                                data : {
                                    type : 'FeatureCollection',
                                    features : [{
                                        type : 'Feature',
                                        geometry : {
                                            type : 'Point',
                                            coordinates : drawCoord
                                        }
                                    }]
                                }
                            },
                            layout : {
                                'icon-image' : `imgDraw${item.id}`,
                                'icon-size' : 0.75
                            }
                        });
                    });
                } else {
                    if( isReport && inIsMeasureActive ) {
                        if ( drawType === 'LineString' ) {
                            inMapObj.addLayer({
                                "id" : `lineObj${item.id}`,
                                "type" : "line",
                                "source" : {
                                    "type" : "geojson",
                                    "data" : {
                                        "type" : "Feature",
                                        "properties" : {},
                                        "geometry" : {
                                            "type" : "LineString",
                                            "coordinates" : item.geometry.coordinates
                                        }
                                    }
                                },
                                'layout' : {
                                    'line-join' : 'round',
                                    'line-cap' : 'round'
                                },
                                'paint' : {
                                    'line-color' : inColor,
                                    'line-opacity' : 0.5,
                                    'line-width' : 5
                                }
                            });
                        } else {
                            inMapObj.addLayer({
                                "id" :  `polygonObj${item.id}`,
                                "type" : "fill",
                                "source" : {
                                    "type" : "geojson",
                                    "data" : {
                                        "type" : "Feature",
                                        "properties" : {},
                                        "geometry" : {
                                            "type" : "Polygon",
                                            "coordinates" : item.geometry.coordinates
                                        }
                                    }
                                },
                                'layout' : {},
                                'paint' : {
                                    'fill-color' : inColor,
                                    'fill-opacity' : 0.35
                                }
                            });
                        }
                    }
                }
            }
        });
    }

    //Меняем видимость объектов класса mapBoxDraw на карте
    setToggleDrawObjFromMap( isShow ) {
        
        this._deleteAllPopup();

        const inMapObj = this.stateData.curMap;
        const mapStyles = inMapObj.getStyle();
        const circleLayerArr = mapStyles.layers.filter( i => {    
            if( i.source ) {
                return i.source.match(/mapbox-gl-draw*/);
            }
            else {
                return null;
            }
        });

        if( ( this.stateData.mapObjListServer || []).length > 0 ){
            const firstDrawItem = this.stateData.mapObjListServer[0];
            const { measurItem } = firstDrawItem;
            //if( measurItem === 2 || measurItem === 3) {
                //this.stateData.mapObjListDraw.changeMode( 'direct_select', { featureId : firstDrawItem.id } );
            //}
        }

        circleLayerArr.forEach( x => inMapObj.setLayoutProperty( x.id, 'visibility', isShow ? 'visible' : 'none' ) );
        this._deleteAllPopup();
    }

    //Закрываем все поповеры
    _deleteAllPopup(){
        document.querySelectorAll('.mapboxgl-popup-content').forEach( x=> x.remove() );
        document.querySelectorAll('.mapboxgl-popup-tip').forEach( x=> x.remove() );
    }

    //Удаление всех нарисованных меток
    _deleteSorceAndLayersFromMap( inElemId, inMapObj ) {

        let circleLayerArr = [];
        const mapObj = inMapObj || this.stateData.curMap;
        
        if( !mapObj ) return;

        const mapStyles = mapObj.getStyle();
        
        if( !mapStyles ) return;

        //Находим все слои, что означают точки, линии и полигоны
        if( !inElemId ) {
            circleLayerArr = mapStyles.layers.filter( x => 
                ( x.type === 'symbol' || x.id.match(/lineObj.*/) || x.id.match(/polygonObj*/) )
            );
        } else {
            circleLayerArr = mapStyles.layers.filter( x => 
                ( x.id.indexOf(inElemId) !== -1 )
            );
        }

        //Удаляем все эти точки`
        circleLayerArr.forEach(x => {
            mapObj.removeLayer(x.id);
            mapObj.removeSource(x.source);
        });

        //И закрываем поповеры
        this._deleteAllPopup();
    }
    
    setImagesForReportDrawObjects( inMapObj, featureDrawItem ) {       
        if( featureDrawItem ) {

            const defColor = '#00ff00';
            const color = ext.getValueFromNum( ext.getListColor(), featureDrawItem.properties.numColor ) || defColor;
            const type = featureDrawItem.geometry.type;
            const objLayerName = `lineObj${featureDrawItem.id}`;

            //this._deleteSorceAndLayersFromMap( null, inMapObj );

            //Находим все слои, что означают текущий нарисованный объект
            const finderObj = inMapObj.getStyle().layers.filter( x => x.id.match(objLayerName) );
            
            if( finderObj.length > 0 ) return;

            if ( type === 'LineString' ) {

                this._deleteSorceAndLayersFromMap( null, inMapObj );

                inMapObj.addLayer({
                    'id' : objLayerName,
                    'type' : 'line',
                    'source' : {
                        'type' : 'geojson',
                        'data' : {
                            'type' : 'Feature',
                            'properties' : {},
                            'geometry' : {
                                'type' : 'LineString',
                                'coordinates' : featureDrawItem.geometry.coordinates
                            }
                        }
                    },
                    'layout' : {
                        'line-join' : 'round',
                        'line-cap' : 'round'
                    },
                    'paint' : {
                        'line-color' : color,
                        'line-width' : 7
                    }
                });
            }
            else {
                inMapObj.addLayer({
                    'id' : `polygonObj${i}`,
                    'type' : 'fill',
                    'source' : {
                        'type' : 'geojson',
                        'data' : {
                            'type' : 'Feature',
                            'properties' : {},
                            'geometry' : {
                                'type' : 'Polygon',
                                'coordinates' : featureDrawItem.geometry.coordinates
                            }
                        }
                    },
                    'layout' : {},
                    'paint' : {
                        'fill-color': color,
                        'fill-opacity': 0.5
                    }
                });
            }
        }
    }

    //Активация поповера
    setAddPopUp( drawItem, xyCoord, textPopUp ) {

        if ( !drawItem ) return;

        let mapPartInfo = '';
        const _draw = Array.isArray( drawItem ) ? drawItem[0] : drawItem;
        
        if( !_draw.geometry ) return;

        textPopUp = textPopUp || ( _draw.chartData && _draw.chartData.name );
        const currentText = textPopUp || lang.getMessages('noComment');

        if( !xyCoord ) {
            switch ( _draw.geometry.type ) {
                case 'Polygon' : xyCoord = _draw.geometry.coordinates[0][0]; break;
                case 'LineString' : xyCoord = _draw.geometry.coordinates[0];    break;
                default : xyCoord = _draw.geometry.coordinates;
            }
        }

        if( _draw.geometry.type !== 'Point' ) {
            mapPartInfo = this.mathCalcHeight.getTotalDistanceStr( _draw, true );
        } else {
            mapPartInfo = ( _draw.properties.pointInfo !== undefined ) ? _draw.properties.pointInfo : currentText;
        }

        //Закрываем поповеры
        this._deleteAllPopup();

        new mapboxgl.Popup()
            .setLngLat( xyCoord )
            .setHTML(
                `<table>
                    <tr>
                        <td valign='bottom' align='left' >
                            <input class='delDraw paddingSmallDef' type='image' 
                                title='${lang.getMessages('delete')}'
                                src='${require('../content/images/delete.png')}' />
                        </td>
                        <td>
                            <div> ${mapPartInfo} </div>
                        </td>
                        <td valign='bottom' align='right' >
                            <input class='actionDraw paddingSmallDef' type='image' 
                                title='${lang.getMessages('nameButLoad')}'
                                src='${require('../content/images/analitics.png')}' />
                        </td>
                    </tr>
                </table>`
            ).addTo( this.stateData.curMap );
         
            
        document.querySelectorAll('.delDraw').forEach( item => 
            item.onclick = ()=> this.setDeleteExistObject( drawItem[0] ) 
        );

        document.querySelectorAll('.actionDraw').forEach( item => 
            item.onclick = ()=> this.setActionInstrumnentGoMath( drawItem[0] ) 
        );
    }
}