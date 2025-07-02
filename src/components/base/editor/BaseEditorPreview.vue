<template>
    <div v-if="normalizedContent" class="editor p-4">
        <div class="content">
            <div
                class="page"
                :class="customPageClass"
                style="padding: unset !important"
            >
                <div
                    v-for="(html, index) in normalizedContent"
                    :key="index"
                    v-html="html"
                />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import '@/assets/css/editor-style.css'
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        content?: string | string[]
        customPageClass?: string
    }>(),
    {
        content: undefined,
        customPageClass: undefined,
    }
)

const normalizedContent = computed<string[] | undefined>(() => {
    if (!props.content) return undefined

    const contentArray = Array.isArray(props.content)
        ? props.content
        : [props.content]

    const filteredContent = contentArray.filter((html) => html.trim() !== '') // Rimuove stringhe vuote

    return filteredContent.length > 0 ? filteredContent : undefined
})
</script>
