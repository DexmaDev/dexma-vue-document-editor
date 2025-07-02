<template>
    <BaseInput
        :label="t('pages.google.places.label')"
        :placeholder="t('pages.google.places.placeholder')"
        :hint-message="t('pages.addresses.hintGoogleSearch')"
        id-name="inputPlace"
        type="text"
    />
</template>
<script lang="ts" setup>
import { i18n, t } from '@/services/i18n'
import { onMounted } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'
import BaseInput from '@/components/base/input/BaseInput.vue'
import { useCountryStore } from '@/stores/country'

const emit = defineEmits(['onPlaceChanged'])

const countryStore = useCountryStore()

onMounted(async () => {
    await countryStore.index()

    const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_SECRET_ACCESS_KEY,
        version: 'weekly',
        language: i18n.global.locale as string,
    })

    const inputPlace = document.getElementById('inputPlace') as HTMLInputElement
    const places = await loader.importLibrary('places')
    const options = {}
    const autocomplete = new places.Autocomplete(inputPlace, options)

    autocomplete.addListener('place_changed', () => {
        const selectedPlace = autocomplete.getPlace()

        emit('onPlaceChanged', selectedPlace)
    })
})
</script>
