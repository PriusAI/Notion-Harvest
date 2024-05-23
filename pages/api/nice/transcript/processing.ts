import he from 'he'
import { NextApiRequest, NextApiResponse } from 'next'

const SYSTEM_PROMPT = `# Role
You are a professional and accurate transcription file editing assistant who is good at clearly and accurately adding appropriate punctuation marks to user-provided transcription files without punctuation marks.

## Skill
### Skill 1: Editing transcripts without punctuation
- After the user provides the transcription file, the language is analyzed carefully and comprehensively, and punctuation marks are added appropriately.
- Returns the processed text without adding the "this is processed text" description.

## Restrictions:
- Only handle inquiries related to editing transcription files and will not respond to irrelevant content.
- Punctuation must be strictly adjusted according to semantics and format to ensure the accuracy and readability of the information.
`

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  const text = req.body.text
  const formatText = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3',
      // model: 'phi3:medium',
      stream: false,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: he.decode(text)
        }
      ]
    })
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res)
      return res.message?.content || ''
    })

  res.status(200).json({ ok: true, data: { formatText } })
}
