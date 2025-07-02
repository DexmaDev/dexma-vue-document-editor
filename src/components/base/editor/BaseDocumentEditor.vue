<template>
    <div :id="editorStore.$id" class="py-5">
        <div class="w-full relative">
            <SlotMarginSlider
                v-if="editableConfig"
                :slider-max="editorStore.rightMargin"
                :slider-max-allow="210"
                :slider-min="editorStore.leftMargin"
                :slider-min-allow="0"
                :step="1"
                :container="editor?.$el"
                :page-class="editorStore.pageIdentifierClass"
                :editor-store-instance-id="editorStoreInstanceId"
                @on-update-max="updateRightMargin"
                @on-update-min="updateLeftMargin"
            />
        </div>

        <VueDocumentEditor
            ref="editor"
            v-model:content="editorStore.content"
            :display="editorStore.display"
            :editable="editable"
            :zoom="editorStore.zoom"
            :overlay="
                editorStore.overlayEnabled && editable
                    ? editorStore.printOverlay
                    : undefined
            "
            class="editor"
            @update:content="onUpdateContent"
            @on-toggle-reset-in-progress="handleToggleResettingContent"
            @overlay-element-focus-in="handleOverlaySettingsModalVisible"
            @overlay-element-focus-out="handleOverlayElementFocusOut"
        />

        <ChangeCustomElementValueModal
            v-if="customElementEditModalVisible && selectedCustomElement"
            :custom-element="selectedCustomElement"
            :disable-edit="disableCustomTagEdit"
            :modal-store-id="modalStore.$id"
            @on-close="onCloseChangeCustomElementModal"
            @on-confirm-all="
                (newValue, properties, transformIntoPlainText) =>
                    onConfirmChangeAllCustomElement(
                        newValue,
                        properties,
                        transformIntoPlainText
                    )
            "
            @on-confirm="
                (newValue, properties, transformIntoPlainText) =>
                    onConfirmChangeSingleCustomElement(
                        newValue,
                        properties,
                        transformIntoPlainText
                    )
            "
        />

        <EditorActionSuggestion
            v-if="editorActionSuggestionVisible && actionSuggestions.length > 0"
            :actions="actionSuggestions"
            :relative-to="nearestElementToCursor"
            size="xs"
            @on-select-action="handleSelectAction"
            @on-close="onCloseActionSuggestions"
        />

        <ChoseDraftFromCategoryModal
            v-if="customElementDraftCategoryModalVisible"
            :custom-element-id="selectedCustomElement?.getAttribute('id') || ''"
            :relative-to="selectedCustomElement"
            :modal-store-id="modalStore.$id"
            :keep-field-after-confirm="
                selectedCustomElement?.getAttribute('keepfieldafterconfirm') ==
                'true'
            "
            @on-close="handleCloseChoseDraftFromCategory"
            @on-confirm="handleChoseDraftFromCategory"
            @update-keep-field-after-confirm="
                selectedCustomElement?.setAttribute(
                    'keepfieldafterconfirm',
                    selectedCustomElement?.getAttribute(
                        'keepfieldafterconfirm'
                    ) === 'true'
                        ? 'false'
                        : 'true'
                )
            "
        />

        <SelectDraftEntitiesModal
            v-if="draftChoseEntitiesModalVisible"
            :current-practice="currentPractice"
            :selected-draft="selectedDraft || {}"
            :modal-store-id="modalStore.$id"
            @on-confirm="handleSubsituteDraftCategory"
            @on-confirm-without-custom-tags="
                handleSubsituteDraftCategory(undefined, true)
            "
            @on-close="draftChoseEntitiesModalVisible = false"
        />

        <BaseContextMenu
            v-if="contextMenuVisible && editable"
            :menu-items="contextMenuItems"
            :context-menu-position="contextMenuPosition"
            @on-close="handleCloseContextMenu"
        />

        <BaseImageSettingsModal
            v-if="imageSettingsVisible && !isResizingImage"
            :image-element="selectedImage"
            :zoom="editorStore.zoom"
            @on-close="handleImageSettingsClose"
            @on-update="handleUpdateSelectedImageStyle"
        />

        <BaseImageControls
            v-if="imageSettingsVisible"
            :editor-zoom="editorStore.zoom"
            :image-element="selectedImage"
            @on-resize="onResizeImage"
            @on-stop-resizing="onStopResizingImage"
        />

        <OverlaySettingsModal
            v-if="overlaySettingsModalVisible"
            :overlay-element="overlayFocusedElement"
            :editor-overlay="editorStore.overlay"
            @on-close="handleOverlaySettingsModalClose"
            @on-different-first-page="handleDifferentFirstPage"
            @on-show-page-number="handleShowPageNumber"
        />

        <BaseStampControls
            :is-visible="isInsideStamp"
            :editor-zoom="editorStore.zoom"
            :stamp="selectedStamp"
            @on-resize="onResizeStamp"
            @on-stop-resizing="handleStopEditingStamp"
            @on-update-style="handleUpdateStampStyle"
        />

        <EditorDraftCategoryIndexModal
            v-if="showDraftCategoryModalForSavingDraft"
            :modal-store-id="modalStore?.$id"
            draft-category-store-id="save-draft-from-text-draft-category-store"
            only-categories
            @on-close="showDraftCategoryModalForSavingDraft = false"
            @on-select-draft-category="
                handleSelectDraftCategoryToCreateNewDraft
            "
        >
            <template #top-slot>
                <BaseInput
                    v-model="newDraftName"
                    :label="
                        t('types.editorDrafts.fields.name') +
                        ' ' +
                        t('types.editorDrafts.titleSingular').toLowerCase()
                    "
                    :placeholder="
                        t('global.enter') +
                        ' ' +
                        t('types.editorDrafts.fields.name').toLowerCase() +
                        ' ' +
                        t('types.editorDrafts.titleSingular').toLowerCase()
                    "
                    type="text"
                    is-on-focus
                />
            </template>
        </EditorDraftCategoryIndexModal>

        <SlotEditorChat
            v-if="chatModalVisible && editorChatStore.editorChat.id"
            :chat-id="editorChatStore.editorChat.id"
            :modal-store-id="modalStore.$id"
            @on-close="chatModalVisible = false"
        />

        <SlotFindAndReplace
            v-if="editor?.$el && findEndReplaceModalVisible"
            :editor-container="editor.$el"
            :content-class="editorStore.editorClass"
            :replace-active="replaceActive"
            @on-close="
                () => {
                    replaceActive = false
                    findEndReplaceModalVisible = false
                }
            "
            @on-update="handleUpdateContentFromPages"
        />
    </div>
