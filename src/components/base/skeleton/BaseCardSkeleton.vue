<template>
    <div
        class="flex w-full h-max flex-col gap-2 bg-white p-3 rounded-xl"
        :class="{
            'animate-pulse': pulse,
        }"
    >
        <div class="flex w-full flex-col items-center gap-2 lg:flex-row">
            <div class="h-5 w-5 bg-neutral-200 rounded-full" />
            <div class="h-5 w-20 rounded-full bg-neutral-200" />
        </div>
        <div class="flex w-full flex-col">
            <div class="grid grid-cols-2 w-full gap-4">
                <div
                    v-if="hasAvatar"
                    class="flex col-span-2 relative w-full justify-center"
                >
                    <div class="h-16 w-16 bg-neutral-200 rounded-full" />
                </div>
                <div
                    v-if="hasAvatar"
                    class="flex col-span-2 my-2 relative w-full border-t justify-center animate-none border-neutral-200"
                >
                    <div class="absolute -top-2 bg-white px-3">
                        <div class="h-4 w-10 bg-neutral-200 rounded-full" />
                    </div>
                </div>
                <div
                    v-for="(skeleton, i) in 4"
                    :key="i"
                    class="flex w-full flex-wrap items-center justify-between"
                >
                    <div class="h-4 w-12 bg-neutral-200 rounded-full" />
                    <div class="h-4 w-12 bg-neutral-200 rounded-full" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    pulse?: boolean
    hasAvatar?: boolean
}>()
</script>
