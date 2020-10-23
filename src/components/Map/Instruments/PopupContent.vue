<template>
  <div
    class="popupContainer"
    :class="{ alItemsEnd: menuInfo, alItemsCenter: !menuInfo }"
  >
    <!-- Мусорка -->
    <a-button
      v-if="!menuInfo"
      theme="twoTone"
      icon="delete"
      :title="lang.getMessages('delete')"
      @click="setDelete(drawData)"
    />
    <!-- Показания простых измерений - длина, площадь, периметр... -->
    <span v-if="!menuInfo && !isMenuStartPopup">{{ info }}</span>
    <!-- Данные по карточке объектов-->
    <table v-if="menuInfo" class="menuInfoPopupTbl">
      <tr class="dateOfUpdateTr">
        <td>
          {{ lang.getMessages("dateOfUpdate") }}
        </td>
        <td>{{ date }}</td>
      </tr>
      <tr>
        <td valign="bottom" align="left">
          {{ lang.getMessages("nameMenuObject") }}
        </td>
        <td valign="bottom" align="right" class="bold">
          {{ name }}
        </td>
      </tr>
      <tr>
        <td valign="bottom" align="left">
          {{ lang.getMessages("codeMenObject") }}
        </td>
        <td valign="bottom" align="right" class="bold">
          {{ code }}
        </td>
      </tr>
      <tr>
        <td valign="bottom" align="left">
          {{ lang.getMessages("priceMenuObject") }}
        </td>
        <td valign="bottom" align="right" class="bold">{{ price }} $</td>
      </tr>
      <tr>
        <td valign="bottom" align="left">
          {{ lang.getMessages("readyDocMenuObject") }}
        </td>
        <td valign="bottom" align="right" class="bold">{{ readyDoc }} %</td>
      </tr>
      <tr>
        <td valign="bottom" align="left">
          {{ lang.getMessages("readyBuildMenuObject") }}
        </td>
        <td valign="bottom" align="right" class="bold">{{ readyBuild }} %</td>
      </tr>
    </table>

    <!-- Значок бургера, чтобы вызывать меню карточки объектов -->
    <a-button
      v-if="menuInfo || isMenuStartPopup"
      theme="twoTone"
      icon="menu"
      :title="lang.getMessages('nameButLoad')"
      @click="setAction(drawData)"
    />
    <!-- Значок графика, делает тоже самое, что и вышеуказанный бургер, просто по дизайну иконка другая-->
    <a-button
      v-else
      theme="twoTone"
      icon="line-chart"
      :title="lang.getMessages('nameButLoad')"
      @click="setAction(drawData)"
    />
  </div>
</template>

<script>
export default {
  name: "PopupContent",
  props: [
    "mainInfo",
    "menuInfo",
    "drawData",
    "setDelete",
    "setAction",
    "lang",
    "isMenuStartPopup"
  ],
  data: () => ({
    info: null,
    code: "",
    name: "",
    price: 0,
    readyBuild: 0,
    readyDoc: 0,
    date: null
  }),
  created() {
    this.info = this.menuInfo || this.mainInfo;
    if (this.menuInfo) {
      this.code = this.menuInfo.code;
      this.name = this.menuInfo.name;
      this.price = this.menuInfo.price;
      this.readyBuild = this.menuInfo.readyBuild;
      this.readyDoc = this.menuInfo.readyDoc;
      this.date = this.menuInfo.date;
    } else {
      this.info = this.mainInfo;
    }
  }
};
</script>

<style>
.popupContainer {
  display: flex;
  justify-content: space-between;
}
.alItemsCenter {
  align-items: center;
}
.alItemsEnd {
  align-items: flex-end;
}
.popupContainer > * {
  margin: 5px;
}
.mapboxgl-popup-content {
  position: relative;
  background: #fff;
  border-radius: 4px;
  padding: 15px 10px 10px;
  pointer-events: auto;
}
.menuInfoPopupTbl td {
  padding: 0 10px;
  text-align: left;
}
.dateOfUpdateTr td {
  color: var(--kpmg);
  padding: 0 10px 10px;
}
</style>
