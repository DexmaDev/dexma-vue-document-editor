<template>
    <div
        :class="{
            'badge-lg': size == 'lg',
            'badge-md': size == 'md',
            'badge-sm': size == 'sm',
            primary: color == 'primary' && (variant ?? 'solid') != 'outline',
            secondary:
                color == 'secondary' && (variant ?? 'solid') != 'outline',
            info: color == 'info' && (variant ?? 'solid') != 'outline',
            error: color == 'error' && (variant ?? 'solid') != 'outline',
            warning: color == 'warning' && (variant ?? 'solid') != 'outline',
            success: color == 'success' && (variant ?? 'solid') != 'outline',
            neutral: color == 'neutral' && (variant ?? 'solid') != 'outline',
            'neutral-outline':
                color == 'neutral' && (variant ?? 'solid') == 'outline',
            'primary-outline':
                color == 'primary' && (variant ?? 'solid') == 'outline',
            'secondary-outline':
                color == 'secondary' && (variant ?? 'solid') == 'outline',
            'info-outline':
                color == 'info' && (variant ?? 'solid') == 'outline',
            'error-outline':
                color == 'error' && (variant ?? 'solid') == 'outline',
            'warning-outline':
                color == 'warning' && (variant ?? 'solid') == 'outline',
            'success-outline':
                color == 'success' && (variant ?? 'solid') == 'outline',
        }"
        class="base-badge truncate overflow-hidden whitespace-nowrap text-ellipsis max-w-max select-none items-center gap-1 text-nowrap rounded-3xl transition-all duration-300"
    >
        <BaseAvatar v-if="image" :image="image" size="2xs" />
        <div
            v-else-if="iconName"
            :class="{
                'neutral-close-button':
                    color == 'neutral' && (variant ?? 'solid') != 'outline',
                'primary-close-button':
                    color == 'primary' && (variant ?? 'solid') != 'outline',
                'secondary-close-button':
                    color == 'secondary' && (variant ?? 'solid') != 'outline',
                'info-close-button':
                    color == 'info' && (variant ?? 'solid') != 'outline',
                'error-close-button':
                    color == 'error' && (variant ?? 'solid') != 'outline',
                'warning-close-button':
                    color == 'warning' && (variant ?? 'solid') != 'outline',
                'success-close-button':
                    color == 'success' && (variant ?? 'solid') != 'outline',
                'neutral-outline-close-button':
                    color == 'neutral' && (variant ?? 'solid') == 'outline',
                'primary-outline-close-button':
                    color == 'primary' && (variant ?? 'solid') == 'outline',
                'secondary-outline-close-button':
                    color == 'secondary' && (variant ?? 'solid') == 'outline',
                'info-outline-close-button':
                    color == 'info' && (variant ?? 'solid') == 'outline',
                'error-outline-close-button':
                    color == 'error' && (variant ?? 'solid') == 'outline',
                'warning-outline-close-button':
                    color == 'warning' && (variant ?? 'solid') == 'outline',
                'success-outline-close-button':
                    color == 'success' && (variant ?? 'solid') == 'outline',
                'p-0.5': size != 'sm',
                'p-px': size == 'sm',
            }"
            class="cursor-pointer rounded-full text-white"
        >
            <BaseIcon :name="iconName" size="xs" />
        </div>
        {{ text }}
        <div
            v-if="closeButton"
            :class="{
                'neutral-close-button':
                    color == 'neutral' && (variant ?? 'solid') != 'outline',
                'primary-close-button':
                    color == 'primary' && (variant ?? 'solid') != 'outline',
                'secondary-close-button':
                    color == 'secondary' && (variant ?? 'solid') != 'outline',
                'info-close-button':
                    color == 'info' && (variant ?? 'solid') != 'outline',
                'error-close-button':
                    color == 'error' && (variant ?? 'solid') != 'outline',
                'warning-close-button':
                    color == 'warning' && (variant ?? 'solid') != 'outline',
                'success-close-button':
                    color == 'success' && (variant ?? 'solid') != 'outline',
                'neutral-outline-close-button':
                    color == 'neutral' && (variant ?? 'solid') == 'outline',
                'primary-outline-close-button':
                    color == 'primary' && (variant ?? 'solid') == 'outline',
                'secondary-outline-close-button':
                    color == 'secondary' && (variant ?? 'solid') == 'outline',
                'info-outline-close-button':
                    color == 'info' && (variant ?? 'solid') == 'outline',
                'error-outline-close-button':
                    color == 'error' && (variant ?? 'solid') == 'outline',
                'warning-outline-close-button':
                    color == 'warning' && (variant ?? 'solid') == 'outline',
                'success-outline-close-button':
                    color == 'success' && (variant ?? 'solid') == 'outline',
                'p-0.5': size != 'sm',
                'p-px': size == 'sm',
            }"
            class="cursor-pointer rounded-full text-white"
            @click="$emit('onClose')"
        >
            <BaseIcon name="clear" size="xs" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icons, PrimaryColors } from '@/types/styles'
