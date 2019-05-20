import privateActionsAuth from './privateActionsAuth'

import router from 'route/routeWays'
import lang   from 'language/Translate'
import ext    from 'services/AddExtension'
import api    from 'api/apiConfig'

const actions = {
    
    //Возвращаемся назад
    setActionCancel( {} ){

        router.go(-1);
    },

    //Обработчик события по нажатию на Enter в инпуте элемента
    setActionEventEnter( {}, objItems ){
        
        let arrOfItems   = objItems.refs.inputAuthDetails;
        let nowItemIndex = objItems.num+1;
        let nextItem     = arrOfItems[nowItemIndex];

        //Если номер нажатого инпута - не последний, то переносим фокус на следующий
        if( nowItemIndex !== arrOfItems.length ){

            let findNextElem = nextItem.$children[0].$children[0].$el;
            findNextElem.focus();
        }
        //В противном случае - нажимаем на первую кнопку после инпутов
        else {

            let firstButAuth = document.querySelector('.butAuth_0');
            firstButAuth.click();
        }
    },

    //Точка входа для методов авторизации
    setActionAuth( { dispatch }, inParams ){

        const nameAction   = inParams.action;
        const dataToAction = inParams.data;

        dispatch( nameAction, dataToAction );
    },

    //Авторизация пользователя
    setActionLogin( { commit, dispatch }, data ){

        const authDto = {
    
            email    : data[0],
            password : data[1]
        };

        ext.extForAxiosWithState( commit, {
          
            letUrlAction : api.postLogin(authDto), 
            goodCallBack : response => {

                dispatch( 'setAuthTokenAndRender', {
                    
                    respToken   : response.data, 
                    pathAddress : '/'
                });
            }, 
            badCallBack : error => {

                commit('setErrorText', error.data );
            } 
        });
    },

    //Глобальая установка токена и последующий рендеринг 
    setAuthTokenAndRender( { state, commit }, { respToken, pathAddress } ){

        //Устанавливаем токен в лс и стейтe
        const currToken = `Bearer ${respToken}`;

        localStorage.setItem( 'user-token', currToken );
        commit( 'setTokenToHeadState', currToken );

        //Тянем пользовательские данные из токены
        commit( 'setParseJwtForUserRole', currToken );
        
        //Рендеримся
        router.push({ path : pathAddress });
    },

    //Тянем данные по юзеру
    setActionUserData( { commit }, callBackResponse ){

        ext.extForAxiosWithState( commit, {
                
            letUrlAction : api.getUserData(), 
            goodCallBack : response => {

                commit( 'setCurrentAuthValue', { 
                    field : 'userEmail', 
                    value : response.data.email 
                });

                callBackResponse();
            }
        });
    },

    //Регистрация пользователя
    setActionRegister( { commit }, inData ){
        
        //Проверка на совпадение паролей
        let arrOfPass = inData.slice(1);
        const isMatch = privateActionsAuth._getCheckConfirmPass( {commit}, arrOfPass );
        
        if(isMatch)
          return;

        const regDto = {

            email    : inData[0],
            password : inData[1]
        };

        ext.extForAxiosWithState( commit, {
          
            letUrlAction : api.postRegister(regDto), 
            goodCallBack : () => privateActionsAuth._setSendAccountCode( {commit}, regDto.email ),
            badCallBack  : error => commit('setErrorText', error.data )
        });
    },

    //Подтверждение аккаунта по коду из почты
    setActionActivate( { state, commit }, inData ){
        
        const codeActivate  = inData[0];
        const activationDto = {

            codeActivation : codeActivate
        };

        ext.extForAxiosWithState( commit, {
          
            letUrlAction : api.putActivationCode(activationDto), 
            goodCallBack : () => {

                commit( 'setCurrentAuthValue', { 
                    field : 'checkCodeForRestore', 
                    value : codeActivate
                });

                let address = ( state.isForgotPass !== true ) ? 'SuccessAuth' : 'RestorePassword';
                router.push({ path : `/${address}` });
            },
            badCallBack  : error => commit( 'setErrorText', error.data )
        });
    },

    //Начало процедуры восстановления пароля
    setActionStartForgotPass( { commit } ){

        commit('setCurrentAuthValue', { field : 'isForgotPass', value : true });
        router.push( { path: '/SendEmail' } );
    },

    //Собственно, замена пароля, если юзер его забыл
    setActionFinallyForgotPass( {state, commit}, inForgotData ){

        //Проверка на наличие параметров 
        if( !state.isForgotPass || !state.emailForCheckCode || !state.checkCodeForRestore ){

            router.push( { path: '/Login' } );
            return;
        }

        //Проверка на совпадение паролей
        const isMatch = privateActionsAuth._getCheckConfirmPass( {commit}, inForgotData );
        
        if(isMatch)
         return;

        //После проверок готовим данные для отправки
        const restoreData = {

            email       : state.emailForCheckCode,
            newPassword : inForgotData[0],
            code        : state.checkCodeForRestore
        }

        //И переходим на запрос замены пароля
        ext.extForAxiosWithState( commit, {
          
            letUrlAction : api.patchRestorePass(restoreData), 
            goodCallBack : () => router.push({ path : `/SuccessAuth` }),
            badCallBack  : error => commit( 'setErrorText', error.data )
        });
    },

    //Подтверждениe email
    setActionConfirmEmail( { commit } ){

        /* В отличие от подтверждения email, здесь мы активируем флаг isForgotPass */
        commit('setCurrentAuthValue', { field : 'isForgotPass', value : false });
        router.push( { path: '/SendEmail' } );
    },

    //Отправка email перед получениeм кода подтверждения
    setActionGetCodeEmail( { state, commit, getters }, inData ){

        //Смотрим на параметр isForgotPass, в зависмимости от него решаем, какой код слать на почту
        const email = inData[0];
        const funSendEmail = getters.getTypeOfFunSendEmail(email); 

        ext.extForAxiosWithState( commit, {
            
            letUrlAction : funSendEmail,
            goodCallBack : () => privateActionsAuth._setSendAccountCode( {commit}, email ),
            badCallBack  : error => commit( 'setErrorText', error.data )
        });
    },

    //Повторная отправка кода на email аккаунта
    setActionSendCodeAgain( { state, commit, getters } ){

        if( state.emailForCheckCode )
            ext.extForAxiosWithState( commit, {
                
                letUrlAction : getters.getTypeOfFunSendEmail(state.emailForCheckCode)
            });    
        else 
            commit( 'setErrorText', lang.getMessages('noEmailForCheckCode') );
    },

    //Смена пароля по желанию пользователя (не восстановление)
    setActionChangePass( { state, commit, dispatch }, inChangePassData ){

        const userDto = {

            email       : state.userEmail,
            password    : inChangePassData[0],
            newPassword : inChangePassData[1]
        };

        //1. Проверка на подтверждение нового пароля
        const inPassData = inChangePassData.splice(1);
        const isMatch = privateActionsAuth._getCheckConfirmPass( { commit }, inPassData );
        
        if( isMatch )
            return;

        //2. Отправляем запрос, что проверяет актуальность старого пароля и вероятность совпадения с новым 
        ext.extForAxiosWithState( commit, {
          
            letUrlAction : api.pacthChangePass( userDto ), 
            goodCallBack : () => dispatch('setActionSuccessChangePass'),
            badCallBack  : error => commit( 'setErrorText', error.data )
        });
    },
    
    //Завершение смены пароля ( по желанию )
    setActionSuccessChangePass({commit}){

        commit('setCurrentAuthValue', { field : 'modalSuccess', value : true });
        router.push({path: '/AccountData'})
    },

    //Прописываем клиентские данные ( токен и пользовательские параметры ) в хидер/стейт из локал сторедж
    setActionActivateHeaderToken( { state, commit } ){

        if( state.userToken === null ){

            let tokenData = localStorage.getItem('user-token');
            
            if( tokenData ){

                commit( 'setTokenToHeadState',    tokenData );
                commit( 'setParseJwtForUserRole', tokenData );
            }            
        }
    },

    //Проверка "уверенности" перед разлогиниванием
    setActionBeforeAuthLogout( { commit } ){

        commit('setCurrentAuthValue', { field : 'modalSureLogout', value : true });
    },

    //Разлогиниваемся
    setActionAuthLogout( { commit } ){

        //Закрываем окно модалки 
        commit('setCurrentAuthValue', { field : 'modalSureLogout', value : false });
        
        //Грохаем токен 
        commit('deleteAuthToken');
    },
}

export default actions;