<template>
    <BaseModal
        :backdrop="disableRelativePositioning"
        :close-button="true"
        :relative-to="!disableRelativePositioning ? customElement : undefined"
        :modal-store-id="modalStoreId"
        @on-close="emit('onClose')"
    >
        <template #title>
            <div class="grid grid-cols-2 gap-4">
                <BaseText :text="t('pages.editor.customTag')" color="primary" />

                <BaseCheckbox
                    v-if="!disableEdit"
                    v-model="transformIntoPlainText"
                    :label="t('pages.editor.format.plainText')"
                />
            </div>
        </template>

        <BaseCard v-show="!loadingData">
            <div class="flex w-full flex-col justify-center">
                <div class="p-2">
                    <BaseSelect
                        :model-value="dataTypeClass"
                        :options="dataTypeClassOptions"
                        option-label="label"
                        reduce="value"
                        :clearable="false"
                        :label="t('pages.editor.customTags.dataTypeLabel')"
                        @update:model-value="handleChangeDataType"
                    />
                </div>
                <BaseForm
                    hide-buttons
                    :disable-focus-first-element="disableFocusFirstElement"
                >
                    <slot name="additionalContent" />
                    <div v-if="!disableEdit">
                        <BaseDateTimePicker
                            v-if="dataTypeClass == EditorDraftDataType.DATE"
                            v-model="date"
                            is-on-focus
                            name="datePicker"
                            @update:model-value="handleDateInput"
                        />

                        <SlotActNatureSelect
                            v-else-if="
                                dataTypeClass ==
                                EditorDraftDataType.ACT_NATURE_SELECT
                            "
                            v-model="modelValue"
                            name="actNatureSelect"
                            reduce="description"
                            @update:model-value="handleActNatureInput"
                        />

                        <SlotNotarySelect
                            v-else-if="
                                dataTypeClass ==
                                EditorDraftDataType.NOTARY_SELECT
                            "
                            v-model="modelValue"
                            name="notarySelect"
                            reduce="fullName"
                            @update:model-value="handleNotaryInput"
                        />

                        <SlotUserSelect
                            v-else-if="
                                dataTypeClass ==
                                EditorDraftDataType.ACCOUNTABLE_SELECT
                            "
                            v-model="modelValue"
                            :label="t('types.practices.fields.accountableId')"
                            :placeholder="
                                t('global.select') +
                                ' ' +
                                t(
                                    'types.practices.fields.accountableId'
                                ).toLowerCase()
                            "
                            get-accountable
                            reduce="fullName"
                            name="accountableSelect"
                            @update:model-value="handleAccountableInput"
                        />

                        <SlotMunicipalityInput
                            v-else-if="
                                dataTypeClass ==
                                EditorDraftDataType.MUNICIPALITY
                            "
                            v-model="municipality"
                            :label="
                                t('global.select') +
                                ' ' +
                                t(
                                    'types.address.fields.municipality'
                                ).toLowerCase()
                            "
                            :placeholder="
                                t('global.select') +
                                ' ' +
                                t(
                                    'types.address.fields.municipality'
                                ).toLowerCase()
                            "
                            @update:model-value="handleMunicipalityInput"
                        />

                        <BasePhoneInput
                            v-else-if="
                                dataTypeClass == EditorDraftDataType.PHONE
                            "
                            :phone="phone"
                            :prefix="prefix"
                            @update:prefix="updatePhonePrefix"
                            @update:phone="updatePhone"
                        />

                        <SlotM69TypeSelect
                            v-else-if="
                                dataTypeClass ==
                                EditorDraftDataType.M69_TYPE_SELECT
                            "
                            v-model="modelValue"
                            reduce="typeDescription"
                            @update:model-value="handleM69TypeInput"
                        />

                        <SlotMunicipalityInput
                            v-else-if="
                                dataTypeClass ==
                                EditorDraftDataType.CONSERVATORY_SELECT
                            "
                            v-model="municipality"
                            :label="t('types.goods.fields.conservatory')"
                            :placeholder="
                                t('global.select') +
                                ' ' +
                                t(
                                    'types.goods.fields.conservatory'
                                ).toLowerCase()
                            "
                            is-conservatory
                            @update:model-value="handleMunicipalityInput"
                        />

                        <div
                            v-else-if="
                                dataTypeClass == EditorDraftDataType.ADDRESS
                            "
                            class="grid grid-cols-2 gap-2"
                        >
                            <SlotMunicipalityProvinceInput
                                v-model="address"
                                :label="
                                    t('global.select') +
                                    ' ' +
                                    t(
                                        'types.address.fields.municipality'
                                    ).toLowerCase()
                                "
                                :placeholder="
                                    t('global.select') +
                                    ' ' +
                                    t(
                                        'types.address.fields.municipality'
                                    ).toLowerCase()
                                "
                                has-province
                                @update:model-value="handleAddressInput"
                            />

                            <SlotCountrySelect
                                v-model="address.country"
                                @update:model-value="handleAddressInput"
                            />

                            <div></div>

                            <BaseInput
                                v-model="address.street"
                                :label="t('types.address.fields.street')"
                                :placeholder="
                                    t('types.address.fields.streetPlaceholder')
                                "
                                name="streetNumber"
                                type="text"
                                @update:model-value="handleAddressInput"
                            />

                            <BaseInput
                                v-model="address.streetNumber"
                                :label="t('types.address.fields.streetNumber')"
                                :placeholder="
                                    t(
                                        'types.address.fields.streetNumberPlaceholder'
                                    )
                                "
                                name="streetNumber"
                                type="text"
                                @update:model-value="handleAddressInput"
                            />
                        </div>

                        <div
                            v-else-if="
                                dataTypeClass == EditorDraftDataType.BOOKMARK ||
                                dataTypeClass ==
                                    EditorDraftDataType.HAVING_CAUSE ||
                                dataTypeClass ==
                                    EditorDraftDataType.GIVING_CAUSE ||
                                dataTypeClass == EditorDraftDataType.GOOD
                            "
                        ></div>

                        <div
                            v-else-if="
                                dataTypeClass == EditorDraftDataType.DRAFT
                            "
                            class="flex flex-col gap-2"
                        >
                            <BaseText
                                v-if="editorDraftStore.editorDraft.name"
                                :text="
                                    t(
                                        'types.editorDrafts.warnings.selectedDraft'
                                    ) +
                                    ': ' +
                                    editorDraftStore.editorDraft.name
                                "
                            />
                            <BaseText
                                v-if="editorDraftStore.editorDraft.model?.[0]"
                                :text="
                                    t('global.model') +
                                    ': ' +
                                    t(
                                        'types.editorDrafts.modelEnums.' +
                                            editorDraftStore.editorDraft
                                                .model[0]
                                    )
                                "
                            />

                            <BaseButton
                                :text="
                                    t('global.select') +
                                    ' ' +
                                    t(
                                        'types.editorDrafts.titleSingular'
                                    ).toLowerCase()
                                "
                                color="secondary"
                                size="xs"
                                @on-click="draftModalVisible = true"
                            />

                            <BaseButton
                                v-if="editorDraftStore.editorDraft.id"
                                :text="
                                    t('global.extract') +
                                    ' ' +
                                    t(
                                        'types.editorDrafts.titleSingular'
                                    ).toLowerCase()
                                "
                                color="secondary"
                                size="xs"
                                @on-click="handleExtractDraft"
                            />
                        </div>

                        <BaseInput
                            v-else
                            v-model="modelValue"
                            :is-currency="
                                dataTypeClass == EditorDraftDataType.CURRENCY
                            "
                            :label="
                                dataTypeClass == EditorDraftDataType.CURRENCY
                                    ? t('global.value')
                                    : t('global.content')
                            "
                            :placeholder="
                                t('global.enter') +
                                ' ' +
                                (dataTypeClass == EditorDraftDataType.CURRENCY
                                    ? t('global.value').toLowerCase()
                                    : t('global.content').toLowerCase())
                            "
                            type="text"
                            @update:model-value="handleBaseInput"
                        />
                    </div>

                    <SlotBaseCustomElementFormat
                        v-if="dataTypeClass != EditorDraftDataType.BOOKMARK"
                        :properties="properties"
                        @on-update-traslitteration-format="
                            handleUpdateCustomElementProperty
                        "
                    />
                </BaseForm>
            </div>

            <div
                class="grid justify-center gap-3 mt-2"
                :class="{
                    'grid-cols-3': showEditAllEntries,
                    'grid-cols-2': !showEditAllEntries,
                }"
            >
                <div>
                    <BaseButton
                        :text="t('global.cancel')"
                        color="neutral"
                        size="xs"
                        @on-click="emit('onClose')"
                    />
                </div>

                <div>
                    <BaseButton
                        :text="t('global.confirm')"
                        color="secondary"
                        size="xs"
                        type="button"
                        @on-click="handleConfirmSingle"
                    />
                </div>

                <div v-if="showEditAllEntries">
                    <BaseButton
                        :text="t('pages.editor.editAllEntries')"
                        color="secondary"
                        size="xs"
                        type="button"
                        @on-click="handleConfirmAll"
                    />
                </div>
            </div>
        </BaseCard>

        <EditorDraftCategoryIndexModal
            v-if="draftModalVisible"
            :draft-category-store-id="
                editorDraftStore.$id +
                'editor-draft-category-store-editor-draft-select-modal'
            "
            :draft-store-id="
                editorDraftStore.$id +
                'editor-draft-store-editor-draft-select-modal'
            "
            hide-editor
            hide-folder-menu
            disable-edit
            @on-close="draftModalVisible = false"
            @on-select-draft="handleSelectDraft"
        />
    </BaseModal>
