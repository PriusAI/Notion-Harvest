import {
  AddForm,
  Login,
  SavePage,
  SelectForm,
  SaveDone
} from '@/components/Harvest'
import React, { useState, useCallback, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { RouteType } from '@/components/Harvest'
import { getUserId, updateHeight } from '@/components/Harvest/utils'

import PubSub from '@/lib/PubSub'
import { SELECTED_FORM } from '@/lib/constant'
import { useLocalStorageState, useMount } from 'ahooks'

const SaveToNotion = () => {
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [pageData, setPageData] = useState<any>({})
  const [route, setRoute] = useState<RouteType>()
  const [, selectFormToStorage] = useLocalStorageState(SELECTED_FORM, {
    defaultValue: '' as string
  })

  useEffect(() => {
    function onmessage(event: MessageEvent) {
      if (event.data?.s !== 'notion-harvest') return
      const { type, value } = event.data
      switch (type) {
        case 'fetchData':
          PubSub.pub('fetchData', value)
          break
        case 'getWebContent':
          PubSub.pub('getWebContent', value)
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
  useMount(() => {
    setTimeout(() => {
      getUserId()
        .then((userId) => {
          setUserId(userId)
          switchRoute('firstSelectForm')
        })
        .catch(() => {
          switchRoute('login')
        })
        .finally(() => {
          setLoading(false)
        })
    }, 300)
  })

  const switchRoute = useCallback(
    (route: RouteType, data?: any) => {
      setRoute(route)
      switch (route) {
        case 'addForm':
          updateHeight(560)
          break
        case 'login':
          updateHeight(180)
          break
        case 'savePage':
          updateHeight(480)
          if (data?.collection?.id) selectFormToStorage(data.collection.id)
          break
        case 'selectForm':
          updateHeight(320)
          break

        case 'saveDone':
          updateHeight(180)
          if (data?.pageId) setPageData(data)
          break
        default:
          break
      }
    },
    [selectFormToStorage]
  )

  const renderSkeleton = () => (
    <div className='w-full p-3 flex items-center space-x-4'>
      <Skeleton className='h-12 w-12 rounded-full' />
      <div className='flex-1 space-y-2'>
        <Skeleton className='h-4 w-2/5' />
        <Skeleton className='h-4 w-4/5' />
      </div>
    </div>
  )

  const render = () => {
    if (loading) return renderSkeleton()
    const commProps = { userId, switchRoute }

    switch (route) {
      case 'addForm':
        return <AddForm {...commProps} />
      case 'login':
        return <Login />
      case 'savePage':
        return <SavePage {...commProps} />
      case 'selectForm':
        return <SelectForm {...commProps} />
      case 'firstSelectForm':
        return <SelectForm {...commProps} first />
      case 'saveDone':
        return <SaveDone {...pageData} />
      default:
        return renderSkeleton()
    }
  }
  return <div data-route={route}>{render()}</div>
}
export default SaveToNotion
