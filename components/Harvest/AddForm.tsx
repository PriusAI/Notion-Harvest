import React from 'react'
import { useLocalStorageState, useRequest } from 'ahooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeftIcon } from '@radix-ui/react-icons'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import {
  getPublicSpaceData,
  getSpaceIds,
  removeDuplicates,
  searchDatabases
} from './utils'
import { BaseProps, CollectionInfo } from './types'
import { Collection } from './Collection'
import { SELECTD_FORMS } from '@/lib/constant'

export const AddForm = ({ switchRoute }: BaseProps) => {
  const [spaceId, setSpaceId] = React.useState('')
  const [collections, setCollections] = useLocalStorageState(SELECTD_FORMS, {
    defaultValue: [] as CollectionInfo[]
  })

  const { loading, data, run } = useRequest(
    async (query = '', spaceId = '', spaceIds: string[] = []) => {
      if (!spaceIds.length) {
        spaceIds = await getSpaceIds()
      }
      if (!spaceId) {
        spaceId = spaceIds[0]
      }
      const spaces = await getPublicSpaceData(spaceIds)
      const ret = await searchDatabases(spaceId, query)
      const blocks = Object.values(ret.recordMap?.block || {})
        .map((b: any) => b.value)
        .filter((b) => b.type === 'collection_view_page')
      const collections = Object.values(ret.recordMap?.collection || {})
        .map(
          (v: any) =>
            ({
              id: v.value?.id || '',
              name: v.value?.name[0]?.[0] || '-',
              icon: v.value?.icon || '/icons/book-closed_lightgray.svg',
              user_id: ret.userId
            } as CollectionInfo)
        )
        .filter((v) => !!v.id)
        .map((v) => {
          const block = blocks.find((b) => b.collection_id === v.id)
          if (block) {
            return { ...v, id: block.id }
          }
          return null
        })
        .filter(Boolean)

      console.log('query', query, collections)

      return { collections, spaceIds, spaces }
    },
    {
      debounceWait: 300,
      onSuccess(data) {
        if (!spaceId) setSpaceId(data.spaceIds[0])
      }
    }
  )
  return (
    <div className='p-3'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center'>
          <Button
            size='icon'
            variant='secondary'
            className='rounded-full'
            onClick={() => switchRoute('selectForm')}
          >
            <ChevronLeftIcon />
          </Button>
          <span className='ml-2'>In space</span>
        </div>

        {!!data?.spaces && (
          <Select
            value={spaceId}
            onValueChange={(spaceId) => {
              setSpaceId(spaceId)
              run('', spaceId, data?.spaceIds || [])
            }}
          >
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Select a space' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Space List</SelectLabel>
                {data?.spaces.map(({ id, name }) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
      <div className='my-3'>
        <Input
          type='text'
          placeholder='Search Databases'
          onChange={(ev) => run(ev.target.value, spaceId, data?.spaceIds || [])}
        />
      </div>
      {loading ? (
        <div className='w-full flex items-center space-x-4'>
          <Skeleton className='h-12 w-12 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-2/5' />
            <Skeleton className='h-4 w-4/5' />
          </div>
        </div>
      ) : (
        <div>
          {data?.collections.map((collection) => (
            <Collection
              key={collection.id}
              collection={collection}
              onClick={() => {
                setCollections(
                  removeDuplicates([...collections, collection], 'id')
                )
                switchRoute('savePage', { collection })
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
