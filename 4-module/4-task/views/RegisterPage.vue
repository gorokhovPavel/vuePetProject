<template>
  <form class="form" @submit.prevent="doRegister">
    <div class="form-group">
      <label class="form-label">Email</label>
      <div class="input-group">
        <input type="email" @input="email = $event.target.value" class="form-control" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Имя</label>
      <div class="input-group">
        <input type="text" @input="fullName = $event.target.value" class="form-control" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Пароль</label>
      <div class="input-group">
        <input type="password" @input="password = $event.target.value" class="form-control" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Повтор пароля</label>
      <div class="input-group">
        <input type="password" @input="checkedPassword = $event.target.value" class="form-control" />
      </div>
    </div>
    <div class="form-group">
      <label class="checkbox"><input v-model="condition" type="checkbox" /> Я согласен с условиями <span></span></label>
    </div>
    <div class="form__buttons">
      <button type="submit" class="button button_primary">Зарегистрироваться</button>
    </div>
    <div class="form__append">Уже есть аккаунт? <router-link to="/login" class="link">Войдите</router-link></div>
  </form>
</template>

<script>
 import { register } from '../data';

export default {
  name: 'RegisterPage',

  data() {
    return {
      fullName: null,
      email: null,
      password: null,
      checkedPassword: null,
      condition: null
    }
  },

  methods: {
    setEmail(event) {
      this.email = event.target.value
    },

    doRegister() {
      if (this.email === '' || this.email == null) {
        alert('Требуется ввести Email');
      }
      else if (this.fullName === '' || this.fullName == null) {
        alert('Требуется ввести полное имя');
      }
      else if (this.password === '' || this.password == null) {
        alert('Требуется ввести пароль');
      }
      else if (this.checkedPassword !== this.password )  {
        alert('Пароли не совпадают');
      }
      else if (!this.condition)  {
        alert('Требуется согласиться с условиями');
      } else {
        register(this.email, this.fullName, this.password).then(res => {
          if (res.fullname) {
            alert(res.id)
          } else {
            alert(res.message);
          }
        })
      }
    }
  }
};
</script>

<style scoped></style>
