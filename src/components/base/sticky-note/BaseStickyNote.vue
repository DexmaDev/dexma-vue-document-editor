<template>
    <BaseCard
        :background-color="backgroundColor"
        :background-tone="backgroundTone"
        :class="{
            'shadow-xl w-full flex flex-row gap-4': true,
            'min-h-52': !readonly,
        }"
    >
        <div class="w-full h-full flex gap-2 grow">
            <BaseInput
                v-if="!readonly"
                :model-value="value"
                color="secondary"
                font="bold"
                class=""
                type="textArea"
                @update:model-value="($event) => (value = $event)"
            />

            <BaseText
                v-else
                :text="modelValue"
                color="primary"
                font="bold"
                type="p-sm"
                class="w-full h-full"
            />

            <slot />
        </div>
        <div class="flex items-center justify-between">
            <div class="flex flex-col gap-2">
                <div v-if="date" class="flex flex-row gap-2 items-center">
                    <BaseIcon name="calendar1" size="sm" color="secondary" />
                    <BaseText
                        :text="formattedDate"
                        color="neutral"
                        font="bold"
                        type="p-sm"
                    />
                </div>
                <div v-if="author" class="flex flex-row gap-2 items-center">
                    <BaseIcon name="user" size="sm" color="secondary" />
                    <BaseText
                        :text="author"
                        color="neutral"
                        font="bold"
                        type="p-sm"
                    />
                </div>
            </div>

            <div v-if="!readonly" class="flex flex-row">
                <BaseButtonIcon
                    color="success"
                    icon="check-big"
                    size="md"
                    variant="blank"
                    @on-click="emits('onUpdate', value)"
                />

                <BaseButtonIcon
                    v-if="showDelete"
                    color="error"
                    icon="delete"
                    size="md"
                    variant="blank"
                    @on-click="deleteModalVisible = true"
                />
            </div>
        </div>
    </BaseCard>

    <BaseConfirmDeleteModal
        v-if="deleteModalVisible"
        @on-confirm="emits('onDelete')"
        @on-cancel="deleteModalVisible = false"
        @on-close="deleteModalVisible = false"
    />
</template>

<script lang="ts" setup>
import { PrimaryColors, Tones } from '@/types/styles'
import BaseCard from '../card/BaseCard.vue'
import BaseIcon from '../icon/BaseIcon.vue'
import BaseText from '../text/BaseText.vue'
import { computed, ref } from 'vue'
import { utcToLocalDate } from '@/services/utils'
import BaseInput from '../input/BaseInput.vue'
import BaseButtonIcon from '../button/BaseButtonIcon.vue'
import BaseConfirmDeleteModal from '@/components/modals/actions/BaseConfirmDeleteModal.vue'

const deleteModalVisible = ref<boolean>(false)

const props = withDefaults(
    defineProps<{
        modelValue?: any
        author?: string
        date?: Date | string
        backgroundColor?: PrimaryColors | 'white'
        backgroundTone?: Tones
        readonly?: boolean
        class?: string
        showDelete?: boolean
    }>(),
    {
        modelValue: undefined,
        author: undefined,
        date: undefined,
        backgroundColor: 'white',
        backgroundTone: 500,
        readonly: false,
        class: '',
        showDelete: true,
    }
)
const formattedDate = computed(() => {
    return props.date ? utcToLocalDate(props.date)! : ''
})
const value = ref(props.modelValue)

const emits = defineEmits(['update:modelValue', 'onDelete', 'onUpdate'])
</script>

<style scoped></style>
