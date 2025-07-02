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
            class="flex w-full items-center text-nowrap"
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
                <div class="flex items-center gap-2">
                    <div
                        v-if="!configsAreEqual"
                        class="flex items-center gap-2"
                    >
                        <BaseButtonIcon
                            :disabled="layoutStore.loadingSingle"
                            :tooltip="t('pages.customTable.saveConfiguration')"
                            color="success"
                            icon="check"
                            size="sm"
                            type="button"
                            variant="blank"
                            @on-click="onConfirmConfigTable"
                        />
                        <BaseButtonIcon
                            :disabled="layoutStore.loadingSingle"
                            :tooltip="
                                t('pages.customTable.cancelConfiguration')
                            "
                            color="error"
                            icon="clear"
                            size="sm"
                            type="button"
                            variant="blank"
                            @on-click="onCancelConfigTable"
                        />
                    </div>

                    <BaseDropdown v-if="layoutStore.pageTables[tableType]">
                        <template #button>
                            <BaseButtonIcon
                                :tooltip="t('pages.customTable.editColumns')"
                                color="neutral"
                                icon="layout-8"
                                size="sm"
                                type="button"
                                variant="blank"
                            />
                        </template>
                        <template #content>
                            <SlotEditShowColumns
                                :table-type="tableType"
                                :table-type-translations="tableTypeTranslations"
                                @on-update="onUpdateTableConfig"
                            />
                        </template>
                    </BaseDropdown>
                </div>

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
        <div
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
                class="w-full rounded-tl-xl rounded-tr-xl border-r border-l border-neutral-200 overflow-x-auto min-h-fit"
            >
                <table class="w-full divide-y divide-neutral-200">
                    <BaseTableHeaderSkeleton
                        v-if="loadingColums"
                        :colums="displayedColums.length || 4"
                    />
                    <thead v-else ref="tableHeader" class="bg-neutral-100">
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
                                v-for="(column, i) in computedColumns.filter(
                                    (column) => column.show
                                )"
                                :key="`column-header-${tableType}-${column.title}`"
                                :style="{
                                    minWidth: 'fit-content',
                                }"
                                class="p-2 first:rounded-tl-xl last:rounded-tr-xl"
                                :draggable="
                                    column.notDraggable ? false : isConfigurable
                                "
                                @dragover="onDragOverColumn($event)"
                                @dragstart="
                                    onDragStartColumn($event, column.index!)
                                "
                                @drop="onDropColumn($event, i)"
                            >
                                <div
                                    :ref="
                                        (el) => {
                                            if (
                                                !column.notResizable &&
                                                isConfigurable
                                            ) {
                                                setResizeDiv(
                                                    el as HTMLDivElement,
                                                    column.title
                                                )
                                            }
                                        }
                                    "
                                    :style="{
                                        width: column.width || 'unset',
                                        minWidth: 'fit-content',
                                    }"
                                    :class="{
                                        'resize-x sortable-column-header-container':
                                            !column.notResizable &&
                                            isConfigurable,
                                    }"
                                    class="flex items-center gap-4 overflow-x-auto whitespace-nowrap relative"
                                >
                                    <slot
                                        v-if="
                                            column.title &&
                                            slots[`title-${column.title}`]
                                        "
                                        :name="`title-${column.title}`"
                                    />
                                    <BaseText
                                        v-else-if="column.title && tableType"
                                        :text="
                                            t(
                                                `pages.customTable.columns.${tableTypeTranslations || tableType}.${column.title}`
                                            )
                                        "
                                        :tone="800"
                                        color="neutral"
                                        font="semibold"
                                        type="p-sm"
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
                                    <BaseButtonIcon
                                        v-if="column.filterable === true"
                                        :color="
                                            columnFilters[column.title!] &&
                                            columnFilters[column.title!]
                                                .value != null &&
                                            columnFilters[column.title!]
                                                .value !== ''
                                                ? 'error'
                                                : 'neutral'
                                        "
                                        class="relative right-2"
                                        :icon="
                                            columnFilters[column.title!] &&
                                            columnFilters[column.title!]
                                                .value != null &&
                                            columnFilters[column.title!]
                                                .value !== ''
                                                ? 'clear'
                                                : 'filter'
                                        "
                                        size="xs"
                                        variant="blank"
                                        @click="togglePopup(column)"
                                    />
                                </div>
                                <slot
                                    v-if="
                                        columnFilters[column.title!]?.visible &&
                                        slots[`filter-${column.title}`]
                                    "
                                    :name="`filter-${column.title}`"
                                    v-bind="{ column }"
                                />
                                <BaseInput
                                    v-else-if="
                                        columnFilters[column.title!]?.visible &&
                                        !column.isBoolean
                                    "
                                    ref="filterInput"
                                    v-model="columnFilters[column.title!].value"
                                    type="text"
                                    custom-input-class="h-6 w-full rounded-lg border border-neutral-300 py-1.5 pl-3 text-base text-neutral-900 transition-all duration-300 focus:ring-2 disabled:bg-neutral-50 disabled:text-neutral-500"
                                    is-on-focus
                                    @input="onColumnFilter(column)"
                                />
                                <BaseCheckbox
                                    v-else-if="
                                        columnFilters[column.title!]?.visible &&
                                        column.isBoolean
                                    "
                                    v-model="columnFilters[column.title!].value"
                                    :label="`${t('global.yes')} / ${t('global.no')}`"
                                    @update:model-value="
                                        (value) =>
                                            onBooleanFilter(column, value)
                                    "
                                />
                            </th>
                            <th v-if="isConfigurable" class="w-full" />
                            <th v-if="hasActions" />
                        </tr>
                    </thead>
                    <BaseTableBodySkeleton
                        v-if="loadingData"
                        :rows="10"
                        :colums="displayedColums.length || 4"
                    />
                    <tbody
                        v-else-if="!loadingData && data.length > 0"
                        class="divide-y divide-neutral-200 text-nowrap"
                    >
                        <BaseRow
                            v-for="(row, i) in data"
                            :key="`row-item-${i}`"
                            :checkable-row="checkableRow"
                            :checked-data="checkedData"
                            :clickable-row="clickableRow"
                            :columns="computedColumns"
                            :data="data"
                            :draggable="draggableRows"
                            :has-actions="hasActions"
                            :is-dragging="isDragging"
                            :row="row"
                            :selected-row-id="selectedRowId"
                            :selected-row-id-type="selectedRowIdType"
                            :tabindex="i"
                            @dragover="(event) => onDragOverRow(event, row)"
                            @dragstart="(event) => onDragStartRow(event, row)"
                            @drop="(event) => onDropRow(event)"
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
                v-if="!loadingData && data.length === 0"
                class="flex h-fill min-h-[12rem] w-full items-center justify-center border-t border-r border-l border-neutral-200"
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
import {
    computed,
    nextTick,
    onMounted,
    reactive,
    ref,
    useSlots,
    watch,
} from 'vue'
import BaseButtonIcon from '../button/BaseButtonIcon.vue'
import BasePagination from '../pagination/BasePagination.vue'
import { t } from '@/services/i18n'
import Pagination from '@/types/pagination'
import BaseCheckbox from '../input/BaseCheckbox.vue'
import BaseTableSearch from '../input/BaseTableSearch.vue'
import BaseIcon from '../icon/BaseIcon.vue'
import { Icons } from '@/types/styles'
import BaseRow from '@/components/base/table/BaseRow.vue'
import PageTable from '@/types/pageTable'
import { useLayoutStore } from '@/stores/layout'
import { useNotificationStore } from '@/stores/notification'
import { NotificationType } from '@/enums/NotificationType'
import { cloneDeep, debounce } from '@/services/utils'
import SlotEditShowColumns from '@/components/slots/customTable/SlotEditShowColumns.vue'
import BaseDropdown from '../dropdown/BaseDropdown.vue'
import BaseInput from '../input/BaseInput.vue'
import { deepEqual } from '@/services/utils'
import BaseTableHeaderSkeleton from '../skeleton/BaseTableHeaderSkeleton.vue'
import BaseTableBodySkeleton from '../skeleton/BaseTableBodySkeleton.vue'
import VResizeEvent from '@/types/vResizeEvent'
import { onBeforeUnmount } from 'vue'

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
        tableType?: PageTable['type']
        tableTypeTranslations?: PageTable['type']
        links?: Pagination['links']
        headerIcon?: Icons
        selectedRowId?: string | number
        selectedRowIdType?: string
        hasActions?: boolean
        loadingColums?: boolean
        loadingData?: boolean
        checkedData?: any[]
        draggableRows?: boolean
        disableSort?: boolean
        searchValue?: string
        fullHeight?: boolean
        overflowHidden?: boolean
        disableArrowNavigation?: boolean
        tabindex?: number
        isConfigurable?: boolean
    }>(),
    {
        fullHeight: false,
        title: undefined,
        links: undefined,
        headerIcon: undefined,
        selectedRowId: undefined,
        selectedRowIdType: undefined,
        hasActions: undefined,
        checkedData: undefined,
        draggableRows: undefined,
        disableSort: undefined,
        searchValue: undefined,
        overflowHidden: undefined,
        disableArrowNavigation: undefined,
        tabindex: undefined,
        tableType: undefined,
        tableTypeTranslations: undefined,
        isConfigurable: false,
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
    'onUpdateTableConfig',
    'onColumnFilter',
])

