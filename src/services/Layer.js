export default class Layer{
  
  constructor( elementOfMapBox, elementOfMap, inColorFlag, inMainIndex, inAddIndex, inOpacity ){
    
    this.inMap = elementOfMapBox;

    if( elementOfMap ){
      
      this.mapDateConfigList = elementOfMap.mapDateConfigList;
      this.layersList = elementOfMap.layers;
      this.mapDb = elementOfMap.map;
      this.colorFlag = inColorFlag;
      this.mainIndex = inMainIndex;
      this.addIndex = inAddIndex;
      this.opacity = inOpacity;
    }
  }

  setPointOfChange(data){

    let gjName  = 'gjPoints';
    let gjPoint = {
        type: "FeatureCollection",
        features: []
    }

    this.inMap.addSource(gjName, {
        "type": "geojson",
        "data": gjPoint
    });

    for (let i = 0; i < data.length; i++) {
        gjPoint.features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [data[i].lon.toString(), data[i].lat.toString()]
            },
           "properties": {
               'color': data[i].groupHeight
           }
        });
    }

    this.inMap.getSource(gjName).setData(gjPoint);
    this.inMap.addLayer({
      id     : gjName + 'Layer',
      source : gjName,
      type   : 'circle',
      paint  : {
          'circle-color' : {
              property : 'color',
              stops : [
                [-5, '#0000FF'],
                [-4, '#2E64FE'],
                [-3, '#58ACFA'],
                [-2, '#81DAF5'],
                [-1, '#81F7F3'],
                [1, '#F3F781'],
                [2, '#F5DA81'],
                [3, '#FAAC58'],
                [4, '#FE642E'],
                [5, '#FF0000']
              ]
          },
          'circle-radius'  : 2,
          'circle-opacity' : 0.8
      }
    });
  }

  deletePointOfChange(){

     //Находим все слои, что означают точки
    let circleLayerArr = this.inMap.getStyle().layers.filter(x => {

      return x.type === 'circle' && x.source.indexOf('gjPoint') !== -1;
    });

    //Удаляем все эти точки
    circleLayerArr.forEach(x => {
      
      this.inMap.removeLayer(x.id);
      this.inMap.removeSource(x.source);
    });
  }

  //устанавливаем слой для отчета или цветовой или обычный
  setReportLayer(isColor){
  
    let mainDate = this.mapDateConfigList[this.mainIndex];
   
    this.layersList.forEach((item, i) => {
      if(item.createDtStr === mainDate){
          this._addTileset(`${i}`, item.defaultTiff, false);
          if(isColor)        
            this._addTileset(`colorStyle${i}`, item.colorTiff, true);
      }
    })
  }

  //Стартовые параметры при загрузке страницы
  setStartOptionsOfLayers(){
    
    const mainDate = this.mapDateConfigList[this.mainIndex];
    const addDate  = this.mapDateConfigList[this.addIndex];

    this.layersList.forEach( ( item, i ) => {
      
      if( item.createDtStr === mainDate || item.createDtStr === addDate ){
        this._addTileset(`defaultStyle${i}`, item.defaultTiff, false);
        this._addTileset(`colorStyle${i}`,   item.colorTiff, true);
      
      } else {

        let mainId = `defaultStyle${i}`;
        if( this.inMap.getStyle().layers.find( i => i.id === mainId ) )
          this._deleteTileset(`defaultStyle${i}`);

        let colorId = `colorStyle${i}`;
        if( this.inMap.getStyle().layers.find( i => i.id === colorId ))
          this._deleteTileset(`colorStyle${i}`)
      }
    });

    this._setAllLayout();
  }

  _deleteTileset(objId){

    this.inMap.removeLayer( objId );
    this.inMap.removeSource( objId );
  }

  _addTileset(objId, tileset, isColor){

    if ( !tileset || this.inMap.getLayer(objId) )
      return;
  
      let layerProperty = {
        id: objId,
        type: 'raster',
        source: {
          type: 'raster',
          url: 'mapbox://' + tileset,
          tileSize: 256
         
        },
        paint: {
          'raster-opacity': 1,
        }
      };

      if(isColor){
        layerProperty.paint['raster-contrast'] = 0.99;
        layerProperty.paint['raster-opacity'] = 0.01;
      }
  
      let circleLayerArr = this.inMap.getStyle().layers.filter(i => {
        if(i.source)
          return i.source.match(/mapbox-gl-draw*/);
        else
          return null;
      });
     
      if(circleLayerArr.length > 0)
        this.inMap.addLayer(layerProperty, circleLayerArr[0].id);
      else
        this.inMap.addLayer(layerProperty);

    if ( isColor )
     this.inMap.setPaintProperty(objId, 'raster-saturation', 0.6);
  }

  _setAllLayout() {

    this._setChangeMainLayout('defaultStyle');
    this._setChangeMainLayout('colorStyle');
  }

  //Вызов двумерной обертки и внутри него фильтр по прамаетрам для слоев
  _setChangeMainLayout(layerStyle) {

    this._setTwoCycleForFilter(
      (inI, inJ) => 
        this._setPropertyToLayer(
          layerStyle, 
          inJ, 
          ( inI === this.mainIndex ), 
          ( inI === this.addIndex )
        )
    );
  }

  //Обертка в двумерный массив и последующий внутри него вызов входной функции
  _setTwoCycleForFilter(funForFilter) {

    this.mapDateConfigList.forEach((curDt, i) => {

      this.layersList.forEach((item, j) => {

        if (item.createDtStr == curDt)
          funForFilter(i, j);
      });
    });
  }

  //Установка параметров для слоев, основного или цветового
  _setPropertyToLayer(nameSourse, idLayer, isVisibleDef, isVisibleAddDef) {

     let idSourse = nameSourse + idLayer;
     try {

      if (!this.inMap.getLayer || !this.inMap.getLayer(idSourse))
        return;

      if (idSourse.indexOf('colorStyle') !== -1) {
        
        this.inMap.setPaintProperty(idSourse, 'raster-contrast', (this.colorFlag && isVisibleDef) ? 0.99 : 0);
        this.inMap.setPaintProperty(idSourse, 'raster-opacity', (this.colorFlag && isVisibleDef) ? 0.01 : 0);
      } else {

        let opacityFinValye = 0.01;

        if (isVisibleDef)
          opacityFinValye = this.opacity;
        else {
          if (isVisibleAddDef)
            opacityFinValye = (1 - this.opacity);
        }

        this.inMap.setPaintProperty(idSourse, 'raster-opacity', opacityFinValye);
      }
    } catch (error) {

      console.log(error.message);
    }
  }
}
