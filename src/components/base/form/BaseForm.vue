<template>
    <form
        ref="formRef"
        class="flex flex-col w-full gap-2.5 justify-center bg-white p-2"
        :data-prevent-data-lost="preventDataLost"
        @submit.prevent="handleSubmit"
        @keydown.enter="handleEnterKey"
        @change="handleInputsChange"
        @input="handleInputsChange"
    >
        <div ref="formBodyRef">
            <slot />
        </div>

        <slot name="buttons" />
        <div
            v-if="!hideButtons && !$slots['buttons']"
            class="sticky bottom-1 flex justify-end gap-3 z-10"
        >
            <div>
                <BaseButton
                    v-if="!hideCancelButton"
                    :text="cancelButtonText"
                    color="neutral"
                    size="xs"
                    @click="emit('onCancel')"
                />
            </div>
            <div>
                <BaseButton
                    v-if="canConfirm"
                    :text="confirmButtonText"
                    :disabled="disableConfirm"
                    color="secondary"
                    size="xs"
                    type="submit"
                />
            </div>
            <slot name="additional-button" />
        </div>
    </form>

    <BaseConfirmModal
        v-if="formStore.showConfirmModal"
        :title="t('pages.base.confirmModal.title')"
        :text="t('pages.base.confirmModal.text')"
        @on-close="formStore.showConfirmModal = false"
        @on-cancel="formStore.showConfirmModal = false"
        @on-confirm="handleConfirmNavigarionPrevent"
    />
</template>
<script setup lang="ts">
import { t } from '@/services/i18n'
import BaseButton from '../button/BaseButton.vue'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { getFocusableElements } from '@/services/viewPort'
import { useFormStore } from '@/stores/form'
import BaseConfirmModal from '@/components/modals/actions/BaseConfirmModal.vue'
import { RouteLocationNormalized, useRouter } from 'vue-router'

const emit = defineEmits(['submit', 'onCancel'])

const props = withDefaults(
    defineProps<{
        disableConfirm?: boolean
        hideButtons?: boolean
        canConfirm?: boolean
        confirmButtonText?: string
        cancelButtonText?: string
        preventDataLost?: boolean
        hideCancelButton?: boolean
        disableFocusFirstElement?: boolean
    }>(),
    {
        disableConfirm: undefined,
        hideButtons: undefined,
        canConfirm: true,
        confirmButtonText: t('global.confirm'),
        cancelButtonText: t('global.cancel'),
        preventDataLost: undefined,
        hideCancelButton: undefined,
        disableFocusFirstElement: undefined,
    }
)

const formStore = useFormStore()
const router = useRouter()

const formRef = ref<HTMLElement>()
const formBodyRef = ref<HTMLElement>()
const routeGuard = ref<(() => void) | null>()

onMounted(async () => {
    formStore.resetState()

    await nextTick(async () => {
        await focusFirstElement()

        if (props.preventDataLost) {
            routeGuard.value = router.beforeEach(
                (to: RouteLocationNormalized) => {
                    if (formStore.dirty && !formStore.confirm) {
                        formStore.showConfirmModal = true
                        formStore.routeIntentTo = to
                        return false
                    }

                    if (formStore.confirm) {
                        formStore.confirm = false
                    }
                    return true
                }
            )
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
    })
})

const handleSubmit = (): void => {
    formStore.confirmAndReset()
    emit('submit')
}

const handleEnterKey = (event: KeyboardEvent): void => {
    ;(event?.target as HTMLElement)?.click()
    event.preventDefault()
}

const focusFirstElement = async (): Promise<void> => {
    if (!props.disableFocusFirstElement) {
        await nextTick(() => {
            requestAnimationFrame(() => {
                if (formBodyRef.value) {
                    const focusableElements = getFocusableElements(
                        formBodyRef.value
                    )
                    if (focusableElements.length > 0) {
                        focusableElements[0].focus()
                    }
                }
            })
        })
    }
}

const handleConfirmNavigarionPrevent = async (): Promise<void> => {
    formStore.showConfirmModal = false

    const routeIntentTo = formStore.routeIntentTo
    formStore.confirmAndReset()

    await router.push({
        name: routeIntentTo?.name,
        params: routeIntentTo?.params,
    })
}

const handleBeforeUnload = (e: BeforeUnloadEvent): string | void => {
    if (formStore.dirty && !formStore.confirm) {
        e.preventDefault()
        return t('pages.base.confirmModal.text')
    }
}

const handleInputsChange = () => {
    if (props.preventDataLost) {
        formStore.dirty = true
    }
}

defineExpose({ focusFirstElement })

onUnmounted(() => {
    if (routeGuard.value) {
        routeGuard.value()
    }

    formStore.resetState()

    window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>
