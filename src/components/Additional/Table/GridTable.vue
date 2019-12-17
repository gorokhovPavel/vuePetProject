<template>
    <table class='fullSize gridTemplate' >
        <thead>
            <tr>
                <th v-for='(item, i) in columnsData' :key='i'
                    @click='setSortBy(columnsNames[i])' 
                    :class='{ active : sortKey === columnsNames[i] }' >
                        <span> 
                            {{ item.value | capitalize }} 
                        </span>
                        <span class='arrow' v-if='item.isOrder' :class='getSortStyle(i)' />
                </th>
            </tr>
        </thead>
        <tbody v-if='isExistDataRows' >
            <tr v-for='(entry, indexFirst) in filteredData' :key='indexFirst' >
                <gridTd v-for='(item, indexSecond) in columnsNames' :key='indexSecond'
                    :allObjTr='entry'
                    :tableNameState='tableNameInState'
                    :column='item'
                    :row='entry[item]'
                    :isLineOrPolygon='getLineOrPolygon(entry["type"])' 
                />
            </tr>
        </tbody>
        <tbody v-else >
            <tr>
                <td :colspan='columnsData.length' align='center' class='noData' >
                    {{ $lang.messages.noDataTable }}
                </td>
            </tr>
        </tbody>
    </table>
</template>
<script>
    import { mapActions, mapMutations, mapGetters } from 'vuex'
    import gridTd from 'components/Additional/Table/GridTd'
    export default {
        components : { gridTd },
        props : [ 'rowsData', 'columnsData', 'filterKey', 'tableNameInState' ],
        data :() => ({
            sortKey : '',
            sortOrders : {},
        }),
        created() {  
            const tempSortKey = {};
            this.sortOrders = tempSortKey;
            this.columnsNames.forEach( key => tempSortKey[key] = 1 );
        },
        computed : {
            ...mapGetters([ 'getAllMapState', 'getLineOrPolygon', 'getInstrument' ]),
            isExistDataRows() {
                return this.rowsData.length > 0  || false;
            },
            columnsNames() {
                const tableDataArr = this.rowsData.length>0 ? 
                    Object.keys(this.rowsData[0]) : 
                    this.columnsData.map( item=> item.value );
                return tableDataArr;
            },
            filteredData() {    
                const sortKey = this.sortKey;
                const order = this.sortOrders[sortKey] || 1;
                const filterKey = this.filterKey && this.filterKey.toLowerCase();
                const rowsInState = this.getAllMapState[this.tableNameInState];
                let rowsArr = rowsInState || this.rowsData;

                if( !rowsInState ) {
                    this.setCurrentMapValue({
                        field : this.tableNameInState,
                        value : rowsArr
                    });
                }
                if( filterKey ) {
                    rowsArr = rowsArr.filter( row =>
                        Object.keys( row ).some( key => String( row[key] ).toLowerCase().indexOf(filterKey) > -1 )
                    );
                }
                if( sortKey ) {
                    rowsArr = rowsArr.slice().sort( (a, b) => {
                        a = a[sortKey];
                        b = b[sortKey];
                        return (
                            a === b ? 
                                0 : (a > b) ?
                                    1 : -1 ) * order;
                    });
                }
                return rowsArr;
            },
        },
        filters : {
            capitalize : str => str.charAt(0).toUpperCase() + str.slice(1)
        },
        methods : {
            ...mapMutations(['setCurrentMapValue']),
            setSortBy(key) {
                this.sortKey = key;
                this.sortOrders[key] = this.sortOrders[key] * -1;
            },
            getSortStyle(index) {                
                return this.sortOrders[this.columnsNames[index]] > 0 ? 'asc' : 'dsc';
            },
        }
    }
</script>
<style>
    .gridTemplate {
        margin : 10px auto;
        border-collapse : collapse;
    }
    .gridTemplate thead {
        border-top : solid 2px #00338d;
        border-bottom : solid 2px #00338d;
    }
    .gridTemplate thead th {
        padding : 15px 10px;
    }
    .gridTemplate td {
        padding : 2px;
        border-top : solid 1px #eee;
    }
    .gridTemplate tr:hover td {
        background-color : #eee;
    }
    .arrow {
        display : inline-block;
        vertical-align : middle;
        width : 0;
        height : 0;
        margin-left : 2px;
        opacity : 0.66;
    }
    .arrow.asc {
        border-left : 5px solid transparent;
        border-right : 5px solid transparent;
        border-bottom : 5px solid #00338d;
    }
    .arrow.dsc {
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid #00338d;
    }
    .noData {
        line-height : 52px;
        background-color: #ededed;
    }
</style>