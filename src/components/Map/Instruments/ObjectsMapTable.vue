<template>
  <div>
    <div
      v-show="getShowingObjects.showTableMap"
      class="tableMapPos absolute whiteBack radius border point"
    >
      <div class="tableMapMain">
        <div class="flex justBetween">
          <a-button @click="setActionMapObj(false)" icon="rollback"></a-button>
          <a-button
            icon="save"
            class="allSaveButton"
            @click="setActionMapObj(true)"
          ></a-button>
          <a-input-search
            class="searchInput"
            allowClear
            :placeholder="$lang.messages.filterText"
            v-model="searchQuery"
          />
          <a-button
            @click="setShowMode('showTableMap')"
            icon="menu-unfold"
          ></a-button>
        </div>
        <GridTable
          :tableNameInState="tableName"
          :columnsData="columnsData"
          :rowsData="rowsData"
          :filterKey="searchQuery"
        />
      </div>
    </div>
    <a-button
      v-show="!getShowingObjects.showTableMap"
      class="absolute buttonTableMapPos"
      icon="menu-fold"
      @click="setShowMode('showTableMap')"
    ></a-button>
  </div>
</template>
<script>
import GridTable from "../../Additional/Table/GridTable.vue";
import { mapGetters, mapMutations, mapActions } from "vuex";

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
    ...mapActions(["setActionModal"]),
    setActionMapObj(isSaveAction) {
      this.modalSureSaveName = isSaveAction
        ? this.$lang.messages.sureSaveMapObj
        : this.$lang.messages.sureCancelMapObj;

      this.setActionModal({
        titleAction: this.modalSureSaveName,
        nameAction: "setConfirmActionMapObj",
        dataAction: isSaveAction
      });
    }
  }
};
</script>
<style>
.buttonTableMapPos {
  top: 12%;
  right: 4.5%;
}
.tableMapPos {
  top: 12%;
  right: 4.5%;
}
.tableMapPos > .tableMapMain {
  width: 27em;
  height: calc(76vh);
  overflow-y: auto;

  padding: 10px 10px 5px;
}
.allSaveButton {
  margin-left: 5px;
}
.searchInput.searchInput {
  margin: 0 5px;
  flex: 1;
}
</style>
