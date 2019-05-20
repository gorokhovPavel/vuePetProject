<template>

        <table class='abs navigationMap'>
            <tr>
                <td>
                    <mButton @click='setChangeZoom(true)' >
                        <img :src="require('content/images/up.png')" >
                    </mButton>
                </td>
            </tr>
            <tr>
                <td>
                    <mButton @click='setChangeZoom(false)' >
                        <img :src="require('content/images/down.png')" >
                    </mButton>
                </td>
            </tr>
            <tr>
                <td>
                    <mButton @click='setGoHomeLocation()'>
                        <img :src="require('content/images/compass.png')" >
                    </mButton>
                </td>
            </tr>
            <tr>
                <td>
                    {{navLonLat}}
                </td>
            </tr>
        </table>
</template>

<script>

    import { mapActions, mapMutations, mapGetters } from 'vuex'
    import mButton from 'components/Additional/MButton'

    export default {

        components : { mButton },
        props : [ 'navLonLat' ],

        computed : {
            ...mapGetters(['getAllMapState'])
        },
        methods: {
            ...mapActions([ 'setChangeZoom', 'setGoHomeLocation' ])
        }
    }

</script>

<style>

    .navigationMap, .lonLatPos {

        bottom: 2%;
        right: 1%;
    }

    .navigationMap td {

        text-align: right;
    }
</style>