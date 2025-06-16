<template>
  <div class="editor" ref="editor">
    <RecycleScroller
      class="content"
      :items="pages"
      :item-size="pagePxHeight"
      page-mode
      key-field="uuid"
      :buffer="5"
        :item-style="getItemStyle"

    >
      <template #default="{ item: page, index }">
        <div
          class="page"
          :style="page_style(index, !page.template)"
          :contenteditable="editable && !page.template"
          :data-content-idx="page.content_idx"
        >
          <div
            v-if="typeof content[page.content_idx] === 'string'"
            v-html="content[page.content_idx] ?? ''"
          />
          <component v-else :is="page.template" v-bind="page.props" />
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default {
  name: 'VirtualScrollerEditor',
  components: {
    RecycleScroller
  },
  props: {
    content: {
      type: Array,
      required: true
    },
    editable: {
      type: Boolean,
      default: true
    },
    page_format_mm: {
      type: Array,
      default: () => [210, 297]
    },
    page_margins: {
      type: [String, Function],
      default: '10mm 15mm'
    },
    zoom: {
      type: Number,
      default: 1.0
    },
    display: {
      type: String,
      default: 'grid'
    }
  },
  data() {
    return {
      pages: [],
      pageGap: 24 
    }
  },
  computed: {
    pagePxHeight() {
      return (this.page_format_mm[1] / 0.2645833333333) * this.zoom
    }
  },
  watch: {
    content: {
      immediate: true,
      handler(newContent) {
        this.pages = newContent.map((c, idx) => ({
          uuid: Math.random().toString(36).slice(-5),
          content_idx: idx,
          template: c.template,
          props: c.props
        }))
      }
    }
  },
  methods: {
    page_style(index, allowOverflow) {
      const pxInMm = 0.2645833333333
      const widthPx = this.page_format_mm[0] / pxInMm
      const heightPx = this.page_format_mm[1] / pxInMm

      const style = {
        width: this.page_format_mm[0] + 'mm',
        transform: `scale(${this.zoom})`,
        padding: typeof this.page_margins === 'function'
          ? this.page_margins(index + 1, this.pages.length)
          : this.page_margins
      }
      style[allowOverflow ? 'minHeight' : 'height'] = this.page_format_mm[1] + 'mm'
      return style
    },

    getItemStyle() {
    return {
      marginBottom: this.pageGap + 'px',
      display: 'flex',
      justifyContent: 'center'
    }
  },
  }
}
</script>

<style scoped>
.editor {
  display: block;
}
.content {
  position: relative;
  outline: none;
  margin: 0;
  padding: 0;
  min-width: 100%;
}
.page {
  position: absolute;
  box-sizing: border-box;
  left: 50%;
  transform-origin: center top;
  background: white;
  box-shadow: 0 1px 3px rgba(60, 64, 67, 0.15);
  border-radius: 4px;
  overflow: hidden;
  pointer-events: all;
}
</style>