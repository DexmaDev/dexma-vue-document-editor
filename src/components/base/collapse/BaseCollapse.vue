<template>
    <div
        :class="{
            'bg-white': !isOpen,
            'bg-neutral-100': isOpen,
        }"
        class="flex min-h-14 w-full flex-col items-center gap-4 rounded-xl border p-4 transition-all duration-300 hover:bg-neutral-100"
    >
        <div
            class="flex w-full cursor-pointer items-center gap-4"
            @click="toggleOpen"
        >
            <BaseIcon
                :name="isOpen ? 'chevron-up' : 'chevron-down'"
                size="md"
            />
            <slot v-if="$slots.title" name="title" />
            <div v-else class="flex w-full items-center justify-between">
                <BaseText
                    :text="title || ''"
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