const computedColumns = ref([...props.columns])
const displayedColums = computed(() => {
    return computedColumns.value.filter((column) => column.show)
})

const slots = useSlots()

const checkedData = ref<any[]>([...(props.checkedData ?? [])])
const draggedRow = ref<any>(null)
const isDragging = ref<boolean>(false)
const tableContainer = ref<HTMLElement | null>()
const stickyContainer = ref<HTMLElement | null>()
const baseTableContainer = ref<HTMLElement | null>()
const baseTableTitleContainer = ref<HTMLElement | null>()
const tableHeader = ref<HTMLElement | null>(null)
const filterInput = ref<HTMLElement | null>(null)
const selectedRowId = ref(props.selectedRowId)
const isVisible = ref(false)
const configTable = ref<boolean>(false)
const layoutStore = useLayoutStore()
const notificationStore = useNotificationStore()

const draggedColumnIndex = ref<number | null>(null)

const pageTableConfig = computed<PageTable['config'] | null>(() => {
    if (props.tableType) {
        return layoutStore.pageTables[props.tableType]?.config
    }
    return null
})
const pageTableCopyConfig = computed<PageTable['config'] | null>(() => {
    if (props.tableType) {
        return layoutStore.pageTablesCopy[props.tableType]?.config
    }
    return null
})

