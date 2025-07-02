<template>
    <div class="w-full">
        <div class="w-full flex">
            <BaseText
                v-if="label"
                :text="label"
                :tone="700"
                color="neutral"
                font="bold"
                type="p-sm"
            />

            <div v-if="$slots.labelActionSection" class="ml-auto">
                <slot name="labelActionSection" />
            </div>
        </div>

        <div class="flex w-full items-center gap-4 mb-1 mt-1.5">
            <slot name="leftContent" />

            <v-select
                ref="selectRef"
                :calculate-position="withPopper"
                :class="{
                    'default-select': (status ?? 'default') == 'default',
                    'error-select': (status ?? 'default') == 'error',
                }"
                :clearable="clearable"
                :disabled="disabled"
                :filterable="filterable"
                :label="optionLabel ?? 'label'"
                :map-keydown="handleKeyDown"
                :model-value="modelValue"
                :multiple="multiple"
                :name="name"
                :no-drop="noDrop"
                :options="options"
                :placeholder="placeholder"
                :reduce="onReduce"
                :searchable="searchable"
                :selectable="
                    () => (selectable ? modelValue?.length < selectable : true)
                "
                append-to-body
                :get-option-key="
                    optionKey
                        ? (option: any) => {
                              return option[optionKey]
                          }
                        : undefined
                "
                class="w-full"
                @search="updateSearchQuery"
                @update:model-value="setValue"
                @option:deselecting="deselectValue"
                @search:focus="emit('onFocus')"
            >
                <template #option="option">
                    <slot name="option" v-bind="Object(option)" />
                </template>
                <template #selected-option="option">
                    <slot name="selected-option" v-bind="Object(option)" />
                </template>
                <template #no-options="{ search }">
                    <div
                        v-if="showAddOptionButton && !$slots['no-options']"
                        class="px-3 text-center w-fit mx-auto"
                    >
                        <BaseButton
                            :text="t('global.add') + ' ' + search"
                            color="neutral"
                            size="xs"
                            type="button"
                            @click="handleNoOptions(search)"
                        />
                    </div>

                    <div
                        v-else-if="!$slots['no-options']"
                        class="px-3 py-2 text-center"
                    >
                        <BaseText :text="t('global.noOptions')" />
                    </div>

                    <slot v-if="$slots['no-options']" name="no-options" />
                </template>

                <template #list-footer>
                    <div
                        v-if="
                            page !== undefined &&
                            links !== undefined &&
                            links?.length > 3 &&
                            showPaginationButtons
                        "
                        class="pagination"
                    >
                        <BaseButtonIcon
                            :disabled="(page || 1) <= 1"
                            icon="arrow-left"
                            size="xs"
                            type="button"
                            variant="outline"
                            @click="emit('onPrevPage')"
                        />

                        <BaseButtonIcon
                            :disabled="(page || 1) >= (links?.length || 0) - 2"
                            color="primary"
                            icon="arrow-right"
                            size="xs"
                            type="button"
                            variant="outline"
                            @click="emit('onNextPage')"
                        />
                    </div>

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
                </template>
            </v-select>
            <slot name="rightContent" />
        </div>
        <div v-if="Array.isArray(hintMessage)">
            <BaseText
                v-for="(message, i) in hintMessage"
                :key="`hint-message-${i}`"
                :color="
                    status == 'error'
                        ? 'error'
                        : status == 'success'
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
                    status == 'error'
                        ? 'error'
                        : status == 'success'
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
import VSelect from 'vue-select'
import BaseText from '../text/BaseText.vue'
import { createPopper } from '@popperjs/core'
import BaseButton from '@/components/base/button/BaseButton.vue'
import { t } from '@/services/i18n'
import { nextTick, onUnmounted, ref, watch } from 'vue'
import BaseButtonIcon from '@/components/base/button/BaseButtonIcon.vue'
import { handleEmitChangeToForm } from '@/services/utils'

