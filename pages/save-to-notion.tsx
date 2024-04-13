import { AddForm } from '@/components/Harvest'
import React, { useCallback, useEffect } from 'react'

const SaveToNotion = () => {
  useEffect(() => {
    function onmessage(event: MessageEvent) {
      if (event.data?.s !== 'notion-harvest') return
    }

    window.addEventListener('message', onmessage)
    return () => {
      window.removeEventListener('message', onmessage)
    }
  }, [])

  const updateHeight = useCallback((height: number) => {
    window.parent.postMessage(
      { s: 'notion-harvest', type: 'updateHeight', value: height },
      '*'
    )
  }, [])
  return (
    <div>
      <AddForm updateHeight={updateHeight} />
    </div>
  )
}
export default SaveToNotion
