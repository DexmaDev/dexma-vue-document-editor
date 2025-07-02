<template>
    <div
        class="sticky left-0 top-0 z-10 bg-white bg-opacity-80 border-b border-gray-200 backdrop-blur-md"
    >
        <VueFileToolbarMenu
            v-for="(content, index) in toolbarElements"
            :key="'bar-' + index"
            :content="content"
            class="bar"
        />
    </div>
</template>

<script lang="ts" setup>
import VueFileToolbarMenu from 'dexma-vue-file-toolbar-menu'
import { computed, ref, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { t } from '@/services/i18n'
import {
    Hyphenation,
    MenuAction,
    MenuColor,
    TranlitterateFractionOption,
    TranlitterateNumberOption,
} from '@/types/editor'
import SlotLineSizeInput from '@/components/slots/editor/toolbar/SlotToolbarInput.vue'
import { isWhite } from '@/services/utils'
import { TraslitterationFormat } from '@/enums/EditorCustomElements'
import { EditorBackgroundImage } from '@/enums/EditorBackgroundImage'

const props = withDefaults(
    defineProps<{
        editMenuActions?: MenuAction[]
        enterMenuActions?: MenuAction[]
        fileMenuActions?: MenuAction[]
        editorStoreInstanceId?: string
        disableEditActions?: boolean
        disableEditConfigActions?: boolean
        fileName?: string
    }>(),
    {
        editMenuActions: () => [],
        enterMenuActions: () => [],
        fileMenuActions: () => [],
        editorStoreInstanceId: undefined,
        disableEditActions: false,
        disableEditConfigActions: false,
        fileName: undefined,
    }
)

const emit = defineEmits(['onUpdateContentInPages', 'onUpdateConfig'])

const editorStore = useEditorStore(props.editorStoreInstanceId)()
const isBoldSelected = ref<boolean>(false)
const isItalicSelected = ref<boolean>(false)
const isUnderlineSelected = ref<boolean>(false)
const isStrikeThrougthSelected = ref<boolean>(false)
const isNumberedListSelected = ref<boolean>(false)
const isBulletListSelected = ref<boolean>(false)
const isAlignedCenter = ref<boolean>(false)
const isAlignedRight = ref<boolean>(false)
const isAlignedLeft = ref<boolean>(true)
const isJustified = ref<boolean>(false)

const selectedColorForToolbar = computed<string>(() => {
    return !isWhite(editorStore.selectedColor)
        ? editorStore.selectedColor
        : '#000000'
})

const toolbarElements = computed<MenuAction[][]>(() => {
    const toolbar: MenuAction[][] = []

    const fileActions: MenuAction[] = [
        {
            text: 'File',
            menu: [
                ...(!props.disableEditActions
                    ? [
                          {
                              text: t('global.new'),
                              title: 'New',
                              click: () => {
                                  if (confirm(t('pages.editor.resetContent'))) {
                                      editorStore.resetState()
                                  }
                              },
                          },
                          { is: 'separator' },
                      ]
                    : []),

                {
                    text: 'Download',
                    title: 'Download',
                    menu: [
                        {
                            text: 'Download PDF',
                            title: 'Download PDF',
                            click: async () => await handleDownload(),
                        },
                        {
                            text: 'Download RTF',
                            title: 'Download RTF',
                            click: async () =>
                                await editorStore.downloadAsRtf(),
                        },
                    ],
                },

                ...props.fileMenuActions,
            ],
        },
    ]

    if (!props.disableEditActions) {
        const editActions0: MenuAction[] = [
            ...fileActions,
            ...(props.editMenuActions.length > 0
                ? [
                      {
                          text: t('global.edit'),
                          menu_width: 200,
                          menu: props.editMenuActions,
                      },
                  ]
                : []),
            ...(props.enterMenuActions.length > 0
                ? [
                      {
                          text: t('global.enter'),
                          menu_width: 200,
                          menu: props.enterMenuActions,
                      },
                  ]
                : []),
            {
                text: t('global.format'),
                title: t('global.format'),
                prevent_menu_close: true,
                menu: [
                    {
                        text: t('pages.editor.toolBar.lineSpacing'),
                        title: t('pages.editor.toolBar.lineSpacing'),
                        prevent_menu_close: true,
                        menu_width: 90,
                        menu: [
                            {
                                is: SlotLineSizeInput,
                                title: t('pages.editor.toolBar.lineSpacing'),
                                props: {
                                    type: 'number',
                                    modelValue: editorStore.selectedLine,
                                    step: '0.01',
                                    min: '1',
                                    suggestions: [1.19, 2.38],
                                    additionalClass: 'm-auto',
                                },
                                listeners: {
                                    'update:modelValue': (value?: string) => {
                                        setLineHeight(value || '1')
                                    },
                                    onFocusOut: () => {
                                        editorStore.removeHighlightSavedRangeTextNodes()
                                        editorStore.restoreSelection()
                                        emit('onUpdateContentInPages')
                                    },
                                    onFocus: () => {
                                        editorStore.saveRangeAndhighlightTextNodes()
                                    },
                                    click: () => {
                                        editorStore.saveRangeAndhighlightTextNodes()
                                    },
                                },
                            },
                        ],
                    },
                    {
                        text: t('pages.editor.toolBar.hyphenation'),
                        title: t('pages.editor.toolBar.hyphenation'),
                        prevent_menu_close: true,
                        menu_width: 90,
                        menu: [
                            {
                                title: 'IT',
                                text: 'IT',
                                disabled: editorStore.hyphenation == 'it',
                                click: () => useHyphenation('it'),
                            },
                            {
                                title: 'EN',
                                text: 'EN',
                                disabled: editorStore.hyphenation == 'en',
                                click: () => useHyphenation('en'),
                            },

                            {
                                title: t('global.remove'),
                                text: t('global.remove'),
                                disabled: !editorStore.hyphenation,
                                click: () => useHyphenation(),
                            },
                        ],
                    },
                ],
            },

            {
                text: t('global.settings'),
                menu: [
                    {
                        text: t('pages.editor.actions.transliteration'),
                        menu_width: 300,
                        menu: [
                            {
                                text:
                                    t('pages.editor.actions.transliteration') +
                                    ' default ' +
                                    t(
                                        'pages.editor.actions.number'
                                    ).toLowerCase(),
                                menu_width: 330,
                                menu: [
                                    {
                                        text:
                                            t(
                                                'pages.editor.actions.transliteration'
                                            ) +
                                            ' (' +
                                            t('pages.editor.actions.number') +
                                            ')',
                                        click: () =>
                                            handleSelectDefaultNumberTranslitteration(
                                                'translitterationThanNumber'
                                            ),
                                    },
                                    {
                                        text:
                                            t('pages.editor.actions.number') +
                                            ' (' +
                                            t(
                                                'pages.editor.actions.transliteration'
                                            ) +
                                            ')',
                                        click: () =>
                                            handleSelectDefaultNumberTranslitteration(
                                                'numberThanTranslitteration'
                                            ),
                                    },
                                    {
                                        text:
                                            t(
                                                'pages.editor.actions.transliteration'
                                            ) +
                                            ' ' +
                                            t(
                                                'pages.editor.actions.integer'
                                            ).toLowerCase() +
                                            ' / ' +
                                            t(
                                                'pages.editor.actions.decimal'
                                            ).toLowerCase() +
                                            ' (' +
                                            t('pages.editor.actions.number') +
                                            ')',
                                        click: () =>
                                            handleSelectDefaultNumberTranslitteration(
                                                'translitterationThanFraction'
                                            ),
                                    },
                                ],
                            },
                            {
                                text:
                                    t('pages.editor.actions.transliteration') +
                                    ' default ' +
                                    t(
                                        'pages.editor.actions.fraction'
                                    ).toLowerCase(),
                                menu_width: 230,
                                menu: [
                                    {
                                        text:
                                            t('global.numerator') +
                                            ' / ' +
                                            t('global.denominator'),
                                        click: () =>
                                            handleSelectDefaultFractionTranslitteration(
                                                'numerator/denominator'
                                            ),
                                    },
                                    {
                                        text: t(
                                            'pages.editor.actions.fraction'
                                        ),
                                        click: () =>
                                            handleSelectDefaultFractionTranslitteration(
                                                'fraction'
                                            ),
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ]
        const editActions1: MenuAction[] = [
            {
                title: t('pages.editor.toolBar.undu'),
                icon: 'undo',
                disabled: editorStore.contentHistoryIndex < 1,
                hotkey: editorStore.isMacLike ? 'command+z' : 'ctrl+z',
                click: editorStore.undoChange,
            },
            {
                title: t('pages.editor.toolBar.redo'),
                icon: 'redo',
                disabled:
                    editorStore.contentHistory.length ==
                    editorStore.contentHistoryIndex + 1,
                hotkey: editorStore.isMacLike ? 'shift+command+z' : 'ctrl+y',
                click: editorStore.redoChange,
            },
            { is: 'spacer' },
            {
                icon: 'format_align_left',
                title: t('pages.editor.toolBar.alignLeft'),
                active: isAlignedLeft.value,
                hotkey: editorStore.isMacLike
                    ? 'shift+command+l'
                    : 'ctrl+shift+l',
                click: () => applyStyle('justifyLeft'),
            },
            {
                icon: 'format_align_center',
                title: t('pages.editor.toolBar.alignCenter'),
                active: isAlignedCenter.value,
                hotkey: editorStore.isMacLike
                    ? 'shift+command+e'
                    : 'ctrl+shift+e',
                click: () => applyStyle('justifyCenter'),
            },
            {
                icon: 'format_align_right',
                title: t('pages.editor.toolBar.alignRight'),
                active: isAlignedRight.value,
                hotkey: editorStore.isMacLike
                    ? 'shift+command+r'
                    : 'ctrl+shift+r',
                click: () => applyStyle('justifyRight'),
            },
            {
                icon: 'format_align_justify',
                title: t('pages.editor.toolBar.justifyContent'),
                active: isJustified.value,
                hotkey: editorStore.isMacLike
                    ? 'shift+command+j'
                    : 'ctrl+shift+j',
                click: () => applyStyle('justifyFull'),
            },
            { is: 'separator' },
            {
                html:
                    '<div class="ellipsis" style="width: 60px; font-size: 95%;">' +
                    editorStore.selectedFont +
                    '</div>',
                title: 'Font',
                chevron: true,
                menu_width: 170,
                menu: editorStore.availableFonts.map((font) => {
                    return {
                        text: font,
                        active: editorStore.selectedFont === font,
                        click: () => {
                            editorStore.selectedFont = font
                            applyStyle('fontName', false, font)
                        },
                    }
                }),
            },
            { is: 'separator' },
            {
                icon: 'remove',
                title:
                    t('pages.editor.toolBar.decrement') +
                    ' ' +
                    t('pages.editor.toolBar.fontSize').toLowerCase(),
                click: () => {
                    if (editorStore.selectedFontSize > 1) {
                        editorStore.selectedFontSize--
                    }
                    applyStyle(
                        'fontSize',
                        false,
                        editorStore.selectedFontSize.toString()
                    )
                },
            },
            {
                html:
                    '<div class="ellipsis" style="width:' +
                    (editorStore.selectedFontSize < 100 ? '20px' : '28px') +
                    '; font-size: 95%;">' +
                    (editorStore.availableFontSizes.find((size) => {
                        return size.value == editorStore.selectedFontSize
                    }) != undefined
                        ? editorStore.availableFontSizes.find((size) => {
                              return size.value == editorStore.selectedFontSize
                          })?.label
                        : editorStore.selectedFontSize) +
                    '</div>',
                title: t('pages.editor.toolBar.fontSize'),
                chevron: true,
                menu_width: 40,
                menu: editorStore.availableFontSizes.map((size) => {
                    return {
                        text: size.label,
                        active: editorStore.selectedFontSize === size.value,
                        click: () => {
                            editorStore.selectedFontSize = size.value
                            applyStyle(
                                'fontSize',
                                false,
                                editorStore.selectedFontSize.toString()
                            )
                        },
                    }
                }),
            },
            {
                icon: 'add',
                title:
                    t('pages.editor.toolBar.increment') +
                    ' ' +
                    t('pages.editor.toolBar.fontSize').toLowerCase(),
                click: () => {
                    if (editorStore.selectedFontSize < 7) {
                        editorStore.selectedFontSize++
                    }
                    applyStyle(
                        'fontSize',
                        false,
                        editorStore.selectedFontSize.toString()
                    )
                },
            },
            { is: 'separator' },
            {
                icon: 'format_bold',
                title: t('pages.editor.toolBar.bold'),
                active: isBoldSelected.value,
                click: () => {
                    applyStyle('bold')
                    isBoldSelected.value = !isBoldSelected.value
                },
            },
            {
                icon: 'format_italic',
                title: t('pages.editor.toolBar.italic'),
                active: isItalicSelected.value,
                click: () => {
                    applyStyle('italic')
                    isItalicSelected.value = !isItalicSelected.value
                },
            },
            {
                icon: 'format_underline',
                title: t('pages.editor.toolBar.underline'),
                active: isUnderlineSelected.value,
                click: () => {
                    applyStyle('underline')
                    isUnderlineSelected.value = !isUnderlineSelected.value
                },
            },
            {
                icon: 'format_strikethrough',
                title: t('pages.editor.toolBar.strikeThrough'),
                active: isStrikeThrougthSelected.value,
                click: () => {
                    applyStyle('strikeThrough')
                    isStrikeThrougthSelected.value =
                        !isStrikeThrougthSelected.value
                },
            },
            {
                is: 'button-color',
                title: t('pages.editor.toolBar.textColor'),
                type: 'compact',
                menu_class: 'align-center',
                stay_open: false,
                color: selectedColorForToolbar.value,
                update_color: (new_color: MenuColor) => {
                    editorStore.selectedColor = new_color.hex8
                    applyStyle('foreColor', false, new_color.hex8)
                },
            },

            {
                is: 'button-color',
                icon: 'border_color',
                title: t('pages.editor.toolBar.highlightColor'),
                type: 'compact',
                menu_class: 'align-center',
                stay_open: false,
                color: !isWhite(editorStore.selectedHighlightColor)
                    ? editorStore.selectedHighlightColor
                    : '#000000',
                update_color: (new_color: MenuColor) => {
                    editorStore.selectedHighlightColor = new_color.hex8
                    applyStyle('hiliteColor', false, new_color.hex8)
                },
            },

            { is: 'separator' },

            {
                icon: 'format_size',
                title: t('pages.editor.format.traslitteration.label'),
                menu: [
                    {
                        title: t(
                            'pages.editor.format.traslitteration.lowercase'
                        ),
                        text: t(
                            'pages.editor.format.traslitteration.lowercase'
                        ),
                        click: () => {
                            handleFormatTraslitteration(
                                TraslitterationFormat.LOWERCASE
                            )
                        },
                    },
                    {
                        title: t(
                            'pages.editor.format.traslitteration.uppercase'
                        ),
                        text: t(
                            'pages.editor.format.traslitteration.uppercase'
                        ),
                        click: () => {
                            handleFormatTraslitteration(
                                TraslitterationFormat.UPPERCASE
                            )
                        },
                    },
                    {
                        title: t(
                            'pages.editor.format.traslitteration.title_case'
                        ),
                        text: t(
                            'pages.editor.format.traslitteration.title_case'
                        ),
                        click: () => {
                            handleFormatTraslitteration(
                                TraslitterationFormat.TITLE_CASE
                            )
                        },
                    },
                ],
            },

            { is: 'separator' },

            {
                icon: 'format_list_numbered',
                title: t('pages.editor.toolBar.numberedList'),
                active: isNumberedListSelected.value,
                click: () => applyStyle('insertOrderedList'),
            },
            {
                icon: 'format_list_bulleted',
                title: t('pages.editor.toolBar.bulletList'),
                active: isBulletListSelected.value,
                click: () => applyStyle('insertUnorderedList'),
            },
            { is: 'separator' },
            {
                icon: 'format_clear',
                title: t('pages.editor.toolBar.clear'),
                click: () => {
                    applyStyle('removeFormat')
                },
            },
            { is: 'spacer' },
        ]
        toolbar.push([...editActions0])
        toolbar.push([...editActions1])
    } else {
        toolbar.push([...fileActions])
    }

    if (!props.disableEditConfigActions) {
        const configActions: MenuAction[] = [
            {
                title: t('pages.editor.actions.linesTitle'),
                icon: 'menu',
                chevron: true,
                menu_width: 100,
                menu: [
                    {
                        text:
                            '25 ' +
                            t('pages.editor.actions.lines').toLocaleLowerCase(),
                        title: t('pages.editor.actions.linesTooltip'),
                        click: () => {
                            editorStore.selectAllPages()
                            setLineHeight(2.38)
                            emit('onUpdateContentInPages')
                            handleSelectBackgroundImage(
                                EditorBackgroundImage.PROTOCOL
                            )
                        },
                    },
                    {
                        text:
                            '50 ' +
                            t('pages.editor.actions.lines').toLocaleLowerCase(),
                        title: t('pages.editor.actions.linesTooltip'),
                        click: () => {
                            editorStore.selectAllPages()
                            setLineHeight(1.19)
                            emit('onUpdateContentInPages')
                            handleSelectBackgroundImage('unset')
                        },
                    },
                ],
            },
            {
                title: t('pages.editor.toolBar.background'),
                icon: 'wallpaper',
                chevron: true,
                menu: [
                    {
                        text: t('global.none'),
                        active: editorStore.backgroundImage === 'unset',
                        click: () => {
                            handleSelectBackgroundImage('unset')
                        },
                    },
                    {
                        text: t('pages.editor.protocolBackground'),
                        active:
                            editorStore.backgroundImage ===
                            EditorBackgroundImage.PROTOCOL,
                        click: () => {
                            handleSelectBackgroundImage(
                                EditorBackgroundImage.PROTOCOL
                            )
                        },
                    },
                ],
            },
            {
                text: Math.floor(editorStore.zoom * 100) + '%',
                title: 'Zoom',
                icon: 'zoom_in',
                chevron: true,
                menu: editorStore.zoomOptions.map(([text, zoom]) => {
                    return {
                        text,
                        active: editorStore.zoom == zoom,
                        click: () => {
                            editorStore.zoom = zoom
                        },
                    }
                }),
                menu_width: 80,
                menu_height: 280,
                menu_class: 'align-center',
            },

            {
                title: 'Display',
                icon:
                    editorStore.display == 'horizontal'
                        ? 'view_column'
                        : editorStore.display == 'vertical'
                          ? 'view_stream'
                          : 'view_module',
                chevron: true,
                menu: [
                    {
                        icon: 'view_module',
                        active: editorStore.display == 'grid',
                        click: () => {
                            editorStore.display = 'grid'
                        },
                    },
                    {
                        icon: 'view_column',
                        active: editorStore.display == 'horizontal',
                        click: () => {
                            editorStore.display = 'horizontal'
                        },
                    },
                    {
                        icon: 'view_stream',
                        active: editorStore.display == 'vertical',
                        click: () => {
                            editorStore.display = 'vertical'
                        },
                    },
                ],
                menu_width: 55,
                menu_class: 'align-right',
            },
        ]
        if (!props.disableEditActions) {
            toolbar[1]?.push(...configActions)
        } else {
            toolbar.push(configActions)
        }
    }
    return toolbar
})

watch(
    () => editorStore.cursorPosition,
    () => {
        handleCursorPositionChange()
    },
    {
        deep: true,
    }
)

const applyStyle = (
    commandId: string,
    showUI?: boolean,
    value?: string
): void => {
    const range = editorStore.getSelectionRange()
    if (!range) return
    document.execCommand(commandId, showUI, value)
}

const setLineHeight = (value: number | string) => {
    let parsedValue = typeof value === 'number' ? value : parseFloat(value)

    parsedValue = Math.max(parsedValue, 1)

    parsedValue = parseFloat(parsedValue.toFixed(2))

    editorStore.selectedLine = parsedValue

    editorStore.applyStyleToRange('lineHeight', parsedValue.toString(), true)
}

const handleCursorPositionChange = async () => {
    const cursorPosition = editorStore.cursorPosition

    if (cursorPosition.node) {
        isBoldSelected.value = false
        isItalicSelected.value = false
        isUnderlineSelected.value = false
        isStrikeThrougthSelected.value = false
        isNumberedListSelected.value = false
        isBulletListSelected.value = false
        isAlignedRight.value = false
        isAlignedLeft.value = true
        isAlignedCenter.value = false
        isJustified.value = false

        let currentNode = cursorPosition.node as HTMLElement
        let colorFound = false
        let fontSizeFound = false
        let fontFound = false
        let alignmentFound = false
        let lineHeightFound = false
        let highlightColorFound = false

        while (
            currentNode &&
            !currentNode.classList?.contains(editorStore.pageIdentifierClass)
        ) {
            if (currentNode.nodeType == Node.ELEMENT_NODE) {
                const computedStyle = window.getComputedStyle(currentNode)

                if (
                    computedStyle.fontWeight === 'bold' ||
                    parseInt(computedStyle.fontWeight) >= 700
                ) {
                    isBoldSelected.value = true
                }

                if (computedStyle.fontStyle === 'italic') {
                    isItalicSelected.value = true
                }

                if (computedStyle.textDecorationLine.includes('underline')) {
                    isUnderlineSelected.value = true
                }

                if (computedStyle.textDecorationLine.includes('line-through')) {
                    isStrikeThrougthSelected.value = true
                }

                if (!colorFound) {
                    const color = computedStyle.color
                    if (color) {
                        editorStore.selectedColor = color
                        colorFound = true
                    }
                }

                if (!highlightColorFound) {
                    const highlightColor = computedStyle.backgroundColor
                    if (highlightColor) {
                        editorStore.selectedHighlightColor = highlightColor
                        highlightColorFound = true
                    }
                }

                if (!fontSizeFound) {
                    const fontSize = computedStyle.fontSize?.replace('px', '')
                    if (fontSize) {
                        editorStore.selectedFontSize =
                            editorStore.availableFontSizes.find((size) => {
                                return size.label == fontSize
                            })?.value ?? parseInt(fontSize)
                        fontSizeFound = true
                    }
                }

                if (!lineHeightFound) {
                    const lineHeight = computedStyle.lineHeight
                    const selectedFontSize =
                        editorStore.availableFontSizes.find((size) => {
                            return size.value == editorStore.selectedFontSize
                        })?.label
                    if (lineHeight && selectedFontSize) {
                        editorStore.selectedLine =
                            parseFloat(lineHeight) /
                            parseFloat(selectedFontSize)
                        lineHeightFound = true
                    }
                }

                if (!fontFound) {
                    const font = computedStyle.fontFamily
                        ?.replace(/['"]/g, '')
                        .split(',')[0]
                        .trim()
                    if (font) {
                        editorStore.selectedFont = font
                        fontFound = true
                    }
                }
            }

            if (
                currentNode.tagName &&
                currentNode.tagName.toLowerCase() === 'ul'
            ) {
                isBulletListSelected.value = true
            }

            if (
                currentNode.tagName &&
                currentNode.tagName.toLowerCase() === 'ol'
            ) {
                isNumberedListSelected.value = true
            }

            if (
                !alignmentFound &&
                currentNode.tagName?.toLowerCase() === 'div'
            ) {
                const textAlign = window.getComputedStyle(currentNode).textAlign
                isAlignedLeft.value = false
                if (textAlign) {
                    if (textAlign == 'left' || textAlign == 'start') {
                        isAlignedLeft.value = true
                    } else if (textAlign == 'center') {
                        isAlignedCenter.value = true
                    } else if (textAlign == 'right') {
                        isAlignedRight.value = true
                    } else if (textAlign == 'justify') {
                        isJustified.value = true
                    }

                    alignmentFound = true
                }
            }
            currentNode = currentNode.parentElement as HTMLElement
        }
    }
}

const handleDownload = async () => {
    await editorStore.downloadAsPdf({ filename: props.fileName })
}

const handleFormatTraslitteration = (format: TraslitterationFormat): void => {
    const selection = window.getSelection()
    const range = editorStore.getSelectionRange()

    if (!selection || !range) {
        return
    }

    const transformMap = {
        uppercase: 'uppercase',
        lowercase: 'lowercase',
        title_case: 'capitalize',
    }

    const selectedContent = range.extractContents()

    const span = document.createElement('span')
    span.style.textTransform = transformMap[format]

    span.appendChild(selectedContent)

    range.insertNode(span)
}

const handleSelectBackgroundImage = (backgroundImage: string) => {
    editorStore.backgroundImage = backgroundImage
    emit('onUpdateConfig', editorStore.getConfig())
}

const handleSelectDefaultNumberTranslitteration = (
    tranlitterationConfig: TranlitterateNumberOption
) => {
    editorStore.translitterateConfig.translitterateNumberConfig =
        tranlitterationConfig
    emit('onUpdateConfig', editorStore.getConfig())
}

const handleSelectDefaultFractionTranslitteration = (
    tranlitterationConfig: TranlitterateFractionOption
) => {
    editorStore.translitterateConfig.translitterateFractionConfig =
        tranlitterationConfig
    emit('onUpdateConfig', editorStore.getConfig())
}

const useHyphenation = (value?: Hyphenation) => {
    editorStore.useHyphenation(value)
    emit('onUpdateConfig', editorStore.getConfig())
}
</script>

<style scoped>
@import '@/assets/fonts/fonts.css';
</style>
