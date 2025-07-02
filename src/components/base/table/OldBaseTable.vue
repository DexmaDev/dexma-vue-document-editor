<template>
    <div
        ref="baseTableContainer"
        :class="{
            'h-full': fullHeight,
            'h-max': !fullHeight,
        }"
        :tabindex="tabindex || 1"
        class="flex flex-col w-full gap-2 rounded-md bg-white py-2 px-3 base-table focus:outline-secondary-50"
        @keydown.arrow-down="onArrowDown"
        @keydown.arrow-up="onArrowUp"
        @click.self="onClick"
    >
        <div
            ref="baseTableTitleContainer"
            class="flex w-full items-center justify-between text-nowrap"
        >
            <div class="flex flex-col w-full lg:flex-row gap-2 items-center">
                <BaseIcon v-if="headerIcon" :name="headerIcon" size="md" />
                <BaseText
                    v-if="title"
                    :text="title"
                    :tone="900"
                    color="neutral"
                    font="semibold"
                    type="p-md"
                />
                <BaseTableSearch
                    v-if="searchable"
                    :model-value="searchValue"
                    :placeholder="t('global.search')"
                    icon-name="search"
                    type="text"
                    @update:model-value="onSearch"
                />
                <slot name="headerTitle" />
            </div>
            <div class="flex items-center justify-center gap-1 lg:justify-end">
                <slot name="headerActions" />
                <div v-if="filters" class="flex w-auto">
                    <BaseButtonIcon
                        color="neutral"
                        icon="filter"
                        variant="outline"
                    />
                </div>
            </div>
        </div>
        <BaseTableSkeleton v-if="loading" pulse />
        <div
            v-else
            :class="{
                'h-full': fullHeight,
            }"
            class="flex w-full flex-col rounded-xl border-t border-neutral-200 bg-white"
        >
            <div
                ref="tableContainer"
                :class="{
                    'overflow-y-auto h-full': fullHeight && data.length > 0,
                    'overflow-y-hidden':
                        overflowHidden || !fullHeight || data.length == 0,
                }"
                :style="{ minHeight: `${tableHeaderMinHeight}px` }"
                class="w-full rounded-tl-xl rounded-tr-xl border-r border-l border-neutral-200 overflow-x-auto"
            >
                <table class="w-full divide-y divide-neutral-200">
                    <thead ref="tableHeader" class="bg-neutral-100">
                        <tr>
                            <th
                                v-if="checkableRow"
                                class="pl-4 first:rounded-tl-xl last:rounded-tr-xl"
                            >
                                <BaseCheckbox
                                    :indeterminate="indeterminateCheck()"
                                    :model-value="checkedAllElements()"
                                    @update:model-value="onSetCheckAll"
                                />
                            </th>
                            <th
                                v-for="(column, i) in columns.filter(
                                    (column) => column.show
                                )"
                                :key="`column-header-${i}`"
                                class="p-2 first:rounded-tl-xl last:rounded-tr-xl"
                            >
                                <div class="flex w-full items-center gap-1">
                                    <slot
                                        v-if="
                                            column.title &&
                                            slots[`title-${column.title}`]
                                        "
                                        :name="`title-${column.title}`"
                                    />
                                    <BaseText
                                        v-else-if="column.title"
                                        :text="column.title"
                                        :tone="800"
                                        color="neutral"
                                        font="semibold"
                                        type="p-sm"
                                    />
                                    <BaseButtonIcon
                                        v-if="column.helper"
                                        color="neutral"
                                        icon="help"
                                        size="xs"
                                        variant="blank"
                                    />
                                    <BaseButtonIcon
                                        v-if="column.sortable && !disableSort"
                                        color="neutral"
                                        icon="arrow-vertical"
                                        size="xs"
                                        type="button"
                                        variant="blank"
                                        @click="onSortClick(column.label)"
                                    />
                                </div>
                            </th>
                            <th v-if="hasActions" />
                        </tr>
                    </thead>
                    <tbody
                        v-if="data.length > 0"
                        class="divide-y divide-neutral-200 text-nowrap"
                    >
                        <BaseRow
                            v-for="(row, i) in data"
                            :key="`row-item-${i}`"
                            :checkable-row="checkableRow"
                            :checked-data="checkedData"
                            :clickable-row="clickableRow"
                            :columns="columns"
                            :data="data"
                            :draggable="draggableRows"
                            :has-actions="hasActions"
                            :is-dragging="isDragging"
                            :row="row"
                            :selected-row-id="selectedRowId"
                            :selected-row-id-type="selectedRowIdType"
                            :tabindex="i"
                            @dragover="(event) => onDragOver(event, row)"
                            @dragstart="(event) => onDragStart(event, row)"
                            @drop="(event) => onDrop(event)"
                            @on-row-click="
                                (row) => {
                                    emit('onRowClick', row)
                                }
                            "
                            @on-check-row="
                                (row, checked) => {
                                    onCheckData(row, checked)
                                }
                            "
                            @on-row-double-click="emit('onRowDoubleClick', row)"
                        >
                            <template
                                v-for="(slot, name) in $slots"
                                #[name]="slotProps"
                            >
                                <slot :name="name" v-bind="slotProps" />
                            </template>
                        </BaseRow>
                    </tbody>
                </table>
            </div>
            <div
                v-if="data.length === 0"
                class="flex h-full min-h-[12rem] w-full items-center justify-center border-t border-r border-l border-neutral-200"
            >
                <BaseText
                    :text="t('global.emptyElement')"
                    :tone="100"
                    color="primary"
                    font="semibold"
                    type="subtitle"
                />
            </div>

            <div
                ref="stickyContainer"
                :class="{
                    'sticky bottom-0': fullHeight,
                }"
                class="w-full bg-white rounded-bl-xl rounded-br-xl border-b border-r border-l border-neutral-200"
            >
                <div
                    v-if="slots[`info-section`] && !hideInfo"
                    class="border-t p-3 flex gap-1 items-center overflow-auto"
                >
                    <slot :name="`info-section`" />
                </div>

                <div
                    v-else-if="
                        columns.filter((columnQuery) => columnQuery.isInfo)
                            .length &&
                        selectedRowId &&
                        data.length > 0 &&
                        !hideInfo
                    "
                    class="border-t p-3 flex gap-1 items-center overflow-auto"
                >
                    <div
                        v-for="(tableInfoColumn, i) in columns.filter(
                            (columnQuery) => columnQuery.isInfo
                        )"
                        :key="`tableInfoColumn-${i}`"
                        class="flex text-nowrap"
                    >
                        <slot
                            v-if="slots[`info-${tableInfoColumn.label}`]"
                            :name="`info-${tableInfoColumn.label}`"
                            v-bind="{
                                [tableInfoColumn.label]: data.find(
                                    (dataQuery) =>
                                        dataQuery[selectedRowIdType ?? 'id'] ===
                                        selectedRowId
                                )[tableInfoColumn.label],
                                data,
                            }"
                        />
                        <div
                            v-else-if="
                                tableInfoColumn.relation == 'multiple' &&
                                tableInfoColumn.reduce
                            "
                            class="flex gap-1"
                        >
                            <BaseText
                                v-for="(relation, j) in data.find(
                                    (dataQuery) =>
                                        dataQuery[selectedRowIdType ?? 'id'] ===
                                        selectedRowId
                                )[tableInfoColumn.label]"
                                :key="`relation-${j}`"
                                :text="
                                    tableInfoColumn.translationElement
                                        ? t(
                                              tableInfoColumn.translationElement +
                                                  relation[
                                                      tableInfoColumn.reduce
                                                  ]
                                          )
                                        : relation[tableInfoColumn.reduce]
                                "
                                :tone="700"
                                color="neutral"
                                font="regular"
                                type="p-md"
                            />
                        </div>
                        <div
                            v-else-if="
                                tableInfoColumn.relation == 'single' &&
                                tableInfoColumn.reduce
                            "
                            class="flex gap-1"
                        >
                            <BaseText
                                :text="
                                    tableInfoColumn.translationElement
                                        ? t(
                                              tableInfoColumn.translationElement +
                                                  (data.find(
                                                      (dataQuery) =>
                                                          dataQuery[
                                                              selectedRowIdType ??
                                                                  'id'
                                                          ] === selectedRowId
                                                  )[tableInfoColumn.label] ||
                                                      {})[
                                                      tableInfoColumn.reduce
                                                  ]
                                          )
                                        : (data.find(
                                              (dataQuery) =>
                                                  dataQuery[
                                                      selectedRowIdType ?? 'id'
                                                  ] === selectedRowId
                                          )[tableInfoColumn.label] || {})[
                                              tableInfoColumn.reduce
                                          ]
                                "
                                :tone="700"
                                color="neutral"
                                font="regular"
                                type="p-md"
                            />
                        </div>
                        <BaseText
                            v-else
                            :text="
                                tableInfoColumn.translationElement
                                    ? findSelectedElement(
                                          data,
                                          selectedRowIdType,
                                          selectedRowId,
                                          tableInfoColumn
                                      ) !== ''
                                        ? t(
                                              tableInfoColumn.translationElement +
                                                  findSelectedElement(
                                                      data,
                                                      selectedRowIdType,
                                                      selectedRowId,
                                                      tableInfoColumn
                                                  )
                                          )
                                        : ''
                                    : findSelectedElement(
                                          data,
                                          selectedRowIdType,
                                          selectedRowId,
                                          tableInfoColumn
                                      )
                            "
                            :tone="700"
                            color="neutral"
                            font="regular"
                            type="p-md"
                        />
                        <BaseText
                            v-if="
                                i !==
                                columns.filter(
                                    (columnQuery) => columnQuery.isInfo
                                ).length -
                                    1
                            "
                            :tone="700"
                            color="neutral"
                            font="regular"
                            text=","
                            type="p-md"
                        />
                    </div>
                </div>

                <div v-if="links" class="w-full border-t">
                    <BasePagination
                        v-if="links"
                        :links="links"
                        @on-set-page="onSetPage"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Column from '@/types/column'