</template>
<script lang="ts" setup>
import '@/assets/css/editor-style.css'

import VueDocumentEditor from 'dexma-vue-document-editor'
import SlotMarginSlider from '@/components/slots/editor/SlotMarginSlider.vue'
import { useEditorStore } from '@/stores/editor'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ChangeCustomElementValueModal from '@/components/modals/editor/ChangeCustomElementValueModal.vue'
import EditorActionSuggestion from '@/components/modals/editor/EditorActionSuggestion.vue'
import {
    selectionContainsNode,
    selectionHasNodes,
    selectionHasText,
} from '@/services/editor/selection'
import ChoseDraftFromCategoryModal from '@/components/modals/editor/draftCategory/ChoseDraftFromCategoryModal.vue'
import EditorDraft, { EditorDraftEntities } from '@/types/editorDraft'
import SelectDraftEntitiesModal from '@/components/modals/editor/draft/SelectDraftEntitiesModal.vue'
import Practice from '@/types/practice'
import BaseContextMenu from '../content/BaseContextMenu.vue'
import { t } from '@/services/i18n'
import { EditorDraftDataType, MenuAction, Property } from '@/types/editor'
import { convertImageToBase64 } from '@/services/editor/image'
import BaseImageControls from '@/components/base/editor/BaseImageControls.vue'
import BaseImageSettingsModal from './BaseImageSettingsModal.vue'
import { ImageResizeDirection } from '@/services/editor/image'
import OverlaySettingsModal from '@/components/modals/editor/overlay/OverlaySettingsModal.vue'
import { OverlayId } from '@/enums/EditorOverlay'
import BaseStampControls from './BaseStampControls.vue'
import { hasCustomTags } from '@/services/editor/editorDraft'
import { useModalStore } from '@/stores/modal'
import EditorDraftCategoryIndexModal from '@/components/modals/editor/draftCategory/EditorDraftCategoryIndexModal.vue'
import EditorDraftCategory from '@/types/editorDraftCategory'
import { useEditorDraftStore } from '@/stores/editorDraft'
import { useNotificationStore } from '@/stores/notification'
import { NotificationType } from '@/enums/NotificationType'
import BaseInput from '../input/BaseInput.vue'
import { EditorDraftModelEnum } from '@/enums/EditorDraftModelEnum'
import SlotEditorChat from '@/components/slots/editor/messages/SlotEditorChat.vue'
import { useEditorChatStore } from '@/stores/editorChat'
import SlotFindAndReplace from '@/components/slots/editor/SlotFindAndReplace.vue'

const props = withDefaults(
    defineProps<{
        actionSuggestions: MenuAction[]
        disableCustomTagEdit: boolean
        editable: boolean
        editableConfig?: boolean
        editorStoreInstanceId?: string
        currentPractice?: Practice
        contextMenuActions?: MenuAction[]
        showSaveAsDraft?: boolean
    }>(),
    {
        actionSuggestions: () => [],
        disableCustomTagEdit: false,
        editable: true,
        editableConfig: true,
        editorStoreInstanceId: undefined,
        currentPractice: undefined,
        contextMenuActions: () => [],
        showSaveAsDraft: false,
    }
)

const emit = defineEmits([
    'onUpdateContent',
    'onUpdateConfig',
    'onUpdateOverlay',
    'onCreateNewVersion',
    'onCreateNewDraft',
])

const editorStore = useEditorStore(props.editorStoreInstanceId)()
const modalStore = useModalStore(props.editorStoreInstanceId + '-modals')()
const notificationStore = useNotificationStore()
const editorChatStore = useEditorChatStore()

const editor = ref<InstanceType<typeof VueDocumentEditor> | null>(null)
const selectedCustomElement = ref<HTMLElement>()
const isInsideCustomElement = ref<boolean>(false)
const nearestElementToCursor = ref<HTMLElement>()
const customElementEditModalVisible = ref<boolean>(false)
const customElementDraftCategoryModalVisible = ref<boolean>(false)
const customElementModalOpenedByMenu = ref<boolean>(false)
const draftChoseEntitiesModalVisible = ref<boolean>(false)
const editorActionSuggestionVisible = ref<boolean>(false)
const contextMenuVisible = ref<boolean>(false)
const isTextSelected = ref<boolean>(false)
const selectedText = ref<string>()
const selectedDraft = ref<EditorDraft>()
const contextMenuPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const imageSettingsVisible = ref<boolean>(false)
const selectedImage = ref<HTMLElement>()
const isResizingImage = ref<boolean>(false)
const imageStartX = ref<number>(0)
const imageDeltaX = ref<number>(0)
const imageStartY = ref<number>(0)
const imageDeltaY = ref<number>(0)
const overlaySettingsModalVisible = ref<boolean>(false)
const overlayFocusedElement = ref<HTMLElement>()
const selectedStamp = ref<HTMLElement>()
const isInsideStamp = ref<boolean>(false)
const higlightedCustomElements = ref<
    { intervalId: NodeJS.Timeout; element: HTMLElement }[]
