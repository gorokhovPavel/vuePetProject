<template>
  <BaseAuth :modelAuth="modelObj" v-if="modelObj" />
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import BaseAuth from "./ExctAuth/BaseAuth.vue";

export default {
  components: { BaseAuth },
  data: () => ({
    modelObj: null,
    accountEmail: null,
    accountRole: null
  }),
  computed: {
    ...mapGetters(["getAllAuthState"])
  },
  methods: {
    ...mapActions(["setActionUserData"])
  },
  created() {
    // eslint-disable-next-line no-unused-vars
    this.setActionUserData(callBackResponse => {
      this.accountRole = this.getAllAuthState.userIsAdmin
        ? this.$lang.messages.adminName
        : this.$lang.messages.userName;

      this.accountEmail = this.getAllAuthState.userEmail;

      this.modelObj = {
        headName: this.$lang.messages.accountDataHead,
        inputArr: [
          {
            fieldIsDisable: true,
            filedIsPass: false,
            fieldInValue: this.accountEmail,
            fieldName: this.$lang.messages.userName
          },
          {
            fieldIsDisable: true,
            filedIsPass: false,
            fieldInValue: this.accountRole,
            fieldName: this.$lang.messages.roleName
          }
        ],
        buttArr: [
          {
            name: this.$lang.messages.changePassButName,
            routing: "/ChangePass"
          },
          {
            name: this.$lang.messages.logOutButName,
            actionName: "setActionBeforeAuthLogout",
            isNotValidateForm: true
          },
          {
            name: this.$lang.messages.cancelButName,
            actionName: "setActionCancel",
            isNotValidateForm: true
          }
        ]
      };
    });
  }
};
</script>
