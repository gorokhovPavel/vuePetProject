# Layouts

Часто разные страницы SPA приложения имеют общие части. В простом случае есть один **шаблон** всех страниц сайта, содержащий их общее содержимое: шапку, навигацию, подвал. В других случаях шаблонов может быть несколько для разных групп страниц. При этом даже среди страниц с одним шаблоном часто можно выделить группы с одинаковыми частями, не относящиеся к общему шаблону. Так выстраивается **иерархия шаблонов** страниц.

Есть несколько подходов к разработке системы шаблонов.

## Простой шаблон на слотах

Шаблон -- компонент со слотом по умолчанию. Всё, что окружает слот -- шаблон страниц, их общее содержимое.

```html
<!-- Base Layout -->
<div>
  <header />
  <main>
    <slot />    
  </main>
  <footer />
</div>

<!-- Auth Layout -->
<base-layout>
  <section class="some-page-wrapper-class">
    <h2>Title</h2>
    <slot />
  </section>
</base-layout>
 
<!-- Login Page -->
<auth-layout>
  <login-form />
</auth-layout>
 
<!-- Registration Page -->
<auth-layout>
  <registration-form />
</auth-layout>
```

**Преимущество**: это простое решение.

**Недостаток**: даже если у разных маршрутов будет одинаковый шаблон, при загрузке новой страницы будет заново загружаться и рендериться шаблон.

Например, при переходе с `LoginPage` на `RegistrationPage`, будет загружаться страница с тем же компонентом `AuthLayout`, а с ним и `BaseLayout`. При медленном соединении или слабых ресурсах не изменяющаяся часть разных страниц будет пропадать на время при переходе, создавая "мигание" интерфейса.

## Шаблоны на основе маршрутов

Если связать иерархию шаблонов с иерархией маршрутов, можно заменить `<slot>` на `<router-view>` и не использовать вышестоящий шаблон внутри нижестоящего.  Так иерархия шаблонов превращается в иерархию страниц.

Это избавляет от недостатков предыдущего подхода. Теперь при переходе на новую страницу меняется только изменяющаяся часть, а общая остаётся та же.

Но для этого требуется связывать шаблоны с путями. В общем случае это не всегда возможно, но ситуацию можно улучить двумя способами:
1. Родительский маршрут-шаблон может не добавлять частей в путь, имея `path: ''`;
2. Можно использовать псевдонимы (`alias`) путей, где иерархия шаблонов не совпадает с URL.

```html
<!-- Base Layout -->
<div>
  <header />
  <main>
    <router-view />    
  </main>
  <footer />
</div>

<!-- Auth Layout -->
<section class="some-page-wrapper-class">
  <h2>Title</h2>
  <router-view />
</section>
 
<!-- Login Page -->
<login-form />
```

```javascript
// Простой вариант
// BaseLayout -- в App.vue
const router = new VueRouter({
  routes: [{
    path: '/auth',
    component: AuthLayout,
    redirect: '/auth/login',
    children: [{
      path: 'login',
      component: LoginPage
    }, {
      path: 'registration',
      component: RegistrationPage
    }]
  }]
});
```

```javascript
// Сложнее
const router = new VueRouter({
  routes: [{
    path: '/',
    component: BaseLayout,
    children: [{
      path: '',
      component: IndexPage,
    }, {
      path: '/auth',
      component: AuthLayout,
      children: [{
        path: 'login',
        component: LoginPage,
        alias: '/login'
      }, {
        path: 'registration',
        component: RegistrationPage
      }]
    }]
  }]
});
```

## Универсальный компонент шаблон

Некоторые находят предыдущие варианты неудобными своей трудоёмкостью, необходимостью явно использовать компонент-шаблон на странице.

Для этого можно создать универсальный динамический компонент для вывода шаблонов (например, `AppLayout`).

Здесь поможет динамический компонент (изучается в 5-ом модуле).

```vue
<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>
```
Один из подходов определять `layoutComponent` - получение имени компонента из мета данных маршрута `$route.meta.layout`.

Это удобный подход, есть иерархия шаблонов не более, чем двухуровневая, или если шаблоны не используют `router-view`.

Интересная статья, с похожими подходами: [Markus Oberlehner | Layouts with Vue.js - How to Create Dynamic Layout Components](https://markus.oberlehner.net/blog/dynamic-vue-layout-components/).

## Задание

Требуется разработать систему шаблонов для проекта митапов.

- `BaseLayout` -- базовый шаблон, содержащий все основные части: шапку с навигацией, подвал; 
- `AuthLayout` -- шаблон страниц авторизации и регистрации. Один параметр - `title`, заголовок, который выводится перед формой на странице; 
- `FormLayout` -- шаблон страниц с формами созданий и редактирования митапа. Один параметр - `title`, заголовок, который выводится перед формой на странице. 

Также требуется разработать компоненты - части шаблонов:
- `TheHeader` -- шапка с навигацией;
- `TheFooter` -- подвал сайта.

Здесь можно найти вёрстку всех страниц: [https://github.com/js-tasks-ru/vuejs-20200615-course-materials/tree/master/meetups-design-layout](https://github.com/js-tasks-ru/vuejs-20200615-course-materials/tree/master/meetups-design-layout).

Нужные стили можно найти в: `_header.css`, `_footer.css`, `_page_onboarding.css`, `_page_forms.css ` и частично в `_pages.css`. Стили требуется явно описать в scoped стилях, а не импортировать файлы. 

Задача имеет свободную часть. Содержимое меню зависит от того, где находится пользователь сейчас и авторизован ли он. Пока можно оставить любой набор ссылок. Текст в подвале также может быть любой. 

![Example](https://i.imgur.com/8dOjt5J.png)

---

### Инструкция

📝 Для решения задачи отредактируйте файлы: `components/BaseLayout.vue`, `components/AuthLayout.vue`, `components/FormLayout.vue`, `components/TheHeader.vue`, `components/TheFooter.vue`.

🚀 Команда запуска для ручного тестирования: `npm run vue-serve`;<br>
приложение будет доступно на [http://localhost:8080/4-module-5-task](http://localhost:8080/4-module-5-task).

💬 Задача проверяется вручную на Code Review.