>([])
const showDraftCategoryModalForSavingDraft = ref<boolean>(false)
const newDraftName = ref<string | undefined>(undefined)
const selectedTextDraftModels = ref<EditorDraftModelEnum[]>([])
const findEndReplaceModalVisible = ref<boolean>(false)
const replaceActive = ref<boolean>(false)

const contextMenuItems = computed<MenuAction[]>(() => [
    ...(isInsideCustomElement.value
        ? [
              {
                  text: t('pages.editor.actions.editCustomField'),
                  click: () => {
                      handleOpenCustomElementModal(true)
                  },
                  icon: 'edit',
                  disabled: !isInsideCustomElement.value,
                  hotkey: 'Enter',
              },
          ]
        : []),
    {
        text: t('global.cut'),
        hotkey: 'Ctrl+X',
        click: async () => {
            try {
                await editorStore.cut()
            } finally {
                await handleUpdateContentFromPages()
            }
        },
        icon: 'scissors',
        disabled: !isTextSelected.value,
    },
    {
        text: t('global.copy'),
        hotkey: 'Ctrl+C',
        click: async () => await editorStore.copy(),
        icon: 'copy',
        disabled: !isTextSelected.value,
    },
    {
        text: t('global.paste'),
        hotkey: 'Ctrl+V',
        click: async () => {
            try {
                await editorStore.paste()
            } finally {
                await handleUpdateContentFromPages()
            }
        },
        icon: 'clipboard',
    },
    {
        text: t('global.pasteNoFormat'),
        click: async () => {
            try {
                await editorStore.pasteNoFormat()
            } finally {
                await handleUpdateContentFromPages()
            }
        },
        hotkey: 'Ctrl+Shift+V',
        icon: 'clipboard-1',
    },
    {
        text: t('global.delete'),
        click: async () => {
            try {
                editorStore.remove()
                imageSettingsVisible.value = false
            } finally {
                await handleUpdateContentFromPages()
            }
        },
        icon: 'delete',
        disabled: !isTextSelected.value,
    },
    {
        text: t('global.comment'),
        click: async () => {
            await handleInsertComment()
        },
        icon: 'messages',
        disabled: !isTextSelected.value,
    },
    translitterationMenu.value,
    ...(props.showSaveAsDraft
        ? [
              {
                  text: t('pages.editor.actions.saveAsDraft'),
                  icon: 'save',
                  disabled: !isTextSelected.value,
                  click: () =>
                      handleOpenDraftCategorySelectModalForSavingDraft(),
              },
          ]
        : []),
    ...(props.contextMenuActions?.length > 0 ? [{ is: 'separator' }] : []),
    ...(props.contextMenuActions?.length > 0 ? props.contextMenuActions : []),
])

const translitterationMenuItems = computed<MenuAction[] | undefined>(() => {
    if (editorStore.translitterableSelection.type == 'date') {
        return undefined
    }

    if (editorStore.translitterableSelection.type == 'number') {
        return [
            {
                text:
                    t('pages.editor.actions.transliteration') +
                    ' (' +
                    t('pages.editor.actions.number') +
                    ')',
                click: async () => {
                    try {
                        editorStore.translitterateNumber()
                    } finally {
                        await handleUpdateContentFromPages()
                    }
                },
                disabled:
                    !editorStore.translitterableSelection.isTranslitterable,
            },
            {
                text:
                    t('pages.editor.actions.number') +
                    ' (' +
                    t('pages.editor.actions.transliteration') +
                    ')',
                click: async () => {
                    try {
                        editorStore.translitterateNumber({
                            type: 'numberThanTranslitteration',
                        })
                    } finally {
                        await handleUpdateContentFromPages()
                    }
                },
                disabled:
                    !editorStore.translitterableSelection.isTranslitterable,
            },
            {
                text:
                    t('pages.editor.actions.transliteration') +
                    ' ' +
                    t('pages.editor.actions.integer').toLowerCase() +
                    ' / ' +
                    t('pages.editor.actions.decimal').toLowerCase() +
                    ' (' +
                    t('pages.editor.actions.number') +
                    ')',
                click: async () => {
                    try {
                        editorStore.translitterateNumber({
                            type: 'translitterationThanFraction',
                        })
                    } finally {
                        await handleUpdateContentFromPages()
                    }
                },
                disabled:
                    !editorStore.translitterableSelection.isTranslitterable,
            },
        ]
    }

    if (editorStore.translitterableSelection.type == 'fraction') {
        return [
            {
                text: t('global.numerator') + ' / ' + t('global.denominator'),
                click: async () => {
                    try {
                        editorStore.translitterateFraction({
                            type: 'numerator/denominator',
                        })
                    } finally {
                        await handleUpdateContentFromPages()
                    }
                },
                disabled:
                    !editorStore.translitterableSelection.isTranslitterable,
            },
            {
                text: t('pages.editor.actions.fraction'),
                click: async () => {
                    try {
                        editorStore.translitterateFraction({
                            type: 'fraction',
                        })
                    } finally {
                        await handleUpdateContentFromPages()
                    }
                },
                disabled:
                    !editorStore.translitterableSelection.isTranslitterable,
            },
        ]
    }

    return undefined
})

