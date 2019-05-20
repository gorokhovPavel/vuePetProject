<template>
    <div class='baseDivAuth fullSize'>

        <!-- Основное меню для авторизационных форм -->
        <md-card md-with-hover class='baseCardAuth' >
            
            <label class='center logoCardAuth bigText' >
                {{ modelAuth.headName }}
            </label>

            <md-card-content class='authContent' >
                <inputAuth v-for='( inp, index ) in modelAuth.inputArr' :key="inp.fieldName" 
                    ref='inputAuthDetails'
                    :refItems='$refs'
                    :numInList='index'
                    :fieldIsDisable ='inp.fieldIsDisable'
                    :filedIsPass    ='inp.filedIsPass'
                    :fieldName      ='inp.fieldName'
                    :fieldInValue   ='inp.fieldInValue'
                    :fieldMask      ='inp.fieldMask'
                    :fieldMaskError ='inp.fieldMaskError' />
            </md-card-content>

            <md-card-content>
                <span class='errorColor' >
                    {{getAllAuthState.serverErrorText}}
                </span>
            </md-card-content>
            
            <div class='setDesktop'>
                <div class='authButton md-card-actions md-alignment-space-between' >
                    <span class='md-body-2' v-for='(but, index) in modelAuth.buttArr' :key="but.name" >
                        <md-button                  style='color:#fff;' :class='`butAuth_${index}`' :to='but.routing' @click='setBaseAuth(but.actionName, but.isNotValidateForm )' > 
                            {{ but.name }} 
                        </md-button>
                    </span>
                </div>
            </div>

            <div class='setMobile'>
                <div class='authButton' >
                    <span class='md-body-2' v-for='(but, index) in modelAuth.buttArr' :key="but.name"  >
                        <md-button class='fullSize' style='color:#fff;' :class='`butAuth_${index}`' :to='but.routing' @click='setBaseAuth(but.actionName, but.isNotValidateForm )' > 
                            {{ but.name }} 
                        </md-button>
                    </span>
                </div>
            </div>
        </md-card>

        <!-- Всплывающее окно для проверок (Пока для проверки выхода) -->
        <md-dialog-confirm
            :md-active       = 'getAllAuthState.modalSureLogout'
            :md-title        = '$lang.messages.sureLogout'
            :md-confirm-text = '$lang.messages.yes'
            :md-cancel-text  = '$lang.messages.no'
            @md-cancel       = 'setNoSureLogout'
            @md-confirm      = 'setActionAuthLogout' />

        <!-- Всплывающее окно для того, чтобы сказать, что все хорошо! ( ну, или плохо :) ) -->
        <md-dialog-alert
            :md-active.sync  = 'getAllAuthState.modalSuccess'
            :md-title        = '$lang.messages.successRestorePass'
            :md-confirm-text = '"Oк"' />
    </div>
</template>

<script>

    import inputAuth from './InputAuth'
    import { mapGetters, mapActions, mapMutations } from 'vuex'

    export default {

        components : { inputAuth },
        
        props : [ 'modelAuth' ],

        computed : {

            ...mapGetters(['getAllAuthState'])
        },

        created(){

            this.setCurrentAuthValue({
                field : 'serverErrorText',
                value : ''
            });
        },

        methods : {

            ...mapActions([ 'setActionAuth', 'setActionAuthLogout', 'setActionSuccessChangePass' ]),
            ...mapMutations(['setCurrentAuthValue']),
            
            //Закрываем окно проверка логаута
            setNoSureLogout(){

                this.setCurrentAuthValue({
                    field : 'modalSureLogout',
                    value : false
                })
            },

            //Связка с экшнами методов авторизации - переход на главную точку входа 
            setBaseAuth( inAction, isNotExistValidateForm ){
                
                let formData = true;

                //isExistValidateForm - по умолчанию отключено, undefined, значит валидируем форму, но не всегда это нужно
                if( !isNotExistValidateForm )
                    formData = this._getValidateDataForm();
                
                if( formData.isValid || ( formData === true ) ) {
                    
                    this.setActionAuth({
                        action : inAction,
                        data   : formData.values
                    });
                }
            },

            //Валидация формы
            _getValidateDataForm(){

                let finData = null;
                let valuesData = [];
                let errorFromClient = false;
                const inputAuthList = this.$refs.inputAuthDetails;

                inputAuthList.forEach( item => {

                    valuesData.push(item.fieldValue);

                    //Делаем проверку в том случае, если у поля есть маска
                    if(item.fieldMask){

                        //маска на 'пустоту' не срабатывает при старте, потому что null а не string.empty :/ 
                        if( item.fieldValue === null )
                            item.fieldValue = '';

                        //Наклдываем маску на поле и проверяем, есть ли ошибка
                        item.setClientValid();
                        
                        if(item.clientError)
                            errorFromClient = item.clientError;
                    }
                });
                
                finData = {
                      
                    values  : valuesData,
                    isValid : !errorFromClient
                }

                return finData;
            },
        }
    }
</script>

<style lang='scss' >

    .authButton .md-button {

        background-color : #00338d;
    }

    @media ( min-width : 900px ) {

        .setDesktop {

            display: block;
        }

        .setMobile {

            display: none;
        }

        .baseDivAuth {

            padding : 7% 20%;
        }
    }

    @media ( max-width : 900px ) {
       
        .setDesktop{

            display: none;
        }

        .setMobile{

            display: block;
        }

        .baseDivAuth {

            padding : 13% 5%;
        }
    }

    .baseCardAuth {

        padding : 15px;
    }

    .logoCardAuth{

        width : 40%;
    }

    .errorColor {

        color : red;
    }

    .bigText {

        font-family: Helvetica;
        font-size: 18px;
        color: #00338d;
        letter-spacing: 10;
        text-align: left;
    }

    .bold {

        font-weight: bold;
    }
</style>