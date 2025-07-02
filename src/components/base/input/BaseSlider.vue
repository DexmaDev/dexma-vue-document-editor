<template>
    <div class="flex h-full w-full flex-col gap-1.5">
        <div v-if="label">
            <BaseText
                :text="label"
                :tone="700"
                color="neutral"
                font="bold"
                type="p-sm"
            />
        </div>
        <div class="flex gap-1">
            <BaseText
                :text="min.toString()"
                :tone="700"
                color="neutral"
                font="medium"
                type="p-sm"
            />
            <div class="relative flex w-full items-center">
                <input
                    ref="inputRange"
                    :disabled="disabled"
                    :max="max"
                    :min="min"
                    :name="name"
                    :placeholder="placeholder"
                    :required="required"
                    :step="step"
                    :value="modelValue"
                    class="default h-1 w-full cursor-pointer appearance-none rounded-2xl"
                    type="range"
                    @input="setValue"
                />
                <div
                    ref="inputSlider"
                    class="tooltip rounded-lg bg-neutral-700 px-2 py-1.5"
                >
                    <BaseText
                        :text="modelValue.toString()"
                        color="white"
                        font="semibold"
                        type="p-sm"
                    />
                </div>
            </div>
            <BaseText
                :text="max.toString()"
                :tone="700"
                color="neutral"
                font="medium"
                type="p-sm"
            />
        </div>
        <div class="flex w-full justify-between">
            <BaseButtonIcon
                color="neutral"
                icon="remove"
                size="xs"
                @on-click="stepSubtract"
            />
            <BaseButtonIcon
                color="neutral"
                icon="add"
                size="xs"
                @on-click="stepAdd"
            />
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
import { onMounted, ref } from 'vue'
import BaseButtonIcon from '../button/BaseButtonIcon.vue'

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
        step?: number
        min?: number
        max?: number

        status?: 'default' | 'error' | 'success'
    }>(),
    {
        min: 0,
        max: 100,
        step: 1,
        placeholder: undefined,
        value: undefined,
        name: undefined,
        label: undefined,
        modelValue: 0,
        hintMessage: undefined,
        status: 'default',
    }
)

const inputRange = ref<HTMLInputElement | null>(null)
const inputSlider = ref<HTMLInputElement | null>(null)

onMounted(() => {
    updateTooltipPosition()
})

const setValue = (inputEvent: Event) => {
    emit(
        'update:modelValue',
        parseFloat((inputEvent.target as HTMLInputElement).value)
    )
    updateTooltipPosition()
}

const stepAdd = () => {
    if (props.modelValue < props.max) {
        emit('update:modelValue', props.modelValue + props.step)
    }
    updateTooltipPosition()
}

const stepSubtract = () => {
    if (props.modelValue > props.min) {
        emit('update:modelValue', props.modelValue - props.step)
    }
    updateTooltipPosition()
}

const updateTooltipPosition = () => {
    if (inputRange.value && inputSlider.value) {
        const percent =
            ((props.modelValue - props.min) / (props.max - props.min)) * 100
        const tooltipWidth = inputSlider.value.offsetWidth
        const inputWidth = inputRange.value.offsetWidth
        const offsetLeft = (percent * inputWidth) / 100 - tooltipWidth / 2

        inputSlider.value.style.left = `${offsetLeft}px`
    }
}
</script>

<style scoped>
.default {
    @apply bg-neutral-300;
}

.tooltip {
    position: absolute;
    bottom: 30px;
    pointer-events: none;
}
</style>
