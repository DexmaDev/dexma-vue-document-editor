<template>
    <div
        ref="contextMenuRef"
        class="w-max grid grid-cols-1 gap-1 bg-white rounded-lg border border-neutral-300 absolute z-20"
    >
        <div
            v-for="(item, index) in menuItems"
            :key="item.text + '-' + index"
            :ref="
                (el) => {
                    buttonsRefs[index] = el
                }
            "
            class="relative"
            @mouseenter="setChildrenVisible(index)"
            @mouseleave="setChildrenVisible(index)"
        >
            <div v-if="item.is == 'separator'">
                <BaseDivider />
            </div>

            <div v-else>
                <BaseButton
                    :text="item.text"
                    type="button"
                    size="2xs"
                    variant="blank"
                    :left-icon="item.icon as Icons"
                    :right-icon="
                        item.menu && item.menu?.length > 0
                            ? 'chevron-right'
                            : undefined
                    "
                    :disabled="item.disabled"
                    color="neutral"
                    @on-click="item.click?.()"
                >
                    <div class="flex gap-4 w-full">
                        <div>{{ item.text }}</div>
                        <div class="ml-auto">{{ item.hotkey }}</div>
                    </div>
                </BaseButton>

                <BaseContextMenu
                    v-if="item.menu && subMenuVisible[index]"
                    :menu-items="item.menu"
                    :context-menu-position="
                        getSubMenuPosition(buttonsRefs[index])
                    "
                />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from '../button/BaseButton.vue'
import { debounce } from '@/services/utils'
import { MenuAction } from '@/types/editor'
import { Icons } from '@/types/styles'
import BaseDivider from '../divider/BaseDivider.vue'
import { keepElementInViewport } from '@/services/viewPort'

const props = withDefaults(
    defineProps<{
        menuItems?: MenuAction[]
        contextMenuPosition?: { x: number; y: number }
    }>(),
    {
        menuItems: undefined,
        contextMenuPosition: undefined,
    }
)

const emit = defineEmits(['onClose'])

const contextMenuRef = ref<HTMLElement | null>(null)
const buttonsRefs = ref<any[]>([])
const subMenuVisible = ref<boolean[]>([])

onMounted(async () => {
    await handleRender()

    window.addEventListener('keydown', handleKeyDown)
})

const handleRender = async (): Promise<void> => {
    await nextTick(() => {
        if (contextMenuRef.value) {
            contextMenuRef.value.style.top = props.contextMenuPosition
                ? `${props.contextMenuPosition.y}px`
                : 'unset'
            contextMenuRef.value.style.left = props.contextMenuPosition
                ? `${props.contextMenuPosition.x}px`
                : 'unset'

            contextMenuRef.value = keepElementInViewport(contextMenuRef.value)
        }
    })
}

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        e.preventDefault()
        emit('onClose')
    }
}

const setChildrenVisible = (index: number) => {
    debounce(
        () => (subMenuVisible.value[index] = !subMenuVisible.value[index]),
        200
    )()
}

const getSubMenuPosition = (element: HTMLElement): { x: number; y: number } => {
    const elementRect = element.getBoundingClientRect()
    return {
        x: elementRect.width,
        y: 0,
    }
}

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
})
</script>
