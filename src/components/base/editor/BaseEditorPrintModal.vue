<template>
    <BaseModal
        size="xl"
        :close-button="!generatingPDF"
        @on-close="emit('onClose')"
        :title="t('pages.editor.actions.printPreview')"
    >
        <div class="grid grid-cols-1 md:grid-cols-12 gap-2 min-h-[75vh]">
            <div class="flex flex-col md:col-span-3 gap-4 pb-2">
                <div class="flex gap-2">
                    <BaseButtonIcon
                        icon="printer"
                        :tooltip="t('global.print')"
                        color="secondary"
                        :disabled="!pdfBase64"
                        @on-click="printPdf"
                    />

                    <BaseButtonIcon
                        icon="download-file-1"
                        tooltip="Download PDF"
                        color="secondary"
                        :disabled="!pdfBase64"
                        @on-click="downloadAsPdf"
                    />
                </div>
                <div>
                    <BaseSelect
                        v-model="pageFormat"
                        :options="['A3', 'A4']"
                        :label="t('pages.editor.format.pageFormat')"
                        :clearable="false"
                        @update:model-value="handleGeneratePdf"
                    />
                </div>
                <div>
                    <BaseSelect
                        v-if="pageFormat == 'A3'"
                        v-model="pageOrder"
                        :options="[
                            {
                                label: 'Standard',
                                value: 'standard',
                            },
                            {
                                label: t('pages.editor.format.bookPageOrder'),
                                value: 'book',
                            },
                        ]"
                        :label="t('pages.editor.format.pageOrder')"
                        :clearable="false"
                        option-label="label"
                        reduce="value"
                        @update:model-value="handleGeneratePdf"
                    />
                </div>

                <div>
                    <BaseSelect
                        v-model="backgroundImage"
                        :options="[
                            {
                                label: t('global.none'),
                                value: EditorBackgroundImage.UNSET,
                            },
                            {
                                label: t('pages.editor.protocolBackground'),
                                value: EditorBackgroundImage.PROTOCOL,
                            },
                        ]"
                        :label="t('pages.editor.toolBar.background')"
                        :clearable="false"
                        option-label="label"
                        reduce="value"
                        @update:model-value="handleGeneratePdf"
                    />
                </div>

                <div class="flex gap-2">
                    <BaseInput
                        v-model="startingPage"
                        :label="t('pages.editor.actions.startingPage')"
                        type="number"
                        @update:model-value="handleGeneratePdf"
                    />

                     <BaseInput
                        v-model="endingPage"
                        :label="t('pages.editor.actions.endingPage')"
                        type="number"
                        @update:model-value="handleGeneratePdf"
                    />
                </div>

                <div class="max-h-[40vh] overflow-auto">
                    <BaseCollapseDivider
                        :title="t('types.editorTemplates.titleSingular')"
                    >
                        <template #content>
                            <div>
                                <SlotEditorTemplateCategoryIndex
                                    hide-editor
                                    hide-title
                                    disable-edit
                                    @on-select-template="handleSelectTemplate"
                                />
                            </div>
                        </template>
                    </BaseCollapseDivider>
                </div>
            </div>

            <div
                ref="previewContainer"
                class="md:col-span-9 border overflow-auto min-h-[35vh]"
            >
                <BasePdfPreview
                    v-if="pdfBase64 && previewContainer && !generatingPDF"
                    :url="`data:application/pdf;base64,${pdfBase64}`"
                    :pdf-preview-div="previewContainer"
                />
                <div
                    v-else
                    class="h-full w-full flex justify-center flex-col items-center gap-5"
                >
                    <BaseSpinner
                        :text="
                            t(
                                'pages.subjectIdentification.loadingPreviewDocument'
                            )
                        "
                    />
                </div>
            </div>
        </div>
    </BaseModal>
</template>
<script setup lang="ts">
import { t } from '@/services/i18n'
import BaseModal from '../modals/BaseModal.vue'
import { useEditorStore } from '@/stores/editor'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import BasePdfPreview from '../pdf/BasePdfPreview.vue'
import BaseButtonIcon from '../button/BaseButtonIcon.vue'
import BaseSelect from '../select/BaseSelect.vue'
import Editor, { EditorPageOrder, PageFormat } from '@/types/editor'
import BaseSpinner from '../spinner/BaseSpinner.vue'
import { EditorBackgroundImage } from '@/enums/EditorBackgroundImage'
import SlotEditorTemplateCategoryIndex from '@/components/slots/editor/templateCategories/SlotEditorTemplateCategoryIndex.vue'
import BaseCollapseDivider from '../collapse/BaseCollapseDivider.vue'
import EditorTemplate from '@/types/editorTemplate'
import { useEditorTemplateStore } from '@/stores/editorTemplate'
import BaseInput from '../input/BaseInput.vue'

const emit = defineEmits(['onClose'])

const props = withDefaults(
    defineProps<{
        fileName?: string
        editorInstanceId: string
    }>(),
    {
        fileName: undefined,
    }
)

const editorStore = useEditorStore(props.editorInstanceId)()
const editorTemplateStore = useEditorTemplateStore(
    props.editorInstanceId + 'editor-template-store'
)()

const pdfBase64 = ref<string>()
const previewContainer = ref<HTMLElement>()
const pageFormat = ref<PageFormat>('A3')
const pageOrder = ref<EditorPageOrder>('book')
const generatingPDF = ref<boolean>(false)
const backgroundImage = ref<string>(EditorBackgroundImage.PROTOCOL)
const originalEditor = ref<Partial<Editor>>({})
const endingPage = ref<number>()
const startingPage = ref<number>()


onMounted(async () => {
    originalEditor.value = editorStore.backUpEditor()
    backgroundImage.value = editorStore.backgroundImage
    handleGeneratePdf()
})

const handleGeneratePdf = async () => {
    generatingPDF.value = true

    handleSelectBackgroundImage(backgroundImage.value)
    try {
        pdfBase64.value = await editorStore.generatePdf({
            pageFormat: pageFormat.value,
            pageOrder: pageOrder.value,
            disableLoading: true,
            startingPage: startingPage.value,
            endingPage: endingPage.value
        })
    } finally {
        generatingPDF.value = false
    }
}

const downloadAsPdf = async () => {
    if (pdfBase64.value) {
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${pdfBase64.value}`
        link.download = props.fileName || 'document.pdf'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}

const handleSelectBackgroundImage = (backgroundImage: string) => {
    editorStore.backgroundImage = backgroundImage
}

const handleSelectTemplate = async (
    template: EditorTemplate
): Promise<void> => {
    generatingPDF.value = true
    editorTemplateStore.editorTemplate = template
    await editorTemplateStore.show()
    editorTemplateStore.useConfigInEditor(editorStore.$id)
    editorTemplateStore.useLineHeightConfigInEditor(editorStore.$id)

    await nextTick(() => {
        editorStore.updateContentFromPages()
        handleGeneratePdf()
    })
}

const printPdf = () => {
    if (!pdfBase64.value) return

    const byteCharacters = atob(pdfBase64.value)
    const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i))
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })

    const blobUrl = URL.createObjectURL(blob)
    const printWindow = window.open(blobUrl, '_blank')

    if (printWindow) {
        printWindow.onload = () => {
            printWindow.focus()
            printWindow.print()
        }
    } else {
        alert(t('pages.editor.actions.printWindowOpenError'))
    }
}

onBeforeUnmount(() => {
    editorStore.setEditor(originalEditor.value)

    editorTemplateStore.resetState()
})
</script>
