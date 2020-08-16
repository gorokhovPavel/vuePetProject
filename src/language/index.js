import ru from "./ru/messages";
import en from "./en/messages";
import stateMap from "../store/MapStore/state";

class lang {
  //Вызывается в отдельных js модулях
  static getMessages(option) {
    let lang = stateMap.isRuLang ? ru : en;
    return lang[option];
  }
}

export { lang };
