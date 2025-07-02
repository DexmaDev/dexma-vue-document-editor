<template>
    <div class="w-full">
        <slot name="label" />
        <div v-if="label && !$slots.label">
            <BaseText
                :text="label"
                :tone="700"
                color="neutral"
                font="bold"
                type="p-sm"
            />
        </div>
        <div :class="['relative', { 'mb-1 mt-1.5': !props.nopadding }]">
            <textarea
                v-if="type === 'textArea'"
                :id="idName"
                ref="input"
                :class="{
                    default: (status ?? 'default') == 'default',
                    error: (status ?? 'default') == 'error',
                    success: (status ?? 'default') == 'success',
                }"
                :disabled="disabled"
                :maxlength="maxLength"
                :minlength="minlength"
                :name="name"
                :placeholder="placeholder"
                :value="modelValue"
                class="w-full rounded-lg border border-neutral-300 py-1.5 pl-3 pr-1 text-base text-neutral-900 transition-all duration-300 focus:ring-2 disabled:bg-neutral-50 disabled:text-neutral-500"
                @input="setValue"
            />
            <label
                v-else-if="type === 'file'"
                :class="{
                    default: (status ?? 'default') == 'default',
                    error: (status ?? 'default') == 'error',
                    success: (status ?? 'default') == 'success',
                    'pr-10': iconName,
                    'pr-3': !iconName,
                    'border-2': isDragging,
                    border: !isDragging,
                }"
                class="w-full hover:bg-neutral-100 cursor-pointer rounded-lg flex flex-col items-center py-1.5 px-3 text-base text-neutral-900 transition-all duration-300 focus:ring-2 disabled:bg-neutral-50 disabled:text-neutral-500"
                for="file-upload"
                @dragleave="onDragLeave"
                @dragover="onDragOver"
                @drop="onDrop"
            >
                <BaseText
                    :text="t('types.practiceDocuments.fields.filePlaceholder')"
                    :tone="400.0"
                />
                <input
                    id="file-upload"
                    :accept="accept"
                    :disabled="disabled"
                    :multiple="multiple"
                    class="sr-only"
                    type="file"
                    @change="(value) => emit('onChange', value)"
                />
                <BaseText :text="value" color="secondary" type="p-sm" />
                <BaseProgress
                    v-if="progressPercentage"
                    :progress="progressPercentage"
                    color="secondary"
                />
            </label>
            <input
                v-else
                :id="idName"
                ref="input"
                :autocomplete="autocomplete ? 'on' : 'off'"
                :class="[
                    {
                        default: (status ?? 'default') == 'default',
                        error: (status ?? 'default') == 'error',
                        success: (status ?? 'default') == 'success',
                        'pr-10': iconName,
                        'pr-3': !iconName,
                        'hide-arrows-when-blurred': hideArrowsWhenBlurred,
                    },
                    customInputClass ||
                        'w-full rounded-lg border border-neutral-300 py-1.5 pl-3 text-base text-neutral-900 transition-all duration-300 focus:ring-2 disabled:bg-neutral-50 disabled:text-neutral-500',
                ]"
                :disabled="disabled"
                :max="max"
                :maxlength="maxLength"
                :min="min"
                :minlength="minlength"
                :name="name"
                :placeholder="placeholder"
                :required="required"
                :type="type"
                :value="modelValue"
                :step="step"
                @focus="handleFocusIn"
                @focusout="handleFocusOut"
                @input="setValue"
            />
            <div
                v-if="iconName"
                id="base-input-icon"
                :class="[
                    {
                        'cursor-pointer': iconClickable && !disabled,
                        'animate-spin': iconSpin,
                        'absolute right-3.5 top-2 flex h-5 w-5 items-center justify-center text-neutral-900':
                            !customInputClass,
                        customInputClass: !!customInputClass,
                    },
                    customIconClass ||
                        'absolute right-3.5 top-2 flex h-5 w-5 items-center justify-center text-neutral-900',
                ]"
                @click.prevent="onIconClick(clearable && modelValue)"
            >
                <BaseIcon
                    :name="
                        clearable && modelValue
                            ? 'clear-circle-white'
                            : iconName
                    "
                    :tooltip="iconTooltip"
                />
            </div>
            <div
                v-if="$slots.insideInput"
                class="absolute right-3.5 top-2 flex h-5 w-5 items-center justify-center text-neutral-900"
            >
                <slot name="insideInput" />
            </div>
        </div>
        <div v-if="Array.isArray(hintMessage)">
            <BaseText
                v-for="(message, i) in hintMessage"
                :key="`hint-message-${i}`"
                :color="
                    status == 'error'
                        ? 'error'
                        : status == 'success'
                          ? 'success'
                          : 'neutral'
                "
                :text="message"
                font="medium"
                type="p-sm"
            />
        </div>
        <div v-else-if="hintMessage">
            <BaseText
                :color="
                    status == 'error'
                        ? 'error'
                        : status == 'success'
                          ? 'success'
                          : 'neutral'
                "
                :text="hintMessage as string"
                font="medium"
                type="p-sm"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import BaseIcon from '@/components/base/icon/BaseIcon.vue'