const configsAreEqual = ref(true)

const columnFilters = reactive<{
    [key: string]: {
        visible: boolean
        value: string
        booleanValue: number | undefined
    }
}>({})

const resizeObservers = reactive<
    Map<string, { el: HTMLElement; observer: ResizeObserver }>
>(new Map())

onMounted(async () => {
    computedColumns.value = [...props.columns]
    observeVisibility()

    await nextTick(async () => {
        await focusTableIfSingleOnPage()
    })
})

const initializeFilter = (column: Column) => {
    if (!columnFilters[column.title!]) {
        columnFilters[column.title!] = {
            visible: false,
            value: '',
            booleanValue: undefined,
        }
    }
}

const togglePopup = (column: Column) => {
    if (!columnFilters[column.title!]) {
        initializeFilter(column)
    }

    const filter = columnFilters[column.title!]
    filter.visible = !filter.visible

    if (
        !filter.visible &&
        (filter.value || filter.booleanValue !== undefined)
    ) {
        filter.value = ''
        filter.booleanValue = undefined
        emit('onColumnFilter', [null, column])
    }
}

const onColumnFilter = (column: Column) => {
    debounce(
        () =>
            emit('onColumnFilter', [
                columnFilters[column.title!].value,
                column,
            ]),
        400
    )()
}

const onBooleanFilter = (column: Column, value: boolean) => {
    columnFilters[column.title!].booleanValue = value ? 1 : 0
    emit('onColumnFilter', [columnFilters[column.title!].booleanValue, column])
}

const calculateDifferences = () => {
    const config = pageTableConfig.value
    const copyConfig = pageTableCopyConfig.value
    if (config && copyConfig) {
        configsAreEqual.value = deepEqual(config, copyConfig)
    } else {
        configsAreEqual.value = true
    }
}

watch(
    () => [
        pageTableConfig,
        props.tableType ? layoutStore.pageTablesCopy[props.tableType] : null,
    ],
    () => {
        calculateDifferences()
    },
    {
        immediate: true,
        deep: true,
    }
)

watch(
    () => props.checkedData,
    () => {
        checkedData.value = [...(props.checkedData ?? [])]
    },
    {
        deep: true,
    }
)

watch(
    () => props.columns,
    async (newColumns, oldColumns) => {
        if (JSON.stringify(newColumns) !== JSON.stringify(oldColumns)) {
            computedColumns.value = [...newColumns]
        }
    },
    { deep: true }
)

watch(
    () => props.selectedRowId,
    async () => {
        selectedRowId.value = props.selectedRowId
    },
    { immediate: true }
)

const onDragStartColumn = (event: DragEvent, index: number) => {
    draggedColumnIndex.value = index
    event.dataTransfer!.effectAllowed = 'move'
}