</template>

<script lang="ts" setup>
import BaseCard from '@/components/base/card/BaseCard.vue'
import BaseModal from '@/components/base/modals/BaseModal.vue'
import { t } from '@/services/i18n'
import BaseText from '@/components/base/text/BaseText.vue'
import BaseInput from '@/components/base/input/BaseInput.vue'
import BaseButton from '@/components/base/button/BaseButton.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseDateTimePicker from '@/components/base/input/BaseDateTimePicker.vue'
import moment from 'moment'
import SlotActNatureSelect from '@/components/slots/actNatures/SlotActNatureSelect.vue'
import SlotNotarySelect from '@/components/slots/notaries/SlotNotarySelect.vue'
import SlotUserSelect from '@/components/slots/users/SlotUserSelect.vue'
import SlotMunicipalityInput from '@/components/slots/addresses/SlotMunicipalityInput.vue'
import Municipality from '@/types/municipality'
import {
    parseAddress,
    printAddress,
    printMunicipality,
} from '@/services/address'
import BasePhoneInput from '@/components/base/input/BasePhoneInput.vue'
import { formatCurrency, parseCurrency } from '@/services/utils'
import SlotM69TypeSelect from '@/components/slots/practices/goods/SlotM69TypeSelect.vue'
import Address from '@/types/address'
import SlotMunicipalityProvinceInput from '@/components/slots/addresses/SlotMunicipalityProvinceInput.vue'
import SlotCountrySelect from '@/components/slots/addresses/SlotCountrySelect.vue'
import SlotBaseCustomElementFormat from '@/components/slots/editor/SlotBaseCustomElementFormat.vue'
import { EditorDraftDataType, Property } from '@/types/editor'
import BaseCheckbox from '@/components/base/input/BaseCheckbox.vue'
import BaseForm from '@/components/base/form/BaseForm.vue'
import BaseSelect from '@/components/base/select/BaseSelect.vue'
import { useEditorDraftStore } from '@/stores/editorDraft'
import EditorDraftCategoryIndexModal from './draftCategory/EditorDraftCategoryIndexModal.vue'
import EditorDraft from '@/types/editorDraft'
import { replaceDraftCustomTag } from '@/services/editor/editorDraft'

