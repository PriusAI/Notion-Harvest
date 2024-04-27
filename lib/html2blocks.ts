import { v4 as uuid } from 'uuid'
import { fromHtml } from 'hast-util-from-html'
import { toMdast } from 'hast-util-to-mdast'
import { gfmToMarkdown } from 'mdast-util-gfm'
import { toMarkdown } from 'mdast-util-to-markdown'
import { markdownToBlocks } from '@tryfabric/martian'
import { Readability } from '@mozilla/readability'

export const html2blocks = (htmlContent: string) => {
  try {
    const parser = new DOMParser()

    const doc = parser.parseFromString(htmlContent, 'text/html')
    const reader = new Readability(doc)
    const article = reader.parse()

    const hast = fromHtml(article.content)
    const mdast = toMdast(hast, {
      handlers: {
        base(state, node) {
          if (!state.baseFound) {
            let potentialUrl = String(
              (node.properties && node.properties.href) || ''
            )
            try {
              new URL(potentialUrl) // this line will throw an error for invalid URLs
            } catch (error) {
              if (error instanceof TypeError) {
                console.error('Invalid URL:', error)
                potentialUrl = null
              } else {
                // rethrow the error if it's not a TypeError
                throw error
              }
            }
            state.frozenBaseUrl = potentialUrl || undefined
            state.baseFound = true
          }
        },

        img(state, node) {
          const properties = node.properties || {}
          const result = {
            type: 'image' as const,
            url: state.resolve(
              String(properties.src || properties.dataSrc || '') || null
            ),
            title: properties.title ? String(properties.title) : null,
            alt: properties.alt ? String(properties.alt) : ''
          }
          state.patch(node, result)
          return result
        },
        a(state, node) {
          const properties = node.properties || {}
          // Allow potentially “invalid” nodes, they might be unknown.
          // We also support straddling later.
          const children = state.all(node) as any[]

          const result = {
            type: 'link' as const,
            url: state.resolve(String(properties.href || '') || null),
            title: properties.title ? String(properties.title) : null,
            children
          }
          state.patch(node, result)
          return result
        }
      }
    })

    const markdown = toMarkdown(mdast, { extensions: [gfmToMarkdown()] })
    const blocks = markdownToBlocks(markdown, { strictImageUrls: false })

    return blocks.map((block) => {
      const id = uuid()
      const time = Date.now()
      const args = {
        id,
        version: 1,
        alive: true,
        created_time: time,
        last_edited_time: time,
        created_by_table: 'notion_user',
        last_edited_by_table: 'notion_user'
      } as any

      switch (block.type) {
        case 'paragraph':
          args.type = 'text'
          args.properties = {
            title: block.paragraph.rich_text.map((t) => {
              switch (t.type) {
                case 'text':
                  return [t.text.content]
                default:
                  return ['']
              }
            })
          }
          break
        case 'image':
          args.type = 'image'
          args.format = {
            block_full_width: false,
            block_page_width: false
          }
          // TODO: 还需要考虑图片的alt
          args.properties = {
            source: [[block.image.external.url]]
          }
          break
        default:
          args.type = 'text'
          args.properties = {
            title: [['']]
          }
          break
      }

      return {
        table: 'block',
        id,
        path: [],
        command: 'update',
        args
      } as any
    })
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error)
    return []
  }
}
