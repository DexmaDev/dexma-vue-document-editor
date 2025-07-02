<template>
    <Teleport to="#notifications">
        <div class="absolute right-0 top-0 z-50 flex justify-end">
            <TransitionGroup
                class="flex w-screen flex-col gap-2 overflow-hidden p-2 md:w-[65vw] lg:w-[50vw] xl:w-[30vw]"
                enter-active-class="transform-gpu"
                enter-from-class="opacity-50 -translate-y-full"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transform-gpu"
                leave-class="opacity-100 translate-x-0"
                leave-to-class="opacity-50 translate-x-full"
                name="fade"
                tag="div"
            >
                <div
                    v-for="notification in notificationQueue
                        .slice(0, GeneralSettings.VISIBILE_NOTIFICATION_NUMBER)
                        .reverse()"
                    :key="notification.id"
                    class="duration-250 transition-all"
                    :class="[
                        {
                            'cursor-pointer': !!notification.action,
                        },
                    ]"
                    @mouseenter="stopTimer(notification)"
                    @mouseleave="restartTimer(notification)"
                    @touchstart.passive="toggleTimer(notification)"
                    @click="doAction(notification)"
                >
                    <BaseAlert
                        :color="color(notification.type)"
                        :icon-name="nameIcon(notification.type)"
                        :percentage-progress-bar="
                            ((notification.visibleTimer as number) /
                                GeneralSettings.VISIBILE_NOTIFICATION_TIME) *
                            100
                        "
                        :text="
                            notification.descriptionKey
                                ? t(
                                      notification.descriptionKey,
                                      notification.descriptionInfo
                                  )
                                : notification.description || ''
                        "
                        :title="
                            t(notification.titleKey, notification.titleInfo)
                        "
                        close-button
                        variant="default"
                        @on-close="hideNotification(notification)"
                    />
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { GeneralSettings } from '@/enums/GeneralSettings'
import { ITaskOptions, TaskTimer } from 'tasktimer'
import { useNotificationStore } from '@/stores/notification'
import BaseAlert from '../alert/BaseAlert.vue'
import { NotificationType } from '@/enums/NotificationType'
import { Icons, PrimaryColors } from '@/types/styles'
import { t } from '@/services/i18n'
import Notification from '../../../types/notification'

const notificationStore = useNotificationStore()

const notificationQueue = computed<Notification[]>(
    () => notificationStore.notificationsQueue
)

const timerInterval = 1
const timer = new TaskTimer(timerInterval)

const hideNotification = (notification: Notification) => {
    timer.remove(timer.get(notification.id as string))
    notificationStore.removeNotificationFromQueue(notification.id)
}

const stopTimer = (notification: Notification) => {
    const task = timer.get(notification.id as string)

    task.enabled = false
}

const restartTimer = (notification: Notification) => {
    const task = timer.get(notification.id as string)
    if (task) {
        task.enabled = true
    }
}

const toggleTimer = (notification: Notification) => {
    const task = timer.get(notification.id as string)

    task.enabled = !task.enabled

    if (!task.enabled) {
        setTimeout(() => (task.enabled = true), 1000)
    }
}

const createTimer = (visibleNotification: Notification) => {
    if (!timer.get(visibleNotification.id as string)) {
        const options: ITaskOptions = {
            id: visibleNotification.id as string,
            callback: () => {
                notificationStore.updateNotificationTimer(
                    visibleNotification.id,
                    (visibleNotification.visibleTimer ?? 0) - timerInterval
                )
            },
            removeOnCompleted: true,
            totalRuns:
                GeneralSettings.VISIBILE_NOTIFICATION_TIME / timerInterval,
        }
        timer.add(options)

        if (timer.state != TaskTimer.State.RUNNING) {
            timer.start()
        }
    }
}

const doAction = async (visibleNotification: Notification) => {
    if (visibleNotification.action) {
        await visibleNotification.action()
    }
}

watch(
    notificationQueue,
    () => {
        if (notificationQueue.value.length >= 1) {
            const currentVisibleNotifications: Notification[] =
                notificationQueue.value.slice(
                    0,
                    GeneralSettings.VISIBILE_NOTIFICATION_NUMBER
                )

            currentVisibleNotifications.forEach((visibleNotification) => {
                createTimer(visibleNotification)
            })
        } else {
            timer.stop()
        }
    },
    { deep: true }
)

const nameIcon = (
    notificationType: Notification['type']
): Icons | undefined => {
    switch (notificationType) {
        case NotificationType.SUCCESS:
            return 'check-circle'
        case NotificationType.WARNING:
            return 'warning'
        case NotificationType.ERROR:
            return 'clear-circle'
        case NotificationType.INFO:
            return 'info-outline'
    }
}

const color = (
    notificationType: Notification['type']
): PrimaryColors | undefined => {
    switch (notificationType) {
        case NotificationType.SUCCESS:
            return 'success'
        case NotificationType.WARNING:
            return 'warning'
        case NotificationType.ERROR:
            return 'error'
        case NotificationType.INFO:
            return 'secondary'
    }
}
</script>
