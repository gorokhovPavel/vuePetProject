import axios from "axios";

const host =
  process.env.NODE_ENV === "development"
    ? "http://rustpapp601.ru.kworld.kpmg.com:7010"
    : "https://www.sitesurveyor.ru/Server";

const api = {
  getMenuApi: () => axios.get(`${host}/api/Start/GetMenuData/`),

  getMapApi: id => axios.get(`${host}/api/Start/GetMapData/${id}`),

  getUserMapObjects: mapId =>
    axios.get(`${host}/api/UserMapObjects/GetObjectToMap/${mapId}`),

  postLayerPoints: bodyParams =>
    axios.post(`${host}/api/LayerPoints/PostDataHeights`, bodyParams),

  getChangeResults: (mainLayerId, addLayerId) =>
    axios.get(
      `${host}/api/LayerPoints/GetChangeResultInLayers/${addLayerId}/${mainLayerId}`
    ),

  postSaveObject: objMap =>
    axios.post(`${host}/api/UserMapObjects/PostSaveObjectToMap`, objMap),

  postSaveImage: file =>
    axios.post(`${host}/api/MapMedia/PostSaveImageToObject`, file),

  getReportObjects: params =>
    axios.get(
      `${host}/api/v1/Report?MapId=${params.mapId}&OldLayerId=${params.oldLayerId}&NewLayerId=${params.newLayerId}`
    ),

  //2 Api from Auth
  postLogin: loginData => axios.post(`${host}/api/v1/auth/Auth`, loginData),

  postRegister: registerData =>
    axios.post(`${host}/api/v1/auth/Account/registration`, registerData),

  putActivationCode: activationData =>
    axios.put(`${host}/api/v1/auth/Activation`, activationData),

  putUpdateToken: () => axios.put(`${host}/api/v1/auth/Auth`),

  getUserData: () => axios.get(`${host}/api/v1/auth/User`),

  getActivationCode: email =>
    axios.get(`${host}/api/v1/auth/Activation/${email}`),

  getCodeForRestorePass: inEmail =>
    axios.get(`${host}/api/v1/auth/Auth/${inEmail}`),

  patchRestorePass: accountData =>
    axios.patch(`${host}/api/v1/auth/Auth`, accountData),

  pacthChangePass: userData =>
    axios.patch(`${host}/api/v1/auth/User`, userData),

  //3 Auth in header
  setTokenInHeader: inToken =>
    (axios.defaults.headers.common["Authorization"] = inToken),

  getTokenInHeader: () => axios.defaults.headers.common["Authorization"],

  deleteTokenInHeader: () => {
    delete axios.defaults.headers.common["Authorization"];
  },

  setLangToHeader: lang =>
    (axios.defaults.headers.common["Accept-Language"] = lang)
};

export { api };
