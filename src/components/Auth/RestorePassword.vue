<script>

    import mixinAuth from 'mixins/AuthMixin'
    export default {

        mixins : [ mixinAuth ],

        created(){

            this.modelObj = {

                headName : this.$lang.messages.restorePassHead,

                inputArr : [
                    {
                        filedIsPass    : true,
                        fieldName      : this.$lang.messages.passName,
                        fieldMask      : this.getAllAuthState.passMask,
                        fieldMaskError : this.$lang.messages.passMaskDescr,
                    },
                    {
                        filedIsPass    : true,
                        fieldName      : this.$lang.messages.confPassName,
                        fieldMask      : this.getAllAuthState.passMask,
                        fieldMaskError : this.$lang.messages.passMaskDescr,
                    }
                ],
                buttArr  : [
                    { 
                        name       : this.$lang.messages.restoreName,
                        actionName : 'setActionFinallyForgotPass'
                    },
                    {
                        name    : this.$lang.messages.objectDialogCanc,
                        routing : '/Login',
                    }
                ]
            }
        }
    }
</script>