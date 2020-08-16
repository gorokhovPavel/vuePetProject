import Vue from "vue";
import Router from "vue-router";
import { store } from "../store";

import Menu from "../components/Main/Menu";
import MainMap from "../components/Map/MainMap";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import SendEmail from "../components/Auth/SendEmail";
import ConfirmEmailCode from "../components/Auth/ConfirmEmailCode";
import SuccessAuth from "../components/Auth/SuccessAuth";
import AccountData from "../components/Auth/AccountData";
import RestorePassword from "../components/Auth/RestorePassword";
import ChangePass from "../components/Auth/ChangePass";
import Incidents from "../components/Incidents/IncMain.vue";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/",
      name: "Menu",
      component: Menu
    },
    {
      path: "/Map/:Id",
      name: "Map",
      component: MainMap
    },
    {
      path: "/Login",
      name: "Login",
      component: Login
    },
    {
      path: "/Incidents",
      name: "Incidents",
      component: Incidents
    },
    {
      path: "/Register",
      name: "Register",
      component: Register
    },
    {
      path: "/SendEmail",
      name: "SendEmail",
      component: SendEmail
    },
    {
      path: "/ConfirmEmailCode",
      name: "ConfirmEmailCode",
      component: ConfirmEmailCode
    },
    {
      path: "/SuccessAuth",
      name: "SuccessAuth",
      component: SuccessAuth
    },
    {
      path: "/AccountData",
      name: "AccountData",
      component: AccountData
    },
    {
      path: "/RestorePassword",
      name: "RestorePassword",
      component: RestorePassword
    },
    {
      path: "/ChangePass",
      name: "ChangePass",
      component: ChangePass
    },
    {
      path: "/Base",
      name: "Base"
    }
  ]
});

//Глобальные хуки адресации (до исполнения)
router.beforeEach((to, from, next) => {
  store.dispatch("setActionActivateHeaderToken");

  const isAuthform = store.getters.getCheckFormIsAuth(to.name, false);
  const stateToken = store.state.AuthStore.userToken;

  //Ежели конечный адрес относится к разряду 'авторизационных' (регистрация. восстановление пароля) - спокойно переходим на нее
  if (isAuthform) next();
  else {
    //Если нет - смотрим тогда уже, заполнен ли токен, отсюда - или на форму входа в систему, или на конечный путь
    if (!stateToken) {
      //Интерсептор проверки на ошибку 401 находится в клиентском сервисе AddExtension._setRequestProcessing
      next("/Login");
    } else {
      next();
    }
  }
});

export { router };
