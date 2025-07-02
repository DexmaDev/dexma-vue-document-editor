<template>
    <div ref="baseFolderRef" class="base-folder">
        <div
            :class="{
                'bg-neutral-100':
                    selectedFolder[folderIdentifier] ==
                    folder[folderIdentifier],
                'bg-amber-100': folder.highlight,
            }"
            class="pl-4 flex items-center py-2 transition-all duration-300 hover:bg-neutral-100 rounded-lg min-w-fit"
        >
            <div class="min-w-3 cursor-pointer" @click="handleFolderClick">
                <BaseIcon
                    :name="'folder'"
                    :tone="500"
                    color="warning"
                    size="sm"
                />
            </div>
            <div
                v-if="!isCollapsed"
                ref="labelContainer"
                class="fill-avaiable whitespace-nowrap overflow-hidden ml-2"
            >
                <div
                    v-if="!isEditing"
                    class="cursor-pointer"
                    @click="handleFolderClick"
                >
                    <BaseText
                        :text="displayedLabel"
                        :tooltip="folder[folderLabel] || ''"
                    />
                </div>

                <BaseInput
                    v-else
                    v-model="currentFolder[folderLabel]"
                    :is-on-focus="isEditing"
                    type="text"
                    @keyup.enter="handleEdit"
                    @keyup.esc="handleExitEdit"
                />
            </div>

            <div class="ml-auto flex items-center mr-1">
                <BaseButtonIcon
                    v-if="
                        !isCollapsed &&
                        !isEditing &&
                        (folder[elementsIdentifier]?.length > 0 ||
                            folder[childrenIdentifier]?.length > 0)
                    "
                    ref="toggleOpenButton"
                    :icon="isOpen ? 'chevron-up' : 'chevron-down'"
                    size="xs"
                    variant="blank"
                    @on-click="toggleOpen"
                />
                <BaseDropdown
                    v-if="
                        !isEditing &&
                        !isCollapsed &&
                        !isAddingElement &&
                        !isAddingFolder &&
                        ($slots['additional-actions'] || !disableEdit) &&
                        !hideFolderMenu
                    "
                    icon="three-points-vertical"
                    size="sm"
                    variant="blank"
                >
                    <template #content>
                        <div class="flex flex-col justify-end items-end">
                            <slot :folder="folder" name="additional-actions" />

                            <BaseButton
                                v-if="
                                    permissions.edit() &&
                                    !disableEdit &&
                                    !folder[folderDisableEditKey]
                                "
                                :text="t('global.rename')"
                                color="neutral"
                                size="2xs"
                                style="justify-content: end !important"
                                type="button"
                                variant="blank"
                                @on-click="handleEdit"
                            />

                            <BaseButton
                                v-if="permissions.create() && !disableEdit"
                                :text="t('global.add') + ' ' + folderTitle"
                                color="neutral"
                                size="2xs"
                                style="justify-content: end !important"
                                type="button"
                                variant="blank"
                                @on-click="toggleAddNewFolder"
                            />

                            <BaseButton
                                v-if="
                                    permissions.create() &&
                                    !onlyFolders &&
                                    !disableEdit
                                "
                                :text="t('global.add') + ' ' + elementTitle"
                                color="neutral"
                                size="2xs"
                                style="justify-content: end !important"
                                type="button"
                                variant="blank"
                                @on-click="toggleAddNewElement"
                            />

                            <BaseButton
                                v-if="
                                    permissions.delete &&
                                    !disableEdit &&
                                    !folder[folderDisableEditKey]
                                "
                                :text="t('global.delete')"
                                color="error"
                                size="2xs"
                                style="justify-content: end !important"
                                type="button"
                                variant="blank"
                                @on-click="handleOnDelete(folder)"
                            />
                        </div>
                    </template>
                </BaseDropdown>
                <BaseButtonIcon
                    v-else-if="isEditing && !isCollapsed && permissions.edit()"
                    :icon="'save'"
                    size="xs"
                    variant="blank"
                    @on-click="handleEdit"
                />
            </div>
        </div>
        <div
            v-if="isOpen && !isCollapsed && (isAddingFolder || isAddingElement)"
            class="pl-4"
        >
            <div class="flex items-center gap-2">
                <div class="fle flex-col x items-center">
                    <BaseInput
                        v-if="isAddingFolder"
                        v-model="newFolder[folderLabel]"
                        :is-on-focus="isAddingFolder"
                        :placeholder="t('global.add') + ' ' + folderTitle"
                        icon-name="folder"
                        type="text"
                        @keyup.enter="handleAddNewFolder"
                        @keyup.esc="handleEscapeNewFolderInput"
                    />

                    <BaseInput
                        v-if="isAddingElement"
                        v-model="newElement[elementLabel]"
                        :is-on-focus="isAddingElement"
                        :placeholder="t('global.add') + ' ' + elementTitle"
                        icon-name="file"
                        type="text"
                        @keyup.enter="handleAddNewElement"
                        @keyup.esc="handleEscapeNewElementInput"
                    />
                </div>

                <div class="ml-auto flex items-center gap-2">
                    <BaseButtonIcon
                        v-if="
                            (isAddingElement || isAddingFolder) &&
                            !isCollapsed &&
                            permissions.create()
                        "
                        :icon="'save'"
                        size="xs"
                        variant="blank"
                        @on-click="
                            () => {
                                handleAddNewFolder()
                                handleAddNewElement()
                            }
                        "
                    />
                </div>
            </div>
        </div>

        <div v-if="isOpen && !isCollapsed" class="pl-4 overflow-auto">
            <BaseFolder
                v-for="child in folder[childrenIdentifier]"
                :key="child[folderIdentifier]"
                v-bind="{
                    ...$props,
                    folder: child,
                }"
                @on-save="emitSave"
                @on-delete="handleOnDelete"
                @on-select="handleSelect"
                @on-delete-element="handleDeleteElement"
                @on-save-element="emitSaveElement"
                @on-select-element="handleSelectElement"
                @on-mouse-leave-element="handleOnMouseLeaveElement"
                @on-mouse-over-element="handleOnMouseOverElement"
            >
                <template
                    v-if="$slots['elements-additional-actions']"
                    #elements-additional-actions="slotProps"
                >
                    <slot
                        :element="slotProps?.element"
                        name="elements-additional-actions"
                    />
                </template>

                <template
                    v-if="$slots['additional-actions']"
                    #additional-actions="slotProps"
                >
                    <slot
                        :folder="slotProps?.folder"
                        name="additional-actions"
                    />
                </template>
            </BaseFolder>

            <div v-if="!onlyFolders">
                <BaseFolderElement
                    v-for="element in folder[elementsIdentifier]"
                    :key="element[elementIdentifier]"
                    :disable-edit="disableEdit"
                    :element="element"
                    :element-identifier="elementIdentifier"
                    :is-collapsed="isCollapsed"
                    :permissions="permissions"
                    :selected-element="selectedElement"
                    :container="container"
                    :element-disable-delete-key="elementDisableDeleteKey"
                    @on-save="handleSaveElement"
                    @on-delete="handleDeleteElement"
                    @on-select="handleSelectElement"
                    @on-mouse-leave="handleOnMouseLeaveElement"
                    @on-mouse-over="handleOnMouseOverElement"
                >
                    <template
                        v-if="$slots['elements-additional-actions']"
                        #additional-actions="slotProps"
                    >
                        <slot
                            :element="slotProps.element"
                            name="elements-additional-actions"
                        />
                    </template>
                </BaseFolderElement>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BaseIcon from '@/components/base/icon/BaseIcon.vue'