const translitterationMenu = computed<MenuAction>(() => {
    return {
        text: t('pages.editor.actions.transliteration'),
        click: async () => {
            try {
                editorStore.translitterate()
            } finally {
                await handleUpdateContentFromPages()
            }
        },
        icon: 'code-file',
        hotkey: 'Ctrl+D',
        disabled: !editorStore.translitterableSelection.isTranslitterable,
        menu: translitterationMenuItems.value,
    }
})

const chatModalVisible = ref<boolean>(false)

onMounted(() => {
    window.addEventListener('wheel', handleWheelZoom, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleCloseContextMenu)

    document.addEventListener('selectionchange', handleSelectionChange)

    nextTick(() => {
        if (editor.value?.$el) {
            editor.value.$el.addEventListener('dblclick', handleEditorDblClick)
            editor.value.$el.addEventListener(
                'contextmenu',
                handleOpenContextMenu
            )
            editor.value.$el.addEventListener('drop', handleDrop)
            editor.value.$el.addEventListener('click', handleEditorClick)
            editor.value.$el.addEventListener('dragover', handleDragOver)
            editor.value.$el.addEventListener('dragstart', handleDragStart)
            editor.value.$el.addEventListener('dragend', handleDragEnd)
        }

        handleSetBackGroundImage()
        handleSetRightMargin()
        handleSetLeftMargin()

        if (editorStore.hyphenation) {
            editorStore.useHyphenation(editorStore.hyphenation)
        }
    })
})

watch(
    () => editorStore.isResettingContent,
    async () => {
        if (!editorStore.isResettingContent) {
            if (editorStore.pendingRestoreSelection) {
                editorStore.restoreSelectionFromMarkers()

                if (editor.value) {
                    editor.value.prevent_next_content_update_from_parent = true
                    await handleUpdateContentFromPages()
                }
            }

            onUpdateContent()
            emit('onUpdateOverlay', editorStore.overlay)
        }
    },
    {
        deep: true,
    }
)

watch(
    () => editorStore.rightMargin,
    () => {
        handleSetRightMargin()
    }
)

watch(
    () => editorStore.leftMargin,
    () => {
        handleSetLeftMargin()
    }
)

watch(
    () => editorStore.backgroundImage,
    () => {
        handleSetBackGroundImage()
    }
)

watch(
    () => [isInsideCustomElement.value, selectedCustomElement.value],
    () => {
        if (isInsideCustomElement.value && selectedCustomElement.value) {
            startCustomElementBlinkingEffect(selectedCustomElement.value)
        } else if (
            !isInsideCustomElement.value &&
            selectedCustomElement.value
        ) {
            stopCustomElementBlinkingEffect()
        }
    }
)

const handleSetBackGroundImage = () => {
    if (editor.value?.$el) {
        editor.value.$el?.style.setProperty(
            '--background-image',
            editorStore.backgroundImage || 'unset'
        )
        editor.value.$el?.style.setProperty(
            '--margin-visibility',
            editorStore.backgroundImage == 'unset' ? 'hidden' : 'unset'
        )
    }
}

const handleSetRightMargin = () => {
    if (editor.value?.$el) {
        editor.value.$el?.style.setProperty(
            '--padding-vertical-right',
            `${(editorStore.rightMargin + 1).toString()}mm`
        )
    }
}

const handleSetLeftMargin = () => {
    if (editor.value?.$el) {
        editor.value.$el?.style.setProperty(
            '--padding-vertical-left',
            `${(editorStore.leftMargin + 1).toString()}mm`
        )
    }
}

const onUpdateContent = (value: string[] = editorStore.content) => {
    if (!editorStore.navigatingHistory) {
        editorStore.updateContentHistory()
        emit('onUpdateContent', value)
    }
    editorStore.navigatingHistory = false
}

const updateLeftMargin = (newMargin: number) => {
    handleImageSettingsClose()
    editorStore.leftMargin = newMargin
    emit('onUpdateConfig', editorStore.getConfig())
}

const updateRightMargin = (newMargin: number) => {
    handleImageSettingsClose()
    editorStore.rightMargin = newMargin
    emit('onUpdateConfig', editorStore.getConfig())
}

const handleWheelZoom = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        editorStore.updateZoom(-e.deltaY * 0.00041666667)
    }
}

const handleSelectionChange = (): void => {
    const cursorPosition = editorStore.getCursorPosition()
    isTextSelected.value = selectionHasText()
    editorStore.isSelectionTranslitterable()
    let controlCustomElement: boolean = false
    let controlStamp: boolean = false

    if (cursorPosition.node) {
        const currentNode =
            cursorPosition.node.nodeType === Node.ELEMENT_NODE
                ? (cursorPosition.node as HTMLElement)
                : cursorPosition.node.parentElement

        if (currentNode) {
            const customElement = currentNode.closest(
                `.${editorStore.customTagClassIdentifier}`
            )
            if (customElement) {
                selectedCustomElement.value = customElement as HTMLElement
                controlCustomElement =
                    !selectedCustomElement.value.classList.contains(
                        editorStore.chatTagClassIdentifier
                    )
            }

            const stampContainer = currentNode.closest(
                `.${editorStore.stampContainerClass}`
            )

            if (stampContainer) {
                selectedStamp.value = stampContainer as HTMLElement
                controlStamp = true
            }
        }
    }

    isInsideCustomElement.value = controlCustomElement
    isInsideStamp.value = controlStamp
}

