<template>
    <div @click="$emit('click')" 
        class='mdButton point'  >
            <slot />
    </div>
</template>
<style>
    .mdButton {
        display : inline-block;
        margin : 7px;
        padding : 7px;
        box-shadow: 0 1px 1px rgba(0,0,0,0.3);
    }
    .mdButton:hover {
        box-shadow: 2px 2px 2px rgba(0,0,0,0.3);
    }
    .mdButton img {
        width : 20px;
        height : 20px;
    }
</style>