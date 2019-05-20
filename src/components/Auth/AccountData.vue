<template>
    <baseAuth :modelAuth='modelObj' v-if='modelObj' />
</template>

<script>
    
    import { mapGetters, mapActions } from 'vuex'
    import baseAuth from 'components/Auth/ExctAuth/BaseAuth'
    
    export default {

        components : { baseAuth },

        data : () => ({
            modelObj     : null,
            accountEmail : null,
            accountRole  : null,
        }),

        computed : {
            ...mapGetters(['getAllAuthState']),
        },

        methods : {
            ...mapActions(['setActionUserData'])
        },

        created(){    

            this.setActionUserData( callBackResponse => {

                this.accountRole = this.getAllAuthState.userIsAdmin ? 
                    this.$lang.messages.adminName :
                    this.$lang.messages.userName;

                this.accountEmail = this.getAllAuthState.userEmail;

                this.modelObj = {

                    headName : this.$lang.messages.accountDataHead,
    
                    inputArr : [
                        {
                            fieldIsDisable : true,
                            filedIsPass    : false,
                            fieldInValue   : this.accountEmail,
                            fieldName      : this.$lang.messages.userName,
                        },
                        {
                            fieldIsDisable : true,
                            filedIsPass    : false,
                            fieldInValue   : this.accountRole,
                            fieldName      : this.$lang.messages.roleName,
                        }
                    ],

                    buttArr : [
                        {
                            name    : this.$lang.messages.changePassButName,
                            routing : '/ChangePass'
                        },
                        {
                            name       : this.$lang.messages.logOutButName,
                            actionName : 'setActionBeforeAuthLogout',
                            isNotValidateForm : true,
                        }, 
                        { 
                            name       : this.$lang.messages.cancelButName,
                            actionName : 'setActionCancel',
                            isNotValidateForm : true,
                        }
                    ]
                }
            });
        }
    }
</script>