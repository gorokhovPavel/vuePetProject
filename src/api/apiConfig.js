import axios from 'axios'
import host  from 'api/hostConfig'

export default {
    
    //1 Api from server
    getMenuApi : () => 
        axios.get( `${host.value}/api/Start/GetMenuData/` ),
    
    getMapApi : id => 
        axios.get( `${host.value}/api/Start/GetMapData/${id}`),
    
    getUserMapObjects : mapId => 
        axios.get( `${host.value}/api/UserMapObjects/GetObjectToMap/${mapId}` ),
    
    postLayerPoints : bodyParams => 
        axios.post( `${host.value}/api/LayerPoints/PostDataHeights`, bodyParams ),
    
    getChangeResults : (mainLayerId, addLayerId) => 
        axios.get( `${host.value}/api/LayerPoints/GetChangeResultInLayers/${addLayerId}/${mainLayerId}` ),

    postSaveObject : objMap => 
        axios.post( `${host.value}/api/UserMapObjects/PostSaveObjectToMap`, objMap ),
    
    postSaveImage : file => 
        axios.post( `${host.value}/api/MapMedia/PostSaveImageToObject`, file ),

    getReportObjects : params => 
        axios.get(`${host.value}/api/v1/Report?MapId=${params.mapId}&OldLayerId=${params.oldLayerId}&NewLayerId=${params.newLayerId}`),

    //2 Api from Auth
    postLogin : loginData =>
        axios.post( `${host.value}/api/v1/auth/Auth`, loginData ),

    postRegister : registerData =>
        axios.post( `${host.value}/api/v1/auth/Account/registration`, registerData ),

    putActivationCode :(activationData)=>
        axios.put(`${host.value}/api/v1/auth/Activation`, activationData ),

    putUpdateToken : () =>
        axios.put(`${host.value}/api/v1/auth/Auth`),

    getUserData : ()=>
        axios.get(`${host.value}/api/v1/auth/User`),

    getActivationCode :(email)=>
        axios.get(`${host.value}/api/v1/auth/Activation/${email}`),
        
    getCodeForRestorePass :(inEmail)=>
        axios.get(`${host.value}/api/v1/auth/Auth/${inEmail}`),

    patchRestorePass : (accountData)=>
        axios.patch( `${host.value}/api/v1/auth/Auth`, accountData ),

    pacthChangePass : (userData)=>
        axios.patch( `${host.value}/api/v1/auth/User`, userData ),


    //3 Auth in header
    setTokenInHeader : inToken =>
        axios.defaults.headers.common['Authorization'] = inToken,

    getTokenInHeader :()=>
        axios.defaults.headers.common['Authorization'],

    deleteTokenInHeader :()=>{
        delete axios.defaults.headers.common['Authorization'];
    },

    setLangToHeader : lang =>
        axios.defaults.headers.common["Accept-Language"] = lang,
}