import React from 'react'

import { CollectionInfo } from './types'

interface Props {
  collection: CollectionInfo
  onClick?: () => void
}

export const Collection = ({ collection: c, onClick }: Props) => {
  const renderIcon = () => {
    const icon = c.icon
    if (icon.startsWith('https://')) {
      // TODO 画像のサイズを調整する
      // const url = `https://www.notion.so/image/${encodeURIComponent(
      //   icon
      // )}?table=collection&id=${c.id}&spaceId=${c.space_id}&userId=${
      //   c.user_id
      // }&width=200px&cache=v2`
      const url = 'https://www.notion.so/icons/book-closed_lightgray.svg'
      return <img src={url} alt='' className='h-5 w-5 rounded-full' />
    } else if (icon.startsWith('/icons')) {
      const url = `https://www.notion.so${icon}?mode=light`
      return <img src={url} alt='' className='h-5 w-5 rounded-full' />
    } else if (icon.startsWith('/images')) {
      const url = 'https://www.notion.so/icons/book-closed_lightgray.svg'
      return <img src={url} alt='' className='h-5 w-5 rounded-full' />
    }
    return <span>{icon}</span>
  }
  return (
    <div
      className='-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all cursor-pointer hover:bg-accent hover:text-accent-foreground'
      onClick={onClick}
    >
      <div className='mt-px h-5 w-5'>{renderIcon()}</div>
      <div className='space-y-1'>
        <p className='text-sm font-medium leading-none'>{c.name}</p>
        {/* <p className='text-sm text-muted-foreground'>{'-'}</p> */}
      </div>
    </div>
  )
}
