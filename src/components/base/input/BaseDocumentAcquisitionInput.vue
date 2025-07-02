<template>
    <div
        ref="inputRef"
        class="mt-2 flex justify-center rounded-lg border px-6 py-10"
        :class="[
            {
                'border-dashed border-gray-900/25': !isDragging,
                'border-solid border-secondary-300': isDragging,
            },
        ]"
        @drop="onDrop"
        @dragenter="handleDragEnter"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
    >
        <div class="text-center">
            <div class="m-auto w-fit">
                <BaseIcon
                    name="add-photo"
                    :tone="200"
                    :color="isDragging ? 'secondary' : 'primary'"
                    size="2xl"
                />
            </div>

            <div class="mt-4 flex">
                <BaseInput
                    accept="image/*,.pdf"
                    type="file"
                    @on-change="onChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import BaseIcon from '../icon/BaseIcon.vue'
import BaseInput from './BaseInput.vue'
import { Ref, ref } from 'vue'

defineProps<{
    hasBack?: boolean
}>()
const emit = defineEmits(['onFileSelected'])

const files: Ref<File[]> = ref([])
const inputRef = ref()

const isDragging = ref<boolean>(false)

const onChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files) {
        files.value = Array.from(target.files)
    }
    onFileSelected()
}

const onDrop = (event: DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer?.files.length) {
        files.value = Array.from(event.dataTransfer.files)
        onFileSelected()
    }
    isDragging.value = false
}

const onFileSelected = async () => {
    if (!files.value.length) {
        return
    }
    emit('onFileSelected', files.value)
}

const click = () => {
    inputRef.value?.querySelector('input[type="file"]')?.click()
}

const handleDragEnter = (event: DragEvent) => {
    event.preventDefault()
    isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    if (inputRef.value?.contains(event.relatedTarget as Node)) {
        return
    }
    isDragging.value = false
}

const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
}

defineExpose({
    click,
})
</script>
