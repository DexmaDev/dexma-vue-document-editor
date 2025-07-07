import { PageMatchIndex } from '../types/Page'

export const debounce = (fn: (...args: any) => void, delay: number) => {
    let timer: any

    return (...args: any[]) => {
        clearTimeout(timer)

        timer = setTimeout(() => {
            fn(...args)
        }, delay)
    }
}

export const getTestContentAsSingleElement = (): string[] => {
    let textstring = `<a class="custom-tag text" id="physicsubject-surname-raffaele-balsamo-3">BALSAMO</a> <a class="custom-tag text" id="physicsubject-name-raffaele-balsamo-3">RAFFAELE</a><h1>Hello world!</h1><p>This is a rich-text editor built on top of <span contenteditable="false"><a href="https://vuejs.org/" target="_blank">Vue.js</a></span> using the native <span contenteditable="false"><a href="https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content" target="_blank"><i>contenteditable</i></a></span> browser implementation and some JavaScript trickery to spread content over paper-sized pages.</p><p>Built-in functionality includes:</p><ul><li>Using Vue.js components as interactive page templates (see next page)</li><li>Word-by-word page splitting (<u>still experimental - only for plain HTML content</u>)</li><li>Native Print compatible</li><li>Dynamic document format and margins in millimeters</li><li>Custom page overlays (headers, footers, page numbers)</li><li>Page breaks</li><li>Smart zoom and page display modes</li><li>Computes text style at caret position</li></ul><p>This library may be useful if you design an application that generate documents and you would let the user to modify them slightly before printing / saving, but with limited / interactive possibilities. It does not intend to replace a proper document editor with full functionality.<br>Make sure this project is suitable to your needs before using it.</p><p>This demo adds:</p><ul><li>The top bar (<span contenteditable="false"><a href="https://github.com/motla/vue-file-toolbar-menu" target="_blank">vue-file-toolbar-menu</a></span> component) and the functions associated with it</li><li>Rewritten history stack (undo/redo) compatible with native commands</li><li>Pinch and trackpad zooming</li></ul><p>Check out the <span contenteditable="false"><a href="https://github.com/motla/vue-document-editor/blob/master/src/Demo/Demo.vue" target="_blank">Demo.vue</a></span> file if you need to add these functionalities to your application.</p><p>The link below is an example of non-editable block set with <code>contenteditable="false"</code>:</p><p style="text-align:center" contenteditable="false"><a href="https://github.com/motla/vue-document-editor">View docs on Github</a>, you can't edit me.</p><p>But you can still edit this.</p>`

    for (let i = 0; i < 10; i++) {
        textstring += textstring
    }
    return [textstring]
}

export const getTestContent = (elementsNumber: number = 1000): string[] => {
    const textstring = `<a class="custom-tag text" id="physicsubject-surname-raffaele-balsamo-3">BALSAMO</a> <a class="custom-tag text" id="physicsubject-name-raffaele-balsamo-3">RAFFAELE</a><h1>Hello world!</h1><p>This is a rich-text editor built on top of <span contenteditable="false"><a href="https://vuejs.org/" target="_blank">Vue.js</a></span> using the native <span contenteditable="false"><a href="https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content" target="_blank"><i>contenteditable</i></a></span> browser implementation and some JavaScript trickery to spread content over paper-sized pages.</p><p>Built-in functionality includes:</p><ul><li>Using Vue.js components as interactive page templates (see next page)</li><li>Word-by-word page splitting (<u>still experimental - only for plain HTML content</u>)</li><li>Native Print compatible</li><li>Dynamic document format and margins in millimeters</li><li>Custom page overlays (headers, footers, page numbers)</li><li>Page breaks</li><li>Smart zoom and page display modes</li><li>Computes text style at caret position</li></ul><p>This library may be useful if you design an application that generate documents and you would let the user to modify them slightly before printing / saving, but with limited / interactive possibilities. It does not intend to replace a proper document editor with full functionality.<br>Make sure this project is suitable to your needs before using it.</p><p>This demo adds:</p><ul><li>The top bar (<span contenteditable="false"><a href="https://github.com/motla/vue-file-toolbar-menu" target="_blank">vue-file-toolbar-menu</a></span> component) and the functions associated with it</li><li>Rewritten history stack (undo/redo) compatible with native commands</li><li>Pinch and trackpad zooming</li></ul><p>Check out the <span contenteditable="false"><a href="https://github.com/motla/vue-document-editor/blob/master/src/Demo/Demo.vue" target="_blank">Demo.vue</a></span> file if you need to add these functionalities to your application.</p><p>The link below is an example of non-editable block set with <code>contenteditable="false"</code>:</p><p style="text-align:center" contenteditable="false"><a href="https://github.com/motla/vue-document-editor">View docs on Github</a>, you can't edit me.</p><p>But you can still edit this.</p>`

    const content = new Array(elementsNumber).fill(textstring)
    return content
}

export const replaceAllMatches = (
    content: string[],
    matches: PageMatchIndex[],
    replaceText: string
): string[] => {
    if (!replaceText || !matches.length) return content

    const grouped = new Map()
    for (const match of matches) {
        if (!grouped.has(match.pageIdx)) grouped.set(match.pageIdx, [])
        grouped.get(match.pageIdx).push({ start: match.start, end: match.end })
    }

    const newContent = [...content]

    for (const [pageIdx, group] of grouped.entries()) {
        let text = newContent[pageIdx]
        let offset = 0
        for (const { start, end } of group) {
            const realStart = start + offset
            const realEnd = end + offset
            text = text.slice(0, realStart) + replaceText + text.slice(realEnd)
            offset += replaceText.length - (end - start)
        }
        newContent[pageIdx] = text
    }

    return newContent
}

export const replaceAt = (
    src: string,
    start: number,
    end: number,
    replacement: string
): string => {
    return src.slice(0, start) + replacement + src.slice(end)
}
