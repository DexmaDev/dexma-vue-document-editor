<template>
    <popper
        :close-delay="0"
        :disable-click-away="false"
        :open-delay="0"
        :z-index="10"
        :disabled="disabled"
        placement="bottom-start"
        style="margin: unset; border: unset; width: 100%; height: 100%"
        @close:popper="emit('onClose')"
    >
        <div>
            <slot name="button" />
            <BaseButtonIcon
                v-if="!$slots['button']"
                :color="color"
                :icon="icon"
                :size="size"
                :variant="variant"
                :tooltip="tooltip"
                :disabled="disabled"
                type="button"
                @click="toggleMenu"
            />
        </div>

        <template #content="{ close }">
            <div class="bg-white border border-gray-300 rounded-md shadow-sm">
                <slot name="content" v-bind="{ close }" />
            </div>
        </template>
    </popper>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Icons, PrimaryColors } from '@/types/styles'
import BaseButtonIcon from '@/components/base/button/BaseButtonIcon.vue'
import Popper from 'vue3-popper'

const props = withDefaults(
    defineProps<{
        icon?: Icons
        size?: '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
        color?: PrimaryColors
        variant?: 'default' | 'outline' | 'blank'
        tooltip?: string
        disabled?: boolean
    }>(),
    {
        icon: 'chevron-down',
        size: 'md',
        color: 'neutral',
        variant: 'default',
        tooltip: undefined,
        disabled: undefined,
    }
)

const emit = defineEmits(['onClose', 'onToggleMenu'])

const isOpen = ref(false)

const toggleMenu = () => {
    if (!props.disabled) {
        isOpen.value = !isOpen.value
        emit('onToggleMenu', isOpen.value)
    }
}
</script>
