<template>
    <md-field :md-clearable='!fieldDisable' :class='errorStyle' :md-toggle-password='false' >

        <label> 
            {{fieldName}}
        </label>

        <md-input :type='fieldType' :disabled='fieldDisable' @keyup.enter='setTest'
            v-model='fieldValue' @input='setClientValid' >
        </md-input>

        <span class='md-error'>
            {{fieldMaskError}}
        </span>
    </md-field>
</template>

<script>
    
    import { mapActions } from 'vuex'

    export default {
        
        props : [ 
            'filedIsPass', 'fieldName', 'fieldMask', 'fieldMaskError', 'fieldIsDisable', 'fieldInValue', 'numInList', 'refItems' 
        ],
        
        data :()=>({

            fieldDisable : null, 
            fieldType    : null,
            fieldValue   : null,
            clientError  : false
        }),

        created(){
        
            this.fieldValue   = this.fieldInValue || '';
            this.fieldType    = !this.filedIsPass ? 'text' : 'password';
            this.fieldDisable = this.fieldIsDisable;
        },

        computed : {

            errorStyle(){
                return {
                    'md-invalid' : this.clientError
                }
            }
        },

        methods : {

            ...mapActions(['setActionEventEnter']),

            setTest(){

                this.setActionEventEnter({ refs : this.refItems, num : this.numInList })
            },

            setClientValid(){
                this.clientError = !this.fieldMask.test(this.fieldValue);
            }
        }
    }
</script>