import React from 'react'
import { CheckCircledIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { closeModal } from './utils'

interface SaveDoneProps {
  pageId: string
}

export const SaveDone = ({ pageId }: SaveDoneProps) => {
  const onOpen = () => {
    window.open(`https://www.notion.so/${pageId}`)
    closeModal()
  }
  return (
    <div className='w-full p-4 flex flex-col items-center'>
      <p className='mb-3'>
        <CheckCircledIcon className='text-green-500 w-11 h-11' />
      </p>
      <Button onClick={onOpen}>Open Page in Notion</Button>
    </div>
  )
}
