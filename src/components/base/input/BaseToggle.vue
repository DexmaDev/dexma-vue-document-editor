<template>
    <div class="flex w-full flex-col gap-1.5">
        <div class="flex w-full h-full items-center gap-2">
            <label class="relative inline-flex cursor-pointer items-center">
                <input
                    :checked="modelValue"
                    :disabled="disabled"
                    :name="name"
                    class="peer sr-only"
                    type="checkbox"
                    @change="setValue"
                />
                <div
                    class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full"
                />
            </label>

            <div v-if="label">
                <BaseText
                    :text="label"
                    :tone="700"
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
    hintMessage?: string | string[]
    status?: 'default' | 'error' | 'success'
}>()

const setValue = (inputEvent: Event) => {
    emit('update:modelValue', (inputEvent.target as HTMLInputElement).checked)
}

//TODO: Add dynamic style
</script>
