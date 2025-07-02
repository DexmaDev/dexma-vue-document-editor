<template>
    <component
        :is="tooltip?.length ? BaseTooltip : 'div'"
        :style="containerStyle"
    >
        <component
            :is="noButton ? 'div' : 'button'"
            :type="type"
            :class="[
                {
                    border: variant == 'outline',
                    'rounded-full': circle,
                    'rounded-lg': !circle,
                    primary: color == 'primary' && variant == 'default',
                    secondary: color == 'secondary' && variant == 'default',
                    info: color == 'info' && variant == 'default',
                    error: color == 'error' && variant == 'default',
                    warning: color == 'warning' && variant == 'default',
                    success: color == 'success' && variant == 'default',
                    neutral: color == 'neutral' && variant == 'default',
                    'primary-text': color == 'primary' && variant != 'default',
                    'secondary-text':
                        color == 'secondary' && variant != 'default',
                    'info-text': color == 'info' && variant != 'default',
                    'error-text': color == 'error' && variant != 'default',
                    'warning-text': color == 'warning' && variant != 'default',
                    'success-text': color == 'success' && variant != 'default',
                    'neutral-text': color == 'neutral' && variant != 'default',
                    'button-2xl': size == '2xl',
                    'button-xl': size == 'xl',
                    'button-lg': size == 'lg',
                    'button-md': size == 'md',
                    'button-sm': size == 'sm',
                    'button-xs': size == 'xs',
                    'button-2xs': size == '2xs',
                    'pointer-events-none': disabled,
                },
                buttonClass,
            ]"
            :disabled="disabled"
            class="flex items-center justify-center transition-all duration-300 relative"
            @click="$emit('onClick')"
        >
            <BaseIcon :name="icon" :size="size" />

            <div v-if="badgeText" class="absolute top-0 right-0">
                <BaseText
                    :text="badgeText"
                    type="p-xs"
                    font="semibold"
                    :color="badgeColor"
                />
            </div>
        </component>

        <template v-if="tooltip?.length" #content>
            {{ tooltip }}
        </template>
    </component>
</template>

<script lang="ts" setup>
import { Icons, PrimaryColors } from '@/types/styles'
import BaseIcon from '../icon/BaseIcon.vue'
import BaseTooltip from '../tooltip/BaseTooltip.vue'
import { CSSProperties } from 'vue'
import BaseText from '../text/BaseText.vue'

defineEmits(['onClick'])

withDefaults(
    defineProps<{
        icon: Icons
        color?: PrimaryColors
        variant?: 'default' | 'outline' | 'blank'
        size?: '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | '2xs'
        circle?: boolean
        disabled?: boolean
        noButton?: boolean
        tooltip?: string
        type?: 'submit' | 'reset' | 'button'
        containerStyle?: CSSProperties
        buttonClass?: string
        badgeText?: string
        badgeColor?: PrimaryColors
    }>(),
    {
        color: 'primary',
        variant: 'default',
        size: 'md',
        noButton: false,
        tooltip: undefined,
        type: 'button',
        containerStyle: undefined,
        buttonClass: undefined,
        badgeText: undefined,
        badgeColor: 'primary',
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

.primary-text {
    @apply border-primary-500 text-primary-500  focus:ring-primary-100 disabled:border-primary-100 disabled:text-primary-100 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 active:text-primary-900;
}

.secondary-text {
    @apply border-secondary-500 text-secondary-500  focus:ring-secondary-100 disabled:border-secondary-200 disabled:text-secondary-200 hover:bg-secondary-50 hover:text-secondary-700 active:bg-secondary-100 active:text-secondary-800;
}

.info-text {
    @apply border-info-500 text-info-500  focus:ring-info-100 disabled:border-info-200 disabled:text-info-200 hover:bg-info-50 hover:text-info-700 active:bg-info-100 active:text-info-800;
}

.error-text {
    @apply border-error-500 text-error-500  focus:ring-error-100 disabled:border-error-200 disabled:text-error-200 hover:bg-error-50 hover:text-error-700 active:bg-error-100 active:text-error-800;
}

.warning-text {
    @apply border-warning-500 text-warning-500  focus:ring-warning-100 disabled:border-warning-200 disabled:text-warning-200 hover:bg-warning-50 hover:text-warning-700 active:bg-warning-100 active:text-warning-800;
}

.success-text {
    @apply border-success-500 text-success-500  focus:ring-success-100 disabled:border-success-200 disabled:text-success-200 hover:bg-success-50 hover:text-success-700 active:bg-success-100 active:text-success-800;
}

.neutral-text {
    @apply border-neutral-500 text-neutral-500  focus:ring-neutral-200 disabled:border-neutral-300 disabled:text-neutral-300 hover:bg-neutral-100 hover:text-neutral-600 active:bg-neutral-200 active:text-neutral-700;
}

.button-2xl {
    @apply h-16 w-16 focus:ring-1;
}

.button-xl {
    @apply h-14 w-14 focus:ring-1;
}

.button-lg {
    @apply h-12 w-12 focus:ring-1;
}

.button-md {
    @apply h-10 w-10 focus:ring-1;
}

.button-sm {
    @apply h-7 w-7 focus:ring-1;
}

.button-xs {
    @apply h-6 w-6 focus:ring-1;
}

.button-2xs {
    @apply h-5 w-5 focus:ring-1;
}
</style>
