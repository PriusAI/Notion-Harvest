import { NextApiRequest, NextApiResponse } from 'next'
import { YoutubeTranscript } from 'youtube-transcript'
import { type Block } from '../../../../lib/html2blocks'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  const url = req.body.url

  const transcript = await YoutubeTranscript.fetchTranscript(url)

  const transcriptBlocks = transcript.map(({ text, duration, offset }) => {
    const block: Block = {
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: String(duration) },
            annotations: { code: true, color: 'green_background' }
          },
          {
            type: 'text',
            text: { content: String(offset) },
            annotations: { code: true, color: 'orange_background' }
          },
          {
            type: 'text',
            text: { content: text }
          }
        ],
        color: 'default'
      }
    }
    return block
  })

  res.status(200).json({ ok: true, data: transcriptBlocks })
}