const props = defineProps<{
    customElement: HTMLElement
    modalStoreId?: string
    disableEdit?: boolean
    disableRelativePositioning?: boolean
    hideEditAllEntries?: boolean
    disableFocusFirstElement?: boolean
}>()

const emit = defineEmits([
    'onClose',
    'onConfirmAll',
    'onConfirm',
    'onSelectDataType',
])

const editorDraftStore = useEditorDraftStore(
    'change-custom-element-value-modal-editor-draft-store-id'
)()

const loadingData = ref<boolean>(false)

const editedText = ref<string>(props.customElement?.textContent || '')
const modelValue = ref<string>(props.customElement?.textContent || '')

const date = ref<Date>(
    moment(props.customElement?.textContent, 'DD/MM/YYYY', true).isValid()
        ? moment(props.customElement?.textContent, 'DD/MM/YYYY').toDate()
        : new Date()
)
const municipality = ref<Municipality>({
    municipality: props.customElement?.textContent,
} as Municipality)

const phoneText = props.customElement?.textContent || ''
const phoneMatch = phoneText.match(/(\+\d+)?\s*(\d+)?/)
const prefix = ref<string>(phoneMatch && phoneMatch[1] ? phoneMatch[1] : '')
const phone = ref<string>(phoneMatch && phoneMatch[2] ? phoneMatch[2] : '')
const address = ref<Address>({} as Address)
const properties = ref<Property[]>([])
const dataTypeClass = ref<EditorDraftDataType>(EditorDraftDataType.TEXT)