import BaseText from '../text/BaseText.vue'
import { nextTick, onMounted, onUnmounted, ref, useSlots, watch } from 'vue'
import BaseButtonIcon from '../button/BaseButtonIcon.vue'
import BasePagination from '../pagination/BasePagination.vue'
import { t } from '@/services/i18n'
import Pagination from '@/types/pagination'
import BaseCheckbox from '../input/BaseCheckbox.vue'
import BaseTableSearch from '../input/BaseTableSearch.vue'
import BaseIcon from '../icon/BaseIcon.vue'
import { Icons } from '@/types/styles'
import BaseTableSkeleton from '@/components/base/skeleton/BaseTableSkeleton.vue'
import BaseRow from '@/components/base/table/BaseRow.vue'
import { debounce } from '@/services/utils'

const props = withDefaults(
    defineProps<{
        title?: string
        columns: Column[]
        hideInfo?: boolean
        searchable?: boolean
        data: any[]
        filters?: boolean
        clickableRow?: boolean
        checkableRow?: boolean
        links?: Pagination['links']
        headerIcon?: Icons
        selectedRowId?: string | number
        selectedRowIdType?: string
        hasActions?: boolean
        loading?: boolean
        checkedData?: any[]
        draggableRows?: boolean
        disableSort?: boolean
        searchValue?: string
        fullHeight?: boolean
        overflowHidden?: boolean
        disableArrowNavigation?: boolean
        tabindex?: number
    }>(),
    {
        fullHeight: true,
    }
)

