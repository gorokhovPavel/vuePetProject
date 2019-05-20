import api               from 'api/apiConfig'
import ext               from 'services/AddExtension'
import Instrument        from 'services/InstrumentsData'
import lang              from 'language/Translate'
import privateActionsMap from './privateActionsMap' 
import buildChart        from 'services/BuildChart'

const actions = {

    //Устанавливаем слои на нашу мини карту для отчета
    setReportLayer( { state, commit }, obj ){

      privateActionsMap._setReportLayer({state, commit}, obj);
    },

    //Наполняем мини карту пользовательскими объектами для отчета
    setAdditionalPoints({state}, map){

      privateActionsMap._loadUserObjects( {state}, map );
    },

    //Обертка лодера над отчетом и вывод ошибок в консоль
    getActionReportWithLoader( { commit }, actionReport ){

      ext.extForAxiosWithState( commit, {
          
        letUrlAction : actionReport
      });
    },

    //Убираем или добавляем на карту возможность изменения структуры объектов
    setActionChangeDrawMode( { state, commit, getters }, inStateElem ){

      commit( 'setShowMode', inStateElem );
      getters.getInstrument.setToggleDrawObjFromMap(state[inStateElem]);
    },

    //Обработка модалок, точка входа
    setActionModal : ( { state, commit, dispatch } ) => {

      let actionData = state.activeConfrmDialogAction;

      commit('setCurrentMapValue', { field : 'activeModal', value : false });
      dispatch( actionData.nameAction, actionData.dataAction );
    },
  
    //Запуск расчета профиля высот и объемов
    setActionMathCalc( { state, commit, getters }, inSelDraw ){

      //Прячем предварительно окна с графиками и маркерами
      commit( 'setCurrentMapValue', { field : 'showGraphPlotChart', value : false } );
      commit( 'setCurrentMapValue', { field : 'showPhoto',          value : false } );

      //Запуск метода расчета высот по измерениям
      ext.extForAxiosWithState( commit, {
           
        letUrlAction : getters.getInstrument.setRequestActionInstr( inSelDraw ), 
        goodCallBack : () => {
          //Активация панели маркеров и графиков
          commit( 'setShowMarkerAndInstrumentsMode', { ins : state.currentInstrument, curDraw : inSelDraw } );
        }
      });
    },

    //Удаление объекта с локальной таблицы
    setActionDelMapObj( { state, commit }, inSelDraw ){

      //Копия для выборки
      const arrServerMapObj = state.mapObjListServer;

      //Грохаем предыдущие версии таблиц - иначе не перегрузится компонент :\
      commit( 'setCurrentMapValue', { field : 'mapObjListServer', value : null } );
      commit( 'setCurrentMapValue', { field : 'mapObjListTable',  value : null } );
      
      //Второе условие для перегрузки компонента - тайминг :\\
      setTimeout( ()=> {

        //Убиваем текущую измерялку
        state.mapObjListDraw.trash();
        commit( 'setCurrentMapValue', { field : 'currentInstrument', value : 0 } );

        if( inSelDraw ){

          //Сначала грохаем сам элемент с карты
          const elemDraw = state.mapObjListDraw.getAll().features.find( x => x.id === inSelDraw.id );
          const elemDrawFeature = state.mapObjListDraw.add( elemDraw );
          
          state.mapObjListDraw.delete( elemDrawFeature );

          //Ну а потом удаляем его из таблицы объектов
          const arrServerMapObjIdList = arrServerMapObj.map( x => x.id);
          const indexCurrElem = arrServerMapObjIdList.indexOf( inSelDraw.id );
          
          if( indexCurrElem !== -1 )
            arrServerMapObj.splice( indexCurrElem, 1 );
        }
      
        //Перезаписываем
        commit( 'setCurrentMapValue', { field : 'mapObjListServer', value : arrServerMapObj } );
      }, 100 );
    },

    //Обертка над возвратом или сохранением схем
    setConfirmActionMapObj( { commit, dispatch }, inSaveAction ){

      let actionPromise = new Promise(
        resolve => resolve( dispatch( 'setActionChangeColorAndReport', inSaveAction ) )
      );

      actionPromise.then( () => {
        if( inSaveAction ){
          commit( 'setCurrentMapValue', { field : 'activeSnack',      value : true } );
          commit( 'setCurrentMapValue', { field : 'activeSnackTitle', value : lang.getMessages('saveMapObjSuccess') } ); 
        }
      });
    },

    //Собсно, возврат или сохранение схем
    setActionChangeColorAndReport : ( { state, commit, getters }, typeAction ) => {

      if( !typeAction )
        privateActionsMap._setReloadMapObj( { state, commit, getters } );
      else {

        const listMapObjTbl  = state.mapObjListTable;
        const lastMapObjDraw = state.mapObjListDraw.getAll().features;

        const lastMapObjDrawUp = lastMapObjDraw.map( item => {
          
          if( listMapObjTbl ){
            let elemFromTblMapObj = listMapObjTbl.find( x => x.id === item.id );
            item.properties.isReport = elemFromTblMapObj.isReport;
            item.properties.numColor = elemFromTblMapObj.numColor;
          }

          return {
            geometry   : item.geometry,
            id         : item.id,
            properties : item.properties,
            type       : item.type,
          }
        });

        const lastMapObjDrawJson = JSON.stringify( lastMapObjDrawUp );
       
        const localObjMap = {

          MapId : state.mapId,
          MapObjListJson : lastMapObjDrawJson
        }

        ext.extForAxiosWithState( commit, {
        
          letUrlAction : api.postSaveObject(localObjMap)
        });
      }
    },

    //Стартовая загрузка данных для компонета карты
    setLoadMenuData( {commit} ){

      commit( 'setCurrentMapValue', { field : 'menuDataList',  value : [] }),

      ext.extForAxiosWithState( commit, {
        
        letUrlAction : api.getMenuApi(), 
        goodCallBack : response => commit('setCurrentMapValue', { field : 'menuDataList',  value : response.data }) 
      });
    },
  
    //Стартовая загрузка данных для меню
    setLoadMapData( { state, commit, dispatch } ){

      commit( 'setMapObjListDefault' );
      commit('setCurrentMapValue', { field : 'mapModel', value : null }),
  
      ext.extForAxiosWithState( commit, {

        letUrlAction : api.getMapApi(state.mapId), 
        goodCallBack : response => {
          
          commit('setModelMap', response.data );
          dispatch('setActionInitInstrumentData');
        }
      });
    },
    
    //Задаем параметры рендеринга
    setRenderDefault({ commit, dispatch }, isRunRender ){

      commit('setCurrentMapValue', { field : 'currentInstrument', value : 0 } );
      commit('setLayersRenderEnable');

      if(isRunRender)
        dispatch('setMapRendering');
    },

    //Постоянный рендеринг карты, реагирующий на каждый чих
    setMapRendering( { state, commit, getters } ){

      const inMap = state.curMap;
      
      //Если не сформирован главный объект карты - выходим
      if(!inMap)
        return;

      //Рендеринг отснятых слоев
      if( state.isLayersRender )
        privateActionsMap._setRenderLayers( { state, commit } );

      //Рендеринг имеющихся маркеров и интсрументов измерения
      if( !state.mapObjListDraw )  
        privateActionsMap._setRenderDraw( { state, commit, getters } );
       
      //Рендеринг точек изменения
      if( state.pointsOfChanges !== null )
        privateActionsMap._setRenderPointsChange( { state, commit } );
    },
  
    //Присваиваем конструктуру сервиса InstrumentData объеты состояний
    setActionInitInstrumentData( { state, commit, dispatch } ){

      commit( 'setCurrentMapValue', { field : 'instrumentData', value : new Instrument( state, commit, dispatch ) });
    },

    setChangeDatesOfLayers({commit}){
      
      commit('setShowMode', 'showIsChangeMainAddLayer' );
  
      const mainLayer = document.querySelector(`#mainLayer`);
      const addLayer  = document.querySelector("#addLayer");
      let partValue   = 0;
  
      partValue = mainLayer.value;
      mainLayer.value = addLayer.value;
      addLayer.value = partValue;

      commit('setIndexOfLayer', {date : mainLayer.value, idObj : 'mainLayer'});
      commit('setIndexOfLayer', {date : addLayer.value,  idObj : 'addLayer'});
    },
  
    setChangeZoom : (commit, isUp) => {
  
      let elemZoom = isUp ? ".mapboxgl-ctrl-zoom-in" : ".mapboxgl-ctrl-zoom-out";
      document.querySelector(elemZoom).click();
    },
  
    setGoHomeLocation :( { state } )=>{
  
      let mapModel = state.mapModel.map;
      
      state.curMap.fitBounds([ 
        [mapModel.minLon, mapModel.minLat], 
        [mapModel.maxLon, mapModel.maxLat] 
     ], {maxZoom: 15});
    },

    setActivateDrawAction : ( { commit, getters }, inTypeInstrumnet ) => {
  
      commit('setLayersRenderDisable');
      commit('setCurrentMapValue', { field : 'currentInstrument', value : inTypeInstrumnet } );
        
      getters.getInstrument.setPropForMark( inTypeInstrumnet );
    },
  
    setMouseDownUpOnGraph( commit, isUp ){
  
        let parentFrame = document.querySelector('.measGraphMapPos');
        
        if (parentFrame.classList){
  
            if (isUp)
              parentFrame.className = parentFrame.className + ' move';
            else 
              parentFrame.className = parentFrame.className.replace(/\bmove\b/g, '');
        }
    },
  
    setActionClick( { state, getters, commit }, event ){
      
      //Активация инструмента
      getters.getInstrument.setPreparePopupProp( event );

      //Активация панели маркеров и графиков для новых элеметнов
      commit( 'setShowMarkerAndInstrumentsMode', { ins : state.currentInstrument, curDraw : null } );
    },
    
    setActionDblClick( { getters }, event ){

      event.preventDefault();
      getters.getInstrument.setActionInstrumnentGoMath();
    },

    setVisible3d( {}, isMainlayer ) {
      
      const myDivObj = document.querySelector('#graphPlotChart');
      
      if(!myDivObj.data)
        return;

      let indexBut = isMainlayer ? 0 : 1;
      myDivObj.data[indexBut].visible = ( myDivObj.data[indexBut].visible === 'visibility' ) ? 'legendonly' : 'visibility';
      buildChart.setResstartChart(myDivObj);
    },

    setShowChangeOfLayers( {state, commit}, isShowMode ){

      commit('setCurrentMapValue', { field : 'showColorScale',  value : isShowMode });

      if(isShowMode){

        ext.extForAxiosWithState( commit, {
        
          letUrlAction : api.getChangeResults(state.mainLayerId, state.addLayerId), 
          goodCallBack : response => {
            
            commit('setCurrentMapValue', { field : 'pointsOfChanges',  value : response.data });
          }
        });
      } else 
        commit('setCurrentMapValue', { field : 'pointsOfChanges',  value : -1 });
    },

    async setActionUploadMedia( {commit, state},  ){

      //inDropZone.processQueue(); 
    },

   
}

export default actions;