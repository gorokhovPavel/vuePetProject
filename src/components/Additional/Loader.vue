<template>
    <div v-if='flag' >
        <md-progress-bar md-mode="indeterminate" ></md-progress-bar>
    </div>
</template>

<script>
    export default {
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