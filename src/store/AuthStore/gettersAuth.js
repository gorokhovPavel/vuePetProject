import api  from 'api/apiConfig'
import lang from 'language/Translate'

const getters = {
      
    getAllAuthState : state => state,

    //Список форм авторизации
    getCheckFormIsAuth : state => ( formName, isCheckFreeAccess )=> {

        let authList = state.authComponentsList;
        let isReload = authList.some( item => {
            
            let resNoCheck = ( item.name === formName ) && ( item.isFreeAccess );
            let resCheck   = ( item.name === formName );

            return isCheckFreeAccess ? resCheck : resNoCheck;
        });
        
        return isReload;
    },

    //Шапка к полю успешного подтверждения или смены пароля
    getAuthHeadLogoInSuccessAuth : state => 
        state.isForgotPass ? lang.getMessages('successRestorePass') : lang.getMessages('successRegisterHead'),

    //Тянем функцию отправки в зависимости от параметра - восстанавливаем пароль или подтверждаем email
    getTypeOfFunSendEmail : state => ( inpEmain ) => {

        let typeOfFun = state.isForgotPass ? api.getCodeForRestorePass(inpEmain) : api.getActivationCode(inpEmain);
        return typeOfFun;
    }
}

export default getters;