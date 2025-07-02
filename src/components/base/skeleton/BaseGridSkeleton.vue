<template>
    <div
        :class="{
            'animate-pulse': pulse,
        }"
        class="grid gap-4 w-full flex-col grid-cols-1 lg:grid-cols-2"
    >
        <BaseTableSkeleton />
        <BaseTableSkeleton />
        <BaseCardSkeleton />
        <BaseCardSkeleton />
    </div>
</template>
<script lang="ts" setup>
import BaseTableSkeleton from '@/components/base/skeleton/BaseTableSkeleton.vue'
import BaseCardSkeleton from '@/components/base/skeleton/BaseCardSkeleton.vue'

defineProps<{
    pulse?: boolean
}>()
</script>
