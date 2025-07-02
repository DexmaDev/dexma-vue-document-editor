<template>
    <component
        :is="href ? 'a' : 'button'"
        :href="href"
        :type="type"
        class="flex w-full select-none items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-300 disabled:pointer-events-none"
        :class="{
            primary: color == 'primary' && variant == 'default',
            secondary: color == 'secondary' && variant == 'default',
            info: color == 'info' && variant == 'default',
            error: color == 'error' && variant == 'default',
            warning: color == 'warning' && variant == 'default',
            success: color == 'success' && variant == 'default',
            neutral: color == 'neutral' && variant == 'default',
            danger: color == 'danger' && variant == 'default',
            'primary-text': color == 'primary' && variant != 'default',
            'secondary-text': color == 'secondary' && variant != 'default',
            'info-text': color == 'info' && variant != 'default',
            'error-text': color == 'error' && variant != 'default',
            'warning-text': color == 'warning' && variant != 'default',
            'success-text': color == 'success' && variant != 'default',
            'neutral-text': color == 'neutral' && variant != 'default',
            'danger-text': color == 'danger' && variant != 'default',

            'hover:bg-primary-50 active:bg-primary-100':
                color == 'primary' && variant != 'default' && variant != 'link',
            'hover:bg-secondary-50 active:bg-secondary-100':
                color == 'secondary' &&
                variant != 'default' &&
                variant != 'link',
            'hover:bg-info-50 active:bg-info-100':
                color == 'info' && variant != 'default' && variant != 'link',
            'hover:bg-error-50 active:bg-error-100':
                color == 'error' && variant != 'default' && variant != 'link',
            'hover:bg-warning-50 active:bg-warning-100':
                color == 'warning' && variant != 'default' && variant != 'link',
            'hover:bg-success-50 active:bg-success-100':
                color == 'success' && variant != 'default' && variant != 'link',
            'hover:bg-neutral-100 active:bg-neutral-200':
                color == 'neutral' && variant != 'default' && variant != 'link',
            border: variant == 'outline',
            'focus:ring-2': variant != 'link',
            'px-6 py-3': size == 'lg' && variant != 'link',
            'px-5 py-2.5': size == 'md' && variant != 'link',
            'px-5 py-2.5 text-sm': size == 'sm' && variant != 'link',
            'px-4 py-2 text-sm': size == 'xs' && variant != 'link',
            'px-3.5 py-1.5 text-sm': size == '2xs',
        }"
        :disabled="disabled"
        @click="$emit('onClick')"
    >
        <span
            :class="{
                'w-full': $slots.default,
            }"
            class="flex items-center justify-center gap-2"
        >
            <BaseIcon
                v-if="leftIcon"
                :spin="iconSpin"
                :name="leftIcon"
                size="sm"
            />
            <span
                :class="{
                    'whitespace-nowrap': true,
                    flex: $slots.default,
                    'gap-2 w-full': $slots.default,
                }"
            >
                <template v-if="!$slots.default">{{ text }}</template>
                <slot />
            </span>
            <BaseIcon
                v-if="rightIcon"
                :spin="iconSpin"
                :name="rightIcon"
                size="sm"
            />
        </span>
    </component>
</template>

<script setup lang="ts">
import { Icons, PrimaryColors } from '@/types/styles'
import BaseIcon from '../icon/BaseIcon.vue'

defineEmits(['onClick'])
withDefaults(
    defineProps<{
        text?: string
        color?: PrimaryColors
        variant?: 'default' | 'outline' | 'blank' | 'link'
        size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg'
        type?: 'submit' | 'reset' | 'button'
        leftIcon?: Icons
        rightIcon?: Icons
        href?: string
        disabled?: boolean
        iconSpin?: boolean
    }>(),
    {
        text: undefined,
        color: 'primary',
        variant: 'default',
        size: 'md',
        type: 'button',
        leftIcon: undefined,
        rightIcon: undefined,
        href: undefined,
    }
)
</script>
<style scoped>
.primary {
    @apply bg-primary-500 text-white focus:ring-primary-400 disabled:bg-primary-200 hover:bg-primary-700 active:bg-primary-800;
}

.secondary {
    @apply bg-secondary-500 text-white focus:ring-secondary-400 disabled:bg-secondary-200 hover:bg-secondary-700 active:bg-secondary-800;
}

.info {
    @apply bg-info-500 text-white focus:ring-info-400 disabled:bg-info-200 hover:bg-info-700 active:bg-info-800;
}

.error {
    @apply bg-error-500 text-white focus:ring-error-400 disabled:bg-error-200 hover:bg-error-700 active:bg-error-800;
}

.warning {
    @apply bg-warning-500 text-white focus:ring-warning-400 disabled:bg-warning-200 hover:bg-warning-700 active:bg-warning-800;
}

.success {
    @apply bg-success-500 text-white focus:ring-success-400 disabled:bg-success-200 hover:bg-success-700 active:bg-success-800;
}

.neutral {
    @apply bg-neutral-200 text-neutral-700 focus:ring-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-400 hover:bg-neutral-300 active:bg-neutral-400 active:text-neutral-900;
}

.danger {
    @apply bg-error-500 text-white focus:ring-error-400 disabled:bg-error-200 hover:bg-error-700 active:bg-error-800;
}

.primary-text {
    @apply border-primary-500 text-primary-500  focus:ring-primary-100 disabled:border-primary-100 disabled:text-primary-100 hover:text-primary-700 active:text-primary-900;
}

.secondary-text {
    @apply border-secondary-500 text-secondary-500  focus:ring-secondary-100 disabled:border-secondary-200 disabled:text-secondary-200 hover:text-secondary-700 active:text-secondary-800;
}

.info-text {
    @apply border-info-500 text-info-500  focus:ring-info-100 disabled:border-info-200 disabled:text-info-200 hover:text-info-700 active:text-info-800;
}

.error-text {
    @apply border-error-500 text-error-500  focus:ring-error-100 disabled:border-error-200 disabled:text-error-200 hover:text-error-700 active:text-error-800;
}

.warning-text {
    @apply border-warning-500 text-warning-500  focus:ring-warning-100 disabled:border-warning-200 disabled:text-warning-200 hover:text-warning-700 active:text-warning-800;
}

.success-text {
    @apply border-success-500 text-success-500  focus:ring-success-100 disabled:border-success-200 disabled:text-success-200 hover:text-success-700 active:text-success-800;
}

.neutral-text {
    @apply border-neutral-500 text-neutral-500  focus:ring-neutral-200 disabled:border-neutral-300 disabled:text-neutral-300 hover:text-neutral-600 active:text-neutral-700;
}

.danger-text {
    @apply border-error-500 text-error-500  focus:ring-error-100 disabled:border-error-200 disabled:text-error-200 hover:text-error-700 active:text-error-800;
}
</style>