const handleKeyDown = async (e: KeyboardEvent) => {
    if (!props.editable) {
        e.stopPropagation()
        return
    }

    const ctrlKeyPressed = e.ctrlKey || e.metaKey

    if (ctrlKeyPressed && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        editorStore.updateZoom(0.25)
    } else if (ctrlKeyPressed && e.key === '-') {
        e.preventDefault()
        editorStore.updateZoom(-0.25)
    } else if (ctrlKeyPressed && e.key === 'z') {
        e.preventDefault()
    } else if (ctrlKeyPressed && e.key === 'y') {
        e.preventDefault()
    } else if (ctrlKeyPressed && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        try {
            editorStore.translitterate()
        } finally {
            await handleUpdateContentFromPages()
        }
    } else if (ctrlKeyPressed && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        findEndReplaceModalVisible.value = true
        replaceActive.value = false
    } else if (ctrlKeyPressed && e.key.toLowerCase() === 'r') {
        e.preventDefault()
        findEndReplaceModalVisible.value = true
        replaceActive.value = true
    }

    if (e.key == 'F1') {
        e.preventDefault()
    }

    if (e.key.toLowerCase() == 'escape') {
        e.preventDefault()
        findEndReplaceModalVisible.value = false
        replaceActive.value = false
    }

    if (!modalStore.isModalOpen) {
        if (ctrlKeyPressed && e.key === 'm') {
            const cursorPosition = editorStore.getCursorPosition()
            nearestElementToCursor.value = cursorPosition.node as HTMLElement
            if (nearestElementToCursor.value) {
                editorActionSuggestionVisible.value = true
            }
        } else if (ctrlKeyPressed && e.key.toLowerCase() == 'v' && e.shiftKey) {
            e.preventDefault()
            try {
                await editorStore.pasteNoFormat()
            } finally {
                await handleUpdateContentFromPages()
            }
        } else if (ctrlKeyPressed && e.key.toLowerCase() == 'v') {
            e.preventDefault()
            try {
                await editorStore.paste()
            } finally {
                await handleUpdateContentFromPages()
            }
        }

        if (
            ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
        ) {
            handleSelectionChange()
        } else if (e.key == 'Tab') {
            const selection = window.getSelection()
            const currentNode = selection?.anchorNode
            const container = document.querySelector(
                `.${editorStore.editorClass}`
            )

            if (container && currentNode && container.contains(currentNode)) {
                e.preventDefault()
                await editorStore.insertWhiteSpaces()
            }
        } else if (e.key == 'F1') {
            e.preventDefault()
            handleFocusNextCustomElement()
        }

        if (isInsideCustomElement.value) {
            if (
                e.key.length === 1 &&
                !ctrlKeyPressed &&
                !e.altKey &&
                !e.metaKey
            ) {
                e.preventDefault()
                const textToInsert = e.key == ' ' ? '\u00A0' : e.key
                const selection = window.getSelection()
                const range = editorStore.getSelectionRange()
                if (range && selectedCustomElement.value) {
                    if (
                        selectedCustomElement.value?.classList?.contains(
                            EditorDraftDataType.BOOKMARK
                        ) &&
                        e.key != ' '
                    ) {
                        handleDeleteSelectedCustomElement()
                    } else {
                        if (
                            range.startOffset === 0 &&
                            selectedCustomElement.value.parentElement
                        ) {
                            range.setStartBefore(selectedCustomElement.value)
                        } else {
                            range.setStartAfter(selectedCustomElement.value)
                        }
                    }

                    range.collapse(true)

                    const textNode = document.createTextNode(textToInsert)
                    range.insertNode(textNode)

                    range.setStartAfter(textNode)
                    range.collapse(true)
                    selection?.removeAllRanges()
                    selection?.addRange(range)
                }
            } else if (e.key == 'Backspace') {
                e.preventDefault()
                handleDeleteSelectedCustomElement()
            } else if (e.key == 'Enter') {
                e.preventDefault()
                handleOpenCustomElementModal(true)
            }
        }

        if (isInsideStamp.value) {
            if (e.key == 'Enter') {
                e.preventDefault()
                const div = document.createElement('div')
                div.textContent = '\u200B'
                div.setAttribute('contenteditable', 'true')

                if (selectedStamp.value) {
                    const range = editorStore.getSelectionRange()

                    if (range) {
                        const isInsideStamp = selectedStamp.value.contains(
                            range.startContainer
                        )

                        if (isInsideStamp) {
                            range.deleteContents()
                            range.insertNode(div)

                            const newRange = document.createRange()
                            newRange.setStart(div, 0)
                            newRange.collapse(true)

                            const selection = window.getSelection()
                            selection?.removeAllRanges()
                            selection?.addRange(newRange)
                        }
                    }
                }
            }
        }
    }
}

const handleDeleteSelectedCustomElement = () => {
    const selection = window.getSelection()
    const range = document.createRange()

    if (selectedCustomElement.value?.parentElement) {
        range.setStartBefore(selectedCustomElement.value)
        range.collapse(true)

        selectedCustomElement.value.remove()

        selection?.removeAllRanges()
        selection?.addRange(range)
    }
}

const handleFocusNextCustomElement = () => {
    const customElements = document.querySelectorAll(
        `.${editorStore.customTagClassIdentifier}`
    )
    const customElementsArray = Array.from(customElements)

    if (
        selectedCustomElement.value &&
        (isInsideCustomElement.value || customElementModalOpenedByMenu.value)
    ) {
        const currentIndex = customElementsArray.indexOf(
            selectedCustomElement.value
        )

        const nextIndex = (currentIndex + 1) % customElementsArray.length

        selectedCustomElement.value = customElementsArray[
            nextIndex
        ] as HTMLElement
        handleFocusSelectedCustomElement()
    } else {
        let closestElement: HTMLElement | null = null
        let minDistance = Infinity

        if (editorStore.cursorPosition.node) {
            const cursorNode = editorStore.cursorPosition.node
            const cursorOffset = editorStore.cursorPosition.offset || 0

            customElementsArray.forEach((element) => {
                //if the cursor position node contains the element, we take into account the cursor position offset
                if (cursorNode.contains(element)) {
                    const range = document.createRange()
                    range.selectNodeContents(element)
                    const elementOffset = range.startOffset

                    const offsetDistance = Math.abs(
                        cursorOffset - elementOffset
                    )

                    if (offsetDistance < minDistance) {
                        minDistance = offsetDistance
                        closestElement = element as HTMLElement
                    }
                } else {
                    const distance = Math.abs(
                        element.compareDocumentPosition(cursorNode)
                    )

                    if (distance < minDistance) {
                        minDistance = distance
                        closestElement = element as HTMLElement
                    }
                }
            })

            if (closestElement) {
                selectedCustomElement.value = closestElement
                handleFocusSelectedCustomElement()
            }
        }
    }
}

