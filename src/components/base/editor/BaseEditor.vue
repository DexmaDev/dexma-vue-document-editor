<template>
    <div ref="toolbarContainer" class="sticky left-0 top-0 z-10">
        <BaseToolBar
            v-if="showToolbar"
            ref="toolBar"
            :enter-menu-actions="enterMenuActions"
            :edit-menu-actions="[
                ...(editMenuActions?.length > 0 ? editMenuActions : []),
                ...sidebarTranslitteration,
            ]"
            :file-menu-actions="computedFileMenuActions"
            :editor-store-instance-id="editorStoreInstanceId"
            :disable-edit-actions="!editable"
            :disable-edit-config-actions="!editableConfig"
            :file-name="fileName"
            @on-update-config="onUpdateConfig"
            @on-update-content-in-pages="handleUpdateContentFromPages"
        />
    </div>
    <div
        ref="editorContainer"
        :class="{
            'grid grid-cols-12 overflow-x-hidden overflow-y-hidden':
                $slots.sidebar,
        }"
    >
        <div
            :class="{
                ' overflow-auto': $slots.sidebar,
                'col-span-10':
                    $slots.sidebar && sidebarStyle.position == 'absolute',
                'col-span-12':
                    !$slots.sidebar || sidebarStyle.position != 'absolute',
            }"
        >
            <BaseDocumentEditor
                ref="baseDocumentEditor"
                :action-suggestions="actionSuggestions"
                :disable-custom-tag-edit="disableCustomTagEdit"
                :editable="editable"
                :editor-store-instance-id="editorStoreInstanceId"
                :current-practice="currentPractice"
                :editable-config="editableConfig"
                :context-menu-actions="contextMenuActions"
                :show-save-as-draft="showSaveAsDraft"
                @on-update-content="onUpdateContent"
                @on-update-config="onUpdateConfig"
                @on-update-overlay="onUpdateOverlay"
                @on-create-new-version="emit('onCreateNewVersion')"
                @on-create-new-draft="emit('onCreateNewDraft')"
            />
        </div>
        <div
            v-if="$slots.sidebar"
            ref="sidebarContainer"
            :class="{
                'col-span-2': sidebarStyle.position == 'absolute',
                'col-span-12': sidebarStyle.position != 'absolute',
            }"
            class="relative h-full"
        >
            <div :style="sidebarStyle" class="relative z-[2]">
                <div
                    class="absolute inset-y-0 left-0 z-1 w-fit items-center justify-center min-h-10 hidden lg:block"
                >
                    <BaseButtonIcon
                        :icon="!collapseSidebar ? 'chevron-up' : 'chevron-down'"
                        :color="'neutral'"
                        variant="outline"
                        size="sm"
                        :tooltip="
                            !collapseSidebar
                                ? t('global.hide')
                                : t('global.show')
                        "
                        :container-style="{
                            border: '0',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                        }"
                        button-class="md:rotate-90 relative z-[11] bg-white"
                        @on-click="handleCollapseSidebar"
                    />
                </div>

                <div
                    class="absolute inset-y-0 left-0 w-1 cursor-ew-resize z-10 lg:border-l-2 lg:border-neutral-200 hidden lg:block"
                    @mousedown="startResizing"
                ></div>
                <slot name="sidebar" />
            </div>
        </div>
    </div>

    <EditorTemplateCategoryIndexModal
        v-if="showTemplatesSelect && templateModalVisible"
        @on-close="handleTemplateModalVisible"
        @on-select-template="handleTemplateSelect"
    />

    <EditorDraftCategoryIndexModal
        v-if="
            (showDraftsSelect || showDraftCategoriesSelect) && draftModalVisible
        "
        :select-draft-entities="selectDraftEntities"
        :only-categories="draftModalShowOnlyCategory"
        :current-practice="currentPractice"
        :draft-category-store-id="
            editorStore.$id +
            'editor-draft-category-store-editor-draft-select-modal'
        "
        :draft-store-id="
            editorStore.$id + 'editor-draft-store-editor-draft-select-modal'
        "
        @on-close="draftModalVisible = false"
        @on-select-draft="handleDraftSelect"
        @on-select-draft-category="handleDraftCategorySelect"
        @on-select-draft-entities="handleOpenDraftEntitiesSelect"
    />
    <SelectDraftEntitiesModal
        v-if="
            selectedDraft?.model &&
            draftEntitiesModalVisible &&
            showDraftsSelect &&
            !draftModalVisible
        "
        :selected-draft="selectedDraft"
        :current-practice="currentPractice"
        @on-confirm="handleDraftSelect(selectedDraft, $event)"
        @on-close="draftEntitiesModalVisible = false"
        @on-confirm-without-custom-tags="
            handleDraftSelectWithoutCustomTags(selectedDraft)
        "
    />
    <SelectLogoModal
        v-if="selectLogoModalVisible"
        :editor-store-instance-id="editorStoreInstanceId"
        @on-close="selectLogoModalVisible = false"
        @on-update-overlay="emit('onUpdateOverlay', $event)"
    />
    <SelectStampModal
        v-if="selectStampModalVisible"
        :editor-store-instance-id="editorStoreInstanceId"
        :current-practice="currentPractice"
        @on-close="selectStampModalVisible = false"
        @on-update-overlay="emit('onUpdateOverlay', $event)"
    />

    <BaseModal v-if="editorStore.loadingPrint">
        <BaseSpinner />
    </BaseModal>

    <EditorVersionsModal
        v-if="showVersionsModal"
        :versions="versions"
        :modal-store-id="modalStore.$id"
        :editor-store-instance-id="editorStoreInstanceId"
        @on-close="handleVersionModalVisibility(false)"
        @on-select="
            (version: Editor) => {
                handleVersionModalVisibility(false)
                emit('onSelectVersion', version)
            }
        "
    />

    <EditorMinuteCategoryIndexModal
        v-if="showMinuteCategoryModalForSavingMinute"
        :modal-store-id="modalStore?.$id"
        only-categories
        @on-close="showMinuteCategoryModalForSavingMinute = false"
        @on-select-minute-category="handleSelectMinuteCategoryToCreateNewMinute"
    >
        <template #top-slot>
            <BaseInput
                v-model="newMinuteName"
                :label="
                    t('types.editorMinutes.fields.name') +
                    ' ' +
                    t('types.editorMinutes.titleSingular').toLowerCase()
                "
                :placeholder="
                    t('global.enter') +
                    ' ' +
                    t('types.editorMinutes.fields.name').toLowerCase() +
                    ' ' +
                    t('types.editorMinutes.titleSingular').toLowerCase()
                "
                type="text"
                is-on-focus
            />
        </template>
    </EditorMinuteCategoryIndexModal>

    <BaseEditorPrintModal
        v-if="editorPrintModalVisible"
        :editor-instance-id="editorStore.$id"
        :file-name="fileName"
        @on-close="editorPrintModalVisible = false"
    />
