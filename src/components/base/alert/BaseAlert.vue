<template>
    <div
        :class="{
            'border-primary-300 bg-primary-50':
                color == 'primary' && variant != 'solid',
            'border-secondary-300 bg-secondary-50':
                color == 'secondary' && variant != 'solid',
            'border-info-300 bg-info-50': color == 'info' && variant != 'solid',
            'border-error-300 bg-error-50':
                color == 'error' && variant != 'solid',
            'border-warning-300 bg-warning-50':
                color == 'warning' && variant != 'solid',
            'border-success-300 bg-success-50':
                color == 'success' && variant != 'solid',
            'border-neutral-300 bg-neutral-100':
                color == 'neutral' && variant != 'solid',
            'bg-primary-500': color == 'primary' && variant == 'solid',
            'bg-secondary-500': color == 'secondary' && variant == 'solid',
            'bg-info-500': color == 'info' && variant == 'solid',
            'bg-error-500': color == 'error' && variant == 'solid',
            'bg-warning-500': color == 'warning' && variant == 'solid',
            'bg-success-500': color == 'success' && variant == 'solid',
            'bg-neutral-500': color == 'neutral' && variant == 'solid',
            border: variant == 'outline',
        }"
        class="w-full rounded-lg p-3"
    >
        <div class="flex gap-3">
            <div v-if="iconName" class="flex items-center">
                <div
                    :class="{
                        'bg-primary-500':
                            color == 'primary' && variant != 'solid',
                        'bg-secondary-500':
                            color == 'secondary' && variant != 'solid',
                        'bg-info-500': color == 'info' && variant != 'solid',
                        'bg-error-500': color == 'error' && variant != 'solid',
                        'bg-warning-500':
                            color == 'warning' && variant != 'solid',
                        'bg-success-500':
                            color == 'success' && variant != 'solid',
                        'bg-neutral-500':
                            color == 'neutral' && variant != 'solid',
                        'bg-white': variant == 'solid',
                    }"
                    class="flex h-6 w-6 items-center justify-center rounded-full"
                >
                    <div
                        :class="{
                            'text-white': variant != 'solid',
                            'text-primary-500':
                                color == 'primary' && variant == 'solid',
                            'text-secondary-500':
                                color == 'secondary' && variant == 'solid',
                            'text-info-500':
                                color == 'info' && variant == 'solid',
                            'text-error-500':
                                color == 'error' && variant == 'solid',
                            'text-warning-500':
                                color == 'warning' && variant == 'solid',
                            'text-success-500':
                                color == 'success' && variant == 'solid',
                            'text-neutral-500':
                                color == 'neutral' && variant == 'solid',
                        }"
                        class="flex h-full w-full items-center justify-center"
                    >
                        <BaseIcon :name="iconName" />
                    </div>
                </div>
            </div>
            <div
                class="flex w-full flex-col items-center justify-between gap-3 md:flex-row"
            >
                <div v-if="!$slots.content" class="flex w-full flex-col gap-1">
                    <BaseText
                        v-if="title"
                        :color="variant == 'solid' ? 'white' : color"
                        :text="title"
                        :tone="900"
                        font="semibold"
                        type="p-md"
                    />
                    <BaseText
                        v-if="text"
                        :color="variant == 'solid' ? 'white' : color"
                        :text="text"
                        :tone="900"
                        font="regular"
                        type="p-sm"
                    />
                </div>
                <slot name="content" />
                <slot name="buttons" />
            </div>
            <div v-if="closeButton">
                <div
                    :class="{
                        'text-primary-500':
                            color == 'primary' && variant != 'solid',
                        'text-secondary-500':
                            color == 'secondary' && variant != 'solid',
                        'text-info-500': color == 'info' && variant != 'solid',
                        'text-error-500':
                            color == 'error' && variant != 'solid',
                        'text-warning-500':
                            color == 'warning' && variant != 'solid',
                        'text-success-500':
                            color == 'success' && variant != 'solid',
                        'text-neutral-500':
                            color == 'neutral' && variant != 'solid',
                        'text-white': variant == 'solid',
                    }"
                    class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full"
                    @click.prevent="$emit('onClose')"
                >
                    <div
                        :class="{
                            'hover:bg-primary-100':
                                color == 'primary' && variant != 'solid',
                            'hover:bg-secondary-100':
                                color == 'secondary' && variant != 'solid',
                            'hover:bg-info-100':
                                color == 'info' && variant != 'solid',
                            'hover:bg-error-100':
                                color == 'error' && variant != 'solid',
                            'hover:bg-warning-100':
                                color == 'warning' && variant != 'solid',
                            'hover:bg-success-100':
                                color == 'success' && variant != 'solid',
                            'hover:bg-neutral-200':
                                color == 'neutral' && variant != 'solid',
                            'hover:bg-primary-400':
                                color == 'primary' && variant == 'solid',
                            'hover:bg-secondary-400':
                                color == 'secondary' && variant == 'solid',
                            'hover:bg-info-400':
                                color == 'info' && variant == 'solid',
                            'hover:bg-error-400':
                                color == 'error' && variant == 'solid',
                            'hover:bg-warning-400':
                                color == 'warning' && variant == 'solid',
                            'hover:bg-success-400':
                                color == 'success' && variant == 'solid',
                            'hover:bg-neutral-400':
                                color == 'neutral' && variant == 'solid',
                        }"
                        class="flex h-5 w-5 items-center justify-center rounded-full"
                    >
                        <BaseIcon name="clear" />
                    </div>
                </div>
            </div>
        </div>
        <BaseProgress
            v-if="percentageProgressBar"
            :color="color"
            :progress="percentageProgressBar"
        />
    </div>
</template>

<script lang="ts" setup>
import { Icons, PrimaryColors } from '@/types/styles'
import BaseIcon from '../icon/BaseIcon.vue'
import BaseText from '../text/BaseText.vue'
import BaseProgress from '@/components/base/progress/BaseProgress.vue'

defineEmits(['onClose'])

withDefaults(
    defineProps<{
        title?: string
        text?: string
        variant?: 'default' | 'solid' | 'outline'
        color?: PrimaryColors
        iconName?: Icons
        closeButton?: boolean
        percentageProgressBar?: number
    }>(),
    {
        iconName: undefined,
        variant: 'default',
        color: 'primary',
        percentageProgressBar: undefined,
        title: undefined,
        text: undefined,
    }
)
</script>
