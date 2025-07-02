<template>
    <div
        :class="{
            'animate-pulse': pulse,
        }"
        class="flex w-full flex-col"
    >
        <div
            :class="{
                'rounded-xl': onlyTitle,
            }"
            class="flex w-full items-center gap-2 bg-neutral-100 py-2 px-3 rounded-t-xl"
        >
            <div class="h-5 w-5 bg-neutral-200 rounded-full" />
            <div class="h-5 w-20 rounded-full bg-neutral-200" />
        </div>
        <div v-if="!onlyTitle" class="rounded-b-xl bg-white py-2 px-3">
            <div class="grid grid-cols-4 gap-4">
                <div
                    v-for="i in 8"
                    :key="i"
                    class="flex justify-between items-center"
                >
                    <div class="flex w-full items-center gap-1">
                        <div class="h-5 w-5 bg-neutral-200 rounded-full" />
                        <div class="h-5 w-20 rounded-full bg-neutral-200" />
                    </div>
                    <div class="h-5 w-20 rounded-full bg-neutral-200" />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
defineProps<{
    pulse?: boolean
    onlyTitle?: boolean
}>()
</script>
