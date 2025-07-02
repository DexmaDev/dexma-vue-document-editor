<template>
    <div ref="calendarContainerRef" class="h-full">
        <FullCalendar ref="fullCalendarRef" :options="calendarOptions" />
    </div>
</template>

<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import interactionPlugin from '@fullcalendar/interaction'
import { getCurrentInstance, ref, watch } from 'vue'
import { CalendarOptions, EventInput } from '@fullcalendar/core'
import itLocale from '@fullcalendar/core/locales/it'
import moment from 'moment'
import BaseIcon from '../icon/BaseIcon.vue'
import { renderComponent } from '@/services/utils'
import timeGridPlugin from '@fullcalendar/timegrid'
import router from '@/router'
import { DashboardRoutesNames } from '@/enums/RouterNames'

const props = defineProps<{
    events: EventInput[]
}>()

const emit = defineEmits(['eventSelected', 'datesSet', 'dateClick'])

const calendarContainerRef = ref<HTMLElement>()
const calendarRendered = ref<boolean>(false)
const renderCalendarHeight = () => {
    if (calendarRendered.value) {
        return
    }

    const calendar = document.querySelector<HTMLDivElement>('.fc-view-harness')
    if (!calendar) {
        return
    }

    if (router.currentRoute.value.name === DashboardRoutesNames.POPUP) {
        return
    }

    const containerHeight = parseInt(
        calendarContainerRef.value?.parentElement?.parentElement?.parentElement
            ?.style.height || ''
    )

    const calendarHeaderHeight =
        document.querySelector<HTMLDivElement>('.fc-header-toolbar')
            ?.clientHeight || 0

    calendarOptions.value.height = containerHeight! - calendarHeaderHeight
    calendarRendered.value = true
}

const fullCalendarRef = ref<InstanceType<typeof FullCalendar>>()
const calendarOptions = ref<CalendarOptions>({
    plugins: [
        multiMonthPlugin,
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
    ],
    initialView: 'timeGridDay',
    multiMonthMaxColumns: 1,
    headerToolbar: {
        left: 'timeGridDay,dayGridMonth,dayGridYear',
        center: 'prev title next',
        right: '',
    },
    themeSystem: 'standard',
    timeZoneParam: 'Europe/Rome',
    dayHeaderContent: (args) => {
        const { type: viewType } = args.view
        const { date } = args

        setTimeout(() => {
            replaceFcIcons()
            renderCalendarHeight()
        }, 500)

        switch (viewType) {
            case 'timeGridDay':
                return moment(date).format('dddd DD MMMM YYYY')
            case 'dayGridMonth':
                return moment(date).format('dddd DD')
            case 'dayGridYear':
                setTimeout(changeCalendarHeaderToCurrentYear, 500)
                return moment(date).format('YYYY')
            default:
                return args.view.title
        }
    },
    allDaySlot: true,

    locale: itLocale,
    firstDay: 1,
    nowIndicator: true,
    eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    },

    editable: true,
    droppable: true,

    eventClick: (info) => {
        emit('eventSelected', info)
    },
    eventDragStop: () => {},
    datesSet: (info) => {
        emit('datesSet', info.start, info.end)
    },
    dateClick: ({ date }) => {
        // const timezoneOffset = moment.tz(date, 'Europe/Rome').utcOffset()
        // date.setHours(date.getHours() - timezoneOffset / 60)
        emit('dateClick', date, date)
    },

    events: [],
})

const changeCalendarHeaderToCurrentYear = () => {
    const headerFirstCell = document.querySelector<HTMLTableCellElement>(
        '.fc-dayGridYear-view table thead table thead tr th'
    )
    if (!headerFirstCell) {
        return
    }

    headerFirstCell.colSpan = 7
    headerFirstCell.innerText =
        document.querySelector<HTMLHeadingElement>('.fc-toolbar-title')
            ?.innerText || ''

    const headerFirstCellSiblings =
        headerFirstCell?.parentElement?.children?.length
    if (headerFirstCellSiblings) {
        for (let i = 1; i < headerFirstCellSiblings; i++) {
            headerFirstCell?.parentElement?.children[i]?.remove()
        }
    }
}

