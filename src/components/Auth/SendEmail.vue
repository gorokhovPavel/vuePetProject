<script>
    
    import mixinAuth from 'mixins/AuthMixin'
    
    export default {
        
        mixins : [ mixinAuth ],

        created(){

            this.modelObj = {

                headName : this.$lang.messages.forgotHeadName,

                inputArr : [
                    {
                        filedIsPass    : false,
                        fieldName      : this.$lang.messages.verifyEmailHeadName,
                        fieldMask      : this.getAllAuthState.emailMask,
                        fieldMaskError : this.$lang.messages.emailMaskDescr,
                    }
                ],
                buttArr : [ 
                    {
                        name       : this.$lang.messages.checkButName,
                        actionName : 'setActionGetCodeEmail'
                    }, 
                    { 
                        name    : this.$lang.messages.cancelButName,
                        routing : '/Login',
                    }
                ]
            }
        }
    }
</script>