import mapboxDraw     from '@mapbox/mapbox-gl-draw/js'
import lang           from 'language/Translate'
import drawStyles     from 'services/DrawStyles'
import MathCalcHeight from 'services/MathCalcHeight'
import ext            from 'services/AddExtension'

import '@mapbox/mapbox-gl-draw/css'

export default class Instrument {

    constructor( inStateObj, inCommitObj, inDispatchObj ){

        this.stateData    = inStateObj;
        this.commitData   = inCommitObj;
        this.dispatchData = inDispatchObj;

        this.mathCalcHeight = new MathCalcHeight();
    }

    //Выдаем коллекцию текущих объектов карты
    getFetureList( inElemId ){

        let mapObjFinList = null;

        const mapObjDrawlist   = this.stateData.mapObjListDraw;
        const mapObjServerList = this.stateData.mapObjListServer;

        try {

            mapObjFinList = mapObjDrawlist.getAll().features
        } catch(error) {

            //console.log(error);
            mapObjFinList = mapObjServerList;
        }

        mapObjFinList = !inElemId ? mapObjFinList : mapObjFinList.filter( x => x.id === inElemId );

        return mapObjFinList;
    }

    //Объявление нового объекта с измерялками
    getMapBoxDraw(){

        return new mapboxDraw({
            
            displayControlsDefault : true,
            styles   : drawStyles.styleMapBoxDrawList(),
            controls : {
                polygon     : true,
                line_string : true,
                point       : true,
                trash       : true
            }
        });
    }

    //Акативация нового инструмента
    setPropForMark( inItem ){

        let drawTypeName = null;

        switch( inItem ){

            //Линия 
            case 2 : drawTypeName = '.mapbox-gl-draw_line';    break;

            //Полигон 
            case 3 : drawTypeName = '.mapbox-gl-draw_polygon'; break;
            
            //Точка 
            case 1 : 
            case 4 :
            case 5 :
            case 6 : drawTypeName = '.mapbox-gl-draw_point';   break;
    
            //Корзина (удаление) 
            case 0 : drawTypeName = '.mapbox-gl-draw_trash';   break;
        }

        document.querySelector( drawTypeName ).click();
    }

