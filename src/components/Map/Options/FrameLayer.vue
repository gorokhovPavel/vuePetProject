<template>
    <md-card md-with-hover class='fix' v-show="inShowParam" :style="{ width : inWidth+'px' }" >
        
        <md-card-header class='frameLayerHeader' align="right" >

            <table class='fullSize' >
                <tr>
                    <td>
                        <mButton
                                v-show='isSave' 
                                @click='setClickSaveBtn()' > 
                            <img class='imgInButton' :src="require('content/images/save.png')" >
                        </mButton>
                    </td>
                    <td align='right'>
                        <mButton
                                @click='setShowMode(showName)'
                                v-show='isExit' > 
                            <img class='imgInButton' :src="require('content/images/close.png')" >
                        </mButton>
                    </td>
                </tr>
            </table>
        </md-card-header>

        <md-card-expand class='frameLayerContent fullSize' >
            <slot/>
        </md-card-expand>        
   </md-card>
</template>

<script>

    import { mapMutations, mapActions } from 'vuex'
    import mButton from 'components/Additional/MButton'
    import Mover   from 'services/Mover'

    export default {

        components : { mButton },
        props : [ 'inWidth', 'inShowParam', 'showName', 'isExit', 'isSave' ],
        mounted : ()=> Mover.moveAllObj(),

        methods : {

            ...mapMutations(['setShowMode', 'setCurrentMapValue']),

            setClickSaveBtn(){

                this.setShowMode("activeModal");
                this.setCurrentMapValue({ field : 'activeModalTitle', value : this.$lang.messages.objectDialogInfo });
            }
        }
    }
</script>

<style>
    
    .frameLayerHeader, .frameLayerContent{
        
        padding  : 3px;
        cursor   : all-scroll;
    }
</style>