import Vue       from 'vue'
import Router    from 'vue-router'
import menu      from 'components/Menu'
import mainMap   from 'components/Map/MainMap'
import mainStore from 'store/mainStore'

import login             from 'components/Auth/Login'
import register          from 'components/Auth/Register'
import sendEmail         from 'components/Auth/SendEmail'
import сonfirmEmailCode  from 'components/Auth/ConfirmEmailCode'
import successAuth       from 'components/Auth/SuccessAuth'
import accountData       from 'components/Auth/AccountData'
import restorePassword   from 'components/Auth/RestorePassword'
import changePass        from 'components/Auth/ChangePass'

Vue.use(Router)

let router =  new Router({

  //mode: 'history',
  
  routes: [
    {
      path: '/',
      name: 'Menu',
      component: menu
    },
    {
      path: '/Map/:Id',
      name: 'Map',
      component: mainMap
    },
    {
      path : '/Login',
      name : 'Login',
      component : login
    },
    {
      path : '/Register',
      name : 'Register',
      component : register
    },
    {
      path : '/SendEmail',
      name : 'SendEmail',
      component : sendEmail
    },
    {
      path : '/ConfirmEmailCode',
      name : 'ConfirmEmailCode',
      component : сonfirmEmailCode
    },
    {
      path : '/SuccessAuth',
      name : 'SuccessAuth',
      component : successAuth
    },
    {
      path      : '/AccountData',
      name      : 'AccountData',
      component : accountData
    },
    {
      path      : '/RestorePassword',
      name      : 'RestorePassword',
      component : restorePassword
    },
    {
      path      : '/ChangePass',
      name      : 'ChangePass',
      component : changePass
    },
    {
      path : '/Base',
      name : 'Base'
    }
  ]
});

//Глобальные хуки адресации (до исполнения)
router.beforeEach( ( to, from, next ) => {

  mainStore.dispatch('setActionActivateHeaderToken');

  const isAuthform = mainStore.getters.getCheckFormIsAuth( to.name, false );
  const stateToken = mainStore.state.authStore.userToken;

  //Ежели конечный адрес относится к разряду 'авторизационных' (регистрация. восстановление пароля) - спокойно переходим на нее
  if( isAuthform )

    next();
  else {

    //Если нет - смотрим тогда уже, заполнен ли токен, отсюда - или на форму входа в систему, или на конечный путь
    if ( !stateToken ) {

      //Интерсептор проверки на ошибку 401 находится в клиентском сервисе AddExtension._setRequestProcessing
      next('/Login');
    } else {
      
      next();
    }
  }
});

export default router