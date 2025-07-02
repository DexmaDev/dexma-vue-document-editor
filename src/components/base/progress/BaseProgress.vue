<template>
    <div
        :class="{
            'bg-primary-200': color == 'primary',
            'bg-secondary-200': color == 'secondary',
            'bg-info-200': color == 'info',
            'bg-error-200': color == 'error',
            'bg-warning-200': color == 'warning',
            'bg-success-200': color == 'success',
            'bg-neutral-200': color == 'neutral',
        }"
        class="mt-3 h-1.5 w-full rounded-full"
    >
        <div
            :class="{
                'bg-primary-500': color == 'primary',
                'bg-secondary-500': color == 'secondary',
                'bg-info-500': color == 'info',
                'bg-error-500': color == 'error',
                'bg-warning-500': color == 'warning',
                'bg-success-500': color == 'success',
                'bg-neutral-500': color == 'neutral',
            }"
            :style="`width: ${progress}%`"
            class="h-1.5 rounded-full"
        />
    </div>
</template>

<script lang="ts" setup>
import { PrimaryColors } from '@/types/styles'

defineProps<{
    progress: number
    color: PrimaryColors
}>()
</script>
