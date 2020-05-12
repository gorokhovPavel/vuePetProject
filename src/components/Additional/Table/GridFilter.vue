<template>
  <md-card md-with-hover class="tableMap abs">
    <div class="tableMapDiv fullSize">
      <slot />
      <div v-if="true">
        <a-input
          class="searchInput"
          :placeholder="$lang.messages.filterText"
          v-model="searchQuery"
        />
      </div>
      <GridTable
        :tableNameInState="tableName"
        :columnsData="columnsData"
        :rowsData="rowsData"
        :filterKey="searchQuery"
      />
    </div>
  </md-card>
</template>
<script>
import GridTable from "./GridTable.vue";
import { mapGetters } from "vuex";

export default {
  components: { GridTable },
  props: ["tableName"],
  data: () => ({
    searchQuery: "",
    actualRowsData: null
  }),
  computed: {
    ...mapGetters(["getMapObjList", "getLineOrPolygon"]),
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
  }
};
</script>
<style>
.searchInput.searchInput {
  margin: 5px 0 0;
}
.searchInput.searchInput,
.searchInput.searchInput.ant-input:focus,
.searchInput.searchInput.ant-input:hover {
  border: 1.5px solid var(--main-kpmg);
}
.tableMap {
  width: 25%;
  height: calc(85vh);
  top: 11%;
  left: 1%;
}
.tableMap .tableMapDiv {
  padding: 10px;
  height: calc(85vh);
  overflow-y: auto;
}
</style>
