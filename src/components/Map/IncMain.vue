<template>
  <div class="incMain">
    <div class="incMenu fullSize flex justBetween">
      <div>
        <a-button type="primary" @click="addNewIncident">{{
          $lang.messages.newIncident
        }}</a-button>
        <a-button icon="file-excel" class="leftMargin">{{ "Excel" }}</a-button>
      </div>
      <span class="upperCase bold">{{ $lang.messages.listOfIncidents }}</span>
      <div>
        <a-radio-group @change="setIncMode" :value="getIncData.incMode">
          <a-radio-button value="table">
            <a-icon type="file-search" />
            {{ $lang.messages.incReport }}
          </a-radio-button>
          <a-radio-button value="cards">
            <a-icon type="block" />
            {{ $lang.messages.incCards }}
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>
    <div v-if="getIncData.incMode === 'table'">
      <IncTable :incData="getIncData.incTblData" />
    </div>
    <div v-else>
      <IncCards :incData="getIncData.incTblData" />
    </div>
    <IncModal :statusList="incStatusList" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import IncTable from "./IncTable.vue";
import IncCards from "./IncCards.vue";
import IncModal from "./IncModal.vue";

export default {
  components: { IncTable, IncCards, IncModal },
  computed: {
    ...mapGetters(["getIncData"])
  },
  data: () => ({
    incStatusList: [
      "incStatusNew",
      "incStatusInWork",
      "incStatusRequireDesc",
      "incStatusOutDeadLine",
      "incStatusClosed"
    ]
  }),
  methods: {
    ...mapMutations(["setStateMapValue"]),
    setIncMode(e) {
      this.setStateMapValue({
        field: "incMode",
        value: e.target.value
      });
    },
    addNewIncident() {
      this.setStateMapValue({
        field: "isIncModalActive",
        value: true
      });
    }
  }
};
</script>

<style>
.incMain {
  padding: 15px;
}
.incMenu {
  padding: 10px 0px;
}
</style>
