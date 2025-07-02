<template>
    <div v-if="stamp && (isVisible || keepVisible)" id="stamp-settings">
        <div ref="lineLeftRef" class="absolute bg-secondary-500 w-0.5 z-[2]" />
        <div
            ref="leftCenterPointRef"
            class="absolute bg-secondary-500 w-3 h-3 cursor-pointer border border-primary-200 z-[2]"
            @mousedown="(e) => onStartResizing(e, 'left')"
            @mouseover="handleKeepVisible(true)"
            @mouseleave="handleKeepVisible(false)"
        />
        <div ref="lineRightRef" class="absolute bg-secondary-500 w-0.5 z-[2]" />
        <div
            ref="rightCenterPointRef"
            class="absolute bg-secondary-500 w-3 h-3 cursor-pointer border border-primary-200 z-[2]"
            @mousedown="(e) => onStartResizing(e, 'right')"
            @mouseover="handleKeepVisible(true)"
            @mouseleave="handleKeepVisible(false)"
        />
        <div ref="lineTopRef" class="absolute bg-secondary-500 h-0.5 z-[2]" />
        <!-- <div
            ref="topCenterPointRef"
            class="absolute bg-secondary-500 cursor-pointer border border-primary-200 z-[2]"
            @mousedown="(e) => onStartResizing(e, 'top')"
            @mouseover="handleKeepVisible(true)"
            @mouseleave="handleKeepVisible(false)"
        >
            <BaseTooltip>
                <BaseIcon name="arrow-down" :size="'2xs'" />
                <template #content>
                    {{ t('pages.editor.actions.moveStamp') }}
                </template>
            </BaseTooltip>
        </div> -->
        <div
            ref="lineBottomRef"
            class="absolute bg-secondary-500 h-0.5 z-[2]"
        />
        <div
            ref="bottomCenterPointRef"
            class="absolute bg-secondary-500 w-3 h-3 cursor-pointer border border-primary-200 z-[2]"
            @mousedown="(e) => onStartResizing(e, 'bottom')"
            @mouseover="handleKeepVisible(true)"
            @mouseleave="handleKeepVisible(false)"
        />

        <div
            v-if="!isResizing"
            ref="menuRef"
            class="absolute z-[2] flex bg-white border border-gray-300 rounded-md shadow-sm px-2 py-1 gap-2"
        >
            <BaseButtonIcon
                icon="no-border"
                :tooltip="
                    isBordered
                        ? t('pages.editor.actions.removeStampBorder')
                        : t('pages.editor.actions.insertStampBorder')
                "
                :variant="isBordered ? 'outline' : 'blank'"
                :color="isBordered ? 'secondary' : 'primary'"
                size="xs"
                @on-click="handleBorderInsert"
            />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ImageResizeDirection } from '@/services/editor/image'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import BaseButtonIcon from '../button/BaseButtonIcon.vue'
import { t } from '@/services/i18n'
import { nextTick } from 'vue'

const emit = defineEmits(['onResize', 'onStopResizing', 'onUpdateStyle'])

const props = withDefaults(
    defineProps<{
        isVisible: boolean
        stamp?: HTMLElement
        editorZoom: number
    }>(),
    {
        stamp: undefined,
    }
)
const menuRef = ref<HTMLElement>()
const leftCenterPointRef = ref<HTMLDivElement>({ style: {} } as HTMLDivElement)
const rightCenterPointRef = ref<HTMLDivElement>({ style: {} } as HTMLDivElement)
const topCenterPointRef = ref<HTMLDivElement>({ style: {} } as HTMLDivElement)
const bottomCenterPointRef = ref<HTMLDivElement>({
    style: {},
} as HTMLDivElement)
const lineLeftRef = ref<HTMLDivElement>({ style: {} } as HTMLDivElement)
const lineRightRef = ref<HTMLDivElement>({ style: {} } as HTMLDivElement)
const lineTopRef = ref<HTMLDivElement>({ style: {} } as HTMLDivElement)
const lineBottomRef = ref<HTMLDivElement>({ style: {} } as HTMLDivElement)
const resizingDirection = ref<string | null>(null)
const startX = ref<number>(0)
const startY = ref<number>(0)
const startWidth = ref<number>(0)
const startHeight = ref<number>(0)
const isBordered = ref<boolean>(false)
const isResizing = ref<boolean>(false)
const keepVisible = ref<boolean>(false)

onMounted(() => {
    calculatePosition()

    window.addEventListener('resize', calculatePosition)
    window.addEventListener('scroll', calculatePosition, true)
})

watch(
    () => [props.editorZoom, props.stamp],
    async () => {
        await calculatePosition()
    },
    { deep: true }
)

