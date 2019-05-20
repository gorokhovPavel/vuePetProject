<template>
    <div v-if='flag' >
        <md-progress-bar md-mode="indeterminate" ></md-progress-bar>
        <clip-loader class='preloader' :color="'#00338d'" :size='"100px"' />
        <clip-loader class='preloader2' :color="'#fff'" :size='"98px"' />
    </div>
</template>

<script>
    import { ClipLoader } from 'vue-spinner/dist/vue-spinner.min.js'
    export default {
        
        components : { ClipLoader  },
        props: ['flag'],
    }
</script>

<style lang='scss' >

    .md-progress-bar {
        
        //position : absolute;
        z-index: 100;
    }

    @mixin loader {

        z-index  : 100500;
        position : fixed;
        top      : 35%;
    }

    @media ( min-width : 900px ) {

        .preloader, .preloader2 {
            @include loader;
            left     : 45%;
        }
    }

    @media ( max-width: 900px ) {

        .preloader, .preloader2 {
            @include loader;
            left     : 40%;
        } 
    }
</style>