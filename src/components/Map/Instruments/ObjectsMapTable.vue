<template>
  <div
    v-show="getShowingObjects.showTableMap"
    class="tableMapPos absolute whiteBack radius border point"
  >
    <div class="tableMapMain">
      <div class="flexBetween">
        <a-button @click="setActionMapObj(false)" icon="rollback"></a-button>
        <a-input-search
          class="searchTable"
          allowClear
          :placeholder="$lang.messages.filterText"
          v-model="searchQuery"
        />
        <a-button @click="setActionMapObj(true)" icon="save"></a-button>
      </div>
      <GridTable
        :tableNameInState="tableName"
        :columnsData="columnsData"
        :rowsData="rowsData"
        :filterKey="searchQuery"
      />
    </div>
  </div>
</template>
<script>
import GridTable from "../../Additional/Table/GridTable.vue";
import { mapGetters, mapMutations } from "vuex";

export default {
  components: { GridTable },
  props: ["tableName"],
  data: () => ({
    searchQuery: "",
    actualRowsData: null
  }),
  computed: {
    ...mapGetters(["getMapObjList", "getLineOrPolygon", "getShowingObjects"]),
    columnsData() {
      return [
        { isOrder: true, value: "" },
        { isOrder: true, value: this.$lang.messages.tableHeaderName },
        { isOrder: true, value: this.$lang.messages.tableHeaderDate },
        { isOrder: true, value: "" },
        { isOrder: true, value: "" },
        { isOrder: false, value: "" }
      ];
    },
    rowsData() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.actualRowsData = this.getMapObjList.mapObjListServer || [];
      const finalList = [];
      this.actualRowsData.forEach(x => {
        if (x.properties && x.properties.id) {
          const currType = x.typeView || x.type;
          const currIsReport = this.getLineOrPolygon(currType)
            ? x.isReport
            : true;
          const currNumColor =
            x.properties.numColor || (this.getLineOrPolygon(currType) ? 3 : 6);
          const finalObj = {
            type: x.properties.type,
            name: x.properties.name,
            date: x.properties.date,
            numColor: currNumColor,
            isReport: currIsReport,
            delete: null,
            id: x.id
          };
          finalList.push(finalObj);
        }
      });
      return finalList;
    }
  },
  methods: {
    ...mapMutations(["setStateMapValue", "setShowMode"]),
    setActionMapObj(isSaveAction) {
      this.modalSureSaveName = isSaveAction
        ? this.$lang.messages.sureSaveMapObj
        : this.$lang.messages.sureCancelMapObj;
      this.setStateMapValue({ field: "activeModal", value: true });
      this.setStateMapValue({
        field: "activeModalTitle",
        value: this.modalSureSaveName
      });
      this.setStateMapValue({
        field: "activeConfrmDialogAction",
        value: {
          nameAction: "setConfirmActionMapObj",
          dataAction: isSaveAction
        }
      });
    }
  }
};
</script>
<style>
.tableMapPos {
  top: 12%;
  right: 4.5%;
}
.tableMapPos > .tableMapMain {
  min-width: 350px;
  max-width: 500px;
  height: calc(70vh);
  overflow-y: auto;

  padding: 10px;
}
.searchTable.searchTable {
  width: 75%;
}
</style>
