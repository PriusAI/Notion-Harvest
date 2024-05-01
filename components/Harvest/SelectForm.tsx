import React from 'react'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { BaseProps, CollectionInfo } from './types'
import { Button } from '@/components/ui/button'
import { useLocalStorageState, useMount } from 'ahooks'
import { Collection } from './Collection'
import { SELECTD_FORMS, SELECTED_FORM } from '@/lib/constant'

export const SelectForm = ({
  first,
  switchRoute
}: BaseProps & { first?: boolean }) => {
  const [collections] = useLocalStorageState(SELECTD_FORMS, {
    defaultValue: [] as CollectionInfo[]
  })
  const [collectionId] = useLocalStorageState(SELECTED_FORM, {
    defaultValue: '' as string
  })

  useMount(() => {
    if (collectionId && first) {
      switchRoute('savePage', {})
    }
  })

  return (
    <div className='p-6 pt-3 grid gap-1'>
      {collections.map((collection) => (
        <Collection
          key={collection.id}
          collection={collection}
          onClick={() => switchRoute('savePage', { collection })}
        />
      ))}

      <Button onClick={() => switchRoute('addForm')}>
        <PlusCircledIcon />
        <span className='ml-1'>Add New Form</span>
      </Button>
    </div>
  )
}
