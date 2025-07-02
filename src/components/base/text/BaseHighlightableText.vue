<template>
    <component :is="tooltip?.length ? BaseTooltip : 'div'">
        <component
            :is="
                ['p-lg', 'p-md', 'p-sm', 'subtitle', 'caption'].includes(type)
                    ? 'p'
                    : type
            "
            v-safe-html="formattedText"
            :class="{
                'text-7xl': type == 'h1',
                'xl:text-6xl': type == 'h2',
                'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl xl:leading-[3rem]':
                    type == 'h3',
                'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl':
                    type == 'h4',
                'text-3xl': type == 'h5',
                'text-2xl leading-[1.2]': type == 'h6',
                'text-xl leading-7': type == 'subtitle',
                'text-lg leading-normal': type == 'p-lg',
                'text-base leading-normal': type == 'p-md',
                'text-sm leading-tight': type == 'p-sm',
                'text-xs leading-tight': type == 'p-xs',
                'text-xs leading-none': type == 'caption',
                'font-bold': font == 'bold',
                'font-cirulo-semibold font-semibold': font == 'semibold',
                'font-medium': font == 'medium',
                'font-normal': font == 'regular',
                'truncate overflow-hidden whitespace-nowrap text-ellipsis':
                    truncate === true,
                'text-white': color == 'white',
                ['text-primary-' + tone]: color == 'primary',
                ['text-secondary-' + tone]: color == 'secondary',
                ['text-info-' + tone]: color == 'info',
                ['text-error-' + tone]: color == 'error',
                ['text-warning-' + tone]: color == 'warning',
                ['text-success-' + tone]: color == 'success',
                ['text-neutral-' + tone]: color == 'neutral',
            }"
        />
        <template v-if="tooltip?.length" #content>
            <BaseText :text="tooltip" type="p-xs" />
        </template>
    </component>
</template>

<script lang="ts" setup>
import { PrimaryColors, Tones } from '@/types/styles'
import BaseTooltip from '../tooltip/BaseTooltip.vue'
import { computed } from 'vue'
import BaseText from './BaseText.vue'

const props = withDefaults(
    defineProps<{
        text: string | number | undefined
        type?:
            | 'h1'
            | 'h2'
            | 'h3'
            | 'h4'
            | 'h5'
            | 'h6'
            | 'caption'
            | 'p-lg'
            | 'p-md'
            | 'p-sm'
            | 'p-xs'
            | 'subtitle'
        font?: 'bold' | 'semibold' | 'medium' | 'regular'
        color?: PrimaryColors
        tone?: Tones
        tooltip?: string
        truncate?: boolean
        highlightedText?: string
    }>(),
    {
        font: 'regular',
        type: 'p-md',
        color: 'primary',
        tone: 500,
        tooltip: undefined,
        truncate: false,
        highlightedText: undefined,
    }
)

// Helper to escape RegExp special characters
const escapeRegExp = (str: string): string =>
    str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Create computed property to highlight text if prop is set
const formattedText = computed(() => {
    const rawText =
        typeof props.text === 'number'
            ? props.text.toString()
            : props.text || ''
    if (props.highlightedText && props.highlightedText.length) {
        // Use case-insensitive regex and replace with matched substring
        const re = new RegExp(escapeRegExp(props.highlightedText), 'gi')
        return rawText.replace(re, (match) => `<mark>${match}</mark>`)
    }
    return rawText
})
</script>
