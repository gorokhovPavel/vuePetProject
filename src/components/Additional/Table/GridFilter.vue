<template>
    <md-card md-with-hover class='tableMap abs' >
      <div class='tableMapDiv fullSize'>
        
        <slot />

        <md-field md-inline md-clearable >
          <label>{{$lang.messages.filterText}}</label>
          <md-input v-model="searchQuery"></md-input>
        </md-field>

        <gridTable
          :dataTable='tableRows'
          :columnsTable='tableCols'
          :filterKey='searchQuery'
          :tableNameInState='tableName' />
      </div>
    </md-card>
</template>

<script>

    import { mapGetters } from 'vuex'
    import gridTable from 'components/Additional/Table/GridTable'
    import ext       from 'services/AddExtension'

    export default {
        
      components : { gridTable },
      props      : [ 'tableName', 'tableRows', 'tableCols' ],

      data :() => ({
        
        searchQuery : '',
      })
    }
</script>

<style lang="scss" scoped>

  .tableMap {

    width      : 30%;
    height     : calc(85vh);
	  top        : 11%;
	  left       : 1%;
  }

  .tableMap .tableMapDiv  {

    padding    : 15px;
    height     : calc(85vh);
    overflow-y : auto;
  }
</style>