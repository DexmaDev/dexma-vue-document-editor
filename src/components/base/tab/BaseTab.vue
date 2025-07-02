<template>
    <div
        class="flex cursor-pointer text-nowrap border-b px-5 py-2.5 transition-all duration-300 hover:bg-neutral-100"
        :class="[
            {
                'border-primary-500': selectedTab === tabKey,
            },
            {
                'has-error': hasError,
            },
            selectedColor
                ? {
                      [`border-${props.selectedColor}-500`]:
                          selectedTab === tabKey,
                  }
                : '',
        ]"
        @click="onSelectTab"
    >
        <BaseIcon v-if="icon" :name="icon" size="sm" class="mr-2" />
        <BaseText
            :text="tabText!"
            type="p-md"
            :color="
                hasError
                    ? 'error'
                    : selectedTab === tabKey
                      ? selectedColor || 'primary'
                      : notSelectedColor || 'neutral'
            "
            font="medium"
            :tone="500"
        />
    </div>
</template>

<script lang="ts" setup>
import BaseText from '@/components/base/text/BaseText.vue'
import BaseIcon from '@/components/base/icon/BaseIcon.vue'
import { Icons, PrimaryColors } from '@/types/styles'

const props = withDefaults(
    defineProps<{
        tabKey: number
        selectedTab: number
        tabText?: string
        hasError?: boolean
        selectedColor?: PrimaryColors
        notSelectedColor?: PrimaryColors
        icon?: Icons
    }>(),
    {
        tabKey: 1,
        tabText: undefined,
        hasError: false,
        selectedColor: undefined,
        notSelectedColor: undefined,
        icon: undefined,
    }
)

const emit = defineEmits(['onTabClick'])

const onSelectTab = () => {
    emit('onTabClick', props.tabKey)
}
</script>

<style scoped>
.has-error {
    border-bottom: 2px solid red;
}
</style>
