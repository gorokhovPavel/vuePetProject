# Meetup Page Draft

Создайте экземпляр Vue приложения для вывода информации о митапе.

Требуется:
- Получить данные митапа по [API /meetups/:ID](https://course-vue.javascript.ru/api/#/Meetups/MeetupsController_findById);
- Вывести изображение митапа по [API /images/:ID](https://course-vue.javascript.ru/api/#/Images/ImagesController_getImage);
- Вывести описание митапа;
- Вывести основную информацию о митапе;
- Дату митапа вывести локализовано;
- Вывести программу митапа;
- Пункты программы могут быть разного типа (`agenda[].type`);
- Для типа "talk" (доклад) требуется дополнительно вывести докладчика и язык;
- У каждого типа элемента программы есть своя иконка (см. `agendaItemIcons`);
- Если у пункта программы отсутствует заголовок (`agenda[].title`), требуется вывести заголовок по умолчанию для данного типа элемента программы (см. `agendaItemTitles`);
- Если какой-то блок пустой (например, нет описания) -- его не нужно выводить.

###### Результат

![Example](./example.png)

## Полезные ссылки

- Fetch API: https://learn.javascript.ru/fetchMeetup
- Локализация даты:
    - https://learn.javascript.ru/intl
    - https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString

---

**- Для решения отредактируйте файлы `index.html` и `script.js`**
