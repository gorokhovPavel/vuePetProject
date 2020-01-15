import api from 'api/apiConfig'
import ext from 'services/AddExtension'
import Layer from 'services/Layer'
import lang  from 'language/Translate'

const privateActionsMap = {

    //Перегрузка таблицы с объектами, и перерисовка самих объектов
    _setReloadMapObj( { state, commit, getters } ) {
      commit( 'setMapObjListDefault' );
      this._setRenderDraw({ state, commit, getters });
      commit('setCurrentMapValue', { field : 'isDrawShow', value : true } );
    },

    //Рендерим объекты измерения на карту
    _setRenderDraw( { state, commit, getters } ) {
      //Активируем начальный элемент mapBoxDraw, что ответчает за пользовательское управление элементами карты
      commit( 'setCurrentMapValue', { field : 'mapObjListDraw', value : getters.getInstrument.getMapBoxDraw() });
      //Выполняем запрос, что вернет массив объектов с готовыми пользовательскими элементами
      this._setLoadMapObjects({ state, commit })
        .then( result=> {
            //Закрасим их
            getters.getInstrument.setImagesForDrawObjects();
            return result;
          }
        ).then( result=> {
          //Добавим коллекцию из БД в элемент mapBoxDraw ( без setTimeout не обойтись, надо асинхронно, фоном грузить элементы )
         setTimeout(()=>{
          state.mapObjListDraw.add({
            type : 'FeatureCollection',
            features : result
          });
         }, 1 );
         return state.mapObjListDraw;
        }).then( result=> {
          //Ну а после добавим заполненный mapBoxDraw базовыми элементами на главную карту
          state.curMap.addControl( result );
        });
    },

    //Выгружаем json объектов измерения из БД
    _setLoadMapObjects( { state, commit } ) {
      return new Promise( resolve=> {
        ext.setForAxiosWithState( commit, {
          letUrlAction : api.getUserMapObjects( state.mapId ), 
          goodCallBack : response => {
            if( !response.data ) return;
            try {
              const resObjList = JSON.parse( response.data.mapObjListJson );
              commit( 'setCurrentMapValue', { field : 'mapObjListServer', value : resObjList } );
              resolve(resObjList);

              // if ( resObjList.length > 0 ) {
              //   commit( 'setCurrentMapValue', { field : 'mapObjListServer', value : resObjList } );
              //   resolve(resObjList);
              // }
            } catch(err) {
              console.log(err);
            }
          }
        });
      });
    },
  
    //Смотрим, сформированы ли основные свойства объекта карты
    _getCheckMainMapProperty( inObjMap ) {
      let isExistStyleInMap = true;
      try {
        inObjMap.getStyle();
        inObjMap.getLayer();
      } catch(err){
        isExistStyleInMap = false;
      }
      return isExistStyleInMap;
    },

    //Вывод детектора изменений
    _setRenderPointsChange( {state, commit}, inPointsOfChanges ) {
      const inMap = state.curMap;
      let layerItem = new Layer(inMap);
      //Удаляем точки изменения слоев, если стоит флаг снятия слоя детектора
      if( !inPointsOfChanges )
        layerItem.deletePointOfChange();
      else {
        if ( inPointsOfChanges.length !== 0  ) {
          commit( 'setCurrentMapValue', { field : 'loading', value : true });
          new Promise(resolve=>{
            resolve(layerItem.setPointsOfChange( inPointsOfChanges ));
          }).then( ()=> {
            setTimeout( ()=> {
              commit( 'setCurrentMapValue', { field : 'loading', value : false });
            }, 1000);
          });
        } else {
          ext.setErrorNotification( commit, lang.getMessages('pointsChangeError') );
          //Прячем чекбокс детектора и шкалу, выводим ошибку
          commit( 'setCurrentMapValue', { field : 'showPointsChangesCheck', value : false });
          commit( 'setCurrentMapValue', { field : 'showColorScale', value : false });
        }
      }
      //Чистим ресурсы 
      layerItem = null;
    },

    //Создаем лэйер и формируем слой для отчета
    //Так как нам не нужно ничего коммитить и нужно сформировать только один слой
    _setReportLayer({state}, obj) {
      let layerItem = 
        new Layer( obj.snapshotMap, state.mapModel, state.showColorLayer, state.currentMainIndex, state.currentAddIndex, state.opacityOfLayer );
      layerItem.setReportLayer( obj.isColor );
      layerItem = null;
    }
}

export default privateActionsMap;