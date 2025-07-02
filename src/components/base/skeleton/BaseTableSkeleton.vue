<template>
    <div
        :class="{
            'animate-pulse': pulse,
        }"
        class="flex flex-col w-full gap-2 rounded-md bg-white py-2 px-3"
    >
        <div class="flex w-full flex-col rounded-xl border border-neutral-200">
            <div class="overflow-x-auto overflow-y-hidden min-h-[12rem]">
                <table class="w-full divide-y divide-neutral-200">
                    <BaseTableHeaderSkeleton :colums="colums" :pulse="pulse" />
                    <BaseTableBodySkeleton
                        :rows="rows"
                        :colums="colums"
                        :pulse="pulse"
                    />
                </table>
            </div>
            <div class="w-full border-t py-3 px-6 flex justify-between">
                <div class="h-5 w-20 rounded-full bg-neutral-200" />

                <div class="h-5 w-5 rounded-full bg-neutral-200" />

                <div class="h-5 w-20 rounded-full bg-neutral-200" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import BaseTableBodySkeleton from './BaseTableBodySkeleton.vue'
import BaseTableHeaderSkeleton from './BaseTableHeaderSkeleton.vue'
withDefaults(
    defineProps<{
        rows?: number
        colums?: number
        pulse?: boolean
    }>(),
    {
        rows: 4,
        colums: 4,
        pulse: false,
    }
)
</script>
