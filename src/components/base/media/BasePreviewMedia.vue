<template>
    <div
        v-if="!previewFile?.url"
        :class="{
            'hover:border-1 hover:border-neutral-300 cursor-pointer clickable transition-all duration-300':
                clickable,
        }"
        class="bg-neutral-100 flex w-full h-full rounded-lg border-2 justify-center items-center flex-col gap-2"
        @click="clickable ? emit('onClick') : false"
    >
        <BaseIcon :tone="500.0" color="neutral" name="file" size="2xl" />
        <BaseText
            :text="label || t('pages.subjectIdentification.previewDocument')"
            :tone="500.0"
            color="neutral"
            font="bold"
        />
    </div>
    <a
        v-else-if="
            previewFile.mime_type === 'application/pdf' && previewFile.url
        "
        :href="previewFile?.url"
        target="_blank"
    >
        <BasePdfPreview
            :pdf-preview-div="pdfPreviewDiv!"
            :url="previewFile.url"
        />
    </a>
    <div
        v-else-if="!previewFile?.preview_exists"
        class="bg-neutral-100 flex w-full rounded-lg border-2 justify-center items-center flex-col gap-2"
    >
        <BaseIcon :tone="500.0" color="neutral" name="file" size="2xl" />
        <BaseText
            :text="previewFile?.file_name!"
            :tone="500.0"
            color="neutral"
            font="bold"
        />
        <div>
            <BaseButton
                :href="previewFile?.url"
                :text="t('global.open')"
                color="secondary"
                size="2xs"
                target="_blank"
            />
        </div>
    </div>
    <a v-else :href="previewFile?.url" class="h-full" target="_blank">
        <img :src="previewFile?.url" alt="" class="h-full" />
    </a>
</template>

<script lang="ts" setup>
import Media from '@/types/media'
import { t } from '@/services/i18n'
import BaseText from '@/components/base/text/BaseText.vue'
import BaseButton from '@/components/base/button/BaseButton.vue'
import BaseIcon from '@/components/base/icon/BaseIcon.vue'
import BasePdfPreview from '@/components/base/pdf/BasePdfPreview.vue'

defineProps<{
    pdfPreviewDiv: HTMLElement
    previewFile?: Media
    label?: string
    clickable?: boolean
}>()

const emit = defineEmits(['onClick'])
</script>
