<template>
    <div :style="modalStyle" class="find-replace-modal">
        <div class="form-group">
            <label for="findInput">Find:</label>
            <div class="input-wrapper">
                <input
                    id="findInput"
                    v-model="findText"
                    type="text"
                    placeholder="Find"
                    @input="handleFind"
                />
                <div class="button-group">
                    <button @click="prevMatch">↑</button>
                    <button @click="nextMatch">↓</button>
                </div>
            </div>
        </div>

        <div v-if="replaceActive" class="form-group">
            <label for="replaceInput">Replace:</label>
            <input
                id="replaceInput"
                v-model="replaceText"
                type="text"
                placeholder="Replace"
            />
        </div>

        <div class="action-buttons">
            <button v-if="replaceActive" @click="handleReplace">Replace</button>
            <button v-if="replaceActive" @click="handleReplaceAll">
                Replace All
            </button>
            <button @click="emit('onClose')">Close</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import Page, { PageMatchIndex } from '../../../types/Page'
import { debounce, replaceAllMatches, replaceAt } from '../../../services/utils'
import { ref, computed, CSSProperties } from 'vue'

const props = defineProps<{
    pages: Page[]
    renderedPageIndexes: number[]
    content: string[]
    replaceActive: Boolean
}>()

const emit = defineEmits(['onClose', 'onUpdate'])

const findText = ref<string>('')
const replaceText = ref<string>('')
const matches = ref<PageMatchIndex[]>([])
const currentMatchIndex = ref<number>(0)

const modalStyle = computed<CSSProperties>(() => ({
    position: 'absolute',
    top: '0px',
    right: '0px',
    zIndex: '1000',
}))

const emitUpdatedContent = (newContent: string[]) => {
    emit('onUpdate', newContent)
}

const escapeRegExp = (text: string): string =>
    text.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')

const indexMatches = debounce(() => {
    matches.value = []
    if (!findText.value) return
    const regex = new RegExp(escapeRegExp(findText.value), 'gi')

    props.content.forEach((text, pageIdx) => {
        regex.lastIndex = 0
        let match
        while ((match = regex.exec(text))) {
            matches.value.push({
                pageIdx,
                start: match.index,
                end: match.index + match[0].length,
            })
        }
    })

    currentMatchIndex.value = 0
    // emit('onUpdate', matches.value)
}, 300)

const handleFind = () => {
    indexMatches()
}

const nextMatch = () => {
    if (!matches.value.length) return
    currentMatchIndex.value =
        (currentMatchIndex.value + 1) % matches.value.length
    // emit('onUpdate', matches.value, currentMatchIndex.value)
}

const prevMatch = () => {
    // if (!matches.value.length) return
    // currentMatchIndex.value =
    //     (currentMatchIndex.value - 1 + matches.value.length) % matches.value.length
    // emit('onUpdate', matches.value, currentMatchIndex.value)
}

const handleReplace = () => {
    const m = matches.value[currentMatchIndex.value]
    if (!m || !replaceText.value) return

    const newContent = [...props.content]
    const oldText = newContent[m.pageIdx]
    newContent[m.pageIdx] = replaceAt(
        oldText,
        m.start,
        m.end,
        replaceText.value
    )

    const delta = replaceText.value.length - (m.end - m.start)
    matches.value.splice(currentMatchIndex.value, 1)

    for (let i = currentMatchIndex.value; i < matches.value.length; i++) {
        if (matches.value[i].pageIdx === m.pageIdx) {
            matches.value[i].start += delta
            matches.value[i].end += delta
        }
    }

    currentMatchIndex.value = Math.min(
        currentMatchIndex.value,
        matches.value.length - 1
    )
    emitUpdatedContent(newContent)
}

const handleReplaceAll = () => {
    if (!replaceText.value || !matches.value.length) return

    const newContent = replaceAllMatches(
        props.content,
        matches.value,
        replaceText.value
    )

    matches.value = []
    currentMatchIndex.value = 0
    emitUpdatedContent(newContent)
}
</script>

<style scoped>
.find-replace-modal {
    width: 250px;
    padding: 10px;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 12px;
}

.input-wrapper {
    display: flex;
    align-items: center;
}

.input-wrapper input {
    flex: 1;
    padding: 4px 6px;
    font-size: 14px;
}

.button-group {
    display: flex;
    gap: 4px;
    margin-left: 4px;
}

.button-group button {
    padding: 4px 6px;
    font-size: 12px;
}

.action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
}

.action-buttons button {
    padding: 4px 8px;
    font-size: 13px;
}

.highlight {
    background-color: yellow;
}
.focus {
    outline: 2px solid red;
}
</style>
