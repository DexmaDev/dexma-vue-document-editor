<template>
    <div class="editor w-full" ref="editor">
        {{ selectedCustomElement }}
        <RecycleScroller
            v-if="!loading"
            class="content"
            :items="pages"
            :item-size="pagePxHeight"
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
                    Pagina: {{ page.contentIdx }}
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
    nextTick,
} from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import Page from '../../../types/Page'
import '@/assets/main.css'
import '@/assets/editor-style.css'
import FindAndReplaceModal from './FindAndReplaceModal.vue'
import { updateCustomTagContent } from '@/services/customTags'

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

const selectedCustomElement = ref<HTMLElement>()

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

const handleUpdateFindEndReplace = (updatedContent: string[]) => {
    loading.value = true
    try {
        handleEmitUpdateModelValue(updatedContent)
    } finally {
        loading.value = false
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

// const updateAllCustomTags = (tagsId: string, newValue: string) => {
//     const updated = updateCustomTagsContent(props.modelValue, tagsId, newValue)
//     handleEmitUpdateModelValue(updated)
// }

//Handle Emits
const handleEmitUpdateModelValue = (updatedContent: string[]) => {
    emit('update:modelValue', updatedContent)
}

onMounted(async () => {
    handleGeneratePages()

    nextTick(() => {
        selectedCustomElement.value = document.querySelector(
            '.custom-tag'
        ) as HTMLElement

        const newModelValue = updateCustomTagContent({
            modelValue: props.modelValue,
            customTag: selectedCustomElement.value,
            newValue: 'ROSSI',
            replaceAllSiblings: true,
            transformIntoPlainText: true,
        })
        handleEmitUpdateModelValue(newModelValue)
    })
})

watch(
    () => props.modelValue,
    () => {
        handleGeneratePages()
    },
    { immediate: true, deep: true }
)
</script>
