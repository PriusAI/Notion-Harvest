import { v4 as uuid } from 'uuid'
import { fromHtml } from 'hast-util-from-html'
import { toMdast } from 'hast-util-to-mdast'
import { gfmToMarkdown } from 'mdast-util-gfm'
import { toMarkdown } from 'mdast-util-to-markdown'
import { markdownToBlocks } from '@tryfabric/martian'
import type * as notion from '@tryfabric/martian/src/notion'
import { Readability } from '@mozilla/readability'
// import { YoutubeTranscript } from 'youtube-transcript'

interface Params {
  url: string
  content: string
}

type Block =
  | notion.Block
  | {
      button: {
        automation_id: string
      }
      type?: 'button'
      object?: 'block'
    }

const block2blocks = (block: Block) => {
  const blocks: any[] = []
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
    case 'video':
      args.type = 'video'
      args.format = {
        block_full_width: false,
        block_page_width: true,
        display_source: block.video.external.url
      }
      args.properties = {
        source: [[block.video.external.url]]
      }
      break
    case 'toggle':
      args.type = 'toggle'
      args.properties = {
        title: block.toggle.rich_text.map((t) => {
          switch (t.type) {
            case 'text':
              return [t.text.content]
            default:
              return ['']
          }
        })
      }

      args.content = block.toggle.children.reduce((acc, block) => {
        const childrenBlocks = block2blocks(block)
        blocks.push(...childrenBlocks)
        return acc.concat(childrenBlocks)
      }, [] as any[])
      break
    default:
      args.type = 'text'
      args.properties = {
        title: [['']]
      }
      break
  }

  blocks.unshift({
    table: 'block',
    id,
    path: [],
    command: 'update',
    args
  })

  return blocks
}

export const html2blocks = async ({ url, content }: Params) => {
  try {
    let blocks: Block[] = []
    if (
      url.startsWith('https://www.youtube.com') ||
      url.startsWith('https://youtube.com')
    ) {
      // const transcript = await YoutubeTranscript.fetchTranscript(url)

      // const transcriptBlocks = transcript.map(({ text, duration, offset }) => {
      //   const block: Block = {
      //     type: 'paragraph',
      //     paragraph: {
      //       rich_text: [
      //         {
      //           type: 'text',
      //           text: { content: String(duration) },
      //           annotations: { code: true, color: 'green_background' }
      //         },
      //         {
      //           type: 'text',
      //           text: { content: String(offset) },
      //           annotations: { code: true, color: 'orange_background' }
      //         },
      //         {
      //           type: 'text',
      //           text: { content: text }
      //         }
      //       ],
      //       color: 'default'
      //     }
      //   }
      //   return block
      // })

      blocks = [
        {
          type: 'video',
          video: {
            type: 'external',
            external: { url }
          }
        },
        // {
        //   type: 'toggle',
        //   toggle: {
        //     rich_text: [
        //       {
        //         type: 'text',
        //         text: { content: 'Transcript' }
        //       }
        //     ],
        //     color: 'default',
        //     children: transcriptBlocks
        //   }
        // }
      ]
    } else {
      const parser = new DOMParser()

      const doc = parser.parseFromString(content, 'text/html')
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
      blocks = markdownToBlocks(markdown, { strictImageUrls: false })
    }

    return blocks.reduce((acc, block) => {
      return acc.concat(block2blocks(block))
    }, [] as any[])
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error)
    return []
  }
}