const transformIntoPlainText = ref<boolean>(false)
const dataTypeClassOptions = [
    {
        value: EditorDraftDataType.TEXT,
        label: t('pages.editor.customTags.dataType.text'),
    },
    {
        value: EditorDraftDataType.DATE,
        label: t('pages.editor.customTags.dataType.date'),
    },
    {
        value: EditorDraftDataType.ACT_NATURE_SELECT,
        label: t('pages.editor.customTags.dataType.actNatureSelect'),
    },
    {
        value: EditorDraftDataType.NOTARY_SELECT,
        label: t('pages.editor.customTags.dataType.notarySelect'),
    },
    {
        value: EditorDraftDataType.ACCOUNTABLE_SELECT,
        label: t('pages.editor.customTags.dataType.accountableSelect'),
    },
    {
        value: EditorDraftDataType.MUNICIPALITY,
        label: t('pages.editor.customTags.dataType.municipality'),
    },
    {
        value: EditorDraftDataType.PHONE,
        label: t('pages.editor.customTags.dataType.phone'),
    },
    {
        value: EditorDraftDataType.M69_TYPE_SELECT,
        label: t('pages.editor.customTags.dataType.m69TypeSelect'),
    },
    {
        value: EditorDraftDataType.CONSERVATORY_SELECT,
        label: t('pages.editor.customTags.dataType.conservatorySelect'),
    },
    {
        value: EditorDraftDataType.ADDRESS,
        label: t('pages.editor.customTags.dataType.address'),
    },
    {
        value: EditorDraftDataType.CURRENCY,
        label: t('pages.editor.customTags.dataType.currency'),
    },
    {
        value: EditorDraftDataType.BOOKMARK,
        label: t('pages.editor.customTags.dataType.bookmark'),
    },
    {
        value: EditorDraftDataType.DRAFT,
        label: t('pages.editor.customTags.dataType.draft'),
    },
    {
        value: EditorDraftDataType.GIVING_CAUSE,
        label: t('pages.editor.customTags.dataType.givingCause'),
    },
    {
        value: EditorDraftDataType.HAVING_CAUSE,
        label: t('pages.editor.customTags.dataType.havingCause'),
    },
    {
        value: EditorDraftDataType.GOOD,
        label: t('pages.editor.customTags.dataType.good'),
    },
]
const draftModalVisible = ref<boolean>(false)
const showEditAllEntries = computed<boolean>(() => {
    return (
        !props.hideEditAllEntries &&
        dataTypeClass.value != EditorDraftDataType.DRAFT &&
        dataTypeClass.value != EditorDraftDataType.GOOD &&
        dataTypeClass.value != EditorDraftDataType.GIVING_CAUSE &&
        dataTypeClass.value != EditorDraftDataType.HAVING_CAUSE
    )
})

