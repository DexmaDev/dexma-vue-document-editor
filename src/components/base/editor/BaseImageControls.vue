<template>
    <div v-if="imageElement">
        <div ref="lineLeftRef" class="absolute bg-secondary-500 w-0.5 z-1" />
        <div
            ref="leftCenterPointRef"
            class="absolute bg-secondary-500 w-3 h-3 cursor-pointer border border-primary-200 z-1"
            @mousedown="(e) => onStartResizing(e, 'left')"
        />
        <div ref="lineRightRef" class="absolute bg-secondary-500 w-0.5 z-1" />
        <div
            ref="rightCenterPointRef"
            class="absolute bg-secondary-500 w-3 h-3 cursor-pointer border border-primary-200 z-1"
            @mousedown="(e) => onStartResizing(e, 'right')"
        />
        <div ref="lineTopRef" class="absolute bg-secondary-500 h-0.5 z-1" />
        <div
            ref="topCenterPointRef"
            class="absolute bg-secondary-500 w-3 h-3 cursor-pointer border border-primary-200 z-1"
            @mousedown="(e) => onStartResizing(e, 'top')"
        />
        <div ref="lineBottomRef" class="absolute bg-secondary-500 h-0.5 z-1" />
        <div
            ref="bottomCenterPointRef"
            class="absolute bg-secondary-500 w-3 h-3 cursor-pointer border border-primary-200 z-1"
            @mousedown="(e) => onStartResizing(e, 'bottom')"
        />
    </div>
</template>
<script lang="ts" setup>
import { ImageResizeDirection } from '@/services/editor/image'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const emit = defineEmits(['onResize', 'onStopResizing'])

const props = withDefaults(
    defineProps<{
        imageElement?: HTMLElement
        editorZoom: number
    }>(),
    {
        imageElement: undefined,
    }
)

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

onMounted(() => {
    calculatePosition()

    window.addEventListener('resize', calculatePosition)
    window.addEventListener('scroll', calculatePosition, true)
})

watch(
    () => props.editorZoom,
    () => {
        calculatePosition()
    },
    { deep: true }
)

watch(
    () => props.imageElement,
    () => {
        calculatePosition()
    },
    { deep: true }
)

const calculatePosition = () => {
    if (props.imageElement && props.imageElement.tagName === 'IMG') {
        const imgRect = props.imageElement.getBoundingClientRect()

        if (!leftCenterPointRef.value) {
            leftCenterPointRef.value = { style: {} } as HTMLDivElement
        }
        leftCenterPointRef.value.style.left = `${imgRect.x - 5}px`
        leftCenterPointRef.value.style.top = `${imgRect.y + imgRect.height / 2}px`

        if (!topCenterPointRef.value) {
            topCenterPointRef.value = { style: {} } as HTMLDivElement
        }
        topCenterPointRef.value.style.left = `${imgRect.x + imgRect.width / 2}px`
        topCenterPointRef.value.style.top = `${imgRect.y - 5}px`

        if (!rightCenterPointRef.value) {
            rightCenterPointRef.value = { style: {} } as HTMLDivElement
        }
        rightCenterPointRef.value.style.left = `${imgRect.x + imgRect.width - 5}px`
        rightCenterPointRef.value.style.top = `${imgRect.y + imgRect.height / 2}px`

        if (!bottomCenterPointRef.value) {
            bottomCenterPointRef.value = { style: {} } as HTMLDivElement
        }
        bottomCenterPointRef.value.style.left = `${imgRect.x + imgRect.width / 2}px`
        bottomCenterPointRef.value.style.top = `${imgRect.y + imgRect.height - 5}px`

        if (!lineLeftRef.value) {
            lineLeftRef.value = { style: {} } as HTMLDivElement
        }
        lineLeftRef.value.style.left = `${imgRect.x}px`
        lineLeftRef.value.style.top = `${imgRect.y}px`
        lineLeftRef.value.style.height = `${imgRect.height}px`

        if (!lineRightRef.value) {
            lineRightRef.value = { style: {} } as HTMLDivElement
        }
        lineRightRef.value.style.left = `${imgRect.x + imgRect.width}px`
        lineRightRef.value.style.top = `${imgRect.y}px`
        lineRightRef.value.style.height = `${imgRect.height}px`

        if (!lineTopRef.value) {
            lineTopRef.value = { style: {} } as HTMLDivElement
        }
        lineTopRef.value.style.left = `${imgRect.x}px`
        lineTopRef.value.style.top = `${imgRect.y}px`
        lineTopRef.value.style.width = `${imgRect.width}px`

        if (!lineBottomRef.value) {
            lineBottomRef.value = { style: {} } as HTMLDivElement
        }
        lineBottomRef.value.style.left = `${imgRect.x}px`
        lineBottomRef.value.style.top = `${imgRect.y + imgRect.height}px`
        lineBottomRef.value.style.width = `${imgRect.width}px`
    }
}

const onStartResizing = (e: MouseEvent, direction: ImageResizeDirection) => {
    resizingDirection.value = direction
    startX.value = e.clientX
    startY.value = e.clientY

    if (props.imageElement) {
        const rect = props.imageElement.getBoundingClientRect()
        startWidth.value = rect.width
        startHeight.value = rect.height
    }

    window.addEventListener('mousemove', onResize)
    window.addEventListener('mouseup', onStopResizing)
}

const onResize = (e: MouseEvent) => {
    if (props.imageElement && resizingDirection.value) {
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
    emit('onStopResizing')
    window.removeEventListener('mousemove', onResize)
    window.removeEventListener('mouseup', onStopResizing)
}

onUnmounted(() => {
    window.removeEventListener('resize', calculatePosition)
    window.removeEventListener('scroll', calculatePosition, true)
})
</script>
