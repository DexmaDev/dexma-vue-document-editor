<template>
    <div
        v-if="imageElement && !imageElement.classList.contains('logo')"
        ref="imageMenuRef"
        class="fixed flex bg-white border border-gray-300 rounded-md shadow-sm px-2 py-1 gap-2"
    >
        <BaseButtonIcon
            icon="break-text"
            :tooltip="t('pages.editor.actions.breakText')"
            :variant="isBreakTextActive ? 'outline' : 'blank'"
            :color="isBreakTextActive ? 'secondary' : 'primary'"
            size="xs"
            @on-click="handlebreakText"
        />

        <BaseButtonIcon
            icon="behind-text"
            :tooltip="t('pages.editor.actions.behindText')"
            :variant="isBehindTextActive ? 'outline' : 'blank'"
            :color="isBehindTextActive ? 'secondary' : 'primary'"
            size="xs"
            @on-click="handleBehindText"
        />

        <BaseButtonIcon
            icon="above-text"
            :tooltip="t('pages.editor.actions.inFrontText')"
            :variant="isAboveTextActive ? 'outline' : 'blank'"
            :color="isAboveTextActive ? 'secondary' : 'primary'"
            size="xs"
            @on-click="handleInFrontText"
        />
    </div>
</template>
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BaseButtonIcon from '../button/BaseButtonIcon.vue'
import { t } from '@/services/i18n'

const emit = defineEmits(['onClose', 'onUpdate'])

const props = withDefaults(
    defineProps<{
        imageElement?: HTMLElement
        zoom?: number
    }>(),
    {
        imageElement: undefined,
        zoom: undefined,
    }
)

const imageMenuRef = ref<HTMLElement>()
const isBehindTextActive = ref<boolean>(false)
const isAboveTextActive = ref<boolean>(false)
const isBreakTextActive = ref<boolean>(false)

onMounted(async () => {
    await handleRender()

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleRender)
    window.addEventListener('scroll', handleRender, true)
})
const handleRender = async () => {
    await nextTick(async () => {
        if (props.imageElement instanceof HTMLElement) {
            const relativeToRect = props.imageElement?.getBoundingClientRect()
            if (imageMenuRef.value) {
                const imageRect = imageMenuRef.value.getBoundingClientRect()
                imageMenuRef.value.style.top = `${relativeToRect.bottom + 10}px`
                imageMenuRef.value.style.left = `${relativeToRect.x + relativeToRect.width / 2 - imageRect.width / 2}px`
            }
        }
        updateActiveState()
    })
}

watch(
    () => props.zoom,
    async () => {
        if (props.zoom) {
            await handleRender()
        }
    }
)

watch(
    () => props.imageElement,
    async () => {
        await handleRender()
    },
    {
        deep: true,
    }
)

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        e.preventDefault()
        emit('onClose')
    }
}

const handlebreakText = () => {
    isBehindTextActive.value = false
    isAboveTextActive.value = false
    isBreakTextActive.value = true
    emit('onUpdate', {
        display: 'block',
        position: 'relative',
        left: 'unset',
        top: 'unset',
    })
}

const handleBehindText = () => {
    isBehindTextActive.value = true
    isAboveTextActive.value = false
    isBreakTextActive.value = false
    emit('onUpdate', {
        position: 'absolute',
        'z-index': '-1',
        display: 'unset',
        margin: 'unset',
        'margin-left': 'unset',
    })
}

const handleInFrontText = () => {
    isBehindTextActive.value = false
    isAboveTextActive.value = true
    isBreakTextActive.value = false
    emit('onUpdate', {
        position: 'absolute',
        'z-index': '1',
        display: 'unset',
        margin: 'unset',
        'margin-left': 'unset',
    })
}

const updateActiveState = () => {
    if (props.imageElement instanceof HTMLElement) {
        const style = props.imageElement.style
        isBehindTextActive.value =
            style.position === 'absolute' && style.zIndex === '-1'
        isAboveTextActive.value =
            style.position === 'absolute' && style.zIndex === '1'
        isBreakTextActive.value =
            style.display === 'block' && style.position !== 'absolute'
    }
}

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('resize', handleRender)
    window.removeEventListener('scroll', handleRender, true)
})
</script>
