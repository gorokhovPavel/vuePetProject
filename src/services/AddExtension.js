export default class AddExtension {
  static getListColor() {
    return [
      { id: 1, value: "#009A44" },
      { id: 2, value: "#BC204B" },
      { id: 3, value: "#F68D2E" },
      { id: 4, value: "#EAAA00" },
      { id: 5, value: "#43B0AA" },
      { id: 6, value: "#C6007E" }
    ];
  }

  static getListColorInfoCard(inPercent) {
    let percentReadyColor = "#009A44";

    if (inPercent >= 0 && inPercent <= 10) {
      percentReadyColor = "#BC204B";
    } else if (inPercent >= 11 && inPercent <= 25) {
      percentReadyColor = "#F68D2E";
    } else if (inPercent >= 26 && inPercent <= 50) {
      percentReadyColor = "#EAAA00";
    } else if (inPercent >= 51 && inPercent <= 75) {
      percentReadyColor = "#43B0AA";
    }

    return percentReadyColor;
  }

  //Возврат значения параметра по номеру в списке
  static getValueFromNum(listOfParam, inNumOfColor) {
    const elemColor = listOfParam.find(x => x.id === inNumOfColor);
    const goodElemColor = elemColor || { value: "#d9d9d9" };
    return goodElemColor.value;
  }

  //В зависимости от типа объекта и параметра индикатора готовности инфокарточки, задаем цвет
  static getColorFromIndicateInfoCard(startColor, inObject, paramIndicate) {
    let indicateValue = 0;
    const { chartData } = inObject;

    if (chartData.isMenuInfo && paramIndicate) {
      indicateValue = chartData[paramIndicate];
    }

    const indicateColor =
      indicateValue === 0
        ? startColor
        : this.getListColorInfoCard(indicateValue);

    return indicateColor;
  }

  //Оборачиваем запрос в лоадер и записываем ошибку в консоль
  static setForAxiosWithState(
    commit,
    { letUrlAction, goodCallBack, badCallBack }
  ) {
    //Включаем лоадер. Если обработчики не проставлены - просто заносим ошибку в консоль и отключаем лоадер
    commit("setStateMapValue", { field: "loading", value: true });
    letUrlAction.then(
      response => this._setRequestProcessing(commit, goodCallBack, response),
      reject => this._setRequestProcessing(commit, badCallBack, reject.response)
    );
  }

  //Если обработчик ошибок не проставлен - просто заносим ошибку в консоль и отключаем лоадер
  static _setRequestProcessing(commit, inSetFun, answer) {
    //Проверка на обработчик
    if (inSetFun) {
      inSetFun(answer);
    } else {
      console.log(answer);
    }
    commit("setStateMapValue", { field: "loading", value: false });

    if (!answer) return;

    //А-ля интерсептор, провкерка на отсутствие прав доступа
    if (answer.status === 401) {
      commit("deleteAuthToken");
    }
  }

  //Из глобального объекта mapbox-gl-draw тянем текущий выбранный, если есть
  static getSelectDraw(draw) {
    const selectesDrawItem = draw?.getSelected()?.features[0];

    return selectesDrawItem;
  }

  //Смотрим, какой группе маркеров или инструментов измерения принадлежит текущий объект
  static getTypeObjForDraw(draw, listOfInst) {
    if (!draw) return;
    let [typeDraw, itemDrawName] = [null, null];

    //Смотрим на properties
    if (draw.properties) {
      if (draw.properties.typeView || draw.properties.type)
        typeDraw = draw.properties.typeView
          ? draw.properties.typeView
          : draw.properties.type;
    }
    //Смотрим на geometry
    if (!typeDraw) {
      if (draw?.geometry?.type === "LineString") {
        typeDraw = "line";
      } else typeDraw = draw?.geometry?.type.toLowerCase();
    }
    //Смотрим на наличие свойств карточки меню
    if (draw.chartData?.isMenuInfo) {
      typeDraw = "info";
    }

    itemDrawName = listOfInst.find(
      x => x.type === typeDraw || x.name === typeDraw
    );
    return itemDrawName;
  }

  //Чистим дубли в массиве ( КО :)
  static getArrWithoutDublicate(inArr) {
    let uniqArr = inArr.filter((item, i, self) => {
      return i === self.indexOf(item);
    });
    return uniqArr;
  }

  //Разбиваем на массивы "по порядку"
  static getChunksArray(array, size) {
    const results = [];
    while (array.length) {
      results.push(array.splice(0, size));
    }
    return results;
  }

  //Вытягиваем высоты из результата по координатам
  static setParseJsonToData(inJson, zeroMark) {
    //Входной объект может сразу содержать значения или в только в блоке results
    inJson = inJson.results ? inJson.results : inJson;
    if (inJson.features) inJson = inJson.features.map(x => x.properties);

    const heightCoord = inJson.map(item => {
      if (item.height !== null || item.height !== undefined) {
        item.height -= zeroMark;
        return item.height;
      }
    });
    return heightCoord;
  }

  //Переключение видимости в DOM-e
  static setToggleElem(idName, isHidden) {
    let selElem = document.querySelector(`#${idName}`);
    let setElemDisp = selElem.style.display;
    if (selElem) {
      if (!isHidden) {
        selElem.style.display = setElemDisp != "none" ? "none" : "block";
      } else {
        selElem.style.display = isHidden;
      }
    }
  }

  //Фильтр...
  static getSearchByValue(items, term) {
    if (items) {
      return !term
        ? items
        : items.filter(item =>
            this.getToLower(item.name).includes(this.getToLower(term))
          );
    }
  }

  //...по нижнему регистру
  static getToLower(text) {
    if (text) {
      return text.toString().toLowerCase();
    }
  }

  //тянем текущую дату
  static getCurrentDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = today.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  //строковую дату в Date obj
  static getDateFromStr(inStrDate) {
    if (!inStrDate) return;
    inStrDate = inStrDate.split(".");
    if (inStrDate.length === 0) return;
    inStrDate = inStrDate.reverse().join("-");
    inStrDate = new Date(inStrDate);
    return inStrDate;
  }

  //создаем табличный объект для отчета
  static getTAbleForReport(inTblObj) {
    if (!inTblObj) return;
    if (inTblObj.length === 0) return;

    const widthFull = 435;
    const cellCnt = inTblObj[0].length;
    const widthOneColumn = (widthFull / cellCnt).toFixed(0);
    // eslint-disable-next-line no-unused-vars
    const widthSizeArr = inTblObj[0].map(_ => +widthOneColumn);

    const table = [
      {
        style: "tableExample",
        table: {
          widths: widthSizeArr,
          heights: 30,
          body: inTblObj,
          dontBreakRows: true
        },
        layout: {
          defaultBorder: true,
          borderColor: "#00338d",
          textAlign: "center",
          hLineColor: function() {
            return "#00338d";
          },
          vLineColor: function() {
            return "#00338d";
          }
        }
      }
    ];
    return table;
  }

  //Тянем коллекцию инцидентов из общего объекта элементов карты
  static getIncTableDataFromMapObjList(inMapObjList) {
    const { mapObjListServer } = inMapObjList;
    if (!mapObjListServer) return;

    const mapIncList = mapObjListServer.filter(item => item.measurItem === 9);
    const mapIncDataList = mapIncList.map(item => item?.chartData);

    return mapIncDataList;
  }
}
