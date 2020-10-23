<template>
  <!-- Всплывающее диалоговое c именем -->
  <a-modal
    class="modalName"
    v-model="getModalData.activeModalName"
    :title="$lang.messages.enterName"
    :okText="$lang.messages.yes"
    :cancelText="$lang.messages.no"
    @ok="setActionSaveModal(nameSavingObject)"
    @cancel="setShowMode('activeModalName')"
  >
    <a-input v-model="nameSavingObject" />
  </a-modal>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["getModalData", "getPointData"]),
    nameSavingObject: {
      get() {
        return this.getPointData.nameObject;
      },
      set(inValue) {
        this.setStateMapValue({ field: "nameObject", value: inValue });
      }
    }
  },
  methods: {
    ...mapMutations(["setShowMode", "setStateMapValue"]),
    ...mapActions(["setActionSaveModal"])
  }
};
</script>
<style>
.modalName .ant-modal-header {
  text-align: left;
}
</style>