const replaceFcIcons = () => {
    const prevButton =
        document.querySelector<HTMLSpanElement>('.fc-prev-button')
    const nextButton =
        document.querySelector<HTMLSpanElement>('.fc-next-button')

    function removeFcIcons() {
        prevButton?.querySelector('.fc-icon')?.remove()
        nextButton?.querySelector('.fc-icon')?.remove()

        changeCalendarHeaderToCurrentYear()
    }

    removeFcIcons()
    prevButton?.addEventListener('click', removeFcIcons)
    nextButton?.addEventListener('click', removeFcIcons)
    document
        .querySelectorAll('.fc-header-toolbar .fc-button')
        .forEach((el) => el.addEventListener('click', removeFcIcons))

    if (prevButton) {
        renderComponent({
            el: prevButton,
            component: BaseIcon,
            props: { name: 'arrow-left', size: 'sm' },
            appContext: getCurrentInstance()?.appContext,
        })
    }

    if (nextButton) {
        renderComponent({
            el: nextButton,
            component: BaseIcon,
            props: { name: 'arrow-right', size: 'sm' },
            appContext: getCurrentInstance()?.appContext,
        })
    }
}

watch(
    () => props.events,
    () => {
        fullCalendarRef.value?.getApi().removeAllEvents()
        for (const event of props.events) {
            fullCalendarRef.value?.getApi().addEvent(event)
        }
    },
    { immediate: true, deep: true }
)
</script>

<style scoped>
div :deep(.fc .fc-h-event .fc-event-main),
div :deep(.fc .fc-event),
div :deep(.fc .fc-event-time),
div :deep(.fc .fc-event-title-container) {
    color: #0052cc;
}

div :deep(.fc .fc-event-time),
div :deep(.fc .fc-event-title) {
    font-weight: 500;
}

div :deep(.fc .fc-event) {
    background-color: #f0f6ff;
    border: 0;

    padding: 2px 8px;
}

div :deep(.fc .fc-event.fc-daygrid-event) {
    border-radius: 150px;
}

div :deep(.fc .fc-daygrid-event-dot) {
    display: none;
}

div :deep(.fc .fc-day) {
    background-color: #ffffff;
    border-color: #f2f4f7;
    color: #637083;
}

div :deep(.fc .fc-day-other) {
    color: #667085;
}

div :deep(.fc .fc-day-sun),
div :deep(.fc .fc-day-sat) {
    background-color: #f9fafb;
    color: #ced2da;
}

div :deep(.fc .fc-day-today .fc-daygrid-day-number) {
    color: #1a75ff;
}

div :deep(.fc .fc-col-header-cell) {
    background-color: #ffffff;

    border-width: 0px 1px 1px 0px;
    border-style: solid;
    border-color: #f2f4f7;

    text-align: left;
    text-transform: capitalize;

    padding: 13px 8px;
}

div :deep(.fc .fc-multimonth) {
    flex-direction: column;
    overflow: auto hidden;
}

div :deep(.fc .fc-header-toolbar) {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: flex-start;
    justify-content: center;
    gap: 1rem;
}

div :deep(.fc .fc-header-toolbar .fc-toolbar-chunk) {
    width: 100%;
}

div :deep(.fc .fc-header-toolbar .fc-toolbar-chunk:first-child) {
    display: flex;
    align-items: center;
    justify-content: center;
}

div :deep(.fc .fc-header-toolbar .fc-toolbar-chunk:nth-child(2)) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

div :deep(.fc .fc-header-toolbar .fc-button-active) {
    @apply bg-secondary-700 text-white !important;
}

div :deep(.fc .fc-prev-button),
div :deep(.fc .fc-next-button),
div :deep(.fc .fc-toolbar-chunk .fc-button-group .fc-button) {
    @apply bg-secondary-500 text-white focus:ring-secondary-400 disabled:bg-secondary-200 hover:bg-secondary-700 active:bg-secondary-800 border focus:ring-2 bg-transparent;
    @apply border-secondary-500 text-secondary-500  focus:ring-secondary-100 disabled:border-secondary-200 disabled:text-secondary-200 hover:text-white active:text-secondary-800;
}

div :deep(.fc .fc-dayGridYear-view table thead table thead tr th) {
    text-align: center;
}

div
    :deep(
        div:not(.fc-dayGridMonth-view)
            .fc-dayGridMonth-view
            .fc
            .fc-daygrid-body-unbalanced
    ),
div :deep(.fc-timeGridDay-view .fc .fc-daygrid-body-unbalanced) {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 200px;
}

div :deep(.fc .fc-daygrid-body-unbalanced .fc-timegrid-axis-frame) {
    align-items: flex-start;
    padding-top: 1rem;
}
</style>
