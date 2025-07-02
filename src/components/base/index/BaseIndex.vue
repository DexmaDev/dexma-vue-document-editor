<template>
    <div :style="{ height: height }" class="flex flex-col md:flex-row gap-1">
        <div
            ref="indexContainer"
            :class="{
                'md:w-2/3': showSectionVisible,
            }"
            class="flex flex-col w-full gap-0 md:flex-row"
        >
            <div class="md:w-[95%]">
                <slot />
            </div>
            <div
                class="flex w-fit items-center justify-center md:w-[5%] m-auto min-h-10"
            >
                <BaseButtonIcon
                    v-if="$slots.showSection"
                    v-model="showSectionVisible"
                    :icon="showSectionVisible ? 'chevron-up' : 'chevron-down'"
                    :color="'neutral'"
                    variant="blank"
                    size="sm"
                    :tooltip="
                        showSectionVisible
                            ? showSectionHideTooltip
                            : showSectionVisibleTooltip
                    "
                    :container-style="{
                        border: '0',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                    }"
                    button-class="md:rotate-90"
                    @on-click="showSectionVisible = !showSectionVisible"
                />
            </div>
        </div>
        <div v-show="showSectionVisible" class="flex w-full md:w-1/3">
            <slot name="showSection" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import BaseButtonIcon from '../button/BaseButtonIcon.vue'
import { t } from '@/services/i18n'

withDefaults(
    defineProps<{
        showSectionHideTooltip?: string
        showSectionVisibleTooltip?: string
        height?: string
    }>(),

    {
        showSectionHideTooltip:
            t('global.hide') + ' ' + t('global.details').toLowerCase(),
        showSectionVisibleTooltip:
            t('global.show') + ' ' + t('global.details').toLowerCase(),
        height: '610px',
    }
)

const showSectionVisible = ref<boolean>(true)
const indexContainer = ref<HTMLElement>()
</script>
