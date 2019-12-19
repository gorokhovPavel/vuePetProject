<template>
    <md-button @click="$emit('click')" 
        class='minMdButton md-card md-with-hover' >
            <slot/>
    </md-button>
</template>

<script>
    
</script>

<style>
    .minMdButton {
        min-width : 10px;
    }
</style>