</template>

<script lang="ts" setup>
import BaseToolBar from '@/components/base/editor/BaseToolBar.vue'
import BaseDocumentEditor from '@/components/base/editor/BaseDocumentEditor.vue'
import EditorTemplateCategoryIndexModal from '@/components/modals/editor/templateCategory/EditorTemplateCategoryIndexModal.vue'
import {
    computed,
    CSSProperties,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from 'vue'
import { t } from '@/services/i18n'
import { useEditorTemplateStore } from '@/stores/editorTemplate'
import EditorTemplate from '@/types/editorTemplate'
import { useEditorStore } from '@/stores/editor'
import EditorDraftCategoryIndexModal from '@/components/modals/editor/draftCategory/EditorDraftCategoryIndexModal.vue'
import EditorDraft, { EditorDraftEntities } from '@/types/editorDraft'
import EditorDraftCategory from '@/types/editorDraftCategory'
import Practice from '@/types/practice'
import SelectDraftEntitiesModal from '@/components/modals/editor/draft/SelectDraftEntitiesModal.vue'
import Editor, { EditorConfig, MenuAction } from '@/types/editor'
import SelectLogoModal from '@/components/modals/editor/logos/SelectLogoModal.vue'
import SelectStampModal from '@/components/modals/editor/stamps/SelectStampModal.vue'
import BaseModal from '../modals/BaseModal.vue'
import BaseSpinner from '../spinner/BaseSpinner.vue'
import { useModalStore } from '@/stores/modal'
import EditorVersionsModal from '@/components/modals/editor/EditorVersionsModal.vue'
import BaseButtonIcon from '../button/BaseButtonIcon.vue'
import { clearMenuAcitonStyle } from '@/services/editor/editor'
import EditorMinuteCategoryIndexModal from '@/components/modals/editor/minutes/EditorMinuteCategoryIndexModal.vue'
import BaseInput from '../input/BaseInput.vue'
import EditorMinuteCategory from '@/types/editorMinuteCategory'
import { useEditorMinuteStore } from '@/stores/editorMinute'
import { useNotificationStore } from '@/stores/notification'
import { NotificationType } from '@/enums/NotificationType'
import BaseEditorPrintModal from './BaseEditorPrintModal.vue'

const emit = defineEmits([
    'onUpdateContent',
    'onUpdateConfig',
    'onUpdateOverlay',
    'onSelectVersion',
    'onCreateNewVersion',
    'onCreateNewDraft',
])

const props = withDefaults(
    defineProps<{
        actionSuggestions?: MenuAction[]
        additionalEnterMenuActions?: MenuAction[]
        disableCustomTagEdit?: boolean
        editable?: boolean
        editableConfig?: boolean
        showTemplatesSelect?: boolean
        editorStoreInstanceId?: string
        selectDraftEntities?: boolean
        currentPractice?: Practice
        showToolbar?: boolean
        showDraftsSelect?: boolean
        showDraftCategoriesSelect?: boolean
        showInsertImage?: boolean
        showInsertLogos?: boolean
        containerRect?: DOMRect
        showInsertStamp?: boolean
        fileName?: string
        editMenuActions?: MenuAction[]
        fileMenuActions?: MenuAction[]
        versions?: Editor[]
        showSaveAsDraft?: boolean
        showSaveAsMinute?: boolean
    }>(),
    {
        actionSuggestions: () => [],
        additionalEnterMenuActions: () => [],
        disableCustomTagEdit: false,
        editable: true,
        editableConfig: true,
        showTemplatesSelect: false,
        editorStoreInstanceId: undefined,
        selectDraftEntities: true,
        currentPractice: undefined,
        showToolbar: true,
        showDraftsSelect: false,
        showDraftCategoriesSelect: false,
        containerRect: undefined,
        showInsertImage: false,
        showInsertLogos: false,
        showInsertStamp: false,
        fileName: undefined,
        editMenuActions: undefined,
        fileMenuActions: undefined,
        versions: undefined,
        showSaveAsDraft: false,
        showSaveAsMinute: false,
    }
)

const editorStore = useEditorStore(props.editorStoreInstanceId)()
const editorTemplateStore = useEditorTemplateStore()()
const modalStore = useModalStore(props.editorStoreInstanceId + '-modals')()
const notificationStore = useNotificationStore()

const draftModalShowOnlyCategory = ref<boolean>(false)
const draftModalVisible = ref<boolean>(false)
const draftEntitiesModalVisible = ref<boolean>(false)
const selectedDraft = ref<EditorDraft>()

const templateModalVisible = ref<boolean>(false)

const enterMenuActions = ref<MenuAction[]>([])
const contextMenuActions = computed<MenuAction[]>(() => {
    const actions: MenuAction[] = []
    enterMenuActions.value.forEach((action: MenuAction) => {
        const actionCopy = { ...action }
        actionCopy.text =
            t('global.enter') + ' ' + actionCopy.text?.toLowerCase()
        actionCopy.icon = 'add'
        actions.push(actionCopy)
    })
    return actions
})

const sidebarContainer = ref<HTMLElement>()
const editorContainer = ref<HTMLElement>()
const toolBar = ref<InstanceType<typeof BaseToolBar>>()
const toolbarContainer = ref<HTMLElement>()
const baseDocumentEditor = ref<InstanceType<typeof BaseDocumentEditor>>()

const selectLogoModalVisible = ref<boolean>(false)
const selectStampModalVisible = ref<boolean>(false)

const isResizingSidebar = ref<boolean>(false)
const startX = ref<number>(0)
const startWidth = ref<number>(200)
const sidebarWidth = ref<number>()
const showVersionsModal = ref<boolean>(false)
const collapseSidebar = ref<boolean>(false)

const minuteTosaveText = ref<string>()
const showMinuteCategoryModalForSavingMinute = ref<boolean>()
const newMinuteName = ref<string>()

const sidebarStyle = ref<CSSProperties>({
    width: 'auto',
    height: '100%',
    top: 'unset',
    position: 'absolute',
})
const preCollapseWidth = ref<number>(200)

const sidebarTranslitteration = computed<MenuAction[]>(() => {
    const menuActions: MenuAction[] = []
    if (baseDocumentEditor.value?.translitterationMenu) {
        menuActions.push(
            clearMenuAcitonStyle(baseDocumentEditor.value?.translitterationMenu)
        )
        return menuActions
    }
    return []
})

const computedFileMenuActions = computed<MenuAction[]>(() => {
    return [
        {
            text: t('global.print'),
            click: () => handleEditorPrintModalVisible(),
        },
        ...(props.fileMenuActions ?? []),
        ...(props.showSaveAsMinute
            ? [
                  {
                      text: t('pages.editor.actions.saveAsMinute'),
                      click: () => handleSaveEditorAsMinute(),
                  },
              ]
            : []),
    ]
})

const editorPrintModalVisible = ref<boolean>(false)

onMounted(async () => {
    enterMenuActions.value = props.additionalEnterMenuActions
    await updateSidebarStyles()

    setTimeout(async () => {
        await updateSidebarStyles()
    }, 2000)

    window.addEventListener('resize', updateSidebarStyles)
    document.addEventListener('scroll', updateSidebarStyles, true)

    if (props.showTemplatesSelect) {
        enterMenuActions.value.push({
            text: t('pages.editor.actions.templateChoice'),
            title: t('pages.editor.actions.templateChoice'),
            click: () => handleTemplateModalVisible(),
        })
    }

    if (props.showDraftsSelect) {
        enterMenuActions.value.push({
            text: t('pages.editor.actions.draftChoice'),
            title: t('pages.editor.actions.draftChoice'),
            click: () => handleDraftModalVisible(),
        })
    }

    if (props.showDraftCategoriesSelect) {
        enterMenuActions.value.push({
            text: t('pages.editor.actions.draftCategoryChoice'),
            title: t('pages.editor.actions.draftCategoryChoice'),
            click: () => handleDraftModalVisible(true),
        })
    }

    if (
        enterMenuActions.value.length > 0 &&
        (props.showInsertImage || props.showInsertLogos)
    ) {
        enterMenuActions.value.push({ is: 'separator' })
    }

    if (props.showInsertImage) {
        enterMenuActions.value.push({
            text: t('global.image'),
            title: t('global.image'),
            click: () => handleInsertImageMenu(),
            disabled: false,
        })
    }

    if (props.showInsertLogos) {
        enterMenuActions.value.push({
            text: t('types.editorLogos.title'),
            title: t('types.editorLogos.title'),
            click: () => {
                selectLogoModalVisible.value = true
            },
            disabled: false,
        })
    }

    if (props.showInsertStamp) {
        enterMenuActions.value.push({
            text: t('types.editorStamps.title'),
            title: t('types.editorStamps.title'),
            click: () => {
                selectStampModalVisible.value = true
            },
            disabled: false,
        })
    }
})

watch(
    () => props.containerRect,
    async () => {
        await nextTick(async () => {
            await updateSidebarStyles()
        })
    },
    {
        deep: true,
    }
)

const onUpdateContent = (value: string[] = editorStore.content): void => {
    emit('onUpdateContent', value)
}

const handleTemplateModalVisible = (): void => {
    templateModalVisible.value = !templateModalVisible.value
}

const handleTemplateSelect = async (
    template: EditorTemplate
): Promise<void> => {
    editorTemplateStore.editorTemplate = template
    await editorTemplateStore.show()
    editorTemplateStore.useConfigInEditor(editorStore.$id)
    editorTemplateStore.useLineHeightConfigInEditor(editorStore.$id)
    handleUpdateContentFromPages()
}

const handleDraftModalVisible = (showOnlyCategory: boolean = false): void => {
    draftModalVisible.value = !draftModalVisible.value
    draftModalShowOnlyCategory.value = showOnlyCategory
}

const handleDraftSelect = async (
    draft: EditorDraft,
    entities?: EditorDraftEntities | EditorDraftEntities[]
): Promise<void> => {
    await editorStore.addDraft(draft, entities)
    onUpdateContent()
    emit('onCreateNewVersion')
}

const handleDraftSelectWithoutCustomTags = async (
    draft: EditorDraft
): Promise<void> => {
    await editorStore.addDraftWithoutCustomTags(draft)
    onUpdateContent()
    emit('onCreateNewVersion')
}

const handleOpenDraftEntitiesSelect = (draft: EditorDraft) => {
    selectedDraft.value = draft
    draftEntitiesModalVisible.value = true
}

const handleDraftCategorySelect = async (
    draftCategory: EditorDraftCategory
): Promise<void> => {
    await editorStore.addDraftCategory(draftCategory)
    onUpdateContent()
    emit('onCreateNewVersion')
}

const updateSidebarStyles = async () => {
    await nextTick(() => {
        requestAnimationFrame(async () => {
            if (
                sidebarContainer.value &&
                editorContainer.value &&
                toolbarContainer.value
            ) {
                const sidebarRect =
                    sidebarContainer.value.getBoundingClientRect()
                const editorContainerRect =
                    editorContainer.value.getBoundingClientRect()
                const toolBarRect =
                    toolbarContainer.value?.getBoundingClientRect()
                const windowHeight = window.innerHeight

                if (editorContainerRect.width > 800) {
                    const availableHeight =
                        (props.containerRect?.height || windowHeight) -
                        toolBarRect.bottom +
                        (props.containerRect?.top || 0)

                    const top = toolBarRect?.bottom - editorContainerRect.top

                    sidebarStyle.value = {
                        width: `${sidebarWidth.value || sidebarRect.width}px`,
                        height: `${availableHeight}px`,
                        top: `${top}px`,
                        position: 'absolute',
                        right: '0',
                    }
                } else {
                    sidebarStyle.value = {
                        width: `unset`,
                        height: `unset`,
                        top: `unset`,
                        position: 'unset',
                        right: 'unset',
                    }
                }
            }
        })
    })
}

const onUpdateConfig = (config: EditorConfig): void => {
    emit('onUpdateConfig', config)
}

const onUpdateOverlay = (overlay: Editor['overlay']): void => {
    emit('onUpdateOverlay', overlay)
}

const handleInsertImageMenu = async (): Promise<void> => {
    const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [
            {
                description: 'Immagini',
                accept: {
                    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                },
            },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
    })

    const file = await fileHandle.getFile()
    if (file) {
        baseDocumentEditor.value?.handleInsertImage(file)
    }
}

