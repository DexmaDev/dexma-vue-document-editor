<template>
    <div
        :class="[
            'flex w-full items-center text-nowrap my-3' +
                (text ? ' gap-3' : ''),
            additionalContainerClass,
        ]"
    >
        <div v-if="$slots.left" class="w-full flex items-center gap-x-2">
            <div
                class="w-full border-t items-center-center border-neutral-200"
            />
            <slot name="left" />
        </div>
        <div
            v-else
            class="w-full border-t items-center-center border-neutral-200"
        />
        <BaseText
            v-if="text"
            :text="text"
            type="p-sm"
            color="neutral"
            :tone="600"
        />
        <div v-if="$slots.right" class="w-full flex items-center gap-x-2">
            <div
                class="w-full border-t items-center-center border-neutral-200"
            />
            <slot name="right" />
        </div>
        <div
            v-else
            class="w-full border-t items-center-center border-neutral-200"
        />
    </div>
</template>

<script setup lang="ts">
import BaseText from '../text/BaseText.vue'

withDefaults(
    defineProps<{
        text?: string
        additionalContainerClass?: string
    }>(),
    {
        text: undefined,
        additionalContainerClass: undefined,
    }
)
</script>
