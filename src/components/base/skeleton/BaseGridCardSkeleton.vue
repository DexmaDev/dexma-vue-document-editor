<template>
    <div
        :class="{
            'animate-pulse': pulse,
        }"
        class="grid gap-4 w-full flex-col grid-cols-1 lg:grid-cols-4 md:grid-cols-2"
    >
        <BaseCardSkeleton v-for="(skeleton, i) in 4" :key="i" />
    </div>
</template>
<script lang="ts" setup>
import BaseCardSkeleton from '@/components/base/skeleton/BaseCardSkeleton.vue'

defineProps<{
    pulse?: boolean
}>()
</script>
