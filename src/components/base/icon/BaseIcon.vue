<template>
    <component :is="tooltip?.length ? BaseTooltip : 'div'">
        <div
            id="icon"
            :class="{
                'h-9 w-9': size == '2xl',
                'h-8 w-8': size == 'xl',
                'h-7 w-7': size == 'lg',
                'h-6 w-6': size == 'md',
                'h-5 w-5': size == 'sm',
                'h-4 w-4': size == 'xs',
                'h-3 w-3': size == '2xs',
                'h-full w-full': !size,
                'animate-spin': spin,
                ['text-primary-' + tone]: color == 'primary',
                ['text-secondary-' + tone]: color == 'secondary',
                ['text-info-' + tone]: color == 'info',
                ['text-error-' + tone]: color == 'error',
                ['text-warning-' + tone]: color == 'warning',
                ['text-success-' + tone]: color == 'success',
                ['text-neutral-' + tone]: color == 'neutral',
                'text-inherit': !color,
            }"
            class="flex items-center justify-center relative"
        >
            <icomoon :icon-set="selection" :name="name" />
        </div>

        <template v-if="tooltip?.length" #content>
            {{ tooltip }}
        </template>
    </component>
</template>

<script lang="ts" setup>
import { Icons, PrimaryColors, Tones } from '@/types/styles'
import selection from './selection.json'
import { Icomoon } from 'vue-icomoon'
import BaseTooltip from '../tooltip/BaseTooltip.vue'

defineProps<{
    name: Icons
    spin?: boolean
    size?: '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | '2xs'
    color?: PrimaryColors
    tone?: Tones
    tooltip?: string
}>()
</script>

<style scoped>
svg {
    width: 100% !important;
    height: 100% !important;
}
</style>
