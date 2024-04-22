import React from 'react'
import { v4 as uuid } from 'uuid'
import { useLocalStorageState, useRequest } from 'ahooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ReloadIcon, PaperPlaneIcon } from '@radix-ui/react-icons'
import { BaseProps, CollectionInfo } from './types'
import { SELECTD_FORMS, SELECTED_FORM } from '@/lib/constant'
import { getWebContent, submitTransaction } from './utils'
import { html2blocks } from '@/lib/html2blocks'

export const SavePage = ({ userId, switchRoute }: BaseProps) => {
  const [collections] = useLocalStorageState(SELECTD_FORMS, {
    defaultValue: [] as CollectionInfo[]
  })
  const [collectionId] = useLocalStorageState(SELECTED_FORM, {
    defaultValue: '' as string
  })
  const collection = collections.find((item) => item.id === collectionId)
  const req = useRequest(getWebContent)
  const { loading, run } = useRequest(
    async () => {
      if (!req.data?.content) return
      const pageId = uuid()
      const time = Date.now()
      const spaceId = collection.space_id
      const blocks = html2blocks(req.data.content)
      if (!blocks.length) return

      const operations = [
        {
          id: pageId,
          table: 'block',
          path: [],
          command: 'update',
          args: {
            type: 'page',
            id: pageId,
            space_id: spaceId,
            parent_id: collectionId,
            parent_table: 'collection',
            alive: true,
            version: 1,
            created_time: time,
            last_edited_time: time,
            created_by_table: 'notion_user',
            created_by_id: userId,
            last_edited_by_table: 'notion_user',
            last_edited_by_id: userId,
            properties: {
              title: [[req.data.title]]
              // VVMi: [[req.data.url]]
            },
            content: blocks.map((b) => b.id)
          }
        },
        ...blocks.map((block) => {
          block.args = {
            ...block.args,
            space_id: spaceId,
            parent_id: pageId,
            parent_table: 'block',
            created_by_id: userId,
            last_edited_by_id: userId
          }
          return block
        })
      ]
      await submitTransaction(operations)
      return pageId.replace(/-/g, '')
    },
    {
      manual: true,
      onSuccess: (ret) => {
        switchRoute('saveDone', { pageId: ret })
      }
    }
  )

  return (
    <div className='flex flex-col p-3'>
      <div className='flex items-center justify-between p-2'>
        <span>form</span>
        <div className='pl-2 font-medium leading-none'>{collection.name}</div>
      </div>

      <div className='w-full flex-1'>
        {req.loading ? (
          <div className='w-full flex items-center space-x-4'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-2/5' />
              <Skeleton className='h-4 w-4/5' />
            </div>
          </div>
        ) : (
          <>
            <div className='mb-4'>
              <Input
                disabled
                type='text'
                value={req.data.title}
                placeholder='Search Databases'
              />
            </div>
            <Button onClick={run}>
              {loading ? (
                <ReloadIcon className='animate-spin' />
              ) : (
                <PaperPlaneIcon />
              )}
              <span className='ml-1'>Save Page</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
