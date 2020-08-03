<template>
  <a-modal
    class="incModalPos"
    :title="$lang.messages.incInfo"
    v-model="getMapObjProperties.isIncModalActive"
    :closable="false"
    :hide-footer="true"
    :okText="$lang.messages.objectDialogSave"
    :cancelText="$lang.messages.objectDialogCanc"
    @ok="onSubmit"
    @cancel="resetState(true)"
  >
    <a-form-model class="incModalMain" ref="ruleForm" :model="form">
      <!-- Наименование -->
      <a-form-model-item
        :label="$lang.messages.incTblIncident"
        prop="name"
        ref="name"
        :rules="{
          required: true,
          message: $lang.messages.needWrite
        }"
      >
        <a-input v-model="modelName" />
      </a-form-model-item>
      <!-- Описание -->
      <a-form-model-item
        :label="$lang.messages.incTblDesc"
        prop="desc"
        ref="desc"
        :rules="{
          required: true,
          message: $lang.messages.needWrite
        }"
      >
        <a-input v-model="modelDesc" />
      </a-form-model-item>
      <!-- Создатель, MASTER !!! -->
      <a-form-model-item
        :label="$lang.messages.incTblCreator"
        prop="creator"
        ref="creator"
        :rules="{
          required: true,
          message: $lang.messages.needWrite
        }"
      >
        <a-input v-model="modelCreator" />
      </a-form-model-item>
      <!-- Ответственный -->
      <a-form-model-item
        :label="$lang.messages.incTblResponsible"
        prop="responsible"
        ref="responsible"
        :rules="{
          required: true,
          message: $lang.messages.needWrite
        }"
      >
        <a-input v-model="modelResponsible" />
      </a-form-model-item>
      <!-- Статус -->
      <a-select class="incModalStatusContainer" v-model="modelStatus">
        <a-select-option
          v-for="(item, index) in statusList"
          :key="index"
          class="incModalStatusItem"
        >
          {{ $lang.messages[item] }}
        </a-select-option>
      </a-select>
      <!-- Дата создания -->
      <a-date-picker
        class="fullSize"
        :placeholder="$lang.messages.incTblCreateDt"
        v-model="modelCreateDt"
      />
      <!-- Дата необходимого устранения -->
      <a-date-picker
        class="fullSize"
        :placeholder="$lang.messages.incTblNeedFixDt"
        v-model="modelNeedFixDt"
      />
    </a-form-model>
  </a-modal>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import moment from "moment";
import { addExtension } from "../../utils";

export default {
  props: ["statusList"],
  data: () => ({
    styleReadyBuild: {},
    styleReadyDoc: {},
    dateFormat: "DD.MM.YYYY",
    form: {
      name: "",
      desc: "",
      status: "",
      createDt: "",
      needFixDt: "",
      creator: "",
      responsible: ""
    }
  }),
  computed: {
    ...mapGetters([
      "getMapObjProperties",
      "getMenuInfo",
      "getMapObjList",
      "getIncData"
    ]),
    modelName: {
      get() {
        return this.form.name;
      },
      set(val) {
        this.form.name = val;
      }
    },
    modelDesc: {
      get() {
        return this.form.desc;
      },
      set(val) {
        this.form.desc = val;
      }
    },
    modelCreator: {
      get() {
        return this.form.creator;
      },
      set(val) {
        this.form.creator = val;
      }
    },
    modelResponsible: {
      get() {
        return this.form.responsible;
      },
      set(val) {
        this.form.responsible = val;
      }
    },
    modelStatus: {
      get() {
        return this.form.status || this.$lang.messages[this.statusList[0]];
      },
      set(val) {
        this.form.status = this.$lang.messages[this.statusList[val]];
      }
    },
    modelCreateDt: {
      get() {
        return this.form.createDt;
      },
      set(val) {
        this.form.createDt = val;
      }
    },
    modelNeedFixDt: {
      get() {
        return this.form.needFixDt;
      },
      set(val) {
        this.form.needFixDt = val;
      }
    }
  },
  methods: {
    ...mapMutations(["setStateMapValue"]),
    onSubmit() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const maxIncId = Math.max(
            ...this.getIncData.incTblData.map(item => +item.key)
          );
          const newIncId = maxIncId + 1;
          const newIncItem = {
            key: newIncId,
            num: newIncId,
            inc: this.form.name,
            desc: this.form.desc,
            status: this.form.status,
            createDt: moment(this.form.createDt).format(this.dateFormat),
            needFixDt: moment(this.form.needFixDt).format(this.dateFormat),
            creator: this.form.creator,
            responsible: this.form.responsible,
            addedData: "",
            markToMap: ""
          };

          const newIncList = [...this.getIncData.incTblData, newIncItem];
          this.setStateMapValue({ field: "incTblData", value: newIncList });

          this.$message.success(this.$lang.messages.saveMapObjSuccess);
          this.resetState(true);
        } else {
          return false;
        }
      });
    },
    resetState(isCloseModal) {
      if (isCloseModal) {
        this.setStateMapValue({ field: "isIncModalActive", value: false });
        this.form = {
          name: "",
          desc: "",
          status: "",
          createDt: "",
          needFixDt: "",
          creator: "",
          responsible: ""
        };
      }
    }
  }
};
</script>

<style>
.incModalPos .ant-modal {
  top: 3%;
}
.incModalPos .ant-modal-body {
  padding: 5px 25px;
}
.incModalMain .fullSize {
  margin-bottom: 10px;
}
.incModalMain .ant-form-explain,
.incModalMain .ant-form-item-label {
  float: left;
}
.incModalStatusContainer > div {
  margin: 10px 0;
}
.incModalStatusItem {
  text-align: left;
}
</style>
