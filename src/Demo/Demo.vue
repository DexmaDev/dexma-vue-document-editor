<template>
  <div class="main">
    <vue-file-toolbar-menu :content="menu" class="bar" />

    <RecicleScrollerEditor
      v-model="content"
      :overlay="overlay"
      :zoom="zoom"
      :page_format_mm="page_format_mm"
      :page_margins="page_margins"
      :display="display"
      ref="editor"
      @update:modelValue="console.log('update model value')"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import VueFileToolbarMenu from 'vue-file-toolbar-menu'
import RecicleScrollerEditor from '../DocumentEditor/RecicleScrollerEditor.vue'
import { getTestContent } from '../DocumentEditor/utils'

//  const content = ref(['ciao'])
const content = ref(getTestContent())
const zoom = ref(0.8)
const zoom_min = 0.1
const zoom_max = 5.0
const page_format_mm = ref([210, 297])
const page_margins = ref('10mm 15mm')
const display = ref('vertical')

const editor = ref(null)
const mounted = ref(false)

const content_history = ref([])
const undo_count = ref(-1)
let _mute_next_content_watcher = false

const isMacLike = /Mac|iPhone|iPod|iPad/i.test(navigator.platform)

function overlay(page, total) {
  let html =
    `<div style="position: absolute; bottom: 8mm; ${page % 2 ? 'right' : 'left'}: 10mm">Page ${page} of ${total}</div>`
  if (page >= 3) {
    html += `<div style="position: absolute; left: 0; top: 0; right: 0; padding: 3mm 5mm; background: rgba(200, 220, 240, 0.5)"><strong>MYCOMPANY</strong> example.com /// This is a custom header overlay</div>`
    html += `<div style="position: absolute; left: 10mm; right: 10mm; bottom: 5mm; text-align:center; font-size:10pt">MY COMPANY - example.com /// This is a custom footer overlay</div>`
  }
  return html
}

function undo() {
  if (can_undo.value) {
    _mute_next_content_watcher = true
    content.value = content_history.value[--undo_count.value]
  }
}

function redo() {
  if (can_redo.value) {
    _mute_next_content_watcher = true
    content.value = content_history.value[++undo_count.value]
  }
}

function resetContentHistory() {
  content_history.value = []
  undo_count.value = -1
}

async function insertPageBreak() {
  document.execCommand('insertParagraph')
  const marker = '###PB###'
  document.execCommand('insertText', false, marker)
  await nextTick()
  await nextTick()
  const regexp = new RegExp('<(p|div|h\\d)( [^/>]+)*>(<[^/>]+>)*' + marker)

  for (let i = 0; i < content.value.length; i++) {
    const item = content.value[i]
    if (typeof item !== 'string') continue
    const match = regexp.exec(item)
    if (match) {
      const tags_open = match[0].slice(0, -marker.length)
      let rest = item.substr(match.index + match[0].length)
      if (rest.indexOf('</') === 0) rest = '<br>' + rest
      content.value.splice(i, 1, item.substr(0, match.index), tags_open + rest)
      return
    }
  }

  for (let i = 0; i < content.value.length; i++) {
    const item = content.value[i]
    if (typeof item === 'string' && item.includes(marker)) {
      content.value.splice(i, 1, item.replace(marker, ''))
      break
    }
  }
}

const formats = [
  ['A0', 841, 1189], ['A0L', 1189, 841],
  ['A1', 594, 841], ['A1L', 841, 594],
  ['A2', 420, 594], ['A2L', 594, 420],
  ['A3', 297, 420], ['A3L', 420, 297],
  ['A4', 210, 297], ['A4L', 297, 210],
  ['A5', 148, 210], ['A5L', 210, 148],
  ['A6', 105, 148], ['A6L', 148, 105]
]

const margins = [
  ['Medium', '20mm'],
  ['Small', '15mm'],
  ['Slim', '10mm 15mm'],
  ['Tiny', '5mm']
]

const current_format_name = computed(() => {
  const f = formats.find(f => f[1] === page_format_mm.value[0] && f[2] === page_format_mm.value[1])
  return f ? f[0] : `${page_format_mm.value[0]}mm x ${page_format_mm.value[1]}mm`
})

const current_margins_name = computed(() => {
  const m = margins.find(m => m[1] === page_margins.value)
  return m ? m[0] : page_margins.value
})

const current_text_style = computed(() => mounted.value ? editor.value?.current_text_style : null)

const can_undo = computed(() => undo_count.value > 0)
const can_redo = computed(() => content_history.value.length - undo_count.value - 1 > 0)

