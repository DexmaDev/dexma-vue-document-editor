<template>
    <div
        :class="{
            'animate-pulse': pulse,
        }"
        class="flex w-full flex-col gap-4"
    >
        <div class="h-5 w-40 rounded-full bg-neutral-200" />
        <div class="h-5 w-20 rounded-full bg-neutral-200" />
        <div class="h-5 w-40 rounded-full bg-neutral-200" />
        <div class="flex justify-center items-center gap-2">
            <div class="h-5 w-20 rounded-full bg-neutral-200" />
            <div class="h-5 w-20 rounded-full bg-neutral-200" />
        </div>
        <div class="h-5 w-20 rounded-full bg-neutral-200" />
        <div class="h-5 w-40 rounded-full bg-neutral-200" />
    </div>
</template>
<script lang="ts" setup>
defineProps<{
    pulse?: boolean
}>()
</script>