import BaseProgress from '@/components/base/progress/BaseProgress.vue'
import BaseText from '@/components/base/text/BaseText.vue'
import { t } from '@/services/i18n'
import { maskDefinitions } from '@/services/masks'
import {
    formatCurrency,
    formatHectaresConstructionSiteArea,
    formatNumber,
    formatZipCode,
} from '@/services/utils'
import { Icons } from '@/types/styles'
import { nextTick, onMounted, ref, watch } from 'vue'

const emit = defineEmits([
    'update:modelValue',
    'onClickIcon',
    'onInput',
    'onFocusOut',
    'onFocus',
    'onChange',
    'onDrop',
])

const props = defineProps<{
    idName?: string
    placeholder?: string
    value?: any
    name?: string
    required?: boolean
    label?: string
    modelValue?: any
    disabled?: boolean
    hintMessage?: string | string[]
    iconClickable?: boolean
    iconName?: Icons
    iconSpin?: boolean
    type:
        | 'text'
        | 'number'
        | 'email'
        | 'password'
        | 'hidden'
        | 'textArea'
        | 'file'
    status?: 'default' | 'error' | 'success'
    autocomplete?: boolean
    maxLength?: number
    minlength?: number
    isOnFocus?: boolean
    isCurrency?: boolean
    isNumber?: boolean
    mask?: string
    isHectaresConstructionSiteArea?: boolean
    accept?: string
    min?: string
    max?: string
    fieldsMaxLength?: number
    progressPercentage?: number
    isZipCode?: boolean
    customInputClass?: string
    customIconClass?: string
    clearable?: boolean
    noPreventDataLost?: boolean
    multiple?: boolean
    step?: string
    hideArrowsWhenBlurred?: boolean
    nopadding?: boolean
    iconTooltip?: string
}>()

const input = ref()
const isDragging = ref<boolean>(false)

onMounted(async () => {
    await nextTick()

    if (props.isOnFocus && input.value) {
        input.value.focus()
    }

    await handleModelValueUpdate()
})

watch(
    () => props.modelValue,
    async () => {
        await handleModelValueUpdate()
    }
)

const handleModelValueUpdate = async (): Promise<void> => {
    await nextTick(() => {
        if (
            props.modelValue &&
            document.activeElement != input.value &&
            input.value
        ) {
            if (props.isCurrency) {
                input.value.value = formatCurrency(props.modelValue.toString())
            } else if (props.isZipCode) {
                input.value.value = formatZipCode(props.modelValue.toString())
            } else if (props.isHectaresConstructionSiteArea) {
                input.value.value = formatHectaresConstructionSiteArea(
                    props.modelValue.toString()
                )
            } else if (props.isNumber) {
                input.value.value = formatNumber(props.modelValue.toString())
            }
        }
    })
}

