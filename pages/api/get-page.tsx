import { NextApiRequest, NextApiResponse } from 'next'
import { NotionAPI } from 'notion-client'

const notion = new NotionAPI()

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  const pageId = req.body.pageId as string
  if (!pageId) {
    return res.status(400).send({ error: 'pageId is required' })
  }
  try {
    const recordMap = await notion.getPage(pageId)
    res.status(200).json(recordMap)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
