<template>
    <div
        :class="[
            {
                'rounded-t-xl': rounded === 'top',
                'rounded-b-xl': rounded === 'bottom',
                'rounded-l-xl': rounded === 'left',
                'rounded-r-xl': rounded === 'right',
                'rounded-xl': rounded === 'all',
                'bg-white': backgroundColor == 'white',
                ['bg-primary-' + backgroundTone]: backgroundColor == 'primary',
                ['bg-secondary-' + backgroundTone]:
                    backgroundColor == 'secondary',
                ['bg-info-' + backgroundTone]: backgroundColor == 'info',
                ['bg-error-' + backgroundTone]: backgroundColor == 'error',
                ['bg-warning-' + backgroundTone]: backgroundColor == 'warning',
                ['bg-success-' + backgroundTone]: backgroundColor == 'success',
                ['bg-neutral-' + backgroundTone]: backgroundColor == 'neutral',
            },
            heightClass,
            customClass,
        ]"
        class="flex w-full flex-col gap-2 p-3"
    >
        <div
            v-if="title || $slots.headerActions || titleIcon"
            class="flex w-full flex-col items-center justify-between lg:flex-row"
        >
            <div
                v-if="title || titleIcon || !$slots.title"
                class="flex w-full items-center gap-2"
            >
                <BaseIcon v-if="titleIcon" :name="titleIcon" size="md" />
                <BaseText
                    v-if="title"
                    :text="title"
                    :tone="900"
                    color="neutral"
                    font="semibold"
                    type="p-md"
                />
            </div>
            <div v-else>
                <slot name="title" />
            </div>
            <div class="flex items-center gap-2">
                <slot name="headerActions" />
            </div>
        </div>
        <slot />
    </div>
</template>

<script lang="ts" setup>
import { Icons, PrimaryColors, Tones } from '@/types/styles'
import BaseIcon from '../icon/BaseIcon.vue'
import BaseText from '../text/BaseText.vue'

withDefaults(
    defineProps<{
        title?: string
        titleIcon?: Icons
        rounded?: 'top' | 'bottom' | 'all' | 'left' | 'right'
        backgroundColor?: PrimaryColors | 'white'
        backgroundTone?: Tones
        heightClass?: string
        customClass?: string
    }>(),
    {
        title: undefined,
        titleIcon: undefined,
        rounded: 'all',
        backgroundColor: 'white',
        backgroundTone: 500,
        heightClass: 'h-max',
        customClass: '',
    }
)
</script>
