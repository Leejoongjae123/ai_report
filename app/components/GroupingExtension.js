import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export const GroupingExtension = Extension.create({
  name: 'grouping',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('grouping'),
        props: {
          decorations: (state) => {
            const { doc, selection } = state
            const decorations = []

            if (selection.empty) return DecorationSet.empty

            const { from, to } = selection

            const text = doc.textBetween(from, to)
            const regex = /(\([가-힣]\))/g
            let match
            let lastIndex = 0

            while ((match = regex.exec(text)) !== null) {
              const start = from + match.index
              const end = start + match[0].length

              if (lastIndex < match.index) {
                decorations.push(
                  Decoration.inline(from + lastIndex, start, {
                    class: 'grouped-text',
                  })
                )
              }

              lastIndex = match.index + match[0].length
            }

            if (lastIndex < text.length) {
              decorations.push(
                Decoration.inline(from + lastIndex, to, {
                  class: 'grouped-text',
                })
              )
            }

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})