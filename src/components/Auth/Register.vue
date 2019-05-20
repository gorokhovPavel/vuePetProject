<script>

    import mixinAuth from 'mixins/AuthMixin'
    
    export default {
        
        mixins : [ mixinAuth ],

        created(){

            this.modelObj = {

               headName : this.$lang.messages.registerHeadName,

               inputArr : [
                   {    
                       filedIsPass    : false,
                       fieldName      : this.$lang.messages.emailName,
                       fieldMask      : this.getAllAuthState.emailMask,
                       fieldMaskError : this.$lang.messages.emailMaskDescr,
                   }, 
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
               buttArr : [
                    {
                       name : this.$lang.messages.finRegisterButName,
                       actionName  : 'setActionRegister'
                    },
                    { 
                       name : this.$lang.messages.cancelButName,
                       routing : '/Login',
                    },
               ]
           }
        }
    }
</script>