const emit = defineEmits([
    'onSort',
    'onRowClick',
    'onSetPage',
    'onSearch',
    'onCheckRow',
    'onRowReorder',
    'onRowDragStart',
    'onRowDragEnd',
    'onRowDoubleClick',
])

const slots = useSlots()

const checkedData = ref<any[]>([...(props.checkedData ?? [])])
const draggedRow = ref<any>(null)
const isDragging = ref<boolean>(false)
const tableContainer = ref<HTMLElement | null>()
const stickyContainer = ref<HTMLElement | null>()
const baseTableContainer = ref<HTMLElement | null>()
const baseTableTitleContainer = ref<HTMLElement | null>()
const tableHeader = ref<HTMLElement | null>(null)
const tableHeaderMinHeight = ref<number>(33)
const selectedRowId = ref(props.selectedRowId)

const isVisible = ref(false)

onMounted(async () => {
    await updateTableHeight()
    observeVisibility()

    window.addEventListener('resize', updateTableHeight)

    await focusTableIfSingleOnPage()
})

const focusTableIfSingleOnPage = async () => {
    await nextTick(() => {
        const baseTables = document.querySelectorAll(
            '.base-table'
        ) as unknown as HTMLDivElement[]

        if (baseTables.length === 1) {
            baseTableContainer.value?.focus()
        }
    })
}