const menu = computed(() => [
  {
    text: 'New',
    icon: 'description',
    click: () => {
      if (confirm('Create empty document?')) {
        content.value = ['']
        resetContentHistory()
      }
    }
  },
  {
    text: 'Print',
    icon: 'print',
    click: () => window.print()
  },
  { is: 'spacer' },
  {
    icon: 'undo',
    disabled: !can_undo.value,
    click: undo
  },
  {
    icon: 'redo',
    disabled: !can_redo.value,
    click: redo
  },
  { is: 'spacer' },
  {
    icon: 'format_align_left',
    click: () => document.execCommand('justifyLeft'),
    disabled: !current_text_style.value
  },
  {
    icon: 'format_align_center',
    click: () => document.execCommand('justifyCenter'),
    disabled: !current_text_style.value
  },
  {
    icon: 'format_align_right',
    click: () => document.execCommand('justifyRight'),
    disabled: !current_text_style.value
  },
  {
    icon: 'format_align_justify',
    click: () => document.execCommand('justifyFull'),
    disabled: !current_text_style.value
  },
  { is: 'separator' },
  {
    icon: 'format_bold',
    click: () => document.execCommand('bold'),
    disabled: !current_text_style.value
  },
  {
    icon: 'format_italic',
    click: () => document.execCommand('italic'),
    disabled: !current_text_style.value
  },
  {
    icon: 'format_underline',
    click: () => document.execCommand('underline'),
    disabled: !current_text_style.value
  },
  {
    icon: 'format_strikethrough',
    click: () => document.execCommand('strikethrough'),
    disabled: !current_text_style.value
  },
  {
    is: 'separator'
  },
  {
    icon: 'splitscreen',
    click: insertPageBreak,
    disabled: !current_text_style.value
  },
  { is: 'spacer' },
  {
    text: current_format_name.value,
    icon: 'crop_free',
    chevron: true,
    menu: formats.map(([label, w, h]) => ({
      text: label,
      active: page_format_mm.value[0] === w && page_format_mm.value[1] === h,
      click: () => (page_format_mm.value = [w, h])
    }))
  },
  {
    text: current_margins_name.value,
    icon: 'select_all',
    chevron: true,
    menu: margins.map(([label, val]) => ({
      text: `${label} (${val})`,
      active: page_margins.value === val,
      click: () => (page_margins.value = val)
    }))
  },
  {
    text: Math.floor(zoom.value * 100) + '%',
    icon: 'zoom_in',
    chevron: true,
    menu: [
      ['200%', 2.0], ['150%', 1.5], ['125%', 1.25], ['100%', 1.0],
      ['75%', 0.75], ['50%', 0.5], ['25%', 0.25]
    ].map(([label, z]) => ({
      text: label,
      active: zoom.value === z,
      click: () => (zoom.value = z)
    }))
  },
  {
    icon:
      display.value === 'horizontal'
        ? 'view_column'
        : display.value === 'vertical'
          ? 'view_stream'
          : 'view_module',
    chevron: true,
    menu: ['grid', 'horizontal', 'vertical'].map(view => ({
      icon: view === 'grid' ? 'view_module' : view === 'horizontal' ? 'view_column' : 'view_stream',
      active: display.value === view,
      click: () => (display.value = view)
    }))
  }
])

watch(content, (newVal) => {
  if (!_mute_next_content_watcher) {
    content_history.value[++undo_count.value] = structuredClone(newVal)
    content_history.value.length = undo_count.value + 1
  }
  _mute_next_content_watcher = false
}, { immediate: true, deep: true })

onMounted(() => {
  mounted.value = true

  // Zoom handling: ctrl+wheel
  window.addEventListener('wheel', e => {
    if (e.ctrlKey) {
      e.preventDefault()
      zoom.value = Math.min(Math.max(zoom.value - e.deltaY * 0.01, zoom_min), zoom_max)
    }
  }, { passive: false })

  // Trackpad on Safari
  let gestureStartZoom = 1
  window.addEventListener('gesturestart', e => {
    e.preventDefault()
    gestureStartZoom = zoom.value
  })
  window.addEventListener('gesturechange', e => {
    e.preventDefault()
    zoom.value = Math.min(Math.max(gestureStartZoom * e.scale, zoom_min), zoom_max)
  })

  // Touch pinch zoom
  let startDist = 0
  let startZoom = 1
  window.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      e.preventDefault()
      startDist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      )
      startZoom = zoom.value
    }
  }, { passive: false })

  window.addEventListener('touchmove', e => {
    if (e.touches.length === 2 && startDist) {
      e.preventDefault()
      const newDist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      )
      zoom.value = Math.min(Math.max(startZoom * newDist / startDist, zoom_min), zoom_max)
    }
  }, { passive: false })

  // Undo/redo via browser events
  const handleUndoRedo = (e) => {
    if (e.inputType === 'historyUndo') {
      e.preventDefault()
      undo()
    } else if (e.inputType === 'historyRedo') {
      e.preventDefault()
      redo()
    }
  }

  window.addEventListener('beforeinput', handleUndoRedo)
  window.addEventListener('input', handleUndoRedo)
})
</script>
