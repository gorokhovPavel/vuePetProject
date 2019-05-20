<template>
    <table class='fullSize gridTemplate' v-if='columnsBody' cellspacing='0' cellpadding='0' ref='dataTable'>
        <thead>
            <tr>
                <th v-for='(item, i) in columnsTable' :key='i'
                    @click='sortBy(columnsBody[i])' 
                    :class='{ active : sortKey === columnsBody[i] }' >
                        <span> {{ item.value | capitalize }} </span>
                        <span class="arrow" v-if='item.isOrder' :class="sortOrders[columnsBody[i]] > 0 ? 'asc' : 'dsc'"></span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for='entry in filteredData' :key='JSON.stringify(entry)' >
                <gridTd v-for='item in columnsBody' :key='JSON.stringify(item)'
                    :allObjTr='entry'
                    :tableNameState='tableNameInState'
                    :column='item'
                    :row='entry[item]'
                    :isLineOrPolygon='getLineOrPolygon(entry["type"])' 
                />
            </tr>
        </tbody>
    </table>
</template>

<script>

    import { mapActions, mapMutations, mapGetters } from 'vuex'
    import gridTd from 'components/Additional/Table/GridTd'
    
    export default {

        components : { gridTd },

        props : [ 'dataTable', 'columnsTable', 'filterKey', 'tableNameInState' ],

        data :() => ({

            sortKey    : '',
            sortOrders : {},
        }),

        computed : {

            ...mapGetters([ 'getAllMapState', 'getLineOrPolygon' ]),

            columnsBody(){

                return Object.keys(this.dataTable[0]);
            },

            filteredData(){

                let sortKey     = this.sortKey;
                let order       = this.sortOrders[sortKey] || 1;
                let filterKey   = this.filterKey && this.filterKey.toLowerCase();
                let rowsInState = this.getAllMapState[this.tableNameInState];
                let rows        = rowsInState || this.dataTable;

                if( !rowsInState ){

                    //Записываем текущее состояние таблицы в стейт
                    this.setCurrentMapValue({
                        field : this.tableNameInState,
                        value : rows
                    });
                }

                if ( filterKey ) {
                    rows = rows.filter( row =>
                        Object.keys( row ).some( key => String( row[key] ).toLowerCase().indexOf(filterKey) > -1 )
                    );
                }

                if ( sortKey ) {
                    rows = rows.slice().sort( (a, b) => {

                        a = a[sortKey];
                        b = b[sortKey];
                        
                        return (
                            a === b ? 
                                0 : (a > b) ?
                                    1 : -1 ) * order;
                    });
                }

                return rows;
            },
        },

        created(){
            
            let tempSortKey = {};
            this.columnsBody.forEach( key => tempSortKey[key] = 1 );
            this.sortOrders = tempSortKey;
        },

        filters : {

            capitalize : str => str.charAt(0).toUpperCase() + str.slice(1)
        },
        
        methods : {

            ...mapMutations(['setCurrentMapValue']),

            sortBy : function(key){

                this.sortKey = key;
                this.sortOrders[key] = this.sortOrders[key] * -1;
            }
        }
    }
</script>

<style>

    .gridTemplate th {

        background-color: #00338d;
        color: rgba(255,255,255,0.66);
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        padding: 15px;
    }

    .gridTemplate th.active {

        color: #fff;
    }

    .gridTemplate th.active .arrow {

        opacity: 1;
    }

    .gridTemplate td {

        text-align : center;
        padding    : 3px;
    }

    .gridTemplate tr:hover td {

        background-color :lightgray;
    }

    .arrow {

        display: inline-block;
        vertical-align: middle;
        width: 0;
        height: 0;
        margin-left: 2px;
        opacity: 0.66;
    }

    .arrow.asc {

        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 4px solid #fff;
    }

    .arrow.dsc {

        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid #fff;
    }
</style>