const onDragOverColumn = (event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'
}

const onDropColumn = (event: DragEvent, index: number) => {
    event.preventDefault()

    if (draggedColumnIndex.value !== null && props.tableType) {
        const columnsCopy = [...computedColumns.value]
        const draggedColumn = columnsCopy.find(
            (column) => column.index === draggedColumnIndex.value
        )!

        const draggedColumnIndexInArray = columnsCopy.findIndex(
            (column) => column.index === draggedColumn.index
        )

        columnsCopy.splice(draggedColumnIndexInArray, 1)
        columnsCopy.splice(index, 0, draggedColumn)
        columnsCopy.forEach((column, index) => {
            column.index = index
        })

        const tableConfig = layoutStore.pageTables[props.tableType].config
        const titleToIndexMap = columnsCopy.reduce(
            (map, column, index) => {
                if (column.title !== undefined) {
                    map[column.title] = index
                }
                return map
            },
            {} as Record<string, number>
        )

        tableConfig.forEach((column: Column) => {
            column.index = titleToIndexMap[column.title!] + 1
        })

        layoutStore.pageTables[props.tableType].config = tableConfig

        computedColumns.value = columnsCopy
        draggedColumnIndex.value = null
    }
}

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

const onSearch = (search: string) => {
    if (!props.checkedData?.length) {
        checkedData.value = []
    }
    emit('onSearch', search)
}

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

const onDragStartRow = (event: DragEvent, row: any) => {
    draggedRow.value = row
    isDragging.value = true
    event.dataTransfer!.effectAllowed = 'move'
    emit('onRowClick', row)
    emit('onRowDragStart')
}

const onDragOverRow = (event: DragEvent, row: any) => {
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

const onDropRow = (event: DragEvent) => {
    event.preventDefault()
    draggedRow.value = null
    isDragging.value = false
    emit('onRowDragEnd')
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

const getRootFontSize = () => {
    return parseFloat(getComputedStyle(document.documentElement).fontSize)
}

const setResizeDiv = (el: HTMLDivElement | null, title: Column['title']) => {
    if (!el || !title) return

    const existingObserver = resizeObservers.get(title)

    if (existingObserver?.el === el) {
        return
    }

    if (existingObserver) {
        existingObserver.observer.disconnect()
        resizeObservers.delete(title)
    }

    const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const { contentRect } = entry
            onResize(
                { width: contentRect.width, height: contentRect.height },
                title
            )
        }
    })

    observer.observe(el)
    resizeObservers.set(title, { el, observer })
}

const onResize = (event: VResizeEvent, title: string | undefined) => {
    if (props.tableType) {
        const rootFontSize = getRootFontSize()
        const calculatedWidth = event.width / rootFontSize

        if (
            layoutStore.pageTables[props.tableType] &&
            layoutStore.pageTables[props.tableType].config
        ) {
            layoutStore.pageTables[props.tableType].config.forEach(
                (pageTable: Column) => {
                    if (
                        pageTable.title === title &&
                        pageTable.show &&
                        event.width > 0
                    ) {
                        pageTable.width = `${calculatedWidth}rem`
                    }
                }
            )
        }
    }
}

const onConfirmConfigTable = async () => {
    if (props.tableType) {
        clonePageTable()

        await layoutStore.updatePageTable()

        layoutStore.pageTablesCopy[props.tableType] = cloneDeep(
            layoutStore.pageTables[props.tableType]
        )
        configTable.value = false

        notificationStore.addNotificationToQueue({
            type: NotificationType.SUCCESS,
            titleKey: 'global.updateTable',
        })
    }
}

const onUpdateTableConfig = async () => {
    clonePageTable()
    emit('onUpdateTableConfig')
}

const onCancelConfigTable = () => {
    if (props.tableType) {
        configTable.value = false
        layoutStore.pageTables[props.tableType] = cloneDeep(
            layoutStore.pageTablesCopy[props.tableType]
        )
    }
}

const clonePageTable = () => {
    if (props.tableType) {
        layoutStore.pageTable = cloneDeep(
            layoutStore.pageTables[props.tableType]
        )
    }
}

onBeforeUnmount(() => {
    resizeObservers.forEach(
        (observer: { el: HTMLElement; observer: ResizeObserver }) => {
            observer.observer.disconnect()
        }
    )
    resizeObservers.clear()
})
</script>
<style scoped>
.sortable-column-header-container > :last-child {
    margin-right: 0.75rem;
}
</style>
