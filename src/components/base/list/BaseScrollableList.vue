<template>
    <ul
        v-show="isVisible && suggestions.length"
        id="baseScrollableList"
        ref="scrollableList"
        class="w-full list-none m-0 bg-white border border-neutral-300 max-h-36 overflow-y-auto z-10 rounded-lg p-list"
        tabindex="-1"
    >
        <li
            v-for="(suggestion, index) in suggestions"
            :key="index"
            :class="{
                'vs__dropdown-option--highlight cursor-pointer':
                    index === activeIndex,
            }"
            class="p-list-element"
            @click="selectSuggestion(suggestion)"
            @mouseenter="activeIndex = index"
        >
            <BaseText
                :text="
                    suggestionLabel ? suggestion[suggestionLabel] : suggestion
                "
                :color="index === activeIndex ? 'white' : undefined"
            />
        </li>

        <li
            v-show="
                page !== undefined &&
                links !== undefined &&
                (page || 1) < (links?.length || 0) - 2 &&
                infiniteScroll
            "
            ref="loadRef"
            class="loader text-center"
        >
            {{ t('global.loading') }}
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseText from '@/components/base/text/BaseText.vue'
import { t } from '@/services/i18n'

const props = withDefaults(
    defineProps<{
        suggestions?: any[]
        isVisible: boolean
        suggestionLabel?: string
        infiniteScroll?: boolean
        links?: any[] | undefined
        page?: number | undefined
    }>(),
    {
        suggestions: () => [],
        isVisible: false,
        suggestionLabel: undefined,
        infiniteScroll: false,
        links: undefined,
        page: undefined,
    }
)

const emit = defineEmits(['select', 'onScroll'])
const activeIndex = ref<number | undefined>()
const scrollableList = ref()

const loadRef = ref()
const observer = ref()
const ulRef = ref()
const oldScrollTop = ref(0)

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
})

watch(
    () => props.isVisible,
    () => {
        if (!props.isVisible) {
            activeIndex.value = undefined
        }
    }
)

const selectSuggestion = (suggestion: any) => {
    emit('select', suggestion)
}

const handleKeyDown = (event: KeyboardEvent) => {
    if (props.isVisible) {
        let changed = false

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                if (activeIndex.value === undefined) {
                    activeIndex.value = -1
                }
                if (activeIndex.value < props.suggestions.length - 1) {
                    activeIndex.value++
                    changed = true
                }
                break
            case 'ArrowUp':
                event.preventDefault()
                if (activeIndex.value === undefined) {
                    activeIndex.value = -1
                }
                if (activeIndex.value > 0) {
                    activeIndex.value--
                    changed = true
                }
                break
            case 'Enter':
                event.preventDefault()
                if (activeIndex.value === undefined) {
                    activeIndex.value = -1
                }
                if (
                    props.suggestions[activeIndex.value] &&
                    props.isVisible &&
                    props.suggestions.length
                ) {
                    selectSuggestion(props.suggestions[activeIndex.value] || '')
                }
                break
            case 'Tab':
                if (activeIndex.value === undefined) {
                    activeIndex.value = -1
                }
                if (
                    props.suggestions[activeIndex.value] &&
                    props.isVisible &&
                    props.suggestions.length
                ) {
                    selectSuggestion(props.suggestions[activeIndex.value] || '')
                }
                break
        }

        if (changed) {
            nextTick(() => {
                if (activeIndex.value) {
                    const activeElement =
                        scrollableList.value?.children[activeIndex.value]
                    if (activeElement) {
                        activeElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                        })
                    }
                }
            })
        }
    }
}

const checkVisibility = async (entries: any[]) => {
    const entry = entries[0]
    if (entry.isIntersecting) {
        if (ulRef.value !== entry.target.offsetParent) {
            ulRef.value = entry.target.offsetParent
        }
        oldScrollTop.value = entry.target.offsetParent?.scrollTop
        emit('onScroll')
    }
}

watch(
    () => loadRef.value,
    (newValue, oldValue) => {
        if (newValue !== oldValue) {
            if (loadRef.value) {
                observer.value = new IntersectionObserver(checkVisibility, {
                    threshold: 1.0,
                })
                observer.value.observe(loadRef.value)
            }
        }
    }
)

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)

    if (observer.value) {
        observer.value.disconnect()
    }
})
</script>

<style scoped>
.p-list-element {
    padding: 3px 20px;
}

.p-list {
    padding: 5px 0;
}
</style>
