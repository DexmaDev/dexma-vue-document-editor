<template>
    <div
        class="w-full cursor-pointer space-y-4 border-b border-neutral-300 p-8 transition-all duration-300"
        @click="toggleOpen"
    >
        <div class="flex justify-between">
            <slot v-if="$slots.title" name="title" />
            <div v-else class="flex w-full items-center justify-between">
                <BaseText
                    :text="title"
                    :tone="900"
                    color="neutral"
                    font="semibold"
                    type="p-lg"
                />
                <BaseBadge
                    v-if="badgeTitle"
                    :color="badgeColor"
                    :text="badgeTitle"
                    variant="outline"
                />
            </div>
            <div class="h-6 w-6 text-neutral-500">
                <BaseIcon :name="isOpen ? 'remove-circle' : 'add-circle'" />
            </div>
        </div>
        <slot v-if="isOpen" name="content" />
    </div>
</template>

<script lang="ts" setup>
import BaseBadge from '@/components/base/badge/BaseBadge.vue'
import BaseIcon from '@/components/base/icon/BaseIcon.vue'
import BaseText from '@/components/base/text/BaseText.vue'
import { ref } from 'vue'
import { PrimaryColors } from '@/types/styles'

withDefaults(
    defineProps<{
        title?: string
        badgeTitle?: string
        badgeColor?: PrimaryColors
    }>(),
    {
        title: undefined,
        badgeTitle: undefined,
        badgeColor: 'primary',
    }
)

const isOpen = ref<boolean>(false)

const toggleOpen = () => {
    isOpen.value = !isOpen.value
}
</script>

<style scoped></style>
