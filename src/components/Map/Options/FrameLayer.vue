<template>
  <div
    class="frameLayerContainer fix whiteBack radius border point"
    v-show="inShowParam"
    :style="{ width: inWidth + 'px' }"
  >
    <div class="frameLayerHeader fullSize allScroll">
      <a-button v-show="isSave" icon="save" @click="setClickSaveBtn()" />
      <a-button
        v-show="isEdit"
        icon="retweet"
        class="leftMargin"
        @click="setClickEditBtn()"
      />
      <span v-show="headerText">{{ headerText }}</span>
      <a-button
        class="right"
        icon="close"
        @click="setShowMode(showName)"
        v-show="isExit"
      />
    </div>
    <div class="frameLayerContent fullSize">
      <slot />
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
import { addExtension, mover } from "../../../utils";

export default {
  props: [
    "inWidth",
    "inShowParam",
    "showName",
    "isExit",
    "isSave",
    "isEdit",
    "headerText"
  ],
  computed: {
    ...mapGetters(["getMapObjList"])
  },
  mounted: () => {
    mover.moveAllObj();
  },
  methods: {
    ...mapMutations(["setShowMode", "setStateMapValue"]),
    setClickSaveBtn() {
      this.setShowMode("activeModal");
      this.setStateMapValue({
        field: "activeModalTitle",
        value: this.$lang.messages.objectDialogInfo
      });
      this.setStateMapValue({
        field: "activeConfrmDialogAction",
        value: {
          nameAction: "setStartSaveModal",
          nameObject: '"qawedw"'
        }
      });
    },
    setClickEditBtn() {
      const inSelObjDraw = addExtension.getSelectDraw(
        this.getMapObjList.mapObjListDraw
      );

      inSelObjDraw.isRecount = true;
      this.setShowMode("activeModal");
      this.setStateMapValue({
        field: "activeModalTitle",
        value: this.$lang.messages.objectDialogEditInfo
      });

      this.setStateMapValue({
        field: "activeConfrmDialogAction",
        value: {
          nameAction: "setActionMathCalc",
          dataAction: inSelObjDraw
        }
      });
    }
  }
};
</script>
<style>
.frameLayerContainer {
  z-index: 10;
}
.frameLayerHeader {
  padding: 10px;
}
.frame3dPos > .frameLayerHeader {
  padding: 5px 5px 33px;
}
.frameLayerContent {
  padding: 2px;
}
</style>
