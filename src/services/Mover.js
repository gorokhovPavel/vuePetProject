export default class Mover {
  //Set move-property by objects with .move class
  static moveAllObj() {
    document.querySelectorAll(".move").forEach(obj => {
      Mover._moveObject(obj);
    });
  }

  //Move current object
  static _moveObject(block) {
    /* Определяем тип браузера */
    let ie = 0;
    let op = 0;
    let ff = 0;

    let x = 0;
    let y = 0;

    let delta_x = 0;
    let delta_y = 0;

    let x_block = 0;
    let y_block = 0;

    let new_x = 0;
    let new_y = 0;

    let browser = navigator.userAgent;

    if (browser.indexOf("Opera") !== -1) op = 1;

    if (browser.indexOf("MSIE") !== -1) ie = 1;

    if (browser.indexOf("Firefox") !== -1) ff = 1;

    if (block) {
      delta_x = 0;
      delta_y = 0;

      /* Ставим обработчики событий на нажатие и отпускание клавиши мыши */
      block.onmousedown = _saveXY;

      if (op || ff) block.addEventListener("onmousedown", _saveXY, false);

      document.onmouseup = clearXY;
    }

    /* При нажатии кнопки мыши попадаем в эту функцию */
    function _saveXY(obj_event) {
      if (obj_event.currentTarget.className.indexOf("move") == -1) return;
      /* Получаем текущие координаты курсора */
      if (obj_event) {
        x = obj_event.pageX;
        y = obj_event.pageY;
      } else {
        x = window.event.clientX;
        y = window.event.clientY;
        if (ie) {
          y -= 2;
          x -= 2;
        }
      }
      /* Узнаём текущие координаты блока */
      x_block = this.offsetLeft;
      y_block = this.offsetTop;
      /* Узнаём смещение */
      delta_x = x_block - x;
      delta_y = y_block - y;
      /* При движении курсора устанавливаем вызов функции moveWindow */
      document.onmousemove = _moveBlock;
      if (op || ff) document.addEventListener("onmousemove", _moveBlock, false);
    }

    function clearXY() {
      document.onmousemove = null; // При отпускании мыши убираем обработку события движения мыши
    }

    function _moveBlock(obj_event) {
      /* Получаем новые координаты курсора мыши */
      if (obj_event) {
        x = obj_event.pageX;
        y = obj_event.pageY;
      } else {
        x = window.event.clientX;
        y = window.event.clientY;
        if (ie) {
          y -= 2;
          x -= 2;
        }
      }
      /* Вычисляем новые координаты блока */
      new_x = delta_x + x;
      new_y = delta_y + y;
      block.style.top = new_y + "px";
      block.style.left = new_x + "px";
    }
  }
}