import BaseIcon from '../icon/BaseIcon.vue'
import BaseAvatar from '../avatar/BaseAvatar.vue'

defineEmits(['onClose'])

withDefaults(
    defineProps<{
        text: string | undefined
        variant?: 'solid' | 'outline'
        color?: PrimaryColors
        size?: 'sm' | 'md' | 'lg'
        image?: string
        iconName?: Icons
        closeButton?: boolean
    }>(),
    {
        size: 'md',
        color: 'primary',
        variant: 'solid',
        image: undefined,
        iconName: undefined,
    }
)
</script>
<style scoped>
.badge-sm {
    @apply px-2 py-0.5 text-xs font-semibold leading-none;
}

.badge-md {
    @apply px-2.5 py-0.5 text-sm font-semibold leading-tight;
}

.badge-lg {
    @apply px-3 py-1 text-sm font-semibold leading-tight;
}

.neutral {
    @apply bg-neutral-500 text-white hover:bg-neutral-600;
}

.primary {
    @apply bg-primary-500 text-white hover:bg-primary-600;
}

.secondary {
    @apply bg-secondary-500 text-white hover:bg-secondary-600;
}

.error {
    @apply bg-error-500 text-white hover:bg-error-600;
}

.info {
    @apply bg-info-500 text-white hover:bg-info-600;
}

.warning {
    @apply bg-warning-500 text-white hover:bg-warning-600;
}

.success {
    @apply bg-success-500 text-white hover:bg-success-600;
}

.neutral-outline {
    @apply border-2 border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-100;
}

.primary-outline {
    @apply border-2 border-primary-300 bg-white text-primary-500 hover:bg-primary-50;
}

.secondary-outline {
    @apply border-2 border-secondary-300 bg-white text-secondary-500 hover:bg-secondary-50;
}

.info-outline {
    @apply border-2 border-info-300 bg-white text-info-500 hover:bg-info-50;
}

.error-outline {
    @apply border-2 border-error-300 bg-white text-error-500 hover:bg-error-50;
}

.warning-outline {
    @apply border-2 border-warning-300 bg-white text-warning-500 hover:bg-warning-50;
}

.success-outline {
    @apply border-2 border-success-300 bg-white text-success-500 hover:bg-success-50;
}

.neutral-close-button {
    @apply bg-neutral-700;
}

.primary-close-button {
    @apply bg-primary-700;
}

.secondary-close-button {
    @apply bg-secondary-700;
}

.info-close-button {
    @apply bg-info-700;
}

.error-close-button {
    @apply bg-error-700;
}

.warning-close-button {
    @apply bg-warning-700;
}

.success-close-button {
    @apply bg-success-700;
}

.neutral-outline-close-button {
    @apply bg-neutral-400;
}

.primary-outline-close-button {
    @apply bg-primary-400;
}

.secondary-outline-close-button {
    @apply bg-secondary-400;
}

.error-outline-close-button {
    @apply bg-error-400;
}

.info-outline-close-button {
    @apply bg-info-400;
}

.warning-outline-close-button {
    @apply bg-warning-400;
}

.success-outline-close-button {
    @apply bg-success-400;
}
</style>
