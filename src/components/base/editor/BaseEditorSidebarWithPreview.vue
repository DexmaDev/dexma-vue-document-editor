<template>
    <div ref="containerRef" class="relative bg-white h-full w-full">
        <div
            v-show="
                isPreviewDisplayable &&
                (mouseInsideSidebarContent || mouseInsidePreviewContent)
            "
            ref="editorContainerRef"
            class="bg-white absolute top-0 z-[2] border overflow-auto"
            @mouseleave="handleMouseLeavePreviewContent"
            @mouseenter="handleMouseEnterPreviewContent"
        >
            <BaseEditorPreview
                :content="editorStore.content"
                custom-page-class="max-w-[300px] max-h-[450px]"
            />
        </div>

        <div
            class="w-full h-full"
            @mouseleave="handleMouseLeaveSidebarContent"
            @mouseenter="handleMouseEnterSidebarContent"
        >
            <slot />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useEditorStore } from '@/stores/editor'
import { nextTick, onMounted, watch } from 'vue'
import { ref } from 'vue'
import { debounce } from '@/services/utils'
import { keepElementInViewport } from '@/services/viewPort'
import { EditorConfig } from '@/types/editor'
import BaseEditorPreview from './BaseEditorPreview.vue'

const props = withDefaults(
    defineProps<{
        editorStoreInstanceId: string
    }>(),
    {}
)

const editorStore = useEditorStore(props.editorStoreInstanceId)()

const containerRef = ref<HTMLElement>()
const editorContainerRef = ref<HTMLElement>()
const isPreviewDisplayable = ref<boolean>(false)
const mouseInsideSidebarContent = ref<boolean>(false)
const mouseInsidePreviewContent = ref<boolean>(false)

onMounted(async () => {
    editorStore.zoom = 0.7
    editorStore.content = ['']
})

watch(
    () => [mouseInsideSidebarContent.value, mouseInsidePreviewContent.value],
    async () => {
        if (
            isPreviewDisplayable.value &&
            !(
                mouseInsideSidebarContent.value ||
                mouseInsidePreviewContent.value
            )
        ) {
            await handleHidePreview()
        }
    }
)

const handleMouseEnterSidebarContent = debounce(() => {
    mouseInsideSidebarContent.value = true
}, 200)

const handleMouseLeaveSidebarContent = debounce(() => {
    mouseInsideSidebarContent.value = false
}, 200)

const handleMouseEnterPreviewContent = () => {
    mouseInsidePreviewContent.value = true
}

const handleMouseLeavePreviewContent = () => {
    mouseInsidePreviewContent.value = false
}

const handleShowPreview = async (
    mouseEvent: MouseEvent,
    editorContent?: string,
    config?: EditorConfig
): Promise<void> => {
    editorStore.content = [editorContent || '']

    if (config) {
        editorStore.useConfig(config)
    }

    isPreviewDisplayable.value = true

    await nextTick(async () => {
        const editorContainerRect =
            editorContainerRef.value?.getBoundingClientRect()

        if (editorContainerRef.value && editorContainerRect?.width) {
            editorContainerRef.value.style.bottom = 'unset'

            editorContainerRef.value.style.left =
                '-' + editorContainerRect.width.toString() + 'px'

            editorContainerRef.value.style.top =
                mouseEvent.layerY.toString() + 'px'

            editorContainerRef.value = keepElementInViewport(
                editorContainerRef.value
            )
        }
    })
}

const handleHidePreview = async (): Promise<void> => {
    editorStore.content = ['']
    isPreviewDisplayable.value = false
}

defineExpose({
    handleShowPreview,
    handleHidePreview,
})
</script>
<!-- <style scoped>
:deep(.page *) {
    font-size: 30px !important;
}
</style> -->
