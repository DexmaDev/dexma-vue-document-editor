<template>
    <div
        v-if="loadingPdfPreview"
        class="h-full w-full flex justify-center flex-col items-center gap-5"
    >
        <BaseSpinner
            :text="t('pages.subjectIdentification.loadingPreviewDocument')"
        />
    </div>
    <VuePdfEmbed
        v-show="!loadingPdfPreview"
        :height="pdfPreviewHeight"
        :source="url"
        :width="pdfPreviewWidth"
        style="overflow: auto; max-height: 100%"
        @progress="onLoadPdfPreview"
        @rendered="onLoadedPdfPreview"
    />
</template>

<script lang="ts" setup>
import { t } from '@/services/i18n'
import VuePdfEmbed from 'vue-pdf-embed'
import { ref, watch } from 'vue'
import BaseSpinner from '../spinner/BaseSpinner.vue'

const props = defineProps<{
    url: string
    pdfPreviewDiv: HTMLElement
}>()

const loadingPdfPreview = ref<boolean>(true)
const pdfPreviewHeight = ref(0)
const pdfPreviewWidth = ref(0)

const onLoadedPdfPreview = () => {
    loadingPdfPreview.value = false
}

const onLoadPdfPreview = () => {
    loadingPdfPreview.value = true
}

const recalculateSize = () => {
    if (props.pdfPreviewDiv?.clientWidth) {
        pdfPreviewWidth.value =
            props.pdfPreviewDiv.clientWidth -
            props.pdfPreviewDiv.clientWidth * 0.05
    }

    if (props.pdfPreviewDiv?.clientHeight) {
        pdfPreviewHeight.value =
            props.pdfPreviewDiv.clientHeight -
            props.pdfPreviewDiv.clientHeight * 0.05
    }
}

watch(
    loadingPdfPreview,
    () => {
        if (props.pdfPreviewDiv?.clientWidth) {
            pdfPreviewWidth.value =
                props.pdfPreviewDiv.clientWidth -
                props.pdfPreviewDiv.clientWidth * 0.05
        }

        if (props.pdfPreviewDiv?.clientHeight) {
            pdfPreviewHeight.value =
                props.pdfPreviewDiv.clientHeight -
                props.pdfPreviewDiv.clientHeight * 0.05
        }
    },
    { deep: true, immediate: true }
)

defineExpose({
    recalculateSize,
})
</script>
