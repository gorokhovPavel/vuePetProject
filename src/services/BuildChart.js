import { lang } from "../language";

export default class BuildChart {
  //This function is using in all local public chart functions
  static _getFontChartStyle(isReport, isBigStyle) {
    let fontSize = isBigStyle ? 14 : 11;
    fontSize = isReport ? 20 : fontSize;
    return {
      size: fontSize,
      family: "sans-serif"
    };
  }
  //Profiles
  static addTwoDimGraph(inHeightsData, reportObject) {
    const { inArr, distanseLine, stepLine } = inHeightsData;
    const firstArr = inArr.find(x => x.array.length > 0);
    const xArrForScale = !firstArr
      ? []
      : firstArr.array.map((_, index) => index * stepLine);
    const traceArr = inArr.map(elem => {
      const defArr = new Array(xArrForScale.length).fill(0);
      return {
        y: elem.array.length !== 0 ? elem.array : defArr,
        x: xArrForScale.map(x => +x.toFixed(2)),
        fill: "tozeroy",
        type: "scatter",
        name: elem.name
      };
    });

    const cntNotEmptyArr = traceArr.filter(item => item.y.length > 0);
    const layoutFormGraph = {
      x: 0,
      y: -0.2,
      orientation: "h",
      traceorder: "normal",
      titlefont: this._getFontChartStyle(reportObject, false)
    };
    const finalLayoutLegend =
      cntNotEmptyArr.length <= 12 || reportObject ? layoutFormGraph : {};

    const layout = {
      title: `${lang.getMessages(
        "heightProfile"
      )} ${distanseLine}, ${lang.getMessages("step")} : ${stepLine.toFixed(
        1
      )} ${lang.getMessages("meter")}`,
      titlefont: this._getFontChartStyle(reportObject, true),
      yaxis: {
        hoverformat: ".2f",
        title: lang.getMessages("volumeDim"),
        titlefont: this._getFontChartStyle(reportObject, true)
      },
      legend: finalLayoutLegend,
      margin: {
        l: 65,
        r: 10,
        b: 45,
        t: 35
      }
    };

    if (reportObject) {
      // eslint-disable-next-line no-undef
      Plotly.newPlot(`graphPlotChart_${reportObject.id}`, traceArr, layout, {
        displayModeBar: false
      });
    } else {
      // eslint-disable-next-line no-undef
      Plotly.newPlot("graphPlotChart", traceArr, layout, {
        displayModeBar: false
      });
    }
  }
  //Volumes
  static addTwoDimVoluemGraph(inArr, reportObject) {
    //Создаем еще массив, прибавляем на старт нулевое значение
    let upInArr = [{ volume: 0, dataVolume: "01.01.2017" }, ...inArr];
    //Модифицируем входной, чтобы исключить график с 1ой точкой
    inArr = inArr.length === 1 ? upInArr : inArr;
    //Добавляем 'аналитический' график, что показывает разницу с предыдущей величиной объема
    upInArr = inArr.map((item, index) => {
      return {
        volume: index > 0 ? Math.abs(item.volume - inArr[index - 1].volume) : 0,
        dataVolume: item.dataVolume
      };
    });
    const traceArr = [inArr, upInArr].map((elem, index) => {
      return {
        y: elem.map(x => +x.volume.toFixed(2)),
        x: elem.map(x => x.dataVolume),
        type: index === 0 ? "scatter" : "bar",
        name:
          index === 0
            ? lang.getMessages("relToZero")
            : lang.getMessages("relToStartWork"),
        marker:
          index === 0
            ? { color: "rgb(26, 118, 255)" }
            : { color: "rgb(158,202,225)" }
      };
    });
    const layout = {
      title: `${lang.getMessages("volumeHistory")} : `,
      titlefont: this._getFontChartStyle(reportObject, true),
      yaxis: {
        hoverformat: ".2f",
        title: lang.getMessages("volumeDim"),
        titlefont: this._getFontChartStyle(reportObject, true)
      },
      xaxis: {
        tickfont: {
          size: 10,
          color: "rgb(107, 107, 107)"
        }
      },
      legend: {
        x: 0.1,
        y: 1.12,
        orientation: "h",
        traceorder: "normal",
        font: this._getFontChartStyle(reportObject, false)
      },
      margin: {
        l: 65,
        r: 45,
        b: inArr.length > 5 ? 100 : 45,
        t: 35
      },
      bargap: 0.15,
      barmode: "group",
      bargroupgap: 0.1
    };
    if (reportObject) {
      // eslint-disable-next-line no-undef
      Plotly.newPlot("graphPlotChart_" + reportObject.id, traceArr, layout, {
        displayModeBar: false
      });
    } else {
      // eslint-disable-next-line no-undef
      Plotly.newPlot("graphPlotChart", traceArr, layout, {
        displayModeBar: false
      });
    }
  }
  //3d
  static addThreeDimGraph(inHeightsData, reportObject) {
    const { inArr, inPolygonInfo } = inHeightsData;
    document.querySelector("#graphChartInfo").innerHTML = inPolygonInfo[1];
    const layout = {
      title: inPolygonInfo[0],
      showlegend: false,
      autosize: true,
      margin: {
        l: 10,
        r: 10,
        b: 10,
        t: 35
      }
    };
    const data_z1 = { x: 0, z: inArr[0], type: "surface", showscale: false };
    const data_z2 = { x: 0, z: inArr[1], type: "surface", showscale: false };
    if (reportObject) {
      // eslint-disable-next-line no-undef
      Plotly.newPlot(
        "graphPlotChart_" + reportObject.id,
        [data_z1, data_z2],
        layout,
        { displayModeBar: false }
      );
    } else {
      // eslint-disable-next-line no-undef
      Plotly.newPlot("graphPlotChart", [data_z1, data_z2], layout, {
        displayModeBar: false
      });
    }
  }
  //redraw graph
  static setResstartChart(inMyDivObj) {
    // eslint-disable-next-line no-undef
    Plotly.redraw(inMyDivObj);
  }
}
