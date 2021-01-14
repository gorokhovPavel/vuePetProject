<template>
  <div class="toasts" v-if="toasts.length > 0">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="toast.class"
      class="toast">
      <app-icon :icon="toast.icon" />
      <span>{{toast.message}}</span>
    </div>
  </div>
</template>

<script>
import AppIcon from './AppIcon';

const DELAY = 5000;

export default {
  name: 'AppToast',

  components: { AppIcon },

  data() {
    return {
      toasts: []
    }
  },

  methods: {

    showMessage(className, message) {

      let icons = {
        success: 'check-circle',
        error: 'alert-circle'
        };

      let toast = {
        message,
        class: 'toast_'+className,
        icon: icons[className],
        id: this.generateId(className)
      };

      this.toasts.push(toast);

      setTimeout(() => {
        this.toasts.splice(this.toasts.indexOf(toast), 1)
      }, 5000);

    },

    generateId(className) {
      return className + Math.random();
    },

    error(message) {
      this.showMessage('error', message);
    },

    success(message) {
      this.showMessage('success', message);
    },
  },
};
</script>

<style scoped>
.toasts {
  position: fixed;
  bottom: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  white-space: pre-wrap;
  z-index: 999;
}

.toast {
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  font-size: 18px;
  line-height: 28px;
  width: auto;
}

.toast + .toast {
  margin-top: 20px;
}

.toast > .icon {
  margin-right: 12px;
}

.toast.toast_success {
  color: var(--green);
}

.toast.toast_error {
  color: var(--red);
}

@media all and (min-width: 992px) {
  .toasts {
    bottom: 72px;
    right: 112px;
  }
}
</style>
