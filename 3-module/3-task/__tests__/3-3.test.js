const { shallowMount, mount } = require('@vue/test-utils');
const { getSolutionPath } = require('taskbook-test-utils');
const AppToast = require(getSolutionPath('components/AppToast')).default;
const AppIcon = require('../components/AppIcon').default;

jest.useFakeTimers();

describe('3-module-3-task', () => {
  describe('AppToast', () => {
    const message = 'Sample Message';

    it('Компонент изначально не показывает ни одного тоста', async () => {
      const wrapper = shallowMount(AppToast);
      expect(wrapper.find('.toast').exists()).toBe(false);
    });

    it('Компонент должен рендерить success тост с сообщением', async () => {
      const wrapper = mount(AppToast);
      wrapper.vm.success(message);
      await wrapper.vm.$nextTick();
      const toast = wrapper.find('.toast');
      expect(toast.exists()).toBe(true);
      expect(toast.text()).toBe(message);
      expect(toast.classes('toast_success')).toBe(true);
      const icon = wrapper.findComponent(AppIcon);
      expect(icon.exists()).toBe(true);
      expect(icon.props().icon).toBe('check-circle');
    });

    it('Компонент должен рендерить error тост с сообщением', async () => {
      const wrapper = mount(AppToast);
      wrapper.vm.error(message);
      await wrapper.vm.$nextTick();
      const toast = wrapper.find('.toast');
      expect(toast.exists()).toBe(true);
      expect(toast.text()).toBe(message);
      expect(toast.classes('toast_error')).toBe(true);
      const icon = wrapper.findComponent(AppIcon);
      expect(icon.exists()).toBe(true);
      expect(icon.props().icon).toBe('alert-circle');
    });

    it('Компонент должен рендерить список сообщений', async () => {
      const wrapper = mount(AppToast);
      const messages = ['1', '2', '3'];
      messages.forEach((message) => {
        wrapper.vm.success(message);
      });
      await wrapper.vm.$nextTick();
      const toasts = wrapper.findAll('.toast').wrappers;
      expect(toasts).toHaveLength(3);
      expect(toasts.map((toast) => toast.text())).toEqual(messages);
    });

    it('Компонент удалять тост через 5 секунд', async () => {
      const wrapper = mount(AppToast);

      wrapper.vm.success('1');
      jest.advanceTimersByTime(2500);

      wrapper.vm.success('2');
      jest.advanceTimersByTime(2500);

      await wrapper.vm.$nextTick();

      const toasts = wrapper.findAll('.toast').wrappers;
      expect(toasts).toHaveLength(1);
      expect(toasts.map((toast) => toast.text())).toEqual(['2']);
    });
  });
});
