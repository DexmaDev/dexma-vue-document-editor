<template>
    <div class="editor w-full" ref="editor">
        <RecycleScroller
            v-if="!loading"
            class="content"
            :items="pages"
            :item-size="pagePxHeight"
            page-mode
            key-field="uuid"
            :buffer="5"
            :item-style="getItemStyle"
            emit-update
            @update="handleScrollUpdate"
        >
            <template #default="{ item: page, index }">
                <div
                    class="page"
                    :style="pageStyle(index, !page.template)"
                    :contenteditable="editable && !page.template"
                    :data-content-idx="page.contentIdx"
                    @input="handleInput($event, page.contentIdx)"
                >
                    <div
                        v-if="typeof modelValue[page.contentIdx] === 'string'"
                        v-html="modelValue[page.contentIdx] ?? ''"
                    />
                    <component v-else :is="page.template" v-bind="page.props" />
                </div>
            </template>
        </RecycleScroller>

        <FindAndReplaceModal
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
} from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import FindAndReplaceModal from './FindAndReplaceModal.vue'
import Page from './types/Page'
import '@/assets/main.css'
import '@/assets/editor-style.css'


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

const loading = ref(false)
const pages = ref<Page[]>([])
const pageGap = 24
const renderedPageIndexes = ref<number[]>([])

const pagePxHeight = computed(
    () => (props.pageFormat[1] / 0.2645833333333) * props.zoom
)

const handleGeneratePages = () => {
    loading.value = true
    try {
        pages.value = props.modelValue.map((c, idx) => ({
            uuid: Math.random().toString(36).slice(-5),
            contentIdx: idx,
        }))
    } finally {
        loading.value = false
    }
}

const pageStyle = (index: number, allowOverflow: boolean) => {
    const style: CSSProperties = {
        width: `${props.pageFormat[0]}mm`,
        transform: `scale(${props.zoom})`,
        padding: props.pageMargins,
        minHeight: 'unset',
        height: 'unset',
    }

    if (allowOverflow) {
        style.minHeight = `${props.pageFormat[1]}mm`
    } else {
        style.height = `${props.pageFormat[1]}mm`
    }
    return style
}

const getItemStyle = () => {
    return {
        marginBottom: `${pageGap}px`,
        display: 'flex',
        justifyContent: 'center',
    }
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

const handleUpdateFindEndReplace = (updatedContent) => {
    loading.value = true
    try {
        // pages.value = updatedPages;
        // editorKey.value += 1;
        // const updatedContent = [...props.modelValue];
        // for (const page of updatedPages) {
        //   if (
        //     !page.template &&
        //     typeof updatedContent[page.contentIdx] === "string"
        //   ) {
        //     const el = document.querySelector(
        //       `[data-content-idx="${page.contentIdx}"]`
        //     );
        //     if (el) {
        //       updatedContent[page.contentIdx] = el.innerHTML;
        //     }
        //   }
        // }

        emit('update:modelValue', updatedContent)
    } finally {
        loading.value = false
    }
}

// NON FUNZIONA
const handleInput = (event, contentIdx) => {
    const newContent = [...props.modelValue]
    newContent[contentIdx] = event.target.innerHTML
    emit('update:modelValue', newContent)
}

onMounted(() => {
    handleGeneratePages()
})

watch(
    () => props.modelValue,
    () => {
        handleGeneratePages()
    },
    { immediate: true, deep: true }
)
</script>

<style scoped>
.editor {
    display: block;
    position: relative;
}
.content {
    outline: none;
    margin: 0;
    padding: 0;
    min-width: 100%;
}
.page {
    box-sizing: border-box;
    margin: 0 auto;
    transform-origin: center top;
    background: white;
    box-shadow: 0 1px 3px rgba(60, 64, 67, 0.15);
    border-radius: 4px;
    overflow: hidden;
    pointer-events: all;
}
</style>