import BaseText from '@/components/base/text/BaseText.vue'
import BaseInput from '@/components/base/input/BaseInput.vue'
import BaseButtonIcon from '@/components/base/button/BaseButtonIcon.vue'
import { t } from '@/services/i18n'
import BaseButton from '@/components/base/button/BaseButton.vue'
import BaseDropdown from '@/components/base/dropdown/BaseDropdown.vue'
import BaseFolderElement from '@/components/base/folderTree/BaseFolderElement.vue'

const emit = defineEmits([
    'onSave',
    'onDelete',
    'onSelect',
    'onSaveElement',
    'onDeleteElement',
    'onSelectElement',
    'onMouseOverElement',
    'onMouseLeaveElement',
])

const props = withDefaults(
    defineProps<{
        folder: any
        isCollapsed?: boolean
        childrenIdentifier?: string
        elementsIdentifier?: string
        elementFolderKey?: string
        parentFolderKey?: string
        folderLabel?: string
        elementLabel?: string
        permissions?: {
            create: () => boolean
            edit: () => boolean
            delete: () => boolean
        }
        folderTitle?: string
        elementTitle?: string
        selectedElement?: any
        folderIdentifier?: any
        elementIdentifier?: any
        disableEdit?: boolean
        onlyFolders?: boolean
        selectedFolder?: any
        selectFolderOnClick?: boolean
        container?: HTMLElement
        folderDisableEditKey?: string
        elementDisableDeleteKey?: string
        hideFolderMenu?: boolean
    }>(),
    {
        folder: {},
        isCollapsed: false,
        childrenIdentifier: 'children',
        elementsIdentifier: 'elements',
        elementFolderKey: 'folderId',
        parentFolderKey: 'parentId',
        folderLabel: 'name',
        elementLabel: 'name',
        permissions: () => ({
            create: () => false,
            edit: () => false,
            delete: () => false,
        }),
        folderTitle: t('global.folder'),
        elementTitle: t('global.element'),
        selectedElement: {},
        folderIdentifier: 'id',
        elementIdentifier: 'id',
        disableEdit: false,
        onlyFolders: false,
        selectedFolder: {},
        selectFolderOnClick: true,
        container: undefined,
        folderDisableEditKey: undefined,
        elementDisableDeleteKey: undefined,
        hideFolderMenu: undefined,
    }
)

