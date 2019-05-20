import ext from 'services/AddExtension'

const mutations = {

  setMapStart( state, inMap ){
    
    state.curMap = inMap;
    state.showTableMap = false;
  },

  setMapObjListDefault(state){

    state.isDrawActive     = true;
    state.isMarkersActive  = true;
    state.isMeasureActive  = true;
    
    try {
      state.curMap.removeControl( state.mapObjListDraw );
    }
    catch( error ) {
      //console.log( error );
    }

    state.mapObjListDraw   = null;
    state.mapObjListServer = null;
    state.mapObjListTable  = null;
  },

  setModelMap( state, resData ){

    if( !resData )
      return;

    const rMap    = resData.map;
    const rLayers = resData.layers;

    //Получаем список дат и чистим его от дублей
    let mapDateConfigList = rLayers.map(item => item.createDtStr);
    
    state.mapModel = {

      accessToken              : resData.accessToken,
      center                   : [ rMap.centerLon, rMap.centerLat ],
      mapDateConfigList        : ext.getArrWithoutDublicate(mapDateConfigList),
      frameSrcConfigList       : rLayers.map(item => item.threeDModelFrame),
      heightsMapIdConfigList   : rLayers.map(item => item.heightsMapIdMb),
      heightsMapNameConfigList : rLayers.map(item => item.heightsMapNameMb),
      layers                   : rLayers,
      map                      : rMap
    };
  },

  setCurrentMapValue( state, {field, value} ){
    
    state[field] = value;
  },

  setLayersRenderEnable(state){

    state.isLayersRender = true;
  },

  setLayersRenderDisable(state){

    state.isLayersRender = false;
  },

  setIndexOfLayer : ( state, { date, idObj } )=>{

    //Проставляем индексы в зависимости от изменения слоев
    const mdConfList = state.mapModel.mapDateConfigList;
    const layerIndex = mdConfList.indexOf(date);

    if( idObj === 'mainLayer' )  
      state.currentMainIndex = layerIndex;
    else
      state.currentAddIndex = layerIndex;

    //change mainLayerId and addLayerId
    this.a.setCurrentMapValue( state, {
      field : `${idObj}Id`, 
      value : state.mapModel.layers[layerIndex].id
    });
  },

  setPrevSelecting : state => {
    
    //Дефолтим состояние опций, при необходимости добавим еще
    state.showColorLayer     = false;
    state.show3DFrame        = false;
    state.showGraphPlotChart = false;

    //Проставляем параметр, отвечающий за наличие цветового слоя в текущей съемке
    state.isExistColorCurrentLayer = state.mapModel.layers[state.currentMainIndex].colorTiff;
  },

  setShowMode : ( state, item ) => {
    
    if(!item.name)
      state[`${item}`] = !state[`${item}`];
    else 
      state[`${item.name}`] = item.value;
  },

  //Регулируем отображение модалок
  setShowMarkerAndInstrumentsMode : ( state, inData ) => {

    //На входе объект с текущим выбранным инструментом и выделенным объектом, от них зависит, какое окно будем открывать
    let curInst  = inData.ins;
    let curDraw  = inData.curDraw;
    let drawInfo = null;

    if( !curInst && !curDraw )
      return;

    if( curDraw ){
      
      //Смотрим на тип объекта
      drawInfo = ext.getTypeObjForDraw( curDraw, state.listOfInstruments, curInst );
      if(!drawInfo)
        return;

      curInst = drawInfo.id;
      
      //Если это объект, на который кликнули - смотрим, линия это или полигон, если да - открываем модалку с графиком 
      if( curInst === 2 || curInst === 3 ){

        state.showGraphPlotChart = true; 
      }
    }

    //Если это маркеры - отрываем модалку маркеров
    if( curInst >= 4 )
      state.showPhoto = true;
    
    //И регулируем вкладки, в зависимости от типа
    //Фото
    if( curInst === 5 ){

      state.isMedia = true;
      state.isPhotoMedia = true;

    //Видео
    } else if ( curInst === 6 ){

      state.isMedia = true;
      state.isPhotoMedia = false;

    //Точка
    } else if ( curInst === 4 ){

      state.isMedia = false;
      state.isPhotoMedia = false;
    } 
  },

  set3dFrame : (state, mapObj) => {
    
    state.selected3dFrameSrc =
      mapObj.frameSrcConfigList[state.currentMainIndex];
  },

  setPrevChangeOpacity : (state, inValue) => {

    state.opacityOfLayer = inValue / 100;
  },

  setCleanObjectForm : ( state ) => {

    state.nameObject    = '';
    state.commentObject = '';
    state.dateObject    = new Date();
  }
}

export default mutations;