<template>
    <div ref="dropdownContainerRef" class="w-full relative">
        <BaseInput
            :autocomplete="false"
            :disabled="disabled"
            :hint-message="hintMessage"
            :icon-clickable="iconClickable"
            :icon-name="iconName"
            :id-name="idName"
            :label="label"
            :model-value="modelValue"
            :name="name"
            :placeholder="placeholder"
            :required="required"
            :status="status"
            :type="type"
            :value="value"
            :is-on-focus="isOnFocus"
            @update:model-value="setValue"
            @on-focus-out="hideSuggestions"
            @on-focus="handleSuggestionVisible"
        />
        <BaseScrollableList
            ref="dropdownRef"
            :is-visible="isSuggestionsVisible"
            :suggestions="filterable ? filteredSuggestions : suggestions"
            :suggestion-label="suggestionLabel"
            :links="links"
            :page="page"
            :infinite-scroll="infiniteScroll"
            @select="handleSelect"
            @on-scroll="handleOnScroll"
        />
    </div>
</template>

<script lang="ts" setup>
import BaseInput from '@/components/base/input/BaseInput.vue'
import { Icons } from '@/types/styles'
import BaseScrollableList from '@/components/base/list/BaseScrollableList.vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
    defineProps<{
        idName?: string
        placeholder?: string
        value?: any
        name?: string
        required?: boolean
        label?: string
        modelValue?: any
        disabled?: boolean
        hintMessage?: string | string[]
        iconClickable?: boolean
        iconName?: Icons
        type: 'text' | 'number' | 'email' | 'password' | 'hidden' | 'textArea'
        status?: 'default' | 'error' | 'success'
        suggestions?: any[]
        suggestionLabel?: string
        reduce?: string
        filterable?: boolean
        infiniteScroll?: boolean
        links?: any[] | undefined
        page?: number | undefined
        isOnFocus?: boolean
        left?: number
        top?: number
    }>(),
    {
        idName: undefined,
        placeholder: undefined,
        value: undefined,
        name: undefined,
        required: undefined,
        label: undefined,
        modelValue: undefined,
        disabled: undefined,
        hintMessage: undefined,
        iconClickable: undefined,
        iconName: undefined,
        type: 'text',
        status: undefined,
        suggestions: undefined,
        suggestionLabel: undefined,
        reduce: undefined,
        filterable: true,
        infiniteScroll: undefined,
        links: undefined,
        page: undefined,
        left: undefined,
        top: undefined,
    }
)

const emit = defineEmits([
    'update:modelValue',
    'onClickIcon',
    'onInput',
    'onScroll',
    'onSearch',
    'selectSuggestion',
])
const isSuggestionsVisible = ref<boolean>(false)
const dropdownContainerRef = ref<HTMLElement>()
const dropdownRef = ref<InstanceType<typeof BaseScrollableList>>()
const filteredSuggestions = ref<Array<string | undefined>>()
const isClickInsideDropdown = ref<boolean>(false)

onMounted(() => {
    filteredSuggestions.value = props.suggestions
    window.addEventListener('keydown', handleEscapeKey)
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', updateScrollableListPosition)
    updateScrollableListPosition()
})

watch(
    () => props.modelValue,
    (newValue) => {
        if (props.filterable) {
            if (!newValue) {
                filteredSuggestions.value = props.suggestions
                return
            }
            const searchKeywords = newValue.toLowerCase().split(/\s+/)
            filteredSuggestions.value = props.suggestions?.filter(
                (suggestion) => {
                    let suggestionLower: string
                    if (props.suggestionLabel) {
                        suggestionLower =
                            suggestion[props.suggestionLabel]?.toLowerCase()
                    } else {
                        suggestionLower = suggestion?.toLowerCase()
                    }

                    return searchKeywords.every((keyword: string) =>
                        suggestionLower?.includes(keyword)
                    )
                }
            )
        } else {
            emit('onSearch', props.modelValue)
        }
    }
)

const handleSuggestionVisible = () => {
    isSuggestionsVisible.value = true
    updateScrollableListPosition()
}

const setValue = (value: string) => {
    emit('update:modelValue', value)
    isSuggestionsVisible.value = true
}

const handleSelect = (suggestion: any) => {
    if (props.reduce) {
        emit('update:modelValue', suggestion[props.reduce])
    } else {
        emit('update:modelValue', suggestion)
    }
    emit('selectSuggestion', suggestion)
    isSuggestionsVisible.value = false
}

const hideSuggestions = () => {
    setTimeout(() => {
        if (!isClickInsideDropdown.value) {
            isSuggestionsVisible.value = false
        }
        isClickInsideDropdown.value = false
    }, 200)
}

const handleOnScroll = () => {
    emit('onScroll')
}

const handleEscapeKey = (event: KeyboardEvent) => {
    if (
        dropdownContainerRef.value &&
        dropdownContainerRef.value.contains(document.activeElement)
    ) {
        switch (event.key) {
            case 'Escape':
                event.preventDefault()
                isSuggestionsVisible.value = false
                break
            case 'Enter':
                event.preventDefault()
                if (!isSuggestionsVisible.value && !props.modelValue) {
                    isSuggestionsVisible.value = true
                }
                break
        }
    }
}

const handleClickOutside = (event: MouseEvent) => {
    const dropdownContainer = dropdownContainerRef.value
    const dropdownComponent = dropdownRef.value
    const dropdownElement = dropdownComponent?.$el

    if (dropdownContainer && dropdownContainer.contains(event.target as Node)) {
        isClickInsideDropdown.value = true
    } else if (
        dropdownElement &&
        dropdownElement.contains(event.target as Node)
    ) {
        isClickInsideDropdown.value = true
    } else {
        isSuggestionsVisible.value = false
    }
}

const updateScrollableListPosition = () => {
    if (dropdownContainerRef.value && dropdownRef.value?.$el) {
        const inputRect = dropdownContainerRef.value.getBoundingClientRect()
        dropdownRef.value.$el.style.position = 'fixed'
        dropdownRef.value.$el.style.top =
            props.top !== undefined ? `${props.top}px` : `${inputRect.bottom}px`
        dropdownRef.value.$el.style.left =
            props.left !== undefined ? `${props.left}px` : `${inputRect.left}px`
        dropdownRef.value.$el.style.width = `${inputRect.width}px`
    }
}

onUnmounted(() => {
    window.removeEventListener('keydown', handleEscapeKey)
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', updateScrollableListPosition)
})
</script>