const setValue = (inputEvent: Event) => {
    const inputElement = inputEvent.target as HTMLInputElement
    let value = inputElement.value
    if (
        props.isCurrency ||
        props.isHectaresConstructionSiteArea ||
        props.isNumber
    ) {
        value = value.replace(/,/g, '.')
    }

    if (props.fieldsMaxLength) {
        const cleanedInput = value.replace(/\s+/g, '')
        const substrings: string[] = []
        for (let i = 0; i < cleanedInput.length; i += props.fieldsMaxLength) {
            substrings.push(
                cleanedInput.substring(i, i + props.fieldsMaxLength)
            )
        }
        value = substrings.join(' ')
    }

    const maskValue = props.mask ? applyMask(value) : value
    inputElement.value = maskValue

    emit('update:modelValue', maskValue)
}

const applyMask = (value: any) => {
    const maskedValue: any[] = []
    let unmaskedIndex: number = 0
    let maskIndex: number = 0

    while (
        props.mask &&
        unmaskedIndex < value.length &&
        maskIndex < props.mask.length
    ) {
        const maskChar = props.mask[maskIndex]
        const unmaskedChar = value[unmaskedIndex]
        const maskDefinition = maskDefinitions[maskChar]

        if (maskDefinition) {
            if (maskDefinition.escape) {
                maskIndex++
                maskedValue.push(value[unmaskedIndex])
                unmaskedIndex++
            } else if (maskDefinition.pattern.test(unmaskedChar)) {
                const transformedChar = maskDefinition.transform
                    ? maskDefinition.transform(unmaskedChar)
                    : unmaskedChar
                maskedValue.push(transformedChar)
                unmaskedIndex++
            } else {
                break
            }
        } else {
            maskedValue.push(maskChar)
            if (maskChar === unmaskedChar) {
                unmaskedIndex++
            }
        }
        maskIndex++
    }

    return maskedValue.join('')
}

const handleFocusOut = (event: Event) => {
    emit('onFocusOut', event)
    if (props.modelValue) {
        const inputElement = event.target as HTMLInputElement
        if (props.isCurrency) {
            inputElement.value = formatCurrency(props.modelValue.toString())
        } else if (props.isZipCode) {
            inputElement.value = formatZipCode(props.modelValue.toString())
        } else if (props.isHectaresConstructionSiteArea) {
            inputElement.value = formatHectaresConstructionSiteArea(
                props.modelValue.toString()
            )
        } else if (props.isNumber) {
            inputElement.value = formatNumber(props.modelValue.toString())
        }
    }
}

const handleFocusIn = (event: Event) => {
    emit('onFocus', event)
    if (
        props.modelValue &&
        (props.isCurrency ||
            props.isHectaresConstructionSiteArea ||
            props.isNumber)
    ) {
        const inputElement = event.target as HTMLInputElement
        inputElement.value = props.modelValue
    }
}

const onDragOver = (e: Event) => {
    e.preventDefault()

    isDragging.value = true
}

const onDragLeave = () => {
    isDragging.value = false
}

const onDrop = (e: DragEvent) => {
    e.preventDefault()
    emit('onDrop', e)
    isDragging.value = false
}

const onIconClick = (isClearEvent: boolean = false) => {
    if (isClearEvent) {
        emit('update:modelValue')
    }
    emit('onClickIcon', isClearEvent)
}

defineExpose({
    input,
})
</script>

<style scoped>
.default {
    @apply border-neutral-300 focus:border-primary-400 focus:ring-blue-200 disabled:border-neutral-300;
}

.error {
    @apply border-error-300 focus:border-error-400 focus:ring-error-200;
}

.success {
    @apply border-success-300 focus:border-success-400 focus:ring-success-200;
}

.hide-arrows-when-blurred::-webkit-inner-spin-button,
.hide-arrows-when-blurred::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.hide-arrows-when-blurred:focus-within::-webkit-inner-spin-button,
.hide-arrows-when-blurred:focus-within::-webkit-outer-spin-button {
    -webkit-appearance: auto;
}

.hide-arrows-when-blurred:focus-within {
    -moz-appearance: number-input;
}
</style>
