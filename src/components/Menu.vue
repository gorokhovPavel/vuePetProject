<template>

    <div class='menuStyles'>

        <md-card class='menuMdCard' md-with-hover v-for='item in getMenuList' :key='item.id' >
            
            <router-link :to="'/Map/'+item.id" >
                <md-card-media>
                    <img :src="require(`content/images/${item.fileName}`)" >
                </md-card-media>
            </router-link>
            
            <md-card-expand>
                <md-card-actions md-alignment="space-between">
                
                    <span class="md-body-2">{{item.name}}</span>
                    <span class="md-caption">{{item.dtStr}}</span>
                </md-card-actions>
            </md-card-expand>
        </md-card>
    </div>
</template>

<script>
    
    import { mapGetters, mapActions } from 'vuex';
    
    export default {

        created() {

            this.setLoadMenuData();
        },

        computed: {
        
            ...mapGetters([ 'getMenuList' ])
        },

        methods: {

            ...mapActions([ 'setLoadMenuData' ])
        },
    }
</script>

<style>

    @media ( min-width : 600px ) {
        
        .menuStyles {

            padding    : 1% 5% 0px 14%;
            max-height : calc(100vh - 64px);
            overflow-y : scroll;
        }

        .menuMdCard {

            width          : 22%;
            margin         : 10px;
            padding        : 2px;
            display        : inline-block;
            vertical-align : top;
        }
        
        .menuMdCard img {

            height: calc( 21vh );
        }
    }

    @media ( max-width : 400px ){

        .menuStyles {

            padding    : 2%;
            max-height : calc( 95vh );
            overflow-y : scroll;
        }

        .menuMdCard {

            width   : 90%;
            padding : 2px;
            margin  : 20px;
        }

        .menuMdCard img {

            height: 180px;
        }
    }
</style>