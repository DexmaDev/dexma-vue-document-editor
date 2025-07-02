<template>
    <div>
        <div class="flex justify-center mb-4">
            <BaseIcon name="loading" :size="size" spin />
        </div>
        <div class="text-center">
            <BaseText :text="text ?? t('global.loading')" :type="type" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { t } from '@/services/i18n'
import BaseIcon from '../icon/BaseIcon.vue'
import BaseText from '../text/BaseText.vue'
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        text?: string
        size?: '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | '2xs'
    }>(),
    {
        text: undefined,
        size: '2xl',
    }
)

const type = computed<'p-lg' | 'p-md' | 'p-sm' | 'p-xs'>(() => {
    if (props.size == '2xs' || props.size == 'xs') {
        return 'p-xs'
    } else if (props.size == 'sm') {
        return 'p-sm'
    } else if (props.size == 'md') {
        return 'p-md'
    }
    return 'p-lg'
})
</script>