const handleUpdateContentFromPages = async (): Promise<void> => {
    await nextTick(() => {
        if (baseDocumentEditor.value) {
            baseDocumentEditor.value.handleUpdateContentFromPages()
            onUpdateContent()
        }
    })
}

const startResizing = (event: MouseEvent) => {
    isResizingSidebar.value = true
    startX.value = event.clientX
    startWidth.value = parseFloat(sidebarStyle.value.width as string)
    preCollapseWidth.value = parseFloat(sidebarStyle.value.width as string)

    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', stopResizing)
}

const stopResizing = () => {
    isResizingSidebar.value = false
    startX.value = 0
    startWidth.value = 300
    document.removeEventListener('mousemove', resize)
    document.removeEventListener('mouseup', stopResizing)
}

const minSidebarWidth = 17

const resize = async (event: MouseEvent): Promise<void> => {
    if (!isResizingSidebar.value) return

    const editorContainerRect = editorContainer.value?.getBoundingClientRect()
    const maxSidebarWidth = (editorContainerRect?.width || 1200) - 100

    const deltaX = startX.value - event.clientX
    const newWidth = startWidth.value + deltaX

    sidebarWidth.value = Math.max(
        minSidebarWidth,
        Math.min(maxSidebarWidth, newWidth)
    )
    sidebarStyle.value.width =
        Math.max(
            minSidebarWidth,
            Math.min(maxSidebarWidth, newWidth)
        ).toString() + 'px'

    collapseSidebar.value = sidebarWidth.value == minSidebarWidth
}

