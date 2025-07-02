<template>
    <div
        class="relative flex items-center justify-center rounded-full"
        :class="{
            'h-4 w-4': size == '2xs' && image,
            'h-6 w-6': size == 'xs' && image,
            'h-8 w-8': size == 'sm' && image,
            'h-10 w-10': size == 'md' && image,
            'h-12 w-12': size == 'lg' && image,
            'h-14 w-14': size == 'xl' && image,
            'h-16 w-16': size == '2xl' && image,
            'h-20 w-20': size == '3xl' && image,
            'h-24 w-24': size == '4xl' && image,
            'h-28 w-28': size == '5xl' && image,
            'h-6 w-6 p-1': size == 'xs' && !image,
            'h-8 w-8 p-2': size == 'sm' && !image,
            'h-10 w-10 p-2': size == 'md' && !image,
            'h-12 w-12 p-3': size == 'lg' && !image,
            'h-14 w-14 p-3': size == 'xl' && !image,
            'h-16 w-16 p-3': size == '2xl' && !image,
            'h-20 w-20 p-3': size == '3xl' && !image,
            'h-24 w-24 p-3 ': size == '4xl' && !image,
            'h-28 w-28 p-3 ': size == '5xl' && !image,
            'cursor-pointer': clickable,
            'pointer-events-none': !clickable,
            'bg-primary-200 text-primary-500': color == 'primary',
            'bg-secondary-200 text-secondary-500': color == 'secondary',
            'bg-info-200 text-info-500': color == 'info',
            'bg-error-200 text-error-500': color == 'error',
            'bg-warning-200 text-warning-500': color == 'warning',
            'bg-success-200 text-success-500': color == 'success',
            'bg-neutral-200 text-neutral-500': color == 'neutral',
        }"
        @click="$emit('onClick')"
    >
        <img
            v-if="image"
            class="rounded-full bg-cover"
            :class="{
                'h-4 w-4': size == '2xs',
                'h-6 w-6': size == 'xs',
                'h-8 w-8': size == 'sm',
                'h-10 w-10': size == 'md',
                'h-12 w-12': size == 'lg',
                'h-14 w-14': size == 'xl',
                'h-16 w-16': size == '2xl',
            }"
            :src="image"
        />
        <BaseIcon v-else-if="iconName" :name="iconName" />
        <span
            v-if="indicatorColor"
            class="absolute bottom-0 right-0 h-4 w-4 rounded-full border border-white"
            :class="{
                'h-4 w-4': size == '2xl',
                'h-3.5 w-3.5': size == 'xl',
                'h-3 w-3': size == 'lg',
                'h-2.5 w-2.5': size == 'md',
                'h-2 w-2': size == 'sm',
                'h-1.5 w-1.5': size == 'xs',
                'h-1 w-1': size == '2xs',
                'bg-primary-500': indicatorColor == 'primary',
                'bg-secondary-500': indicatorColor == 'secondary',
                'bg-info-500': indicatorColor == 'info',
                'bg-error-500': indicatorColor == 'error',
                'bg-warning-500': indicatorColor == 'warning',
                'bg-success-500': indicatorColor == 'success',
                'bg-neutral-500': indicatorColor == 'neutral',
            }"
        ></span>
    </div>
</template>

<script setup lang="ts">
import { Icons, PrimaryColors } from '@/types/styles'
import BaseIcon from '../icon/BaseIcon.vue'

defineEmits(['onClick'])

withDefaults(
    defineProps<{
        image?: string
        iconName?: Icons
        size?:
            | '2xs'
            | 'xs'
            | 'sm'
            | 'md'
            | 'lg'
            | 'xl'
            | '2xl'
            | '3xl'
            | '4xl'
            | '5xl'
        color?: PrimaryColors
        indicatorColor?: PrimaryColors
        clickable?: boolean
    }>(),
    {
        image: undefined,
        iconName: undefined,
        size: 'md',
        color: 'primary',
        indicatorColor: undefined,
    }
)
</script>
<style scoped></style>
