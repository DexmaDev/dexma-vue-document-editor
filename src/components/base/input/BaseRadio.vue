<template>
    <div class="flex w-full flex-col gap-1.5">
        <div class="flex w-full items-center gap-2">
            <input
                :checked="modelValue === value"
                :disabled="disabled"
                :indeterminate="indeterminate"
                :name="name"
                :value="value"
                class="h-5 w-5 cursor-pointer rounded-md border border-neutral-300 text-secondary-500 disabled:pointer-events-none disabled:text-secondary-300 focus:ring-neutral-200 checked:focus:ring-secondary-200 indeterminate:focus:ring-secondary-200 hover:bg-neutral-50 hover:text-secondary-50 checked:hover:bg-secondary-700 indeterminate:hover:bg-secondary-700"
                type="radio"
                @change="setValue"
            />
            <div v-if="label">
                <BaseText
                    :text="label"
                    :tone="disabled ? 500 : 700"
                    color="neutral"
                    font="bold"
                    type="p-md"
                />
            </div>
        </div>
        <div v-if="Array.isArray(hintMessage)">
            <BaseText
                v-for="(message, i) in hintMessage"
                :key="`hint-message-${i}`"
                :color="
                    status == 'error' && !disabled
                        ? 'error'
                        : status == 'success' && !disabled
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
                    status == 'error' && !disabled
                        ? 'error'
                        : status == 'success' && !disabled
                          ? 'success'
                          : 'neutral'
                "
                :text="hintMessage"
                font="medium"
                type="p-sm"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import BaseText from '@/components/base/text/BaseText.vue'

const emit = defineEmits(['update:modelValue', 'onClickIcon', 'onInput'])

defineProps<{
    name?: string
    label?: string
    modelValue?: any
    disabled?: boolean
    indeterminate?: boolean
    hintMessage?: string | string[]
    status?: 'default' | 'error' | 'success'
    value: string
}>()

const setValue = (inputEvent: Event) => {
    emit('update:modelValue', (inputEvent.target as HTMLInputElement).checked)
    emit('onInput')
}
</script>
