import { NextApiRequest, NextApiResponse } from 'next'
import { TranscriptResponse, YoutubeTranscript } from 'youtube-transcript'

function offsetToTime(offset: number) {
  const hours = Math.floor(offset / 3600)
  const minutes = Math.floor((offset - hours * 3600) / 60)
  const seconds = Number((offset - hours * 3600 - minutes * 60).toFixed(0))
  const h = hours < 10 ? `0${hours}` : hours
  const m = minutes < 10 ? `0${minutes}` : minutes
  const s = seconds < 10 ? `0${seconds}` : seconds
  return `${h}:${m}:${s}`
}

type TranscriptInfo = TranscriptResponse & {
  time?: string
  formatText?: string
}

function mergeTranscriptData(transcriptData: TranscriptResponse[]) {
  const mergedData: TranscriptInfo[] = []
  let currentObj: TranscriptInfo = { ...transcriptData[0] }
  for (let i = 1; i < transcriptData.length; i++) {
    const prevOffset = transcriptData[i - 1].offset
    const prevDuration = transcriptData[i - 1].duration
    const currOffset = transcriptData[i].offset
    if (prevOffset + prevDuration - currOffset < 2.2) {
      currentObj.text += ' ' + transcriptData[i].text
      currentObj.duration += transcriptData[i].duration
      continue
    }
    currentObj.time = offsetToTime(currentObj.offset)
    mergedData.push(currentObj)

    currentObj = { ...transcriptData[i] }
  }
  currentObj.time = offsetToTime(currentObj.offset)
  mergedData.push(currentObj)
  return mergedData
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  const url = req.body.url

  const transcript = await YoutubeTranscript.fetchTranscript(url)

  res.status(200).json({ ok: true, data: mergeTranscriptData(transcript) })
}
