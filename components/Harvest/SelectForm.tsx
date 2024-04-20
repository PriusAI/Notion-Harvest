import React from 'react'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { BaseProps, CollectionInfo } from './types'
import { Button } from '@/components/ui/button'
import { useLocalStorageState } from 'ahooks'
import { Collection } from './Collection'
import { SELECTD_FORMS } from '@/lib/constant'

interface SelectFormProps extends BaseProps {
  loading?: boolean
}

export const SelectForm = ({ loading, switchRoute }: SelectFormProps) => {
  const [collections] = useLocalStorageState(SELECTD_FORMS, {
    defaultValue: [] as CollectionInfo[]
  })

  console.log('collections', collections)

  if (loading) return null
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
