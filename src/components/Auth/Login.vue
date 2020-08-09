<script>
import AuthMixin from "./mixins/AuthMixin.vue";

export default {
  mixins: [AuthMixin],
  created() {
    this.modelObj = {
      headName: this.$lang.messages.loginHeadName,
      inputArr: [
        {
          filedIsPass: false,
          fieldName: this.$lang.messages.emailName,
          fieldMask: this.getAllAuthState.emailMask,
          fieldMaskError: this.$lang.messages.emailMaskDescr
        },
        {
          filedIsPass: true,
          fieldName: this.$lang.messages.passName,
          fieldMask: this.getAllAuthState.passMask,
          fieldMaskError: this.$lang.messages.passMaskDescr
        }
      ],
      buttArr: [
        {
          name: this.$lang.messages.loginButName,
          actionName: "setActionLogin"
        },
        {
          name: this.$lang.messages.forgotButName,
          actionName: "setActionStartForgotPass",
          isNotValidateForm: true
        },
        {
          name: this.$lang.messages.registerButname,
          routing: "/Register"
        },
        {
          name: this.$lang.messages.confirmEmailButName,
          actionName: "setActionConfirmEmail",
          isNotValidateForm: true
        }
      ]
    };
  }
};
</script>
