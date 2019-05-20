<template>
    <table class='fullSize' border='0'>
        <tr>
            <td valign='bottom' align='left' width='15%' :v-if='false' >
                <mButton :style='{ display : isFirBut }' @click='mButClick' > 
                    {{ firButName }}
                </mButton> 
            </td>   
            
            <td align='center' width='70%' >
                <slot />
            </td>
            
            <td valign='bottom' align='right' width='15%' >
                <mButton :style='{ display : isSecBut }' @click='aButClick' > 
                    {{ secButName }}
                </mButton> 
            </td>
        </tr>
    </table>
</template>

<script>

    import mButton from './MButton';
    export default {

        components : { mButton },
        props : [ 'firButName', 'firButClick', 'secButName', 'secButClick' ],

        data : ()=>({

            isFirBut : 'none',
            isSecBut : 'none',
        }),

        created(){

            this.isFirBut = this.firButName ? 'block' : 'none';
            this.isSecBut = this.secButName ? 'block' : 'none';
        },

        methods : {

            mButClick(event){
                this.$emit('firButClick', event);
            },

            aButClick(event){
                this.$emit('secButClick', event);
            }
        }
    }
</script>

<style >
    
</style>