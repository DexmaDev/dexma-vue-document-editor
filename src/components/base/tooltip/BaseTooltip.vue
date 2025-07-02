<template>
    <popper
        :close-delay="closeDelay"
        :disable-click-away="disableClickAway"
        :hover="true"
        :open-delay="openDelay"
        :placement="placement"
        :z-index="zIndex"
    >
        <slot />
        <template #content>
            <span class="text-sm">
                <slot name="content" />
            </span>
        </template>
    </popper>
</template>

<script lang="ts" setup>
import Popper from 'vue3-popper'

withDefaults(
    defineProps<{
        placement?:
            | 'left'
            | 'left-start'
            | 'left-end'
            | 'right'
            | 'right-start'
            | 'right-end'
            | 'bottom'
            | 'bottom-start'
            | 'bottom-end'
            | 'top'
            | 'top-start'
            | 'top-end'
        openDelay?: number
        closeDelay?: number
        disableClickAway?: boolean
        zIndex?: number
    }>(),
    {
        placement: 'top',
        openDelay: 0,
        closeDelay: 0,
        disableClickAway: false,
        zIndex: 9999,
    }
)
</script>

<style scoped>
:deep(.popper) {
    --popper-theme-background-color: theme('colors.neutral.200');
    --popper-theme-background-color-hover: var(--popper-theme-background-color);
    --popper-theme-text-color: theme('colors.neutral.800');
    --popper-theme-border-width: 0px;
    --popper-theme-border-style: solid;
    --popper-theme-border-radius: 6px;
    --popper-theme-padding: 4px 8px;
    --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);
}
</style>
