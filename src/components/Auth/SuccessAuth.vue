<script>
    
    import mixinAuth from 'mixins/AuthMixin'
import { mapGetters } from 'vuex';
    export default {
        
        mixins : [ mixinAuth ],
        
        created(){

            this.modelObj = {

                headName : this.getAuthHeadLogoInSuccessAuth,

                inputArr : [],
                
                buttArr  : [
                    { 
                        name    : this.$lang.messages.signInButName,
                        routing : '/Login',
                    }
                ]
            }
        }
    }
</script>