const handleCollapseSidebar = (): void => {
    collapseSidebar.value = !collapseSidebar.value
    sidebarStyle.value.transition =
        'width 0.3s ease-in-out, transform 0.3s ease-in-out'
    sidebarStyle.value.transform = 'translateX(0)'

    if (collapseSidebar.value) {
        preCollapseWidth.value = parseFloat(sidebarStyle.value.width as string)
        sidebarWidth.value = minSidebarWidth
        sidebarStyle.value.width = minSidebarWidth.toString() + 'px'
    } else {
        sidebarWidth.value = preCollapseWidth.value
        sidebarStyle.value.width = preCollapseWidth.value.toString() + 'px'
    }

    setTimeout(() => {
        sidebarStyle.value.transition = 'unset'
        sidebarStyle.value.transform = 'unset'
    }, 300)

    setTimeout(() => {
        if (!collapseSidebar.value) {
            sidebarStyle.value.width =
                (preCollapseWidth.value + 1).toString() + 'px'
        }
    }, 600)
}

const handleVersionModalVisibility = (visible: boolean): void => {
    showVersionsModal.value = visible
}

const handleSaveEditorAsMinute = (): void => {
    const normalizedPages = editorStore.normalizeCustomTagsInPages()

    if (normalizedPages) {
        const pages = normalizedPages.querySelectorAll(
            '.' + editorStore.pageIdentifierClass
        )

        pages.forEach((page) => {
            minuteTosaveText.value =
                (minuteTosaveText.value || '') + page.innerHTML
        })

        showMinuteCategoryModalForSavingMinute.value = true
    }
}