const isOpen = ref<boolean>(false)
const isAddingFolder = ref<boolean>(false)
const isEditing = ref<boolean>(false)
const isAddingElement = ref<boolean>(false)

const currentFolder = ref<any>(JSON.parse(JSON.stringify(props.folder)))
const newFolder = ref<any>({
    [props.parentFolderKey]: props.folder[props.folderIdentifier],
})
const newElement = ref<any>({
    [props.elementFolderKey]: props.folder[props.folderIdentifier],
})

const baseFolderRef = ref<HTMLDivElement>()
const labelContainer = ref<HTMLDivElement>()
const displayedLabel = ref<string>(props.folder[props.folderLabel] || '')
const toggleOpenButton = ref<InstanceType<typeof BaseButtonIcon>>()

const resizeObserver = ref<ResizeObserver | null>(null)

onMounted(async () => {
    if (props.container) {
        resizeObserver.value = new ResizeObserver(async () => {
            await updateFolderWidth()
        })
        resizeObserver.value.observe(props.container)
    }
    await updateFolderWidth()

    await nextTick(() => {
        isOpen.value = !!props.folder.isOpenOnMount
    })
})

watch(
    () => props.container,
    async (newVal, oldVal) => {
        if (!!newVal && !oldVal) {
            if (props.container) {
                resizeObserver.value = new ResizeObserver(async () => {
                    await updateFolderWidth()
                })
                resizeObserver.value.observe(props.container)
            }
            await updateFolderWidth()
        }
    }
)

watch(
    () => props.folder[props.folderLabel],
    async () => {
        await updateFolderWidth()
    }
)

watch(
    () => props.folder.isOpenOnMount,
    async () => {
        toggleOpen()
    }
)

watch(
    () => props.folder,
    () => {
        currentFolder.value = JSON.parse(JSON.stringify(props.folder))
    },
    {
        deep: true,
    }
)

const toggleOpen = () => {
    if (!isEditing.value) {
        isOpen.value = !isOpen.value
    }
}

const handleEdit = () => {
    isEditing.value = !isEditing.value
    if (!isEditing.value) {
        emitSave(currentFolder.value)
    }
}

