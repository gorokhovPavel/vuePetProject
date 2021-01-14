const { shallowMount } = require('@vue/test-utils');
const { getSolutionPath } = require('taskbook-test-utils');
const CounterButton = require(getSolutionPath('components/CounterButton.vue'))
  .default;

describe('3-module-1-task', () => {
  describe('CounterButton', () => {
    it('Компонент должен иметь необязательный числовой параметр count со значением 0 по умолчанию', () => {
      const wrapper = shallowMount(CounterButton);
      expect(wrapper.vm.$options.props.count.type).toBe(Number);
      expect(wrapper.vm.$options.props.count.required).toBeFalsy();
      expect(wrapper.vm.$options.props.count.default).toBe(0);
    });

    it('Компонент должен рендерить кнопку со значением счётчика', () => {
      const wrapper = shallowMount(CounterButton, {
        propsData: { count: 42 },
      });
      expect(wrapper.find('button').exists()).toBe(true);
      expect(wrapper.text()).toBe('42');
    });

    it('При клике компонент должен порождать событие `increment` с увеличенным на 1 значением счётчика', async () => {
      const wrapper = shallowMount(CounterButton, {
        propsData: { count: 1 },
      });
      const button = wrapper.find('button');

      await button.trigger('click');
      expect(wrapper.emitted().increment).toBeTruthy();
      expect(wrapper.emitted().increment.length).toBe(1);
      expect(wrapper.emitted().increment[0]).toEqual([2]);
    });

    it('Компонент должен выводить новое значение счётчика при его обновлении', async () => {
      const wrapper = shallowMount(CounterButton, {
        propsData: { count: 1 },
      });
      wrapper.setProps({ count: 2 });
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toBe('2');
    });
  });
});