    //Вызов действия объекта карты
    async setActionInstrumnentGoMath( inSelObjDraw ){
        
        const sureMathCalcTitle = lang.getMessages('sureMathCalc');
        const nameAction = 'setActionMathCalc';

        if( !inSelObjDraw )
            inSelObjDraw = ext.getSelectDraw( this.stateData.mapObjListDraw );

        if( !inSelObjDraw )
            return;

        if( inSelObjDraw.geometry.type === 'LineString' || inSelObjDraw.geometry.type === 'Polygon' ){

            this.commitData( 'setCurrentMapValue', { field : 'activeModal',      value : true });
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
    setDeleteExistObject( inSelObjDraw ){
        
        const sureDelTitle = lang.getMessages('sureDelObj');
        const nameAction = 'setActionDelMapObj';

        if( !inSelObjDraw )
            inSelObjDraw = ext.getSelectDraw( this.stateData.mapObjListDraw );

        this.commitData( 'setCurrentMapValue', { field : 'activeModal',      value : true });
        this.commitData( 'setCurrentMapValue', { field : 'activeModalTitle', value : sureDelTitle });

        this.commitData( 'setCurrentMapValue', { 
            field : 'activeConfrmDialogAction', 
            value : {
                nameAction : nameAction,
                dataAction : inSelObjDraw
            } 
        });
    }

    //Клик на карту - проходим по инструментам, смотрим, на какой нажали
    setPreparePopupProp( inEvent ){

        let inInst = this.stateData.currentInstrument;
        let selectDrawItem = ext.getSelectDraw(this.stateData.mapObjListDraw);
        
        let dataDrawArr = this.stateData.mapObjListDraw.getAll().features;
        let curDrawItem = dataDrawArr[ dataDrawArr.length - 1 ];

        //Если нет выбранного объекта в режиме редактирования - выходим
        if( !curDrawItem ) 
            return;
        
        //Линия
        if ( inInst === 2 && curDrawItem.geometry.coordinates.length >= 2 ) {

            this.setAddPopUp( curDrawItem, [ inEvent.lngLat.lng, inEvent.lngLat.lat ] );
        }
        //Полигон
        else if ( inInst === 3 && curDrawItem.geometry.coordinates[0].length > 3 ) {

            let coord  = this.mathCalcHeight.getStartCoord( curDrawItem );
            this.setAddPopUp( curDrawItem, [ coord[0], coord[1] ] );
        } 
        //Клик на имеющийся объект
        else if ( selectDrawItem ){

            this.setImagesForDrawObjects();
            this.setAddPopUp( curDrawItem , [ inEvent.lngLat.lng, inEvent.lngLat.lat ] );  
        }
    }
    
    //Двойной клик на карту - смотрим, попали ли на какой-нибудь инструмент 
    async setRequestActionInstr( inSelDraw ){
        
        //Перегружаем сервис вычислений
        let mathCalcHeightWithModel = new MathCalcHeight( this.stateData.mapModel, this.stateData.currentMainIndex, this.stateData.currentAddIndex );
        let measurItem = this.stateData.currentInstrument;

        //Если пусто - выходим
        if ( !inSelDraw && measurItem === 0 )
            return;

        //Линия
        else if ( measurItem === 2 || inSelDraw.geometry.type === 'LineString' ) {

            let resHeights = await mathCalcHeightWithModel.getHeightsLine( inSelDraw );
        }

        //Полигон
        else if ( measurItem === 3 || inSelDraw.geometry.type === 'Polygon' )
            await mathCalcHeightWithModel.getVolume( inSelDraw );        
    }

    //Замена дефолтовых маркеров на более красивые
    setImagesForDrawObjects( inDrawId ){
        
        const inMapObj = this.stateData.curMap;

        this._deleteSorceAndLayersFromMap( inDrawId );

        const inIsMarkersActive = this.stateData.isMarkersActive;
        const inIsMeasureActive = this.stateData.isMeasureActive;
        const inTblMapObj = this.stateData.mapObjListTable;
        const inListOfColors  = ext.getListColor();
        const featureDrawList =  this.getFetureList( inDrawId );

        if( !featureDrawList )
            return;

        featureDrawList.forEach( item => {
            
            if( item ){

                let imgForDraw = '';
                let drawType = item.geometry.type;
                let drawCoord = item.geometry.coordinates;
                let drawTypeView = item.properties.typeView;
                let inColor  = ext.getValueFromNum( inListOfColors, item.properties.numColor );
                let isReport = item.properties.isReport !== null ? item.properties.isReport : true;
                
                if( inTblMapObj ){

                    let elemFromTblMapObj = inTblMapObj.find( x => x.id === item.id );
                    inColor  = elemFromTblMapObj ? ext.getValueFromNum( inListOfColors, elemFromTblMapObj.numColor ) : inListOfColors[0].value;
                    isReport = elemFromTblMapObj ? elemFromTblMapObj.isReport : false;
                }

                if( drawType !== 'LineString' && drawType !== 'Polygon' && drawTypeView && inIsMarkersActive ){

                    //imgForDraw = require(`content/images/${drawTypeView}Draw.png`);
                    imgForDraw = require(`content/images/${drawTypeView}.png`);
                    
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
                                'icon-size'  : 0.75
                            }
                        });
                    });

                } else {
                    
                    if( isReport && inIsMeasureActive ){

                        if ( drawType === 'LineString' ){

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
                                    "layout" : {
                                        "line-join" : "round",
                                        "line-cap"  : "round"
                                    },
                                    "paint" : {
                                        "line-color" : inColor,
                                        "line-width" : 5
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
                                "layout" : { },
                                "paint"  : {
                                    'fill-color'   : inColor,
                                    'fill-opacity' : 0.5
                                }
                            });
                        }
                    }
                }
            }
        });
    }

    //Меняем видимость объектов класса mapBoxDraw на карте
    setToggleDrawObjFromMap( isShow ){

        const inMapObj  = this.stateData.curMap; 
        const mapStyles = inMapObj.getStyle();
        const circleLayerArr = mapStyles.layers.filter( i => {    
            if( i.source )
                return i.source.match(/mapbox-gl-draw*/);
            else
                return null;
        });

        circleLayerArr.forEach( x => inMapObj.setLayoutProperty( x.id, 'visibility', isShow ? 'visible' : 'none' ) );
        this._deleteAllPopup();
    }

    //Закрываем все поповеры
    _deleteAllPopup(){

        document.querySelectorAll('.mapboxgl-popup-content').forEach( x=> x.remove() );
        document.querySelectorAll('.mapboxgl-popup-tip').forEach( x=> x.remove() );
    }

    //Удаление всех нарисованных меток
    _deleteSorceAndLayersFromMap( inElemId ){

        const inMapObj  = this.stateData.curMap;
        
        if( !inMapObj ) 
            return;

        const mapStyles = inMapObj.getStyle();
        let circleLayerArr = [];

        //Находим все слои, что означают точки, линии и полигоны
        if( !inElemId ){

            circleLayerArr = mapStyles.layers.filter( x => 
                
                ( x.type === 'symbol' || x.id.match(/lineObj.*/) || x.id.match(/polygonObj*/) )
            );
        }
        else {

            circleLayerArr = mapStyles.layers.filter( x => 
                
                ( x.id.indexOf(inElemId) != -1 )
            );
        }

        //Удаляем все эти точки
        circleLayerArr.forEach(x => {

            inMapObj.removeLayer(x.id);
            inMapObj.removeSource(x.source);
        });

        //И закрываем поповеры
        this._deleteAllPopup();
    }

    //Активация поповера
    setAddPopUp( drawItem, xyCoord ){

        if ( !drawItem ) 
            return;

        let _draw = Array.isArray(drawItem) ? drawItem[0] : drawItem;

        if( !xyCoord ){

            switch ( _draw.geometry.type ) {

             case 'Polygon'    : xyCoord = _draw.geometry.coordinates[0][0]; break;
             case 'LineString' : xyCoord = _draw.geometry.coordinates[0];    break;
             default           : xyCoord = _draw.geometry.coordinates;
            }
        }

        const mapPartInfo = _draw.geometry.type !== 'Point' ?
            this.mathCalcHeight.getTotalDistanceStr( _draw, true ) :
            ( _draw.properties.pointInfo != undefined ) ? 
                _draw.properties.pointInfo : lang.getMessages('noComment');

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