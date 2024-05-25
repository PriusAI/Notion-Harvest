import React from 'react'

import { CollectionInfo } from './types'

interface Props {
  collection: CollectionInfo
  onClick?: () => void
}

/**
 * @description:  只能判断是否输入emoji表情，不能执行replace或提取具体表情符号
 */
export const isEmojiCharacter = (substring: string) => {
  for (var i = 0; i < substring.length; i++) {
    var hs = substring.charCodeAt(i)
    if (hs >= 0xd800 && hs <= 0xdbff) {
      if (substring.length > 1) {
        var ls = substring.charCodeAt(i + 1)
        var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000
        if (uc >= 0x1d000 && uc <= 0x1f77f) {
          return true
        }
      }
    } else if (substring.length > 1) {
      var a = substring.charCodeAt(i + 1)
      if (a === 0x20e3) {
        return true
      }
    } else {
      if (hs >= 0x2100 && hs <= 0x27ff) {
        return true
      } else if (hs >= 0x2B05 && hs <= 0x2b07) {
        return true
      } else if (hs >= 0x2934 && hs <= 0x2935) {
        return true
      } else if (hs >= 0x3297 && hs <= 0x3299) {
        return true
      } else if (hs === 0xa9 || hs === 0xae || hs === 0x303d || hs === 0x3030 ||
        hs === 0x2b55 || hs === 0x2b1c || hs === 0x2b1b ||
        hs === 0x2b50) {
        return true
      }
    }
  }
}

export const Collection = ({ collection: c, onClick }: Props) => {
  const renderIcon = () => {
    const icon = c.icon
    if (isEmojiCharacter(icon)) {
      return <span>{icon}</span>
    } else if (icon.startsWith('https://')) {
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
    } else {
      const url = 'https://www.notion.so/icons/book-closed_lightgray.svg'
      return <img src={url} alt='' className='h-5 w-5 rounded-full' />
    }

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
