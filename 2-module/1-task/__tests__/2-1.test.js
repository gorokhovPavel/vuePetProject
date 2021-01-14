const { mount } = require('@vue/test-utils');
const { getSolutionPath } = require('taskbook-test-utils');
const { CounterButton } = require(getSolutionPath('CounterButton'));

describe('2-module-1-task', () => {
  describe('CounterButton', () => {
    it('Компонент должен рендерить кнопку с текстом count', () => {
      const wrapper = mount(CounterButton, {
        propsData: { count: 42 },
      });
      expect(wrapper.find('button').exists()).toBe(true);
      expect(wrapper.text()).toBe('42');
    });

    it('Компонент должен иметь count 0 по умолчанию', () => {
      const wrapper = mount(CounterButton);
      expect(wrapper.text()).toBe('0');
    });

    it('Компонент должен увеличивать значение на 1 по клику', async () => {
      const wrapper = mount(CounterButton, {
        propsData: { count: 1 },
      });
      const button = wrapper.find('button');

      await button.trigger('click');
      expect(wrapper.emitted().increment).toBeTruthy();
      expect(wrapper.emitted().increment.length).toBe(1);
      expect(wrapper.emitted().increment[0]).toEqual([2]);

      wrapper.setProps({ count: 2 });
      await button.trigger('click');
      expect(wrapper.emitted().increment.length).toBe(2);
      expect(wrapper.emitted().increment[1]).toEqual([3]);
    });

    it('Пропс count должен иметь числовой тип', () => {
      expect(CounterButton.props.count.type).toBe(Number);
    });
  });
});
