<template>
    <div class='vdMedia'>
        <div v-if='getAllMapState.isPhotoMedia'
            class='vgPhoto'
            :class='{ onBord : getAllMapState.mediaIndex == imageIndex }'
            v-for='(image, imageIndex) in getAllMapState.mediaImageList'
            :key='imageIndex'
            :style='{ backgroundImage : "url(" + image + ")", width : "31%", height : "100px" }'
            @click='setCurrentMapValue({ field : "mediaIndex", value : imageIndex })' >
        </div>

        <video v-if='!getAllMapState.isPhotoMedia'
            controls
            class='fullSize vgVideo' 
            :src="getAllMapState.mediaVideo" />
  </div>
</template>

<script>

    import { mapGetters, mapMutations, mapActions } from 'vuex'    
    
    export default {

        computed : {

            ...mapGetters(['getAllMapState']),
        },

        methods : {
            
            ...mapMutations(['setCurrentMapValue']),
        }
    }
</script>

<style>
    
    .vgPhoto {

        width  : 31%; 
        height : 100px;
        margin : 5px;
        float  : left;
        background-size     : cover;
        background-repeat   : no-repeat;
        background-position : center center;
    }

    .vgVideo {

        --margin : 5px;
    }

    .vdMedia{

        height : 220px;
    }
</style>