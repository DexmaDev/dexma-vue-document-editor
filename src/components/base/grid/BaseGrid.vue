<template>
    <div>
        <BaseGridSkeleton v-if="loadingGrid" pulse />
        <div v-else class="relative">
            <div
                :class="{
                    'border border-error-500 rounded-xl bg-error-50/15':
                        isDragging,
                }"
            >
                <GridLayout
                    v-if="
                        layoutStore?.pageLayout?.layout &&
                        layoutStore?.currentBreakpoint
                    "
                    :is-draggable="isDragging"
                    :is-resizable="isDragging"
                    :layout="
                        (
                            layoutStore.pageLayout
                                .layout as Partial<ResponsiveLayout>
                        )[layoutStore?.currentBreakpoint] || []
                    "
                    auto-size
                    responsive
                    use-css-transforms
                    @breakpoint-changed="layoutStore.breakPointChanged"
                    @layout-updated="layoutStore.setLayout"
                >
                    <template
                        v-for="item in (
                            layoutStore?.pageLayout
                                ?.layout as Partial<ResponsiveLayout>
                        )?.[layoutStore?.currentBreakpoint] || []"
                        :key="item.i"
                    >
                        <GridItem
                            v-if="
                                item?.i &&
                                gridComponents[item.i] &&
                                gridComponents[item.i]?.component &&
                                gridComponents[item.i]?.permission
                                    ? can(gridComponents[item.i].permission)
                                    : true
                            "
                            :h="item.h"
                            :i="item.i"
                            :w="item.w"
                            :x="item.x"
                            :y="item.y"
                        >
                            <div class="h-full w-full overflow-auto bg-white">
                                <component
                                    :is="gridComponents[item.i]?.component"
                                    v-if="gridComponents[item.i]?.component"
                                    v-bind="gridComponents[item.i].props || {}"
                                />
                            </div>
                        </GridItem>
                    </template>
                </GridLayout>
            </div>
        </div>
        <div
            class="justify-end overflow-none flex flex-col sm:fixed sm:right-10 bottom-10"
        >
            <Transition
                enter-active-class="transform-gpu"
                enter-from-class="opacity-0 translate-y-full"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transform-gpu"
                leave-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-full"
                name="fade"
            >
                <div
                    v-if="showLayoutActions"
                    class="flex flex-col w-full items-end gap-3 p-1 duration-200 transition-all"
                >
                    <BaseButton
                        v-if="!showSelectLayout"
                        :text="t('global.selectLayout')"
                        color="neutral"
                        right-icon="settings-2"
                        size="xs"
                        @on-click="onShowSelectLayout"
                    />
                    <BaseSelect
                        v-else
                        v-model="layoutStore.layout"
                        :options="layoutStore.layouts"
                        option-label="name"
                        @update:model-value="onSelectLayout"
                    />
                    <BaseButton
                        :text="t('global.editLayout')"
                        color="neutral"
                        right-icon="edit"
                        size="xs"
                        @on-click="
                            isDragging ? onDisableDrag() : onActivateDrag()
                        "
                    />
                </div>
            </Transition>
            <div class="flex w-full justify-end gap-3 p-1">
                <BaseButtonIcon
                    v-if="isDragging"
                    :color="isDragging ? 'success' : 'secondary'"
                    :icon="isDragging ? 'check' : 'add'"
                    size="lg"
                    @on-click="isDragging ? onUpdateLayout() : () => {}"
                />
                <BaseButtonIcon
                    :color="isDragging ? 'error' : 'primary'"
                    :icon="isDragging ? 'clear' : 'layout-6'"
                    size="lg"
                    :tooltip="!isDragging ? t('global.editLayout') : undefined"
                    @on-click="
                        isDragging ? onDisableDrag() : onShowLayoutActions()
                    "
                />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import BaseGridSkeleton from '@/components/base/skeleton/BaseGridSkeleton.vue'
import { PageLayoutType } from '@/enums/PageLayoutType'
import { useAuthStore } from '@/stores/auth'
import { useLayoutStore } from '@/stores/layout'
import { GridItem, GridLayout, ResponsiveLayout } from 'grid-layout-plus'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { t } from '@/services/i18n'
import PageLayout from '@/types/pageLayout'
import { useNotificationStore } from '@/stores/notification'
import { NotificationType } from '@/enums/NotificationType'
import Layout from '@/types/layout'
import { cloneDeep } from '@/services/utils'
import BaseButton from '@/components/base/button/BaseButton.vue'
import BaseSelect from '@/components/base/select/BaseSelect.vue'
import BaseButtonIcon from '@/components/base/button/BaseButtonIcon.vue'
import { can } from '@/services/ability'
import { GridComponents } from '@/types/gridComponent'

const props = withDefaults(
    defineProps<{
        loading?: boolean
        pageLayoutType: PageLayoutType
        gridComponents: GridComponents
    }>(),
    {
        loading: undefined,
    }
)

const layoutStore = useLayoutStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loadingGrid = computed<boolean>(() => {
    return !!loadingData.value || !!props.loading
})
const loadingData = ref<boolean>(false)
const isDragging = ref<boolean>(false)
const tempLayout = ref<PageLayout>()
const showLayoutActions = ref<boolean>(false)
const showSelectLayout = ref<boolean>(false)

onMounted(async () => {
    loadingData.value = true
    try {
        await layoutStore.findPageLayout(props.pageLayoutType)
        await layoutStore.index()
        layoutStore.layout.id = authStore.currentDevice.layoutId
        await layoutStore.show()
    } finally {
        loadingData.value = false
    }
})

const onShowLayoutActions = () => {
    showLayoutActions.value = !showLayoutActions.value
}

const onShowSelectLayout = () => {
    showSelectLayout.value = true
}

const onSelectLayout = async (layout: Layout) => {
    showSelectLayout.value = false

    authStore.currentDevice.layoutId = layout.id
    layoutStore.layout.id = authStore.currentDevice.layoutId

    await authStore.updateDeviceCurrentLayout(layout.id)
    await layoutStore.findPageLayout(props.pageLayoutType)
    await layoutStore.show()

    notificationStore.addNotificationToQueue({
        type: NotificationType.SUCCESS,
        titleKey: 'global.updateLayout',
    })
}

const onUpdateLayout = async () => {
    await layoutStore.updatePageLayout()

    notificationStore.addNotificationToQueue({
        type: NotificationType.SUCCESS,
        titleKey: 'global.updateLayout',
    })
    isDragging.value = false
}

const onActivateDrag = () => {
    tempLayout.value = cloneDeep(layoutStore.pageLayout)
    isDragging.value = true
    showLayoutActions.value = false
    showSelectLayout.value = false
}

const onDisableDrag = () => {
    layoutStore.pageLayout = tempLayout.value || {}
    isDragging.value = false
}

onUnmounted(() => {
    layoutStore.resetState()
})
</script>
