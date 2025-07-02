<template>
    <!-- TODO: -->
    <div class="flex w-full flex-col gap-1.5">
        <div
            class="flex cursor-pointer gap-3 rounded-xl border p-4 transition-all duration-300 focus:ring-2 focus:ring-neutral-100 hover:bg-neutral-50"
            :class="{
                'border-neutral-400 hover:border-neutral-500': modelValue,
                'border-neutral-200 hover:border-neutral-300': !modelValue,
            }"
            disabled
            @click.prevent="setValue"
        >
            <div>
                <input
                    type="checkbox"
                    class="h-5 w-5 cursor-pointer rounded-md border border-neutral-300 text-secondary-500 transition-all duration-300"
                    :checked="modelValue"
                    :name="name"
                    disabled
                />
            </div>
            <div class="flex flex-col gap-1">
                <BaseText
                    v-if="title"
                    :text="title"
                    font="semibold"
                    type="p-md"
                />
                <BaseText v-if="text" :text="text" font="regular" type="p-sm" />
            </div>
            <div>
                <div
                    v-if="icon"
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200"
                >
                    <div class="h-6 w-6">
                        <BaseIcon :name="icon" />
                    </div>
                </div>
            </div>
        </div>
        <div v-if="Array.isArray(hintMessage)">
            <BaseText
                v-for="(message, i) in hintMessage"
                :key="`hint-message-${i}`"
                :text="message"
                type="p-sm"
                font="medium"
                :color="
                    status == 'error' && !disabled
                        ? 'error'
                        : status == 'success' && !disabled
                          ? 'success'
                          : 'neutral'
                "
            />
        </div>
        <div v-else-if="hintMessage">
            <BaseText
                :text="hintMessage"
                type="p-sm"
                font="medium"
                :color="
                    status == 'error' && !disabled
                        ? 'error'
                        : status == 'success' && !disabled
                          ? 'success'
                          : 'neutral'
                "
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icons } from '@/types/styles'
import BaseText from '@/components/base/text/BaseText.vue'
import BaseIcon from '../icon/BaseIcon.vue'

const emit = defineEmits(['update:modelValue', 'onClickIcon', 'onInput'])

const props = defineProps<{
    title?: string
    text?: string
    icon?: Icons
    name?: string
    modelValue?: any
    disabled?: boolean
    hintMessage?: string | string[]
    status?: 'default' | 'error' | 'success'
}>()

const setValue = () => {
    emit('update:modelValue', props.modelValue ? false : true)
}
</script>
