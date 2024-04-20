import { AddForm, Login, SavePage, SelectForm } from '@/components/Harvest'
import React, { useState, useCallback, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { RouteType } from '@/components/Harvest'
import { updateHeight } from '@/components/Harvest/utils'

import PubSub from '@/lib/PubSub'
import { SELECTED_FORM } from '@/lib/constant'
import { useLocalStorageState } from 'ahooks'

const SaveToNotion = () => {
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState<RouteType>('selectForm')
  const [, selectFormToStorage] = useLocalStorageState(SELECTED_FORM, {
    defaultValue: '' as string
  })

  useEffect(() => {
    setLoading(false)
    function onmessage(event: MessageEvent) {
      if (event.data?.s !== 'notion-harvest') return
      const { type, value } = event.data
      switch (type) {
        case 'fetchData':
          PubSub.pub('fetchData', value)
          break
        default:
          break
      }
    }

    window.addEventListener('message', onmessage)
    return () => {
      window.removeEventListener('message', onmessage)
    }
  }, [])

  const switchRoute = useCallback(
    (route: RouteType, data?: any) => {
      setRoute(route)
      switch (route) {
        case 'addForm':
          updateHeight(640)
          break
        case 'login':
          updateHeight(320)
          break
        case 'savePage':
          updateHeight(480)
          if (data?.collection?.id) selectFormToStorage(data.collection.id)
          break
        case 'selectForm':
          updateHeight(320)
          break

        default:
          break
      }
    },
    [selectFormToStorage]
  )

  const renderSkeleton = () => (
    <div className='flex items-center space-x-4'>
      <Skeleton className='h-12 w-12 rounded-full' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-[250px]' />
        <Skeleton className='h-4 w-[200px]' />
      </div>
    </div>
  )

  const render = () => {
    if (loading) return renderSkeleton()
    const commProps = { switchRoute }
    switch (route) {
      case 'addForm':
        return <AddForm {...commProps} />
      case 'login':
        return <Login {...commProps} />
      case 'savePage':
        return <SavePage {...commProps} />
      case 'selectForm':
        return <SelectForm {...commProps} />

      default:
        return renderSkeleton()
    }
  }
  return <div>{render()}</div>
}
export default SaveToNotion
