<template>
  <div class="editor" ref="editor">
    <RecycleScroller
      v-if="!loading"
      class="content"
      :items="pages"
      :item-size="pagePxHeight"
      page-mode
      key-field="uuid"
      :buffer="5"
      :item-style="getItemStyle"
      emit-update
      @update="handleScrollUpdate"
    >
      <template #default="{ item: page, index }">
        <div
          class="page"
          :style="pageStyle(index, !page.template)"
          :contenteditable="editable && !page.template"
          :data-content-idx="page.contentIdx"
          @input="handleInput($event, page.contentIdx)"
        >
          <div
            v-if="typeof modelValue[page.contentIdx] === 'string'"
            v-html="modelValue[page.contentIdx] ?? ''"
          />
          <component v-else :is="page.template" v-bind="page.props" />
        </div>
      </template>
    </RecycleScroller>

    <FindAndReplaceModal
      :pages="pages"
      :renderedPageIndexes="renderedPageIndexes"
      :content="modelValue"
      :replace-active="true"
      @onUpdate="handleUpdateFindEndReplace"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, onMounted, nextTick } from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import FindAndReplaceModal from "./FindAndReplaceModal.vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  page_format_mm: {
    type: Array,
    default: () => [210, 297],
  },
  page_margins: {
    type: [String, Function],
    default: "10mm 15mm",
  },
  zoom: {
    type: Number,
    default: 1.0,
  },
  display: {
    type: String,
    default: "grid",
  },
});

const loading = ref(false);
const editorKey = ref(0);
const pages = ref([]);
const pageGap = 24;
const renderedPageIndexes = ref([]);

const pagePxHeight = computed(
  () => (props.page_format_mm[1] / 0.2645833333333) * props.zoom
);

const handleGeneratePages = () => {
  loading.value = true;
  try {
    pages.value = props.modelValue.map((c, idx) => ({
      uuid: Math.random().toString(36).slice(-5),
      contentIdx: idx,
      template: c.template,
      props: c.props,
    }));
  } finally {
    loading.value = false;
  }
};

const pageStyle = (index, allowOverflow) => {
  const style = {
    width: `${props.page_format_mm[0]}mm`,
    transform: `scale(${props.zoom})`,
    padding:
      typeof props.page_margins === "function"
        ? props.page_margins(index + 1, pages.value.length)
        : props.page_margins,
  };

  if (allowOverflow) {
    style.minHeight = `${props.page_format_mm[1]}mm`;
  } else {
    style.height = `${props.page_format_mm[1]}mm`;
  }
  return style;
};

const getItemStyle = () => {
  return {
    marginBottom: `${pageGap}px`,
    display: "flex",
    justifyContent: "center",
  };
};

const handleScrollUpdate = (
  startIndex,
  endIndex,
  visibleStartIndex,
  visibleEndIndex
) => {
  const indexes = [];
  for (let i = startIndex; i <= endIndex; i++) {
    indexes.push(i);
  }
  renderedPageIndexes.value = indexes;
};

const handleUpdateFindEndReplace = (updatedContent) => {
  loading.value = true;
  try {
    // pages.value = updatedPages;
    // editorKey.value += 1;
    // const updatedContent = [...props.modelValue];
    // for (const page of updatedPages) {
    //   if (
    //     !page.template &&
    //     typeof updatedContent[page.contentIdx] === "string"
    //   ) {
    //     const el = document.querySelector(
    //       `[data-content-idx="${page.contentIdx}"]`
    //     );
    //     if (el) {
    //       updatedContent[page.contentIdx] = el.innerHTML;
    //     }
    //   }
    // }

    emit("update:modelValue", updatedContent);
  } finally {
    loading.value = false;
  }
};

// NON FUNZIONA
const handleInput = (event, contentIdx) => {
  const newContent = [...props.modelValue];
  newContent[contentIdx] = event.target.innerHTML;
  emit("update:modelValue", newContent);
};

onMounted(() => {
  handleGeneratePages();
});

watch(
  () => props.modelValue,
  () => {
    handleGeneratePages();
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.editor {
  display: block;
  position: relative;
}
.content {
  outline: none;
  margin: 0;
  padding: 0;
  min-width: 100%;
}
.page {
  box-sizing: border-box;
  margin: 0 auto;
  transform-origin: center top;
  background: white;
  box-shadow: 0 1px 3px rgba(60, 64, 67, 0.15);
  border-radius: 4px;
  overflow: hidden;
  pointer-events: all;
}
</style>
