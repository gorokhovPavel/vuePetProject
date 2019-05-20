import api    from 'api/apiConfig'
import router from 'route/routeWays'

const mutations = {

    //Установка значения произвольному элементу в состоянии
    setCurrentAuthValue : ( state, { field, value } ) => {
    
        state[field] = value;  
    },
    
    //Задаем значение текстовому полю с ошибками от сервера
    setErrorText : (state, inValue) => {

        state.serverErrorText = inValue;
    },

    //Прописываем входной токен в стейт и хидер
    setTokenToHeadState : ( state, inToken ) => {

        state.userToken = inToken;
        api.setTokenInHeader(inToken);
    },

    //Парсинг токена для пользовательских параметров
    setParseJwtForUserRole : (state, inToken ) => {

        let cleanToken = inToken.split(' ')[1];
        
        if( !cleanToken )
            return;

        let base64Url = cleanToken.split('.')[1];
        let base64    = base64Url.replace('-', '+').replace('_', '/');
        let tokenObj  = JSON.parse(window.atob(base64));

        state.userId = tokenObj['Id'];
        let userRole = tokenObj['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        state.userIsAdmin = ( userRole !== 'user' );
    },

    //Удаляем токен из параметров
    deleteAuthToken : (state) => {

        //Грохаем токен
        localStorage.removeItem('user-token');
        api.deleteTokenInHeader();
        state.userToken = '';

        //Грохаем пользоваетльские данные
        localStorage.removeItem('user-data');
        state.userId    = null;
        state.userEmail = '';
        state.userRole  = '';

        //Направляемся на форму авторизации
        router.push({ path: '/Login' });
    },
}

export default mutations;