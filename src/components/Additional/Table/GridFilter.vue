<template>
  <md-card md-with-hover class='tableMap abs' >
    <div class='tableMapDiv fullSize'>
      <slot />
      <div v-if='false' >
        <hr class='hrTableMap' >
        <md-field md-inline md-clearable >
          <label>{{ $lang.messages.filterText }}</label>
          <md-input v-model='searchQuery'></md-input>
        </md-field>
      </div>
      <gridTable
        :tableNameInState='tableName' 
        :columnsData='columnsData'
        :rowsData='rowsData'
        :filterKey='searchQuery'
      />
    </div>
  </md-card>
</template>
<script>
  import { mapGetters } from 'vuex'
  import gridTable from 'components/Additional/Table/GridTable'
  import ext from 'services/AddExtension'

  export default {
    components : { gridTable },
    props : [ 'tableName' ],
    data :()=> ({
      searchQuery : '',
      actualRowsData : null,
    }),
    computed : {
      ...mapGetters([ 'getMapObjList', 'getLineOrPolygon' ]),
      columnsData() {
        return [
          { isOrder : true, value : '' },
          { isOrder : true, value : this.$lang.messages.tableHeaderName },
          { isOrder : true, value : this.$lang.messages.tableHeaderDate },
          { isOrder : true, value : '' },
          { isOrder : true, value : '' },
          { isOrder : false, value : '' },
        ]
      },
      rowsData() {
        this.actualRowsData = ( this.getMapObjList.mapObjListServer || [] );
        const finalList = [];
        this.actualRowsData.forEach( x => {
          if( x.properties && x.properties.id ) {
            const currType = x.typeView || x.type;
            const currIsReport = this.getLineOrPolygon(currType) ? x.isReport : true;
            const currNumColor = x.properties.numColor || ( this.getLineOrPolygon(currType) ? 3 : 6  );
            const finalObj = {
              type : x.properties.type,
              name : x.properties.name,
              date : x.properties.date,
              numColor : currNumColor,
              isReport : currIsReport,
              delete : null,
              id : x.id
            };
            finalList.push(finalObj);
          }
        });
        return finalList;
      },
    }
  }
</script>
<style lang='scss' >
  .hrTableMap {
    border : solid 1px #00338d;
  }
  .tableMap {
    width : 25%;
    height : calc(85vh);
	  top : 11%;
	  left : 1%;
  }
  .tableMap .tableMapDiv  {
    padding : 10px;
    height : calc(85vh);
    overflow-y : auto;
  }
</style>