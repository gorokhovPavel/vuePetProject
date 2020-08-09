<script>
import AuthMixin from "./mixins/AuthMixin.vue";
import { router } from "../../router";

export default {
  mixins: [AuthMixin],
  created() {
    if (!this.getAllAuthState.emailForCheckCode)
      router.push({ path: "/SendEmail" });

    this.modelObj = {
      headName: this.$lang.messages.checkEmail(
        this.getAllAuthState.emailForCheckCode
      ),
      inputArr: [
        {
          filedIsPass: false,
          fieldName: this.$lang.messages.inputCheckCode,
          fieldMask: this.getAllAuthState.simpleMask,
          fieldMaskError: this.$lang.messages.simpleMaskDescr
        }
      ],
      buttArr: [
        {
          name: this.$lang.messages.confirm,
          actionName: "setActionActivate"
        },
        {
          name: this.$lang.messages.sendCodeAgain,
          actionName: "setActionSendCodeAgain",
          isNotValidateForm: true
        },
        {
          name: this.$lang.messages.cancelButName,
          routing: "/Login"
        }
      ]
    };
  }
};
</script>
