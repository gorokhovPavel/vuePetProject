import stateMap from 'store/mapStore/stateMap'
import ru       from 'language/ru/messages'
import en       from 'language/en/messages'

export default class Translate {

    //Вызывается в отдельных js модулях
    static getMessages(option){

        let lang = stateMap.isRuLang ? ru : en;
        return lang[option];
    }
}