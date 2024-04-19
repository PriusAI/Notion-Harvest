import React from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { BaseProps } from './types'

interface SelectFormProps extends BaseProps {}

export const SelectForm = ({}: SelectFormProps) => {
  return (
    <div className='p-6 pt-0 grid gap-1'>
      <div className='-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground'>
        <Cross2Icon className='mt-px h-5 w-5' />
        <div className='space-y-1'>
          <p className='text-sm font-medium leading-none'>Everything</p>
          <p className='text-sm text-muted-foreground'>
            Email digest, mentions &amp; all activity.
          </p>
        </div>
      </div>
      <div className='-mx-2 flex items-start space-x-4 rounded-md bg-accent p-2 text-accent-foreground transition-all'>
        <Cross2Icon className='mt-px h-5 w-5' />
        <div className='space-y-1'>
          <p className='text-sm font-medium leading-none'>Available</p>
          <p className='text-sm text-muted-foreground'>
            Only mentions and comments.
          </p>
        </div>
      </div>
      <div className='-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground'>
        <Cross2Icon className='mt-px h-5 w-5' />
        <div className='space-y-1'>
          <p className='text-sm font-medium leading-none'>Ignoring</p>
          <p className='text-sm text-muted-foreground'>
            Turn off all notifications.
          </p>
        </div>
      </div>
    </div>
  )
}
