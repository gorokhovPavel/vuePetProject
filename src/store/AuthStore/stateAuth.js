const state = {

    userToken   : null,
    userId      : null,
    userIsAdmin : false,
    userEmail   : null,

    modalSureLogout : false, 
    modalSuccess    : false,

    emailMask  : /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/,
    passMask   : /^(?=.*[0-9])(?=.*[a-zA-Zа-яА-Я])[0-9a-zA-Zа-яА-Я!@#$%^&*-]{8,}$/,
    simpleMask : /([^\s])/,

    isForgotPass        : false,
    serverErrorText     : '',
    emailForCheckCode   : '',
    checkCodeForRestore : '',

    //Необходимо для смены локализации на формах авторизации, где приходится перегружать компоненты :|
    //Еще для проверки - является ли форма секюрной - нужен ли токен для нее.
    authComponentsList : [
        {
            name         : 'Base',
            isFreeAccess : true
        },
        { 
            name         : 'AccountData',
            isFreeAccess : false
        },
        { 
            name         : 'SendEmail',
            isFreeAccess : true
        },
        { 
            name         : 'Login',
            isFreeAccess : true
        },
        { 
            name         : 'Register',
            isFreeAccess : true
        },
        { 
            name         : 'ConfirmEmailCode',
            isFreeAccess : true
        },
        { 
            name         : 'SuccessAuth',
            isFreeAccess : true
        },
        {
            name         : 'RestorePassword',
            isFreeAccess : true
        },
        {
            name         : 'ChangePass',
            isFreeAccess : false
        }
    ],
    
}

export default state;