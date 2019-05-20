
<template>
    <md-tabs >
        
        <md-tab :md-label='$lang.messages.nameOfPageMedia' class='showMapStyle' v-if='getMediaData.isMedia' >
            <showingMedia />
        </md-tab>

        <md-tab :md-label='$lang.messages.nameOfPageInfo' >
            <formObjectMap />
        </md-tab>

        <md-tab :md-label='$lang.messages.nameOfPageLoad' v-if='getMediaData.isMedia' >
            <vueDropzone 
                id='dropzone' ref='myVueDropzone'
                :options='dropzoneOptions'
                @vdropzone-success = 'setChangeStateFiles'
                @vdropzone-removed-file = 'setChangeStateFiles' />
                
            <tbl2Buttons
                :firButName='$lang.messages.nameButLoad'
                :secButName='$lang.messages.nameButCanc'
                @firButClick='setLoadPhotoToServer'
                @secButClick='setCleanDropeZone' >
                    {{textMessDropZone}}
            </tbl2Buttons>
        </md-tab>
    </md-tabs>
</template>

<script>
    
    import { mapGetters, mapMutations, mapActions } from 'vuex'
    
    import vueDropzone   from 'vue2-dropzone'
    import 'vue2-dropzone/dist/vue2Dropzone.min.css'

    import formObjectMap from 'components/Map/Instruments/formObjectMap'
    import tbl2Buttons   from 'components/Additional/BottomTable2Buttons'
    import showingMedia  from 'components/Map/Instruments/ShowingMedia';
    import api           from 'api/apiConfig'

    export default {

        components : { vueDropzone, formObjectMap, tbl2Buttons, showingMedia },

        data() {

            return {

                cntLoadFiles     : 0,
                textMessDropZone : '',
                
                dropzoneOptions  : {
                    url              : api.postSaveImage(),
                    autoProcessQueue : false,
                    thumbnailWidth   : 90,
                    thumbnailHeight  : 80,
                    maxFilesize      : 1048576 * 100,
                    maxFiles         : 20,
                    acceptedFiles    : `image/jpeg, image/jpg, image/png, image/gif`,
                    addRemoveLinks   : true,
                }
            }
        },

        computed : {

            ...mapGetters(['getMediaData'])
        },

        created(){

            //setTimeout( ()=>{ this.setShowMode('showPhoto'); }, 1 );
            this.textMessDropZone = `${this.cntLoadFiles}`;
        },

        methods : {

            ...mapMutations(['setShowMode']),
            ...mapActions(['setActionUploadMedia']),

            setLoadPhotoToServer(){
                
                this.setActionUploadMedia();
            },

            setCleanDropeZone(){

                this.$refs.myVueDropzone.removeAllFiles();
            },

            setChangeStateFiles(){

                this.cntLoadFiles = this.$refs.myVueDropzone.getAcceptedFiles().length;
                this.textMessDropZone = `${this.cntLoadFiles}`;
            }
        }
    }

</script>

<style >

    .vue-dropzone {

        max-height : calc(50vh);
        overflow-y : scroll;
    }

    .showMapStyle {

        max-height : calc(50vh);
        overflow-y : auto;
    }
</style>