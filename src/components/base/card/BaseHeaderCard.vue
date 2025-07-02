<template>
    <div class="flex w-full flex-col">
        <div
            v-if="!disableActions"
            class="justify-center items-center flex mb-2"
        >
            <slot name="topButton" />
            <BaseButtonIcon
                v-if="!slots['topButton']"
                :icon="isCollapsed ? 'chevron-down' : 'chevron-up'"
                color="neutral"
                size="md"
                variant="blank"
                @on-click="emit('onChevronClick')"
            />
        </div>
        <div
            v-if="title || titleIcon || $slots.title"
            :class="{
                'rounded-xl': onlyTitle,
            }"
            class="grid grid-cols-12 w-full items-center bg-secondary-100 py-2 px-3 rounded-t-xl"
        >
            <div class="col-span-8 flex gap-2">
                <BaseIcon
                    v-if="titleIcon"
                    :name="titleIcon"
                    :tone="700"
                    color="secondary"
                    size="md"
                />
                <slot name="title" />
                <BaseText
                    v-if="title && !$slots.title"
                    :text="title"
                    :tone="900"
                    color="neutral"
                    font="semibold"
                    type="p-md"
                />
            </div>
            <div class="col-span-4">
                <slot name="headerActions" />
            </div>
        </div>
        <div v-if="!onlyTitle" class="rounded-b-xl bg-white py-2 px-3">
            <slot />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icons } from '@/types/styles'
import BaseIcon from '../icon/BaseIcon.vue'
import BaseText from '../text/BaseText.vue'
import BaseButtonIcon from '@/components/base/button/BaseButtonIcon.vue'
import { useSlots } from 'vue'

withDefaults(
    defineProps<{
        title?: string
        titleIcon?: Icons
        isCollapsed?: boolean
        disableActions?: boolean
        onlyTitle?: boolean
    }>(),
    {
        title: undefined,
        titleIcon: undefined,
        isCollapsed: false,
        disableActions: false,
        onlyTitle: false,
    }
)

const emit = defineEmits(['onChevronClick'])

const slots = useSlots()
</script>
