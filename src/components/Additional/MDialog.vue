<template>
    <div>
        <!-- Всплывающее диалоговое окно -->
        <md-dialog-confirm
            :md-title = 'getModalData.activeModalTitle'
            :md-active = 'getModalData.activeModal'
            :md-confirm-text = '$lang.messages.yes'
            :md-cancel-text = '$lang.messages.no'
            @md-confirm = 'setLocalModal'
            @md-cancel = 'setShowMode("activeModal")'
        />
        <!-- Всплывающее диалоговое c именем -->
        <md-dialog-prompt
            v-model='nameSavingObject'
            :md-title = '$lang.messages.enterName'
            :md-active = 'getModalData.activeModalName'
            md-input-maxlength = '30'
            :md-confirm-text = '$lang.messages.yes'
            :md-cancel-text = '$lang.messages.no'
            @md-confirm = 'setActionSaveModal(nameSavingObject)'
            @md-cancel = 'setShowMode("activeModalName")'
        />
        <!-- Уведомлялка -->
        <md-snackbar
            :style="{ 'background-color' : getModalData.activeSnackError === true ? '#f55' : '#00338d' }" 
            :md-active = 'getModalData.activeSnack'
            :md-duration = '1000' >
                <span style = 'text-align : center'> 
                    {{getModalData.activeSnackTitle}} 
                </span>
        </md-snackbar>
    </div>
</template>

<script>
    import { mapActions, mapMutations, mapGetters } from 'vuex'
    export default {
        computed : {
            ...mapGetters(['getModalData', 'getPointData']),
            nameSavingObject : {
                get() {
                    return this.getPointData.nameObject;
                },
                set(inValue) {
                    this.setCurrentMapValue({ field : 'nameObject', value : inValue });
                }
            },
        },
        methods : {
            ...mapMutations(['setShowMode', 'setCurrentMapValue']),
            ...mapActions(['setActionModal', 'setActionSaveModal']),
            setLocalModal() {
                this.setActionModal();
            }
        }
    }
</script>