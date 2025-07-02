<template>
    <div class="w-full">
        <div v-if="loading">
            <BaseSpinner size="xs" :text="t('global.loading')" />
        </div>
        <div v-else v-show="imgUrl">
            <img
                v-if="imgProxyUrl"
                :src="imgProxyUrl"
                class="cursor-pointer"
                @click="handleOnClick"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import BaseSpinner from '../spinner/BaseSpinner.vue'
import { t } from '@/services/i18n'
import { proxyRedirect } from '@/services/whatsapp'

const props = defineProps<{
    imgUrl: string
}>()

const loading = ref(true)
const imgProxyUrl = ref<string | null>(null)

const emit = defineEmits(['onImageClick'])

onMounted(async () => {
    if (props.imgUrl) {
        loading.value = true
        imgProxyUrl.value = await proxyRedirect(props.imgUrl)
        loading.value = false
    }
})

const handleOnClick = () => {
    emit('onImageClick')
}
</script>

<style scoped>
.loader {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #000;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
