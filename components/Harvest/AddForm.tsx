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
  getSpaces,
  removeDuplicates,
  searchDatabases
} from './utils'
import { BaseProps, CollectionInfo, UserInfoWithSpace } from './types'
import { Collection } from './Collection'
import { SELECTD_FORMS } from '@/lib/constant'

export const AddForm = ({ switchRoute }: BaseProps) => {
  const [spaceId, setSpaceId] = React.useState('')
  const [collections, setCollections] = useLocalStorageState(SELECTD_FORMS, {
    defaultValue: [] as CollectionInfo[]
  })

  const { loading, data, run } = useRequest(
    async (
      query = '',
      spaceId = '',
      spaceIds: string[] = [],
      spaces: UserInfoWithSpace[] = []
    ) => {
      if (!spaceIds.length || !spaces.length) {
        const ret = await getSpaces()
        const spaceArr = await getPublicSpaceData(ret.spaceIds)
        spaceIds = ret.spaceIds
        spaces = ret.spaces.map((user) => {
          user.spaces = user.spaceIds
            .map((spaceId) => {
              const space = spaceArr.find((s) => s.id === spaceId)
              return space
            })
            .filter(Boolean)
          return user
        })
      }
      if (!spaceId) {
        spaceId = spaceIds[0]
      }
      const userId = spaces.find((s) => s.spaceIds.includes(spaceId))?.id || ''

      const ret = await searchDatabases(spaceId, userId, query)

      const pages = Object.values(ret.recordMap?.block || {})
        .map((b: any) => b.value)
        .filter((b) => b.type === 'page')
        .map(
          (v: any) =>
            ({
              id: v?.id || '',
              name: v?.properties?.title[0]?.[0] || '-',
              icon: v?.icon || '/icons/book-closed_lightgray.svg',
              user_id: userId
            } as CollectionInfo)
        )
      const blocks = Object.values(ret.recordMap?.block || {})
        .map((b: any) => b.value)
        .filter((b) => b.type === 'collection_view_page')
      const collections = Object.values(ret.recordMap?.collection || {})
        .map((v: any) => {
          const block = blocks.find((b) => b.collection_id === v.value.id)

          const c = {
            id: v.value?.id || '',
            name: v.value?.name[0]?.[0] || '-',
            icon: v.value?.icon || '/icons/book-closed_lightgray.svg',
            user_id: userId
          } as CollectionInfo
          if (block) {
            return { ...c, id: block.id }
          } else if (v.value?.parent_table === 'block') {
            return { ...c, id: v.value.parent_id }
          }
          return c
        })
        .filter(Boolean)
        .filter((v) => !!v.id)

      return { collections, spaceIds, spaces, pages }
    },
    {
      debounceWait: 300,
      onSuccess(data) {
        if (!spaceId) setSpaceId(data.spaceIds[0])
      }
    }
  )
  const onSearch = (query: string, spaceId: string) => {
    run(query, spaceId, data?.spaceIds || [], data?.spaces || [])
  }
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
              onSearch('', spaceId)
            }}
          >
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Select a space' />
            </SelectTrigger>
            <SelectContent>
              {data?.spaces?.map((user) => (
                <SelectGroup key={user.id}>
                  <SelectLabel>{user.email}</SelectLabel>
                  {user.spaces.map(({ id, name }) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className='my-3'>
        <Input
          type='text'
          placeholder='Search Databases'
          onChange={(ev) => onSearch(ev.target.value, spaceId)}
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
