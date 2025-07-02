<template>
    <button
        class="flex w-full flex-1 select-none items-center justify-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-all duration-300 focus:ring-1 focus:ring-neutral-200 disabled:pointer-events-none disabled:border-neutral-200 disabled:text-neutral-300 hover:bg-neutral-100 active:bg-neutral-200"
        :class="{
            active: active,
        }"
        :disabled="disabled"
        @click.prevent="$emit('onClick')"
    >
        <span class="flex items-center justify-center gap-1">
            <BaseIcon v-if="leftIcon" :name="leftIcon" size="xs" />
            <span> {{ text }} </span>
            <BaseIcon v-if="rightIcon" :name="rightIcon" size="xs" />
        </span>
    </button>
</template>

<script setup lang="ts">
import { Icons } from '@/types/styles'
import BaseIcon from '../icon/BaseIcon.vue'

defineEmits(['onClick'])
defineProps<{
    text: string
    leftIcon?: Icons
    rightIcon?: Icons
    active?: boolean
    disabled?: boolean
}>()
</script>

<style scoped>
.active {
    @apply pointer-events-none bg-neutral-200;
}
</style>
