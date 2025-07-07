<template>
    <div class="editor w-full h-full" ref="editor">
        <div
            v-if="generatingPages"
            class="w-full h-full flex items-center justify-center"
        >
            <BaseSpinner :text="t('global.generatingPages')" />
        </div>

        <RecycleScroller
            v-else
            class="content"
            direction="vertical"
            :items="pages"
            :item-size="pagePxHeight + 20"
            :item-secondary-size="pagePxWidth"
            page-mode
            :buffer="pagePxHeight / 2"
            key-field="uuid"
            emit-update
            @update="handleScrollUpdate"
        >
            <template v-slot="{ item: page, index }">
                <div
                    class="page"
                    :style="pageStyle()"
                    :contenteditable="editable && !page.template"
                    :data-content-idx="page.contentIdx"
                    @input="handleInput($event, page.contentIdx)"
                >
                    <div
                        v-if="typeof page.content === 'string'"
                        v-html="page.content ?? ''"
                    />
                </div>
            </template>
        </RecycleScroller>

        <FindAndReplaceModal
            v-if="findAndReplaModalVisible"
            :pages="pages"
            :renderedPageIndexes="renderedPageIndexes"
            :content="modelValue"
            :replace-active="true"
            @onUpdate="handleUpdateFindEndReplace"
        />
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    computed,
    watch,
    defineProps,
    onMounted,
    CSSProperties,
    nextTick,
} from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import Page from '../../../types/Page'
import '@/assets/main.css'
import '@/assets/editor-style.css'
import FindAndReplaceModal from './FindAndReplaceModal.vue'
import { updateCustomTagContent } from '@/services/customTags'
import { Property } from '@/types/Editor'
import BaseSpinner from '../spinner/BaseSpinner.vue'
import { t } from '@/services/i18n'

const emit = defineEmits(['update:modelValue'])

const props = withDefaults(
    defineProps<{
        modelValue: string[]
        editable?: boolean
        pageFormat: [width: number, height: number]
        pageMargins: string
        zoom?: number
        display?: string
    }>(),
    {
        editable: true,
        pageFormat: () => [210, 297],
        pageMargins: '10mm 15mm',
        zoom: 1.0,
        display: 'grid',
    }
)

// Data
const isMounted = ref<boolean>(false)
const generatingPages = ref<boolean>(false)
const pages = ref<Page[]>([])
const renderedPageIndexes = ref<number[]>([])
const pagePxHeight = computed<number>(
    () => (props.pageFormat[1] / 0.2645833333333) * props.zoom
)
const pagePxWidth = computed<number>(
    () => (props.pageFormat[0] / 0.2645833333333) * props.zoom
)
const findAndReplaModalVisible = ref<boolean>(false)

//Actions
const handleGeneratePages = async (): Promise<void> => {
    if (generatingPages.value) return
    generatingPages.value = true
    try {
        handleGeneratePagesFromModelValue()
    } finally {
        generatingPages.value = false
    }
}

const handleGeneratePagesFromModelValue = () => {
    pages.value = props.modelValue.map((c, idx) => ({
        uuid: Math.random().toString(36).slice(-5),
        contentIdx: idx,
        content: c,
    }))
}

const pageStyle = () => {
    const style: CSSProperties = {
        height: `${pagePxHeight.value}px`,
        width: `${pagePxWidth.value}px`,
        padding: props.pageMargins,
        overflow: 'hidden',
    }

    return style
}

const handleScrollUpdate = (
    startIndex: number,
    endIndex: number,
    visibleStartIndex: number,
    visibleEndIndex: number
) => {
    const indexes: number[] = []
    for (let i: number = startIndex; i <= endIndex; i++) {
        indexes.push(i)
    }
    renderedPageIndexes.value = indexes
}

const handleUpdateFindEndReplace = (updatedContent: string[]) => {
    generatingPages.value = true
    try {
        handleEmitUpdateModelValue(updatedContent)
    } finally {
        generatingPages.value = false
    }
}

// NON FUNZIONA
const handleInput = (event: Event, contentIdx: number) => {
    const target = event.target as HTMLElement
    if (target) {
        const newContent = [...props.modelValue]
        newContent[contentIdx] = target?.innerHTML
        handleEmitUpdateModelValue(newContent)
    }
}

//Handle Emits
const handleEmitUpdateModelValue = (updatedContent: string[]) => {
    emit('update:modelValue', updatedContent)
}

const handleUpdateCustomTagContent = ({
    customTag,
    newValue,
    properties = undefined,
    transformIntoPlainText = false,
    replaceAllSiblings = false,
}: {
    customTag: HTMLElement
    newValue: string
    properties?: Property[]
    transformIntoPlainText?: boolean
    replaceAllSiblings?: boolean
}) => {
    const newModelValue = updateCustomTagContent({
        modelValue: props.modelValue,
        customTag: customTag,
        newValue: newValue,
        properties: properties,
        replaceAllSiblings: replaceAllSiblings,
        transformIntoPlainText: transformIntoPlainText,
    })
    handleEmitUpdateModelValue(newModelValue)
}

onMounted(async () => {
    try {
        isMounted.value = false
        handleGeneratePages()
    } finally {
        isMounted.value = true
    }

    // await nextTick(() => {
    //     const selectedCustomElement = document.querySelector(
    //         '.custom-tag'
    //     ) as HTMLElement

    //     const newModelValue = updateCustomTagContent({
    //         modelValue: props.modelValue,
    //         customTag: selectedCustomElement,
    //         newValue: 'ROSSI',
    //         replaceAllSiblings: true,
    //         transformIntoPlainText: false,
    //     })
    //     handleEmitUpdateModelValue(newModelValue)
    // })
})

watch(
    () => props.modelValue,
    async () => {
        if (isMounted.value) {
            handleGeneratePages()
        }
    },
    { immediate: true, deep: true }
)

defineExpose({
    handleUpdateCustomTagContent,
})
</script>
