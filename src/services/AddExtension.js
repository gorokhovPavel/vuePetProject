export default class AddExtension {

    static getListColor(){

        return [
            { id : 1, value : '#ff0000' },
            { id : 2, value : '#00ff00' },
            { id : 3, value : '#448aff' },
            { id : 4, value : '#ffff00' },
            { id : 5, value : '#ffa500' },
            { id : 6, value : '#808080' },
        ]
    }

    //Возврат значения параметра по номеру в списке
    static getValueFromNum( listOfParam, inNumOfColor ){
    
        let elemColor = listOfParam.find( x => x.id === inNumOfColor );
        let goodElemColor = elemColor || listOfParam[0];
        return goodElemColor.value;
    }

    //Оборачиваем запрос в лоадер и записываем ошибку в консоль
    static extForAxiosWithState( commit, { letUrlAction, goodCallBack, badCallBack } ){
  
        commit( 'setCurrentMapValue', { field : 'loading',  value : true } );
        
        //Если обработчики не проставлены - просто заносим ошибку в консоль и отключаем лоадер
        letUrlAction.then(
          response => this._setRequestProcessing( commit, goodCallBack, response ),
          reject   => this._setRequestProcessing( commit, badCallBack, reject.response ),
        );
    }

    //Если обработчик ошибок не проставлен - просто заносим ошибку в консоль и отключаем лоадер
    static _setRequestProcessing( commit, inSetFun, answer ){

        //Проверка на обработчик
        if( inSetFun )
            inSetFun( answer );
        else    
            console.log( answer ); 

        commit( 'setCurrentMapValue', { field : 'loading',  value : false } );
        
        if( !answer )
            return;
        
        //А-ля интерсептор, провкерка на отсутствие прав доступа
        if( answer.status === 401 )
            commit( 'deleteAuthToken' );
    }

    //Из глобального объекта mapbox-gl-draw тянем текущий выбранный, если есть
    static getSelectDraw(draw){

        let selectesDrawItem = null;

        try{
            selectesDrawItem = draw.getSelected().features[0];
        } catch(error) {

            console.log(error);
        }

        return selectesDrawItem;
    }

    //Смотрим, какой греппе маркеров или инструментов измерения принадлежит текущий объект
    static getTypeObjForDraw( draw, listOfInst, numOfInstrument ){

        let typeDraw = null;

        if( draw.properties.typeView || draw.properties.type )
            typeDraw = draw.properties.typeView ? draw.properties.typeView : draw.properties.type;
        
        else if ( draw.geometry.type === 'LineString' )
            typeDraw = 'line'
        
        else 
            typeDraw = draw.geometry.type.toLowerCase();

        const itemInList = listOfInst.filter( x => x.name === typeDraw );
        return itemInList[0];
    }

    //Чистим дубли в массиве ( КО :)
    static getArrWithoutDublicate(inArr){

        let uniqArr = inArr.filter( (item, i, self)=> { 
            
            return i === self.indexOf(item); 
        });

        return uniqArr;
    };

    //Разбиваем на массивы "по порядку"
    static getChunksArray(array, size) {

        let results = [];
        while (array.length) {
            results.push(array.splice(0, size));
        }
        return results;
    };

    //Вытягиваем высоты из результата по координатам
    static setParseJsonToData( inJson, zeroMark ) {

        // Входной объект может сразу содержать значения или в только в блоке results
        inJson = inJson.results ? inJson.results : inJson;
        
        if(inJson.features)
            inJson = inJson.features.map( x=>x.properties );

        let heightCoord = inJson.map( item=>{
            
            if( item.height !== null || item.height !== undefined ){
    
                item.height -= zeroMark;
                return item.height;
            }
        });
    
        return heightCoord;
    };

    //Переключение видимости в DOM-e
    static setToggleElem(idName, isHidden){

        let selElem = document.querySelector(`#${idName}`);
        let setElemDisp = selElem.style.display;

        if( selElem ){

            if(!isHidden)
                selElem.style.display = (setElemDisp != 'none') ? 'none' : 'block';
            else
                selElem.style.display = isHidden;
        }     
    };
  
    //Фильтр...
    static getSearchByValue(items, term){

        if(items)
            return !term ? items : items.filter(
                item => this.getToLower(item.name)
                    .includes(this.getToLower(term))
            );
    }

    //...по нижнему регистру
    static getToLower(text){

        if(text)
            return text.toString().toLowerCase();
    }
}