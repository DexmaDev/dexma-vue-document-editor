<template>
    <div
        ref="folderTreeContainer"
        class="folder-tree flex w-full grow flex-col gap-2 overflow-auto"
    >
        <div v-if="searchable" class="px-4 flex items-center gap-2 justify-end">
            <BaseInput
                v-model="searchValue"
                :placeholder="t('global.search')"
                icon-name="search"
                type="text"
                clearable
                @update:model-value="handleSearch"
            />
        </div>
        <BaseSpinner
            v-if="loadingFolders && folders.length == 0"
            size="sm"
            text=""
        />

        <BaseFolder
            v-for="folder in folders"
            v-else
            :key="folder.id"
            :children-identifier="childrenIdentifier"
            :disable-edit="disableEdit"
            :element-folder-key="elementFolderKey"
            :element-identifier="elementIdentifier"
            :element-label="elementLabel"
            :element-title="elementTitle"
            :elements-identifier="elementsIdentifier"
            :folder="folder"
            :folder-identifier="folderIdentifier"
            :folder-label="folderLabel"
            :folder-title="folderTitle"
            :is-collapsed="isCollapsed"
            :only-folders="onlyFolders"
            :parent-folder-key="parentFolderKey"
            :permissions="permissions"
            :selected-element="selectedElement"
            :selected-folder="selectedFolder"
            :select-folder-on-click="selectFolderOnClick"
            :container="folderTreeContainer"
            :folder-disable-edit-key="folderDisableEditKey"
            :element-disable-delete-key="elementDisableDeleteKey"
            :hide-folder-menu="hideFolderMenu"
            @on-save="emitSave"
            @on-delete="handleOnDelete"
            @on-select="handleSelectFolder"
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
                <slot :folder="slotProps?.folder" name="additional-actions" />
            </template>
        </BaseFolder>

        <div
            v-if="!disableEdit"
            :class="{
                'border-t border-neutral-200': folders?.length > 0,
            }"
            class="pl-4"
        >
            <div class="flex items-center gap-2 py-2 justify-end">
                <BaseInput
                    v-model="newFolder[folderLabel]"
                    :placeholder="t('global.add') + ' ' + folderTitle"
                    icon-name="folder"
                    type="text"
                    @keyup.enter="handleAddNewFolder"
                    @keyup.esc="handleEscapeNewFolderInput"
                />

                <div class="ml-auto flex items-center gap-2">
                    <BaseButtonIcon
                        v-if="
                            !isCollapsed &&
                            permissions.create() &&
                            newFolder[folderLabel]
                        "
                        :icon="'save'"
                        size="xs"
                        variant="blank"
                        @on-click="handleAddNewFolder"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { t } from '@/services/i18n'
import BaseInput from '@/components/base/input/BaseInput.vue'
import BaseButtonIcon from '@/components/base/button/BaseButtonIcon.vue'
import { ref } from 'vue'
import BaseFolder from '@/components/base/folderTree/BaseFolder.vue'
import BaseSpinner from '@/components/base/spinner/BaseSpinner.vue'

const emit = defineEmits([
    'onSave',
    'onDelete',
    'onSelect',
    'onSaveElement',
    'onDeleteElement',
    'onSelectElement',
    'onMouseLeaveElement',
    'onMouseOverElement',
    'onSearch',
])

const props = withDefaults(
    defineProps<{
        folders: any[]
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
        loadingFolders?: boolean
        disableEdit?: boolean
        onlyFolders?: boolean
        selectedFolder?: any
        selectFolderOnClick?: boolean
        folderDisableEditKey?: string
        elementDisableDeleteKey?: string
        hideFolderMenu?: boolean
        searchable?: boolean
    }>(),
    {
        folder: {},
        isCollapsed: undefined,
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
        loadingFolders: false,
        disableEdit: false,
        onlyFolders: false,
        selectedFolder: {},
        selectFolderOnClick: true,
        folderDisableEditKey: undefined,
        elementDisableDeleteKey: undefined,
        hideFolderMenu: undefined,
        searchable: false,
    }
)

const newFolder = ref<any>({})
const folderTreeContainer = ref<HTMLElement>()
const searchValue = ref<string>()

const emitSave = (folder: any): void => {
    emit('onSave', folder)
}

const handleOnDelete = (folder: any): void => {
    emit('onDelete', folder)
}

const emitSaveElement = (element: any): void => {
    emit('onSaveElement', element)
}

const handleDeleteElement = (element: any): void => {
    if (element.id) {
        emit('onDeleteElement', element)
    }
}

const handleAddNewFolder = (): void => {
    if (newFolder.value[props.folderLabel]) {
        emitSave(newFolder.value)
    }
    newFolder.value = {}
}

const handleSelectElement = (element: any): void => {
    emit('onSelectElement', element)
}

const handleSelectFolder = (folder: any): void => {
    emit('onSelect', folder)
}

const handleEscapeNewFolderInput = (): void => {
    newFolder.value = {}
}

const handleOnMouseLeaveElement = (mouseEvent: MouseEvent, element: any) => {
    emit('onMouseLeaveElement', mouseEvent, element)
}

const handleOnMouseOverElement = (mouseEvent: MouseEvent, element: any) => {
    emit('onMouseOverElement', mouseEvent, element)
}

const handleSearch = () => {
    emit('onSearch', searchValue.value)
}
</script>

<style scoped>
.folder-tree :deep(input) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

.folder-tree :deep(#base-input-icon) {
    top: 0.2rem !important;
}
</style>
