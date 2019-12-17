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
      ...mapGetters([ 'getListOfMapObj', 'getListOfMapTable', 'getLineOrPolygon' ]),
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
        this.actualRowsData = ( this.getListOfMapObj || [] );
        return this.actualRowsData.map( x => {
          let currType = x.typeView || x.type;
          let currIsReport = this.getLineOrPolygon(currType) ? x.isReport : true;
          let currNumColor = x.properties.numColor || ( this.getLineOrPolygon(currType) ? 3 : 6  );
          return {
            type : x.properties.type,
            name : x.properties.name,
            date : x.properties.date,
            numColor : currNumColor,
            isReport : currIsReport,
            delete : null,
            id : x.id
          }
        });
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