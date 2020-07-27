<template>
  <div>
    <!-- 3д модель-->
    <FrameLayer
      class="move frame3dPos"
      :isExit="true"
      :inWidth="getFrameContentWidthPx(40)"
      :inShowParam="getAllMapState.show3DFrame"
      :showName="'show3DFrame'"
    >
      <iframe
        :src="getAllMapState.selected3dFrameSrc"
        :style="{
          height: getFrameContentWidthPx(33) + 'px'
        }"
        class="fullSize"
      >
      </iframe>
    </FrameLayer>
    <!-- 2Д и 3Д графики-->
    <FrameLayer
      class="move measGraphMapPos"
      :isExit="true"
      :isEdit="true"
      :isSave="true"
      :inWidth="getFrameContentWidthPx(35)"
      :inShowParam="getAllMapState.showGraphPlotChart"
      :showName="'showGraphPlotChart'"
    >
      <MeasGraphMap />
    </FrameLayer>
    <!-- Медиа -->
    <FrameLayer
      class="move mediaPos"
      :isExit="true"
      :isSave="true"
      :inWidth="getFrameContentWidthPx(35)"
      :inShowParam="getAllMapState.showPhoto"
      :showName="'showPhoto'"
    >
      <MediaToMap />
    </FrameLayer>
    <!-- Шкала готовности документации -->
    <FrameLayer
      class="readyDocPos"
      :headerText="`${$lang.messages.scaleInfoCard}, %`"
      :inShowParam="getAllMapState.showScaleReady"
      :showName="'showScaleReady'"
    >
      <div class="flex justCenter scaleDocColor">
        <div
          v-for="(item, index) in arrayOfReadyDocStyle"
          :key="index"
          class="fullSize"
          :style="item.style"
        >
          {{ item.val }}
        </div>
      </div>
    </FrameLayer>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import MediaToMap from "../Instruments/MediaToMap.vue";
import MeasGraphMap from "../Instruments/MeasGraphMap.vue";
import FrameLayer from "./FrameLayer.vue";
import { addExtension } from "../../../utils";

export default {
  components: {
    FrameLayer,
    MeasGraphMap,
    MediaToMap
  },
  data: () => ({
    arrayOfReadyDoc: [10, 25, 50, 75, 100],
    arrayOfReadyDocStyle: []
  }),
  computed: {
    ...mapGetters(["getAllMapState", "getFrameContentWidthPx"]),
    styleReadyDoc(val) {
      return {
        background: addExtension.getListColorInfoCard(val)
      };
    }
  },
  created() {
    this.arrayOfReadyDocStyle = this.arrayOfReadyDoc.map(item => {
      return {
        val: item,
        style: {
          background: addExtension.getListColorInfoCard(item)
        }
      };
    });
  }
};
</script>

<style>
.frame3dPos {
  left: 45%;
}
.measGraphMapPos {
  left: 35%;
}
.mediaPos {
  left: 40%;
}
.readyDocPos.readyDocPos {
  top: 72%;
  left: 5%;
}
.scaleDocColor {
  padding: 0 7px 5px;
  border-radius: 4px;
}
.scaleDocColor > div {
  opacity: 0.9;
  color: var(--white);
  padding: 5px;
}
.scaleDocColor > div:first-child {
  border-bottom-left-radius: inherit;
  border-top-left-radius: inherit;
}
.scaleDocColor > div:last-child {
  border-bottom-right-radius: inherit;
  border-top-right-radius: inherit;
}
</style>