const onCheckData = (row: any, checked: boolean) => {
    if (checked) {
        checkedData.value.push(row)
    } else {
        checkedData.value = checkedData.value.filter((element) => {
            return JSON.stringify(row) !== JSON.stringify(element)
        })
    }

    emit('onCheckRow', checkedData.value)
}

const onSetCheckAll = (checked: boolean) => {
    if (!checked) {
        checkedData.value = checkedData.value.filter((element) => {
            return !props.data.some(
                (propsDataElement) =>
                    JSON.stringify(propsDataElement) === JSON.stringify(element)
            )
        })
    } else {
        checkedData.value.push(...props.data)
    }
    emit('onCheckRow', checkedData.value)
}

const indeterminateCheck = () => {
    const hasAtLeastOne = props.data.some((dataElement) =>
        checkedData.value.some(
            (checkedElement) =>
                JSON.stringify(checkedElement) === JSON.stringify(dataElement)
        )
    )

    const notAllIncluded = props.data.some(
        (dataElement) =>
            !checkedData.value.some(
                (checkedElement) =>
                    JSON.stringify(checkedElement) ===
                    JSON.stringify(dataElement)
            )
    )

    return hasAtLeastOne && notAllIncluded && checkedData.value.length > 0
}

const checkedAllElements = () => {
    return (
        props.data.length > 0 &&
        checkedData.value.length > 0 &&
        props.data.every((dataElement) =>
            checkedData.value.some(
                (checkedElement) =>
                    JSON.stringify(checkedElement) ===
                    JSON.stringify(dataElement)
            )
        )
    )
}

watch(
    () => props.checkedData,
    () => {
        checkedData.value = [...(props.checkedData ?? [])]
    },
    {
        deep: true,
    }
)
const onSortClick = (label: Column['label']) => {
    if (!props.checkedData?.length) {
        checkedData.value = []
    }
    emit('onSort', label)
}

const onSetPage = (page: number) => {
    if (!props.checkedData?.length) {
        checkedData.value = []
    }
    emit('onSetPage', page)
}

const onSearch = debounce((search: string) => {
    if (!props.checkedData?.length) {
        checkedData.value = []
    }
    emit('onSearch', search)
}, 300)

const findSelectedElement = (
    data: any[],
    selectedRowIdType: string | undefined,
    selectedRowId: string | number,
    tableInfoColumn: any
) => {
    const element = data.find(
        (dataQuery) => dataQuery[selectedRowIdType ?? 'id'] === selectedRowId
    )
    return element ? element[tableInfoColumn.label] : ''
}

const onDragStart = (event: DragEvent, row: any) => {
    draggedRow.value = row
    isDragging.value = true
    event.dataTransfer!.effectAllowed = 'move'
    emit('onRowClick', row)
    emit('onRowDragStart')
}

