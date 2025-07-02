<template>
    <div
        ref="baseFolderElementRef"
        :class="{
            'bg-neutral-100':
                selectedElement[elementIdentifier] ==
                element[elementIdentifier],
            'bg-amber-100': element.highlight,
        }"
        class="pl-4 flex items-center py-2 transition-all duration-300 hover:bg-neutral-100 rounded-lg"
        @mouseover="handleOnMouseOver"
        @mouseleave="handleOnMouseLeave"
    >
        <div class="min-w-3 cursor-pointer" @dblclick="handleDbClick">
            <BaseIcon :name="'file'" :tone="500" color="secondary" size="sm" />
        </div>
        <div
            v-if="!isCollapsed"
            ref="labelContainer"
            class="fill-avaiable whitespace-nowrap overflow-hidden ml-2"
        >
            <div v-if="!isEditing" class="cursor-pointer">
                <BaseText
                    :text="displayedLabel"
                    :tooltip="element[elementLabel] || undefined"
                    size="p-sm"
                    @dblclick="handleDbClick"
                />
            </div>

            <div v-else>
                <BaseInput
                    v-model="currentElement[elementLabel]"
                    :is-on-focus="isEditing"
                    type="text"
                    @keyup.enter="handleEdit"
                    @keyup.esc="handleExitEdit"
                />
            </div>
        </div>

        <div class="ml-auto flex items-center">
            <BaseDropdown
                v-if="!isEditing && !isCollapsed"
                icon="three-points-vertical"
                size="sm"
                variant="blank"
                @on-toggle-menu="emit('onToggleMenu')"
            >
                <template #content>
                    <div class="flex flex-col justify-end items-end">
                        <slot :element="element" name="additional-actions" />

                        <BaseButton
                            v-if="showSelectAction"
                            :text="t('global.select')"
                            color="neutral"
                            size="2xs"
                            style="justify-content: end !important"
                            type="button"
                            variant="blank"
                            @on-click="handleSelect"
                        />

                        <BaseButton
                            v-if="permissions.edit() && !disableEdit"
                            :text="t('global.rename')"
                            color="neutral"
                            size="2xs"
                            style="justify-content: end !important"
                            type="button"
                            variant="blank"
                            @on-click="handleEdit"
                        />

                        <BaseButton
                            v-if="
                                permissions.delete &&
                                !disableEdit &&
                                !element[elementDisableDeleteKey]
                            "
                            :text="t('global.delete')"
                            color="error"
                            size="2xs"
                            style="justify-content: end !important"
                            type="button"
                            variant="blank"
                            @on-click="handleOnDelete(element)"
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

const emit = defineEmits([
    'onSave',
    'onDelete',
    'onSelect',
    'onToggleMenu',
    'onMouseOver',
    'onMouseLeave',
])

const props = withDefaults(
    defineProps<{
        element: any
        isCollapsed?: boolean
        elementLabel?: string
        permissions?: {
            create: () => boolean
            edit: () => boolean
            delete: () => boolean
        }
        selectedElement?: any
        elementIdentifier?: any
        disableEdit?: boolean
        container?: HTMLElement
        showSelectAction?: boolean
        elementDisableDeleteKey?: string
    }>(),
    {
        element: {},
        isCollapsed: undefined,
        elementLabel: 'name',
        permissions: () => ({
            create: () => false,
            edit: () => false,
            delete: () => false,
        }),
        selectedElement: {},
        elementIdentifier: 'id',
        disableEdit: false,
        container: undefined,
        showSelectAction: true,
        elementDisableDeleteKey: undefined,
    }
)
const baseFolderElementRef = ref<HTMLDivElement>()
const isEditing = ref<boolean>(false)
const currentElement = ref<any>(JSON.parse(JSON.stringify(props.element)))
const labelContainer = ref<HTMLDivElement>()
const displayedLabel = ref<string>('')

const resizeObserver = ref<ResizeObserver | null>(null)

onMounted(async () => {
    if (props.container) {
        resizeObserver.value = new ResizeObserver(async () => {
            await updateFolderElementWidth()
        })
        resizeObserver.value.observe(props.container)
    }

    await updateFolderElementWidth()
})

watch(
    () => props.container,
    async (newVal, oldVal) => {
        if (!!newVal && !oldVal) {
            if (props.container) {
                resizeObserver.value = new ResizeObserver(async () => {
                    await updateFolderElementWidth()
                })
                resizeObserver.value.observe(props.container)
            }

            await updateFolderElementWidth()
        }
    }
)

watch(
    () => props.element[props.elementLabel],
    async () => {
        await updateFolderElementWidth()
    }
)

watch(
    () => props.element,
    () => {
        currentElement.value = JSON.parse(JSON.stringify(props.element))
    },
    {
        deep: true,
    }
)

const handleEdit = () => {
    isEditing.value = !isEditing.value
    if (!isEditing.value) {
        emitSave(currentElement.value)
    }
}

const handleExitEdit = () => {
    currentElement.value = JSON.parse(JSON.stringify(props.element))
    isEditing.value = !isEditing.value
}

const emitSave = (element: any) => {
    emit('onSave', element)
}

const handleOnDelete = (element: any) => {
    emit('onDelete', element)
}

const handleSelect = (): void => {
    if (currentElement.value) {
        emit('onSelect', currentElement.value)
    }
}

const handleDbClick = (event: MouseEvent): void => {
    event.preventDefault()
    handleSelect()
}

const updateFolderElementWidth = async () => {
    await nextTick(() => {
        const calculateWidth = () => {
            const folderRect =
                baseFolderElementRef.value?.parentElement?.getBoundingClientRect()
            if (folderRect && baseFolderElementRef.value) {
                baseFolderElementRef.value.style.maxWidth = `${folderRect.width}px`
            }

            if (labelContainer.value) {
                const label = props.element[props.elementLabel] || ''
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

const handleOnMouseLeave = (mouseEvent: MouseEvent) => {
    emit('onMouseLeave', mouseEvent, props.element)
}

const handleOnMouseOver = (mouseEvent: MouseEvent) => {
    emit('onMouseOver', mouseEvent, props.element)
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        resizeObserver.value.disconnect()
    }
})
</script>

<style scoped>
.fill-avaiable {
    width: -moz-available;
    width: -webkit-fill-available;
    width: fill-available;
    max-width: -moz-available;
    max-width: -webkit-fill-available;
    max-width: fill-available;
}
</style>