onMounted(async () => {
    loadingData.value = true
    try {
        if (/^\[.*\]$/.test(modelValue.value)) {
            modelValue.value = ''
        }

        if (props.customElement.classList.contains('currency')) {
            modelValue.value = parseCurrency(
                props.customElement?.textContent || undefined
            ).toString()
        }

        if (props.customElement.classList.contains('address')) {
            address.value =
                (await parseAddress(
                    props.customElement?.textContent || undefined
                )) || ({} as Address)
        }

        if (props.customElement) {
            Array.from(props.customElement.attributes).forEach((attr) =>
                properties.value.push({
                    label: attr.name,
                    value: attr.value,
                })
            )
        }

        dataTypeClass.value =
            (Object.values(EditorDraftDataType).find((type) => {
                return props.customElement?.classList.contains(type)
            }) as EditorDraftDataType) || EditorDraftDataType.TEXT

        if (dataTypeClass.value == EditorDraftDataType.DRAFT) {
            let draftId: number | undefined = undefined
            Array.from(props.customElement.attributes).filter((attribute) => {
                if (attribute.name == 'draftid') {
                    draftId = parseInt(attribute.value)
                }
            })
            if (!!draftId) {
                editorDraftStore.editorDraft.id = draftId
                editorDraftStore.show()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
    } finally {
        loadingData.value = false
    }
})

const handleConfirmAll = () => {
    let value = editedText.value
    value = formatIfCurrency(value)
    emit('onConfirmAll', value, properties.value, transformIntoPlainText.value)
    emit('onClose')
}

const handleConfirmSingle = () => {
    let value = editedText.value
    value = formatIfCurrency(value)
    emit('onConfirm', value, properties.value, transformIntoPlainText.value)
}

const formatIfCurrency = (value: string): string => {
    if (props.customElement.classList.contains('currency')) {
        value = formatCurrency(value)
    }
    return value
}

const handleDateInput = (date?: Date) => {
    editedText.value = moment(date).isValid()
        ? moment(date).format('DD/MM/YYYY')
        : '[dd/mm/YYYY]'
}

const handleActNatureInput = (value?: string) => {
    editedText.value = value || '[' + t('types.actNatures.titleSingular') + ']'
}

const handleNotaryInput = (value?: string) => {
    editedText.value = value || '[' + t('types.notaries.titleSingular') + ']'
}

const handleAccountableInput = (value?: string) => {
    editedText.value =
        value || '[' + t('types.practices.fields.accountableId') + ']'
}

const handleMunicipalityInput = (value?: Municipality) => {
    editedText.value =
        printMunicipality(value) ||
        '[' + t('types.address.fields.municipalityPlaceholder') + ']'
}

const updatePhone = (value: string) => {
    phone.value = value
    editedText.value = (prefix.value || '') + ' ' + (phone.value || '')
}

const updatePhonePrefix = (value: string) => {
    prefix.value = value
    editedText.value = (prefix.value || '') + ' ' + (phone.value || '')
}

const handleM69TypeInput = (value?: string) => {
    editedText.value = value || '[' + t('types.goods.fields.typeM69Id') + ']'
}

const handleAddressInput = () => {
    editedText.value =
        printAddress(address.value) ||
        '[' + t('types.address.titleSingular') + ']'
}

const handleBaseInput = (value: string) => {
    if (props.customElement.classList.contains('currency')) {
        editedText.value =
            value || '[' + t('types.negotiatingUnits.fields.value') + ']'
    } else {
        editedText.value = value || '[' + t('pages.editor.customTag') + ']'
    }
}

const handleKeyDown = async (e: KeyboardEvent) => {
    if (e.key == 'Escape') {
        e.preventDefault()
        emit('onClose')
    }
}

const handleUpdateCustomElementProperty = (property: Property) => {
    const index = properties.value.findIndex(
        (prop) => prop.label == property.label
    )
    if (index >= 0) {
        properties.value[index] = property
    } else if (property.value) {
        properties.value.push(property)
    }
}

const handleChangeDataType = (dataType?: EditorDraftDataType): void => {
    if (dataTypeClass.value) {
        props.customElement.classList.remove(dataTypeClass.value)
    }
    modelValue.value = ''
    address.value = {} as Address
    dataTypeClass.value = dataType || EditorDraftDataType.TEXT

    if (dataType) {
        props.customElement.classList.add(dataType)
    }
    emit('onSelectDataType', dataType)
}

const handleSelectDraft = (draft: EditorDraft) => {
    editorDraftStore.editorDraft = draft
    props.customElement.setAttribute('draftid', draft.id.toString())
    if (draft.model.length > 0) {
        props.customElement.setAttribute(
            'model',
            draft.model[0].charAt(0).toLowerCase() + draft.model[0].slice(1)
        )
    }
    draftModalVisible.value = false
}

const handleExtractDraft = async () => {
    if (editorDraftStore.editorDraft.id) {
        props.customElement.outerHTML = await replaceDraftCustomTag(
            editorDraftStore.editorDraft as EditorDraft
        )
    }

    emit('onClose')
}

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown)
    editorDraftStore.resetState()
})
</script>

<style scoped>
@keyframes flickerAnimation {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@-o-keyframes flickerAnimation {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@-moz-keyframes flickerAnimation {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@-webkit-keyframes flickerAnimation {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
</style>
