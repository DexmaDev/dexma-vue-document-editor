<template>
    <Teleport to="#modals">
        <div
            class="fixed left-0 top-0 z-50 flex h-full w-full transform items-center justify-center"
            @click="onBackgroundClick"
        >
            <div
                v-if="backdrop"
                class="backdrop absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
                @click="emit('onBackgroundClick')"
            />
            <div
                id="modal-container"
                ref="modalRef"
                :class="{
                    'max-w-xs': size == 'xs',
                    'max-w-md': size == 'sm',
                    'max-w-xl': size == 'md',
                    'max-w-5xl': size == 'lg',
                    'max-w-7xl': size == 'xl',
                    'max-w-[95%]': size == 'xxl',
                    'h-full': height == 'full',
                    'shadow-xl': !backdrop,
                    absolute: relativeTo,
                    relative: !relativeTo,
                }"
                class="flex max-h-[calc(100vh-10%)] w-full flex-col rounded-2xl border bg-white"
            >
                <div
                    ref="contentRef"
                    class="flex flex-col gap-8 overflow-auto p-6"
                >
                    <div class="flex items-center justify-between">
                        <BaseText
                            v-if="title"
                            :text="title"
                            :tone="900"
                            color="neutral"
                            font="semibold"
                            type="p-lg"
                        />
                        <slot name="title" />
                        <BaseButtonIcon
                            v-if="closeButton"
                            circle
                            color="neutral"
                            icon="clear"
                            size="xs"
                            variant="outline"
                            @on-click="emit('onClose')"
                        />
                    </div>
                    <slot />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import BaseText from '@/components/base/text/BaseText.vue'
import BaseButtonIcon from '@/components/base/button/BaseButtonIcon.vue'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { keepElementInViewport } from '@/services/viewPort'
import { useModalStore } from '../../../stores/modal'

const props = withDefaults(
    defineProps<{
        size?: 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
        title?: string
        closeButton?: boolean
        height?: 'full'
        backdrop?: boolean
        relativeTo?: any
        modalStoreId?: string
    }>(),
    {
        size: 'md',
        title: undefined,
        height: undefined,
        backdrop: true,
        relativeTo: undefined,
        modalStoreId: undefined,
    }
)

const emit = defineEmits(['onClose', 'onBackgroundClick'])

const modalStore = useModalStore(props.modalStoreId)()

const modalRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>()
const contentRect = ref<DOMRect | null>(null)
let resizeObserver: ResizeObserver | null = null

const onBackgroundClick = (event) => {
    if (!props.backdrop) {
        if (
            event.target !== modalRef.value &&
            !modalRef.value?.contains(event.target)
        ) {
            emit('onBackgroundClick')
        }
    }
}

onMounted(async () => {
    await nextTick(async () => {
        modalStore.isModalOpen = true
        await handleRelativeTo()

        if (contentRef.value) {
            resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    contentRect.value = entry.contentRect
                }
            })
            resizeObserver.observe(contentRef.value)
        }
    })
})

const handleRelativeTo = async (): Promise<void> => {
    await nextTick(() => {
        if (props.relativeTo) {
            const relativeToRect = props.relativeTo.getBoundingClientRect()
            if (modalRef.value) {
                modalRef.value.style.cssText = ''
                modalRef.value.style.top = `${relativeToRect.top + 20}px`
                modalRef.value.style.left = `${relativeToRect.left + relativeToRect.width / 2}px`
                modalRef.value = keepElementInViewport(modalRef.value)
            }
        }
    })
}

watch(contentRect, async () => {
    await handleRelativeTo()
})

onBeforeUnmount(() => {
    modalStore.isModalOpen = false

    if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
    }
})
</script>