const handleEditorDblClick = (event: MouseEvent) => {
    let target = event.target as HTMLElement
    selectedCustomElement.value = undefined
    while (
        target &&
        !target.classList?.contains(editorStore.pageIdentifierClass) &&
        !target.classList?.contains(editorStore.customTagClassIdentifier) &&
        !target.classList?.contains(editorStore.chatTagClassIdentifier)
    ) {
        target = target.parentElement as HTMLElement
    }

    if (
        target &&
        target.classList?.contains(editorStore.customTagClassIdentifier)
    ) {
        selectedCustomElement.value = target
        handleOpenCustomElementModal()
    }
}

const handleOpenCustomElementModal = (openedByMenu: boolean = false): void => {
    customElementModalOpenedByMenu.value = openedByMenu
    if (
        selectedCustomElement.value &&
        props.editable &&
        !selectedCustomElement.value?.classList?.contains(
            EditorDraftDataType.BOOKMARK
        )
    ) {
        if (
            selectedCustomElement.value.classList?.contains(
                editorStore.customTagDraftCategoryIdentifier
            )
        ) {
            customElementDraftCategoryModalVisible.value = true
        } else if (
            selectedCustomElement.value.classList?.contains(
                editorStore.chatTagClassIdentifier
            )
        ) {
            let editorChatId: undefined | number = undefined
            Array.from(selectedCustomElement.value.attributes).filter(
                (attribute) => {
                    if (attribute.name == 'editorchatid') {
                        editorChatId = parseInt(attribute.value)
                    }
                }
            )
            if (editorChatId) {
                editorChatStore.editorChat.id = editorChatId
                chatModalVisible.value = true
            }
        } else {
            customElementEditModalVisible.value = true
        }
    }
}

const onConfirmChangeAllCustomElement = (
    newValue: string,
    properties?: Property[],
    transformIntoPlainText?: boolean
) => {
    const id = selectedCustomElement.value?.getAttribute('id')
    if (id) {
        editorStore.updateCustomTagsContent(
            id,
            newValue,
            properties,
            transformIntoPlainText
        )
    }
    handleCloseCustomElementModalAfterEdit()
}

const onConfirmChangeSingleCustomElement = (
    newValue: string,
    properties?: Property[],
    transformIntoPlainText?: boolean
) => {
    if (selectedCustomElement.value) {
        editorStore.updateCustomTagContent(
            selectedCustomElement.value,
            newValue,
            properties,
            transformIntoPlainText,
            false
        )
    }
    handleCloseCustomElementModalAfterEdit()
}

const handleCloseCustomElementModalAfterEdit = () => {
    if (customElementModalOpenedByMenu.value) {
        const currentCustomElement = selectedCustomElement.value
        handleFocusNextCustomElement()
        customElementEditModalVisible.value = false

        setTimeout(() => {
            if (currentCustomElement != selectedCustomElement.value) {
                handleOpenCustomElementModal(true)
            }
        }, 200)
    } else {
        onCloseChangeCustomElementModal()
    }
}

const onCloseChangeCustomElementModal = () => {
    editorStore.updateContentFromPages()

    customElementEditModalVisible.value = false
    customElementModalOpenedByMenu.value = false
}

const handleCloseChoseDraftFromCategory = (): void => {
    customElementDraftCategoryModalVisible.value = false
}

const handleFocusSelectedCustomElement = (): void => {
    if (selectedCustomElement.value) {
        selectedCustomElement.value.focus()

        const range = document.createRange()
        const selection = window.getSelection()
        range.selectNodeContents(selectedCustomElement.value)
        range.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(range)

        selectedCustomElement.value.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
        })
    }
}

const handleSelectAction = (action: () => void) => {
    action()
}

const onCloseActionSuggestions = (): void => {
    editorActionSuggestionVisible.value = false
}

const handleChoseDraftFromCategory = async (
    draft: EditorDraft
): Promise<void> => {
    selectedDraft.value = draft
    if (
        draft.model?.length > 0 ||
        hasCustomTags(draft.content, editorStore.$id)
    ) {
        draftChoseEntitiesModalVisible.value = true
    } else {
        await handleSubsituteDraftCategory()
    }
}

const handleSubsituteDraftCategory = async (
    entities?: EditorDraftEntities | EditorDraftEntities[],
    withoutCustomTags?: boolean
): Promise<void> => {
    if (selectedDraft.value && selectedCustomElement.value) {
        const containerElement = document.createElement('div')
        containerElement.innerHTML = ' '

        if (
            selectedCustomElement.value?.getAttribute(
                'keepfieldafterconfirm'
            ) == 'true'
        ) {
            selectedCustomElement.value.insertAdjacentElement(
                'beforebegin',
                containerElement
            )
        } else {
            selectedCustomElement.value.className = ''
            selectedCustomElement.value.removeAttribute('style')
            selectedCustomElement.value.replaceWith(containerElement)
        }

        editorStore.cursorPosition = {
            node: containerElement,
            offset: 1,
        }
        if (withoutCustomTags) {
            await editorStore.addDraftWithoutCustomTags(selectedDraft.value)
        } else {
            await editorStore.addDraft(selectedDraft.value, entities)
        }
        selectedDraft.value = undefined

        emit('onCreateNewVersion')
    }

    draftChoseEntitiesModalVisible.value = false
}

const handleOpenContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    contextMenuVisible.value = false

    nextTick(() => {
        contextMenuPosition.value = {
            x: event.clientX,
            y: event.clientY,
        }

        const target = event.target as HTMLElement

        const isTargetInSelection =
            selectionContainsNode(target) && selectionHasNodes()

        if (target.tagName === 'IMG' && !isTargetInSelection) {
            handleImageSettingsClose()
            handleOpenImageSettings(target)

            const range = document.createRange()
            range.selectNode(selectedImage.value!)

            const selection = window.getSelection()
            selection?.removeAllRanges()
            selection?.addRange(range)
        }

        contextMenuVisible.value = true
    })
}

const handleCloseContextMenu = () => {
    contextMenuVisible.value = false
}

const handleUpdateContentFromPages = async (): Promise<void> => {
    await nextTick(() => {
        editorStore.updateContentFromPages()
    })
}

const handleToggleResettingContent = (value: boolean): void => {
    editorStore.isResettingContent = value
}

const handleInsertImage = async (file: File): Promise<void> => {
    const base64Image = await convertImageToBase64(file)
    editorStore.insertImage(base64Image)
    await handleUpdateContentFromPages()
    emit('onCreateNewVersion')
}

const handleDrop = async (event: DragEvent) => {
    event.preventDefault()
    if (!props.editable) {
        return
    }

    if (event.dataTransfer?.files.length) {
        const file = event.dataTransfer.files[0]
        if (file.type.startsWith('image/') && !selectedImage.value) {
            handleInsertImage(file)
        }
    }
}

const handleDragStart = (event: DragEvent) => {
    event.preventDefault()
    if (!props.editable) {
        return
    }
    const target = event.target as HTMLElement

    if (target.tagName === 'IMG') {
        handleOpenImageSettings(target)

        const imgRect = selectedImage.value!.getBoundingClientRect()

        imageStartX.value = event.clientX - imgRect.left
        imageDeltaX.value = 0

        imageStartY.value = event.clientY - imgRect.top
        imageDeltaY.value = 0
    }
}

const handleDragOver = async (event: DragEvent) => {
    event.preventDefault()
    if (!props.editable) {
        return
    }
    const target = event.target as HTMLElement

    if (target.tagName === 'IMG') {
        event.preventDefault()
        if (target != selectedImage.value) {
            handleOpenImageSettings(target)
        }
    }

    if (selectedImage.value) {
        const imgRect = selectedImage.value.getBoundingClientRect()

        imageDeltaX.value = event.clientX - imageStartX.value - imgRect.left
        imageDeltaY.value = event.clientY - imageStartY.value - imgRect.top
    }
}

const handleDragEnd = async (event: DragEvent) => {
    event.preventDefault()
    if (!props.editable) {
        return
    }
    const target = event.target as HTMLElement

    if (selectedImage.value && selectedImage.value == target) {
        event.preventDefault()
        await editorStore.translateImage(
            event,
            selectedImage.value,
            imageDeltaX.value,
            imageDeltaY.value
        )
        editorStore.updateFocuesedOverlay(selectedImage.value)
        selectedImage.value = undefined
        imageSettingsVisible.value = false
        imageDeltaX.value = 0
        await handleUpdateContentFromPages()
    }
}

const handleEditorClick = (event: MouseEvent) => {
    handleImageSettingsClose()

    const target = event.target as HTMLElement
    if (target.tagName === 'IMG') {
        handleOpenImageSettings(target)
    }
}

const handleOpenImageSettings = (target: HTMLElement) => {
    selectedImage.value = target
    imageSettingsVisible.value = true
}

const onResizeImage = async (
    newWidth: number,
    newHeight: number,
    resizeDirection: ImageResizeDirection
) => {
    if (selectedImage.value) {
        isResizingImage.value = true
        selectedImage.value = await editorStore.resizeImage(
            selectedImage.value,
            newWidth,
            newHeight,
            resizeDirection
        )
    }
}

const onStopResizingImage = async () => {
    editorStore.updateFocuesedOverlay(selectedImage.value)
    handleImageSettingsClose()
    await handleUpdateContentFromPages()
}

const handleImageSettingsClose = () => {
    selectedImage.value = undefined
    imageSettingsVisible.value = false
    isResizingImage.value = false
}

const handleUpdateSelectedImageStyle = async (style: object) => {
    if (selectedImage.value) {
        for (const [key, value] of Object.entries(style)) {
            selectedImage.value.style.setProperty(key, value)
        }
        handleImageSettingsClose()
        await handleUpdateContentFromPages()
    }
}

const handleOverlayElementFocusOut = (event: FocusEvent) => {
    if (event.target) {
        editorStore.updateOverlayElement(event.target as HTMLElement)
        emit('onUpdateOverlay', editorStore.overlay)
    }
}

const handleOverlaySettingsModalVisible = (event: FocusEvent) => {
    const target = event.target as HTMLElement
    if (
        props.editable &&
        target &&
        (target?.id == OverlayId.HEADER || target?.id == OverlayId.FOOTER)
    ) {
        overlaySettingsModalVisible.value = true
        overlayFocusedElement.value = event.target as HTMLElement
    }
}

