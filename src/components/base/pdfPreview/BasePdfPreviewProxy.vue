<template>
    <div v-if="loading" class="w-full">
        <BaseSpinner size="xs" :text="t('global.loading')" />
    </div>
    <div
        v-else
        v-show="pdfUrl"
        ref="pdfPreviewDiv"
        class="w-full h-48 flex items-center justify-center relative"
        @click="handlePdfClick"
    >
        <BasePdfPreview
            v-if="pdfProxyUrl"
            ref="basePdfPreviewRef"
            :pdf-preview-div="pdfPreviewDiv!"
            :url="pdfProxyUrl"
        />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { GlobalWorkerOptions } from 'pdfjs-dist'
import BaseSpinner from '../spinner/BaseSpinner.vue'
import BasePdfPreview from '../pdf/BasePdfPreview.vue'
import { t } from '@/services/i18n'
import { proxyRedirect } from '@/services/whatsapp'

const props = defineProps<{
    pdfUrl: string
}>()

GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs'

const pdfPreviewDiv = ref<HTMLElement>()

const loading = ref(true)
const pdfProxyUrl = ref<string | null>(null)
const emit = defineEmits(['onPdfClick'])

const handlePdfClick = (e: Event) => {
    e.stopPropagation()
    emit('onPdfClick', pdfProxyUrl.value)
}

onMounted(async () => {
    if (props.pdfUrl) {
        loading.value = true
        pdfProxyUrl.value = await proxyRedirect(props.pdfUrl)
        loading.value = false
    }
})
</script>

<style scoped>
.loader {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #000;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
