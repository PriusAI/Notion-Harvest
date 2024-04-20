import React from 'react'
import { useLocalStorageState, useRequest } from 'ahooks'
import { Button } from '@/components/ui/button'
import { ReloadIcon, PaperPlaneIcon } from '@radix-ui/react-icons'
import { BaseProps, CollectionInfo } from './types'
import { SELECTD_FORMS, SELECTED_FORM } from '@/lib/constant'

export const SavePage = ({ switchRoute }: BaseProps) => {
  const [collections] = useLocalStorageState(SELECTD_FORMS, {
    defaultValue: [] as CollectionInfo[]
  })
  const [collectionId] = useLocalStorageState(SELECTED_FORM, {
    defaultValue: null as string | null
  })
  const { loading, run } = useRequest(
    async () => {
      // TODO: 保存
    },
    {
      manual: true,
      onSuccess: () => {
        switchRoute('saveDone')
      }
    }
  )

  const collection = collections.find((item) => item.id === collectionId)

  return (
    <div className='flex flex-col'>
      <div className='flex items-center justify-between p-2'>
        <span>form</span>
        <div className='pl-2 font-medium leading-none'>{collection.name}</div>
      </div>

      <div className='flex-1'>
        <Button onClick={run}>
          {loading ? <ReloadIcon /> : <PaperPlaneIcon />}
          <span className='ml-1'>Save Page</span>
        </Button>
      </div>
    </div>
  )
}