const onDragOver = (event: DragEvent, row: any) => {
    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'

    const draggedRowIndex = props.data.indexOf(draggedRow.value)
    const overRowIndex = props.data.indexOf(row)

    if (
        draggedRowIndex !== -1 &&
        overRowIndex !== -1 &&
        draggedRowIndex !== overRowIndex
    ) {
        emit('onRowReorder', draggedRowIndex, overRowIndex)
    }
}

const onDrop = (event: DragEvent) => {
    event.preventDefault()
    draggedRow.value = null
    isDragging.value = false
    emit('onRowDragEnd')
}

const updateTableHeight = async () => {
    await nextTick(() => {
        if (
            stickyContainer.value &&
            baseTableContainer.value &&
            tableContainer.value &&
            baseTableTitleContainer.value &&
            !props.fullHeight
        ) {
            const availableHeight =
                baseTableContainer.value.offsetHeight -
                stickyContainer.value.offsetHeight -
                baseTableTitleContainer.value.offsetHeight

            tableContainer.value.style.maxHeight = `${availableHeight}px`
        }

        if (tableHeader.value?.offsetHeight) {
            tableHeaderMinHeight.value = tableHeader.value.offsetHeight
        } else {
            tableHeaderMinHeight.value = 33
        }
    })
}

const observeVisibility = () => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                isVisible.value = entry.isIntersecting
            })
        },
        {
            root: tableContainer.value,
            rootMargin: '0px',
            threshold: 1,
        }
    )
    if (baseTableContainer.value instanceof Element) {
        observer.observe(baseTableContainer.value)
    }
}

const onArrowDown = (event) => {
    if (props.disableArrowNavigation) {
        return
    }

    if (!props.data.length) {
        return
    }

    event?.preventDefault()
    event?.preventDefault()

    let currentOccurencyIndex = props.data.findIndex(
        (row) => row[props.selectedRowIdType ?? 'id'] === selectedRowId.value
    )
    const nextOccurrency = props.data[++currentOccurencyIndex]
    if (!nextOccurrency) {
        if (currentOccurencyIndex > props.data.length - 1) {
            currentOccurencyIndex = 0
            selectedRowId.value =
                props.data[currentOccurencyIndex][
                    props.selectedRowIdType ?? 'id'
                ]
        }

        return
    }

    selectedRowId.value = nextOccurrency[props.selectedRowIdType ?? 'id']
}

const onArrowUp = (event) => {
    if (props.disableArrowNavigation) {
        return
    }

    event?.stopPropagation()
    event?.preventDefault()

    let currentOccurencyIndex = props.data.findIndex(
        (row) => row[props.selectedRowIdType ?? 'id'] === selectedRowId.value
    )
    const nextOccurrency = props.data[--currentOccurencyIndex]
    if (!nextOccurrency) {
        if (currentOccurencyIndex < 0) {
            currentOccurencyIndex = props.data.length - 1
            selectedRowId.value =
                props.data[currentOccurencyIndex][
                    props.selectedRowIdType ?? 'id'
                ]
        }

        return
    }

    selectedRowId.value = nextOccurrency[props.selectedRowIdType ?? 'id']
}

const onClick = function (event) {
    event.stopPropagation()
    if (props.disableArrowNavigation) {
        return
    }

    if (
        event.target !== baseTableContainer.value ||
        event.target !== baseTableTitleContainer.value
    ) {
        return
    }

    baseTableContainer.value?.focus()
}

watch(
    () => isVisible.value,
    async (newValue) => {
        if (newValue) {
            await updateTableHeight()
        }
    }
)

watch(
    () => props.selectedRowId,
    async () => {
        selectedRowId.value = props.selectedRowId
    },
    { immediate: true }
)

onUnmounted(() => {
    window.removeEventListener('resize', updateTableHeight)
})
</script>
