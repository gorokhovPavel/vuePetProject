import lang   from 'language/Translate'
import router from 'route/routeWays'

const privateActionsAuth = {

    //Проверка правильности подтверждения пароля
    _getCheckConfirmPass( { commit }, inRegisterData ){

        let isError = false;

        if( inRegisterData[0] !== inRegisterData[1] )
            isError = true;
        
        let textError = isError ? lang.getMessages('passNotMatch') : '';
        commit('setErrorText', textError );

        return isError;
    },

    //Прописываем в стейт значение почты и перенаправляем на форму введения кода
    _setSendAccountCode( {commit}, inEmail ){

        commit('setCurrentAuthValue', { field : 'emailForCheckCode', value : inEmail });
        router.push({ path: '/ConfirmEmailCode' });
    },
}

export default privateActionsAuth;