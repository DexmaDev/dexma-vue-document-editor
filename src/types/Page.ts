export default interface Page {
    uuid: string
    contentIdx: number
    content: string
}

export interface PageMatchIndex {
    pageIdx: number
    start: number
    end: number
}
