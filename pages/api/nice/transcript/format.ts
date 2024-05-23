import { NextApiRequest, NextApiResponse } from 'next'
import { YoutubeTranscript } from 'youtube-transcript'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  const url = req.body.url

  const transcript = await YoutubeTranscript.fetchTranscript(url)

  res.status(200).json({ ok: true, data: transcript })
}
