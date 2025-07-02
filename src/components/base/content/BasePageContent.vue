<template>
    <div :class="[{ 'w-full p-8': customClass == undefined }, customClass]">
        <slot />
    </div>
</template>
<script setup lang="ts">
defineProps<{
    customClass?: string
}>()
</script>