const props = withDefaults(
    defineProps<{
        label?: string
        optionLabel?: string
        multiple?: boolean
        placeholder?: string
        clearable?: boolean
        disabled?: boolean
        reduce?: string
        modelValue: any
        name?: string
        options: any[]
        hintMessage?: string | string[]
        status?: 'default' | 'error' | 'success'
        showAddOptionButton?: boolean
        noDrop?: boolean
        filterable?: boolean
        links?: any[] | undefined
        page?: number | undefined
        showPaginationButtons?: boolean
        infiniteScroll?: boolean
        selectable?: number
        searchable?: boolean
        optionKey?: string
    }>(),
    {
        label: undefined,
        optionLabel: undefined,
        multiple: false,
        placeholder: undefined,
        clearable: true,
        disabled: false,
        reduce: undefined,
        name: undefined,
        options: () => [],
        hintMessage: undefined,
        status: undefined,
        showAddOptionButton: false,
        noDrop: false,
        filterable: true,
        links: undefined,
        page: undefined,
        showPaginationButtons: false,
        infiniteScroll: false,
        selectable: undefined,
        searchable: true,
        optionKey: undefined,
    }
)

const emit = defineEmits([
    'update:modelValue',
    'add:newOption',
    'onSearch',
    'onNextPage',
    'onPrevPage',
    'onScroll',
    'option:deselecting',
    'change',
    'onFocus',
])

const selectRef = ref()
const loadRef = ref()
const observer = ref()

const ulRef = ref()
const oldScrollTop = ref(0)

watch(
    () => props.options.length,
    async (newValue, oldValue) => {
        await nextTick(async () => {
            if (newValue !== oldValue && ulRef.value) {
                ulRef.value.scrollTop = oldScrollTop.value
            }
        })
    }
)

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

const updateSearchQuery = (query) => {
    emit('onSearch', query)
}

const setValue = (value: any) => {
    emit('update:modelValue', value)
    handleEmitChangeToForm(selectRef.value?.$el)
}

const onReduce = (value) => {
    if (props.reduce) {
        return value[props.reduce]
    } else {
        return value
    }
}

const withPopper = (dropdownList, component, { width }) => {
    dropdownList.style.width = width

    const popper = createPopper(component.$refs.toggle, dropdownList, {
        placement: 'bottom',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, -1],
                },
            },
            {
                name: 'toggleClass',
                enabled: true,
                phase: 'write',
                fn({ state }) {
                    component.$el.classList.toggle(
                        'onDrop-up',
                        state.placement === 'top'
                    )
                },
            },
        ],
    })

    return () => popper.destroy()
}

const handleNoOptions = (search: string) => {
    emit('add:newOption', search)
    selectRef.value.search = ''
    selectRef.value.open = false
}

const handleTab = (vm) => ({
    9: () => {
        vm.typeAheadSelect()
    },
})

const handleKeyDown = (map, vm) => {
    return {
        ...map,
        ...handleTab(vm),
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

const deselectValue = (value) => {
    emit('option:deselecting', value)
}

onUnmounted(() => {
    if (observer.value) {
        observer.value.disconnect()
    }
})
</script>
<style>
.default-select .vs__dropdown-toggle {
    @apply w-full rounded-lg border border-neutral-300 py-1  text-base text-neutral-900 transition-all duration-300 focus:ring-2 disabled:bg-neutral-50 disabled:text-neutral-500;
}

.error-select .vs__dropdown-toggle {
    @apply w-full rounded-lg border  border-error-300  py-1 text-base text-neutral-900 transition-all  duration-300 focus:border-error-400 focus:ring-2 focus:ring-error-200 disabled:border-neutral-300 disabled:bg-neutral-50 disabled:text-neutral-500;
}

.pagination {
    @apply flex m-1 mt-2;
}

.pagination button {
    @apply flex-grow;
}

.pagination button:hover {
    @apply cursor-pointer;
}
</style>
