<template>
    <div >
        <table border='0' class='fullSize' >
            <tr>
                <td>
                    <md-field class="full">
                        <md-input 
                            v-model='curNameObject'
                            :placeholder='$lang.messages.holderInfo'
                        >
                        </md-input>
                    </md-field>
                </td>
                <td>
                    <md-datepicker 
                        v-model='curDateObj'
                        :md-immediately='true'
                    />
                </td>
            </tr>
            <tr>
                <td colspan='2' >
                    <md-field class="full" >
                        <md-textarea 
                            v-model='curCommentObject'
                            :placeholder='$lang.messages.holderComment'
                        >
                        </md-textarea>
                    </md-field>
                </td>
            </tr>
        </table>
        <tbl2Buttons 
            :secButName='$lang.messages.nameCleanFormBut'
            @secButClick='setCleanObjectForm' >
        </tbl2Buttons>
    </div>
</template>

<script>
    
    import { mapMutations, mapGetters } from 'vuex'
    
    import tbl2Buttons from 'components/Additional/BottomTable2Buttons'

    export default {

        components : { tbl2Buttons },

        computed: {
        
            ...mapGetters(['getAllMapState']),

            curDateObj : {
                get(){
                    return this.getAllMapState.dateObject;
                },
                set(inValue){
                    this.setCurrentMapValue({ field : 'dateObject', value : inValue });
                }
            },

            curNameObject : {

                get(){
                    return this.getAllMapState.nameObject;
                },
                set(inValue){
                    this.setCurrentMapValue({ field : 'nameObject', value : inValue });
                }
            },

            curCommentObject : {

                get(){
                    return this.getAllMapState.commentObject;
                },
                set(inValue){
                    this.setCurrentMapValue({ field : 'commentObject', value : inValue });
                }
            }
        },

        methods : {

            ...mapMutations(['setCleanObjectForm', 'setCurrentMapValue'])
        }
    }
</script>

<style >

    .md-datepicker-header {

        display: none;
    }
</style>