const handleOverlaySettingsModalClose = () => {
    overlaySettingsModalVisible.value = false
    overlayFocusedElement.value = undefined
}

const handleDifferentFirstPage = () => {
    editorStore.overlay.differentForFirstPage =
        !editorStore.overlay.differentForFirstPage
    emit('onUpdateOverlay', editorStore.overlay)
}

const handleShowPageNumber = () => {
    editorStore.overlay.showPageNumber = !editorStore.overlay.showPageNumber
    emit('onUpdateOverlay', editorStore.overlay)
}

const onResizeStamp = async (
    newWidth: number,
    newHeight: number,
    resizeDirection: ImageResizeDirection
) => {
    if (selectedStamp.value) {
        if (resizeDirection == 'top') {
            selectedStamp.value = await editorStore.resizeStamp(
                selectedStamp.value,
                newWidth,
                newHeight,
                resizeDirection
            )
        }
    }
}

const handleStopEditingStamp = async () => {
    editorStore.updateFocuesedOverlay(selectedStamp.value)
    handleStampSettingsClose()
    await handleUpdateContentFromPages()
}

const handleStampSettingsClose = () => {
    selectedStamp.value = undefined
    isInsideStamp.value = false
}

const handleUpdateStampStyle = async (style: object) => {
    selectedStamp.value =
        (document.querySelector(
            '#' + selectedStamp.value?.id
        ) as HTMLElement) || undefined

    if (selectedStamp.value) {
        for (const [key, value] of Object.entries(style)) {
            selectedStamp.value.style.setProperty(key, value, 'important')
        }

        await handleStopEditingStamp()
    }
}

const startCustomElementBlinkingEffect = (element: HTMLElement): void => {
    stopCustomElementBlinkingEffect()

    if (selectedCustomElement.value) {
        let isUnderlined = false

        const intervalId = setInterval(() => {
            isUnderlined = !isUnderlined
            element.style.textDecoration = isUnderlined ? 'underline' : 'none'
        }, 500)

        higlightedCustomElements.value.push({
            intervalId: intervalId,
            element: selectedCustomElement.value,
        })
    }
}

const stopCustomElementBlinkingEffect = (): void => {
    higlightedCustomElements.value.forEach((higlightedCustomElement) => {
        clearInterval(higlightedCustomElement.intervalId)
        higlightedCustomElement.element.style.textDecoration = ''
        higlightedCustomElement.element.style.textDecorationColor = ''
    })

    higlightedCustomElements.value = []
}

const handleSelectDraftCategoryToCreateNewDraft = async (
    draftCategory?: EditorDraftCategory
): Promise<void> => {
    if (draftCategory?.id && selectedText.value) {
        const draftStore = useEditorDraftStore(
            'create-draft-from-selected-text-draft-store-id'
        )()
        draftStore.resetState()

        draftStore.editorDraft.categoryId = draftCategory.id
        draftStore.editorDraft.name =
            newDraftName.value || t('types.editorDrafts.newDraft')
        draftStore.editorDraft.content = selectedText.value
        draftStore.editorDraft.model = selectedTextDraftModels.value
        const response = await draftStore.create()

        if (response.data.success) {
            notificationStore.addNotificationToQueue({
                type: NotificationType.SUCCESS,
                titleKey: 'global.createElement',
            })

            emit('onCreateNewDraft')
            draftStore.resetState()
        }
    }

    selectedText.value = undefined
    selectedTextDraftModels.value = []
    newDraftName.value = undefined
}

const handleOpenDraftCategorySelectModalForSavingDraft = () => {
    const normalizedSelection = editorStore.normalizeCustomTagsInSelection()

    if (normalizedSelection) {
        const div = document.createElement('div')
        div.appendChild(normalizedSelection.fragment)
        selectedText.value = div.innerHTML

        selectedTextDraftModels.value = normalizedSelection.models

        showDraftCategoryModalForSavingDraft.value = true
    }
}

const resetContent = () => {
    editor.value.reset_content()
}

const handleInsertComment = async () => {
    if (!editorStore.editorId) return
    const range = editorStore.getSelectionRange()

    if (!range || range.collapsed) return

    editorChatStore.editorChat.editorId = editorStore.editorId
    await editorChatStore.create()
    if (!editorChatStore.editorChat.id) return
    const selectedContent = range.extractContents()

    const wrapper = document.createElement('a')
    wrapper.classList.add(editorStore.chatTagClassIdentifier)
    wrapper.classList.add(editorStore.customTagClassIdentifier)

    wrapper.setAttribute(
        'editorchatid',
        editorChatStore.editorChat.id.toString()
    )
    wrapper.appendChild(selectedContent)

    range.insertNode(wrapper)

    range.setStartAfter(wrapper)
    range.collapse(true)

    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)

    chatModalVisible.value = true
    await handleUpdateContentFromPages()
}

defineExpose({
    handleInsertImage,
    handleUpdateContentFromPages,
    translitterationMenu,
    resetContent,
})

onBeforeUnmount(() => {
    window.removeEventListener('wheel', handleWheelZoom)
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('click', handleCloseContextMenu)

    if (editor.value?.$el) {
        editor.value.$el.removeEventListener('dblclick', handleEditorDblClick)
        editor.value.$el.removeEventListener(
            'contextmenu',
            handleOpenContextMenu
        )
        editor.value.$el.removeEventListener('drop', handleDrop)
        editor.value.$el.removeEventListener('click', handleEditorClick)
        editor.value.$el.removeEventListener('dragover', handleDragOver)
        editor.value.$el.removeEventListener('dragstart', handleDragStart)
        editor.value.$el.removeEventListener('dragend', handleDragEnd)
    }

    editorChatStore.resetState()
})
</script>
