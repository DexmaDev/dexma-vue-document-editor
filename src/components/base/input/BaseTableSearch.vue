<template>
    <div>
        <BaseInput
            :id-name="idName"
            :placeholder="placeholder"
            :value="value"
            :name="name"
            :required="required"
            :model-value="modelValue"
            :disabled="disabled"
            :icon-name="iconName"
            :type="type"
            :status="status"
            custom-input-class="w-full rounded-xl border border-neutral-300 pl-8 pt-0 pr-0 pb-0 text-neutral-900 transition-all duration-300 disabled:bg-neutral-50 disabled:text-neutral-500"
            custom-icon-class="absolute left-3 top-1.5 h-4 w-4 text-neutral-500"
            clearable
            :icon-clickable="iconClickable || !!modelValue"
            @update:model-value="updateModelValue"
            @on-click-icon="onIconClick"
        />
    </div>
</template>

<script lang="ts" setup>
import { debounce } from '@/services/utils'
import { Icons } from '@/types/styles'
import BaseInput from '@/components/base/input/BaseInput.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits(['update:modelValue', 'onClickIcon', 'onInput'])

defineProps<{
    idName?: string
    placeholder?: string
    value?: any
    name?: string
    required?: boolean
    modelValue?: any
    disabled?: boolean
    iconClickable?: boolean
    iconName?: Icons
    type: 'text' | 'number' | 'email' | 'password' | 'hidden' | 'textArea'
    status?: 'default' | 'error' | 'success'
}>()

const isKeyPressed = ref(false)

onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
})

const updateModelValue = debounce((value) => {
    if (!isKeyPressed.value) {
        emit('update:modelValue', value)
    }
}, 300)

const onIconClick = () => {
    emit('onClickIcon')
}

const onKeyDown = () => {
    isKeyPressed.value = true
}

const onKeyUp = () => {
    isKeyPressed.value = false
}

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
})
</script>