const calculatePosition = async () => {
    await handleMenuRender()

    await nextTick(async () => {
        if (props.stamp) {
            const stampRect = props.stamp.getBoundingClientRect()

            if (!leftCenterPointRef.value) {
                leftCenterPointRef.value = { style: {} } as HTMLDivElement
            }
            leftCenterPointRef.value.style.left = `${stampRect.x - 5}px`
            leftCenterPointRef.value.style.top = `${stampRect.y + stampRect.height / 2}px`

            if (!topCenterPointRef.value) {
                topCenterPointRef.value = { style: {} } as HTMLDivElement
            }
            topCenterPointRef.value.style.left = `${stampRect.x + stampRect.width / 2}px`
            topCenterPointRef.value.style.top = `${stampRect.y - 5}px`

            if (!rightCenterPointRef.value) {
                rightCenterPointRef.value = { style: {} } as HTMLDivElement
            }
            rightCenterPointRef.value.style.left = `${stampRect.x + stampRect.width - 5}px`
            rightCenterPointRef.value.style.top = `${stampRect.y + stampRect.height / 2}px`

            if (!bottomCenterPointRef.value) {
                bottomCenterPointRef.value = { style: {} } as HTMLDivElement
            }
            bottomCenterPointRef.value.style.left = `${stampRect.x + stampRect.width / 2}px`
            bottomCenterPointRef.value.style.top = `${stampRect.y + stampRect.height - 5}px`

            if (!lineLeftRef.value) {
                lineLeftRef.value = { style: {} } as HTMLDivElement
            }
            lineLeftRef.value.style.left = `${stampRect.x}px`
            lineLeftRef.value.style.top = `${stampRect.y}px`
            lineLeftRef.value.style.height = `${stampRect.height}px`

            if (!lineRightRef.value) {
                lineRightRef.value = { style: {} } as HTMLDivElement
            }
            lineRightRef.value.style.left = `${stampRect.x + stampRect.width}px`
            lineRightRef.value.style.top = `${stampRect.y}px`
            lineRightRef.value.style.height = `${stampRect.height}px`

            if (!lineTopRef.value) {
                lineTopRef.value = { style: {} } as HTMLDivElement
            }
            lineTopRef.value.style.left = `${stampRect.x}px`
            lineTopRef.value.style.top = `${stampRect.y}px`
            lineTopRef.value.style.width = `${stampRect.width}px`

            if (!lineBottomRef.value) {
                lineBottomRef.value = { style: {} } as HTMLDivElement
            }
            lineBottomRef.value.style.left = `${stampRect.x}px`
            lineBottomRef.value.style.top = `${stampRect.y + stampRect.height}px`
            lineBottomRef.value.style.width = `${stampRect.width}px`
        }
    })
}

const handleMenuRender = async () => {
    await nextTick(async () => {
        if (props.stamp instanceof HTMLElement) {
            const relativeToRect = props.stamp?.getBoundingClientRect()
            if (menuRef.value) {
                const imageRect = menuRef.value.getBoundingClientRect()
                menuRef.value.style.top = `${relativeToRect.bottom + 10}px`
                menuRef.value.style.left = `${relativeToRect.x + relativeToRect.width / 2 - imageRect.width / 2}px`
            }
        }
        updateActiveState()
    })
}

const onStartResizing = (e: MouseEvent, direction: ImageResizeDirection) => {
    resizingDirection.value = direction
    startX.value = e.clientX
    startY.value = e.clientY
    isResizing.value = true

    if (props.stamp) {
        const rect = props.stamp.getBoundingClientRect()
        startWidth.value = rect.width
        startHeight.value = rect.height
    }

    window.addEventListener('mousemove', onResize)
    window.addEventListener('mouseup', onStopResizing)
}

const onResize = (e: MouseEvent) => {
    if (props.stamp && resizingDirection.value) {
        let newWidth = startWidth.value
        let newHeight = startHeight.value

        if (resizingDirection.value === 'right') {
            newWidth = startWidth.value + (e.clientX - startX.value)
        } else if (resizingDirection.value === 'left') {
            newWidth = startWidth.value - (e.clientX - startX.value)
        } else if (resizingDirection.value === 'top') {
            newHeight = startHeight.value - (e.clientY - startY.value)
        } else if (resizingDirection.value === 'bottom') {
            newHeight = startHeight.value + (e.clientY - startY.value)
        }

        emit('onResize', newWidth, newHeight, resizingDirection.value)

        calculatePosition()
    }
}

const onStopResizing = () => {
    resizingDirection.value = null
    isResizing.value = false

    emit('onStopResizing')
    window.removeEventListener('mousemove', onResize)
    window.removeEventListener('mouseup', onStopResizing)
}

const handleBorderInsert = () => {
    if (isBordered.value) {
        emit('onUpdateStyle', {
            border: 'unset',
        })
    } else {
        emit('onUpdateStyle', {
            border: '1px solid',
        })
    }

    isBordered.value = !isBordered.value
}

const updateActiveState = () => {
    if (props.stamp instanceof HTMLElement) {
        const style = props.stamp.style
        isBordered.value = style.border === '1px solid'
    }
}

const handleKeepVisible = (value: boolean) => {
    keepVisible.value = value
}

onUnmounted(() => {
    window.removeEventListener('resize', calculatePosition)
    window.removeEventListener('scroll', calculatePosition, true)
})
</script>
