<template>
    <div class="w-full base-date-picker">
        <div v-if="label">
            <BaseText
                :text="label"
                :tone="700"
                color="neutral"
                font="bold"
                type="p-sm"
            />
        </div>

        <div class="relative mb-1 mt-1.5">
            <VueDatePicker
                ref="datePickerRef"
                class="w-full rounded-full"
                :disabled="disabled"
                :enable-time-picker="timePickerEnabled"
                :format="getFormat()"
                :preview-format="getFormat()"
                :model-value="modelValue"
                :placeholder="placeholder"
                :state="status === 'error' ? false : null"
                :text-input="true"
                auto-apply
                :month-change-on-arrows="true"
                :teleport="true"
                :locale="getCurrentLocale()"
                @update:model-value="handleEmitUpdateModelValue"
                @focus="handleOnFocus"
                @input="handleTextInput"
                @open="handleOnOpen"
            />
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
import { nextTick, ref } from 'vue'
import BaseText from '@/components/base/text/BaseText.vue'
import { convertDateToISO, handleEmitChangeToForm } from '@/services/utils'
import { getCurrentLocale } from '@/services/i18n'

const emit = defineEmits(['update:modelValue', 'onClickIcon', 'onInput'])

const props = withDefaults(
    defineProps<{
        placeholder?: string
        value?: any
        name?: string
        required?: boolean
        label?: string
        modelValue?: any
        disabled?: boolean
        hintMessage?: string | string[]
        iconClickable?: boolean
        status?: 'default' | 'error' | 'success'
        timePickerEnabled?: boolean
        format?: string
        preCompile?: boolean
    }>(),
    {
        placeholder: undefined,
        value: undefined,
        name: undefined,
        required: undefined,
        label: undefined,
        modelValue: undefined,
        disabled: undefined,
        hintMessage: undefined,
        iconClickable: undefined,
        status: undefined,
        format: undefined,
        timePickerEnabled: false,
        preCompile: false,
    }
)
const datePickerRef = ref()

const getFormat = () => {
    return (
        props.format || 'dd/MM/yyyy' + (props.timePickerEnabled ? ' HH:mm' : '')
    )
}

const handleOnFocus = () => {
    if (!props.modelValue && props.preCompile) {
        const now = new Date()
        handleEmitUpdateModelValue(now)
    }
}

function handleTextInput(input: Event) {
    const target = input.target as HTMLInputElement
    const formattedValue = formatInput(target.value)

    target.value = formattedValue

    if (props.timePickerEnabled) {
        if (formattedValue.length > 15) {
            const date = parseDate(formattedValue, true)
            if (date) {
                handleEmitUpdateModelValue(date)
            }
        }
    } else {
        if (formattedValue.length > 9) {
            const date = parseDate(formattedValue, false)
            if (date) {
                handleEmitUpdateModelValue(date)
            }
        }
    }
}

const handleEmitUpdateModelValue = (date?: Date | string): void => {
    emit('update:modelValue', date ? convertDateToISO(date) : undefined)
    handleEmitChangeToForm(datePickerRef.value?.$el)
}

const formatInput = (input: string) => {
    let cleaned = input.replace(/[^0-9/]/g, '')
    cleaned = cleaned.replace(/\/+/g, '/')
    const match = cleaned.match(
        /(\d{1,2})(\/)?(\d{1,2})?(\/)?(\d{1,4})?( )?(\d{1,2})?(:)?(\d{1,2})?/
    )
    if (!match) return input
    const [
        ,
        day,
        daySlash,
        month,
        monthSlash,
        year,
        space,
        hour,
        colon,
        minute,
    ] = match
    let formatted = day || ''
    if (month) {
        formatted += (daySlash || '/') + month
    }
    if (year) {
        formatted += (monthSlash || '/') + year
    }
    if (props.timePickerEnabled) {
        if (hour) formatted += (space || ' ') + hour
        if (minute) formatted += (colon || ':') + minute
    }
    return formatted
}

const parseDate = (input: string, includeTime: boolean): Date | null => {
    const parts = input.split(/[/ :]/)
    if (includeTime) {
        if (parts.length === 5) {
            const [day, month, year, hour, minute] = parts
            return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`)
        }
    } else {
        if (parts.length === 3) {
            const [day, month, year] = parts
            return new Date(`${year}-${month}-${day}`)
        }
    }
    return null
}

const handleOnOpen = async () => {
    await nextTick()
    const inputEl = document.querySelector<HTMLInputElement>('.dp__input_focus')
    if (!inputEl) {
        return
    }

    const dpWrapper =
        document.querySelector<HTMLDivElement>('.dp--menu-wrapper')
    if (!dpWrapper) {
        return
    }

    dpWrapper.style.left = `${inputEl.getBoundingClientRect().left}px`
    const calendar = dpWrapper.querySelector<HTMLDivElement>(
        '.dp__instance_calendar'
    )
    if (!calendar) {
        return
    }
    calendar.style.width = `${inputEl.getBoundingClientRect().width}px`
}
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
</style>
