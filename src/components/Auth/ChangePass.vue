<script>
import AuthMixin from "./mixins/AuthMixin.vue";
import { router } from "../../router";

export default {
  mixins: [AuthMixin],

  created() {
    //Если оказались на странице случайно - го на стартовую
    if (!this.getAllAuthState.userEmail) router.push({ path: "/" });

    this.modelObj = {
      headName: this.$lang.messages.changePassHeadName,

      inputArr: [
        {
          filedIsPass: true,
          fieldName: this.$lang.messages.currPassName,
          fieldMask: this.getAllAuthState.passMask,
          fieldMaskError: this.$lang.messages.passMaskDescr
        },
        {
          filedIsPass: true,
          fieldName: this.$lang.messages.newPassName,
          fieldMask: this.getAllAuthState.passMask,
          fieldMaskError: this.$lang.messages.passMaskDescr
        },
        {
          filedIsPass: true,
          fieldName: this.$lang.messages.confNewpassName,
          fieldMask: this.getAllAuthState.passMask,
          fieldMaskError: this.$lang.messages.passMaskDescr
        }
      ],
      buttArr: [
        {
          name: this.$lang.messages.changePassButName,
          actionName: "setActionChangePass"
        },
        {
          name: this.$lang.messages.cancelButName,
          routing: "/AccountData"
        }
      ]
    };
  }
};
</script>
