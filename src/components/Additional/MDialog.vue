<template>
    <div>

        <!-- Всплывающее окно -->
        <md-dialog-confirm
            :md-title   = 'getModalData.activeModalTitle'
            @md-confirm = 'setActionModal'
            
            :md-active       = 'getModalData.activeModal'
            :md-confirm-text = '$lang.messages.yes'
            :md-cancel-text  = '$lang.messages.no'
            @md-cancel       = 'setShowMode("activeModal")'
        />

        <!-- Уведомлялка -->
        <md-snackbar
            :style="{ 'background-color' : getModalData.activeSnackError === true ? '#f55' : '#00338d' }" 
            :md-active.sync = 'getModalData.activeSnack'
            :md-duration    = '1500' >
                <span style='text-align : center '> 
                    {{getModalData.activeSnackTitle}} 
                </span>
        </md-snackbar>
    </div>
</template>

<script>
    
    import { mapActions, mapMutations, mapGetters } from 'vuex'

    export default {

        computed : {

            ...mapGetters(['getModalData'])
        },

        methods : {

            ...mapMutations(['setShowMode']),
            ...mapActions(['setActionModal']),
        }
    }
</script>