const handleExitEdit = () => {
    currentFolder.value = JSON.parse(JSON.stringify(props.folder))
    isEditing.value = !isEditing.value
}

const emitSave = (folder: any) => {
    emit('onSave', folder)
}

const handleOnDelete = (folder: any) => {
    emit('onDelete', folder)
}

const handleSaveElement = (element: any) => {
    if (props.folder[props.folderIdentifier]) {
        element[props.elementFolderKey] = props.folder[props.folderIdentifier]
        emitSaveElement(element)
    }
}

const emitSaveElement = (element: any) => {
    emit('onSaveElement', element)
}

const handleDeleteElement = (element: any) => {
    if (element[props.elementIdentifier]) {
        emit('onDeleteElement', element)
    }
}

const toggleAddNewFolder = () => {
    isAddingFolder.value = !isAddingFolder.value
    if (isAddingFolder.value) {
        isOpen.value = true
    }
}
const handleAddNewFolder = async () => {
    isAddingFolder.value = false
    if (newFolder.value[props.folderLabel]) {
        emitSave(newFolder.value)
    }

    newFolder.value = {
        [props.parentFolderKey]: props.folder[props.folderIdentifier],
    }
}

const toggleAddNewElement = () => {
    isAddingElement.value = !isAddingElement.value
    if (isAddingElement.value) {
        isOpen.value = true
    }
}

const handleAddNewElement = async () => {
    isAddingElement.value = false
    if (
        newElement.value[props.elementLabel] &&
        newElement.value[props.elementFolderKey]
    ) {
        emitSaveElement(newElement.value)
    }

    newElement.value = {
        [props.elementFolderKey]: props.folder[props.folderIdentifier],
    }
}

const handleFolderClick = () => {
    toggleOpen()
    if (props.selectFolderOnClick) {
        handleSelect(currentFolder.value)
    }
}

const handleSelectElement = (element: any): void => {
    emit('onSelectElement', element)
}

const handleEscapeNewFolderInput = (): void => {
    newFolder.value = {}
    isAddingFolder.value = false
}

const handleEscapeNewElementInput = (): void => {
    newElement.value = {}
    isAddingElement.value = false
}

const handleSelect = (folder: any): void => {
    emit('onSelect', folder)
}

const updateFolderWidth = async () => {
    await nextTick(() => {
        const calculateWidth = () => {
            const folderRect =
                baseFolderRef.value?.parentElement?.getBoundingClientRect()

            const toggleOpenButtonRect =
                toggleOpenButton.value?.$el.getBoundingClientRect()
            if (folderRect && baseFolderRef.value && toggleOpenButtonRect) {
                baseFolderRef.value.style.maxWidth = `${folderRect.width}px`
            }

            if (labelContainer.value) {
                const label = props.folder[props.folderLabel] || ''
                const containerWidth =
                    labelContainer.value.getBoundingClientRect().width
                const charWidth = 9
                const maxChars = Math.floor(containerWidth / charWidth)

                displayedLabel.value =
                    label.length > maxChars
                        ? label.substring(0, Math.max(1, maxChars - 2)) + '..'
                        : label

                if (displayedLabel.value == '...') {
                    displayedLabel.value = label.substring(0, 3)
                }
            }
        }
        requestAnimationFrame(calculateWidth)
    })
}

const handleOnMouseLeaveElement = (mouseEvent: MouseEvent, element: any) => {
    emit('onMouseLeaveElement', mouseEvent, element)
}

const handleOnMouseOverElement = (mouseEvent: MouseEvent, element: any) => {
    emit('onMouseOverElement', mouseEvent, element)
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        resizeObserver.value.disconnect()
    }
})
</script>

<style scoped>
.base-folder :deep(input) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

.base-folder :deep(#base-input-icon) {
    top: 0.2rem !important;
}

.fill-avaiable {
    width: -moz-available;
    width: -webkit-fill-available;
    width: fill-available;
    max-width: -moz-available;
    max-width: -webkit-fill-available;
    max-width: fill-available;
}
</style>
