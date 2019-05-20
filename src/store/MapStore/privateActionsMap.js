import api from 'api/apiConfig'
import ext from 'services/AddExtension'
import Layer from 'services/Layer'

const privateActionsMap = {
    
    _setLoadMapObjects( { state, commit } ){
      
      ext.extForAxiosWithState( commit, {
    
        letUrlAction : api.getUserMapObjects( state.mapId ), 
        goodCallBack : response => {

          if( !response.data ) 
            return;
            
          const resObjList = JSON.parse( response.data.mapObjListJson );
  
          if ( resObjList.length > 0 ){
            
            commit('setCurrentMapValue', { field : 'mapObjListServer', value : resObjList });

            state.mapObjListDraw.add({
              type : 'FeatureCollection',
              features : resObjList
            });
          }
        }
      });
    },

    _setRenderDraw( { state, commit, getters } ){

      commit( 'setCurrentMapValue', { field : 'mapObjListDraw',  value : getters.getInstrument.getMapBoxDraw() });
      this._setLoadMapObjects( { state, commit, getters } )
      state.curMap.addControl( state.mapObjListDraw );
    },
    
    //Перегрузка таблицы с объектами, и перерисовка самих объектов
    _setReloadMapObj( { state, commit, getters } ){

      commit( 'setMapObjListDefault' );
      this._setRenderDraw( { state, commit, getters } );
      commit('setCurrentMapValue', { field : 'isDrawShow', value : true } );
    },

    _setRenderLayers( { state, commit } ){
      
      const inMap = state.curMap;

      //Eсли не заполнены основные свойства - выходим, нет смысла формировать объект Layer
      if( !this._getCheckMainMapProperty(inMap) )
        return;

      //Формируем 3д модель
      //Слишком много памяти сжирается из-за фоновой загрузки 3д
      commit( 'set3dFrame', state.mapModel );

      //Формируем отснятые слои
      let layerItem = 
        new Layer( inMap, state.mapModel, state.showColorLayer, state.currentMainIndex, state.currentAddIndex, state.opacityOfLayer );
  
      layerItem.setStartOptionsOfLayers();

      //Чистим ресурсы 
      layerItem = null;
      commit('setLayersRenderDisable');
    },
  
    //Смотрим, сформированы ли основные свойства объекта карты
    _getCheckMainMapProperty( inObjMap ){

      let isExistStyleInMap = true;

      try {
        
        inObjMap.getStyle();
        inObjMap.getLayer();
      } catch(err){
        
        isExistStyleInMap = false;
      }

      return isExistStyleInMap;
    },

    _setRenderPointsChange( {state, commit} ){
      
      const inMap = state.inMap;
      let layerItem = new Layer( inMap );
  
      //Удаляем или прогружаем точки изменения слоев, если есть
      if( state.pointsOfChanges === -1 )
        layerItem.deletePointOfChange();
        
      else if ( state.pointsOfChanges.length !== 0  )
        layerItem.setPointOfChange( state.pointsOfChanges );
  
      commit('setCurrentMapValue', { field : 'pointsOfChanges',  value : null });
  
      //Чистим ресурсы 
      layerItem = null;
    },

     //Создаем лэйер и формируем слой для отчета
    //Так как нам не нужно ничего коммитить и нужно сформировать только один слой
    _setReportLayer({state}, obj){
      
      let layerItem = 
        new Layer( obj.snapshotMap, state.mapModel, state.showColorLayer, state.currentMainIndex, state.currentAddIndex, state.opacityOfLayer );
      
      layerItem.setReportLayer( obj.isColor );
      layerItem = null;
    },
}

export default privateActionsMap;