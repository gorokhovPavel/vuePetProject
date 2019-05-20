<template>
    <baseAuth :modelAuth='modelObj' />
</template>

<script>
    import { mapGetters } from 'vuex'
    import baseAuth       from 'components/Auth/ExctAuth/BaseAuth'

    export default {

        components : { baseAuth },
        computed   : {

            ...mapGetters(['getAllAuthState', 'getAuthHeadLogoInSuccessAuth'])
        },

        data :()=>({

           modelObj : null,
        })
    }
</script>