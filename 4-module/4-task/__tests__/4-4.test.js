import { createLocalVue, shallowMount, mount } from '@vue/test-utils';
import VueRouter from 'vue-router';
const { getSolutionPath } = require('taskbook-test-utils');
const { router } = require(getSolutionPath('router/index.js'));
const LoginPage = require(getSolutionPath('views/LoginPage')).default;
const RegisterPage = require(getSolutionPath('views/RegisterPage')).default;
const data = require(getSolutionPath('data'));

global.alert = jest.fn();

describe('4-module-4-task', () => {
  const email = 'demo@email';
  const fullname = 'Demo Organizer';
  const password = 'password';

  describe('LoginPage', () => {
    let wrapper;
    let emailInput;
    let passwordInput;
    let form;

    beforeEach(() => {
      wrapper = shallowMount(LoginPage);
      const inputs = wrapper.findAll('input').wrappers;
      emailInput = inputs[0];
      passwordInput = inputs[1];
      form = wrapper.find('form');
    });

    it('LoginPage должен выводить "Требуется ввести Email" при сабмите без введённого email', async () => {
      await form.trigger('submit');
      expect(global.alert).toHaveBeenCalledWith('Требуется ввести Email');
    });

    it('LoginPage должен выводить "Требуется ввести пароль" при сабмите c email, но без введённого пароля', async () => {
      await emailInput.setValue(email);
      await form.trigger('submit');
      jest.spyOn(data, 'login');
      expect(data.login).not.toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Требуется ввести пароль');
    });

    it('LoginPage должен выводить "Неверные учетные данные" при сабмите с неверными данными', async () => {
      jest.spyOn(data, 'login').mockImplementationOnce(() =>
        Promise.resolve({
          statusCode: 403,
          message: 'Неверные учетные данные',
          error: 'Forbidden',
        }),
      );
      await emailInput.setValue(email);
      await passwordInput.setValue(password);
      await form.trigger('submit');
      expect(data.login).toHaveBeenCalledWith(email, password);
      expect(global.alert).toHaveBeenCalledWith('Неверные учетные данные');
    });

    it('LoginPage должен выводить полное имя при сабмите с верными данными', async () => {
      jest.spyOn(data, 'login').mockImplementationOnce(() =>
        Promise.resolve({
          id: 2,
          fullname,
          email,
        }),
      );
      await emailInput.setValue(email);
      await passwordInput.setValue(password);
      await form.trigger('submit');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      expect(data.login).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(fullname);
    });
  });

  describe('RegisterPage', () => {
    let wrapper;
    let emailInput;
    let fullnameInput;
    let passwordInput;
    let password2Input;
    let agreeInput;
    let form;

    beforeEach(() => {
      wrapper = shallowMount(RegisterPage);
      const inputs = wrapper.findAll('input').wrappers;
      emailInput = inputs[0];
      fullnameInput = inputs[1];
      passwordInput = inputs[2];
      password2Input = inputs[3];
      agreeInput = inputs[4];
      form = wrapper.find('form');
    });

    afterEach(async () => {
      await wrapper.destroy();
    });

    it('RegisterPage должен выводить "Требуется ввести Email" при сабмите без введённого email', async () => {
      await form.trigger('submit');
      expect(global.alert).toHaveBeenCalledWith('Требуется ввести Email');
    });

    it('RegisterPage должен выводить "Требуется ввести полное имя" при сабмите без полного имени', async () => {
      await emailInput.setValue(email);
      await form.trigger('submit');
      expect(global.alert).toHaveBeenCalledWith('Требуется ввести пароль');
    });

    it('RegisterPage должен выводить "Требуется ввести пароль" при сабмите без пароля', async () => {
      await emailInput.setValue(email);
      await fullnameInput.setValue(fullname);
      await form.trigger('submit');
      expect(global.alert).toHaveBeenCalledWith('Требуется ввести пароль');
    });

    it('RegisterPage должен выводить "Пароли не совпадают" при сабмите с несовпадающими паролями', async () => {
      await emailInput.setValue(email);
      await fullnameInput.setValue(fullname);
      await passwordInput.setValue(password);
      await password2Input.setValue(password + '2');
      await form.trigger('submit');
      expect(global.alert).toHaveBeenCalledWith('Пароли не совпадают');
    });

    it('RegisterPage должен выводить "Требуется согласиться с условиями" при сабмите без согласия', async () => {
      await emailInput.setValue(email);
      await fullnameInput.setValue(fullname);
      await passwordInput.setValue(password);
      await password2Input.setValue(password);
      await form.trigger('submit');
      jest.spyOn(data, 'register');
      expect(data.register).not.toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(
        'Требуется согласиться с условиями',
      );
    });

    it('RegisterPage должен выводить ошибку при неуспешной регистрации', async () => {
      jest.spyOn(data, 'register').mockImplementationOnce(() =>
        Promise.resolve({
          statusCode: 422,
          message: 'Email адрес должен быть валидным',
          error: 'Unprocessable Entity',
        }),
      );
      await emailInput.setValue(email);
      await fullnameInput.setValue(fullname);
      await passwordInput.setValue(password);
      await password2Input.setValue(password);
      await agreeInput.setChecked(true);
      await form.trigger('submit');
      expect(data.register).toHaveBeenCalledWith(email, fullname, password);
      expect(global.alert).toHaveBeenCalledWith(
        'Email адрес должен быть валидным',
      );
    });

    it('RegisterPage должен выводить ID пользователя при успешной регистрации', async () => {
      jest.spyOn(data, 'register').mockImplementationOnce(() =>
        Promise.resolve({
          id: 6,
          fullname: 'Demo Organizer',
          email: 'demo@email.me',
        }),
      );
      await emailInput.setValue(email);
      await fullnameInput.setValue(fullname);
      await passwordInput.setValue(password);
      await password2Input.setValue(password);
      await agreeInput.setChecked(true);
      await form.trigger('submit');
      expect(data.register).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(6);
    });
  });

  describe('Router Config', () => {
    let wrapper;

    beforeEach(() => {
      const localVue = createLocalVue();
      localVue.use(VueRouter);
      const routerView = { template: '<router-view />' };
      wrapper = mount(routerView, {
        localVue,
        router,
      });
    });

    afterEach(async () => {
      await wrapper.destroy();
    });

    it('LoginPage должен рендериться на странице /login', async () => {
      expect(wrapper.findComponent(LoginPage).exists()).toBe(false);
      await wrapper.vm.$router.replace('/login');
      expect(wrapper.findComponent(LoginPage).exists()).toBe(true);
    });

    it('RegisterPage должен рендериться на странице /register', async () => {
      expect(wrapper.findComponent(RegisterPage).exists()).toBe(false);
      await wrapper.vm.$router.replace('/register');
      expect(wrapper.findComponent(RegisterPage).exists()).toBe(true);
    });
  });
});
