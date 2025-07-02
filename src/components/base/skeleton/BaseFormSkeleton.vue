<template>
    <div
        :class="{
            'animate-pulse': pulse,
        }"
        class="grid gap-4 w-full flex-col grid-cols-1 lg:grid-cols-3"
    >
        <div
            v-for="(spaceHolder, index) in spaceHolderNumber"
            :key="index"
            class="h-8 w-full bg-neutral-200 rounded-full mt-6"
        />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    pulse?: boolean
    hasAvatar?: boolean
    spaceHolderNumber: number
}>()
</script>