const handleSelectMinuteCategoryToCreateNewMinute = async (
    minuteCategory?: EditorMinuteCategory
): Promise<void> => {
    if (minuteCategory?.id && minuteTosaveText.value) {
        const minuteStore = useEditorMinuteStore()()
        minuteStore.resetState()

        minuteStore.editorMinute.categoryId = minuteCategory.id
        minuteStore.editorMinute.name =
            newMinuteName.value || t('types.editorMinutes.newMinute')
        minuteStore.editorMinute.content = minuteTosaveText.value
        const response = await minuteStore.create()

        if (response.data.success) {
            notificationStore.addNotificationToQueue({
                type: NotificationType.SUCCESS,
                titleKey: 'global.createElement',
            })

            emit('onCreateNewDraft')
            minuteStore.resetState()
        }
    }

    minuteTosaveText.value = undefined
    newMinuteName.value = undefined
}

const resetContent = () => {
    baseDocumentEditor.value?.resetContent()
}

const handleEditorPrintModalVisible = () => {
    editorPrintModalVisible.value = true
    resetContent()
}

defineExpose({
    handleDraftSelect,
    handleDraftCategorySelect,
    handleOpenDraftEntitiesSelect,
    handleUpdateContentFromPages,
    handleVersionModalVisibility,
    resetContent,
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateSidebarStyles)
    document.removeEventListener('scroll', updateSidebarStyles, true)
})
</script>
