<template>
    <BaseDivider :text="title" class="cursor-pointer" @click="toggleOpen">
        <template v-if="indicator" #left>
            <BaseText color="secondary" font="bold" text="•" type="h3" />
        </template>
        <template #right>
            <BaseIcon
                :name="isOpen ? 'chevron-up' : 'chevron-down'"
                size="md"
            />
        </template>
    </BaseDivider>

    <slot v-if="isOpen" name="content" />
</template>

<script lang="ts" setup>
import BaseIcon from '@/components/base/icon/BaseIcon.vue'
import { ref } from 'vue'
import BaseDivider from '../divider/BaseDivider.vue'
import BaseText from '../text/BaseText.vue'

withDefaults(
    defineProps<{
        title?: string
        indicator?: boolean
    }>(),
    {
        title: undefined,
        indicator: false,
    }
)

const isOpen = ref<boolean>(false)

const toggleOpen = () => {
    isOpen.value = !isOpen.value
}
</script>

<style scoped></style>
