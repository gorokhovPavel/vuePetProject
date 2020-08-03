<template>
  <a-table
    bordered
    :pagination="false"
    :columns="columns"
    :data-source="incData"
  />
</template>
<script>
import { lang } from "../../language";

export default {
  props: ["incData"],
  data() {
    return {
      data: [],
      columns: [
        {
          title: "№",
          dataIndex: "num"
        },
        {
          title: this.$lang.messages.incTblIncident,
          dataIndex: "inc"
        },
        {
          title: this.$lang.messages.incTblDesc,
          dataIndex: "desc",
          width: 300
        },
        {
          title: this.$lang.messages.incTblStatus,
          dataIndex: "status",
          scopedSlots: { customRender: "status" }
        },
        {
          title: this.$lang.messages.incTblCreateDt,
          dataIndex: "createDt"
        },
        {
          title: this.$lang.messages.incTblNeedFixDt,
          dataIndex: "needFixDt"
        },
        {
          title: this.$lang.messages.incTblCreator,
          dataIndex: "creator",
          width: 150
        },
        {
          title: this.$lang.messages.incTblResponsible,
          dataIndex: "responsible",
          width: 150
        },
        {
          title: this.$lang.messages.incTblAddedData,
          dataIndex: "addedData"
        },
        {
          title: this.$lang.messages.incTblMarkToMap,
          dataIndex: "markToMap"
        }
      ]
    };
  }
};
</script>

<style>
.incTable {
}
</style>
