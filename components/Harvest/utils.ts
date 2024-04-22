import { v4 as uuid } from 'uuid'

import PubSub from '@/lib/PubSub'
import { SpaceInfo } from './types'

const EXEC_TIMEOUT = 30 * 1000

export const updateHeight = (height: number) => {
  window.parent.postMessage(
    { s: 'notion-harvest', type: 'updateHeight', value: height },
    '*'
  )
}

export const closeModal = () => {
  window.parent.postMessage({ s: 'notion-harvest', type: 'closeModal' }, '*')
}

export const getWebContent = exec_timeout('请求数据超时', async () => {
  return new Promise<{ title: string; url: string; content: string }>(
    (resolve, reject) => {
      PubSub.sub('getWebContent', (res) => {
        if (res.ok) {
          resolve(res.data)
        } else {
          const err: any = Error(res?.error || '请求数据失败')
          err.code = res.code
          reject(err)
        }
      })

      window.parent.postMessage(
        { s: 'notion-harvest', type: 'getWebContent' },
        '*'
      )
    }
  )
})

export const fetchData = exec_timeout(
  '请求数据超时',
  async <T = any>(url: string, init?: RequestInit) => {
    return new Promise<T>((resolve, reject) => {
      PubSub.sub('fetchData', (res) => {
        if (res.ok) {
          resolve(res.data)
        } else {
          const err: any = Error(res?.error || '请求数据失败')
          err.code = res.code
          reject(err)
        }
      })

      window.parent.postMessage(
        { s: 'notion-harvest', type: 'fetchData', value: { url, init } },
        '*'
      )
    })
  }
)

export const getUserId = () => fetchData<string>('/getUserId')

export const submitTransaction = (operations: any[]) =>
  fetchData('/submitTransaction', {
    method: 'POST',
    body: JSON.stringify({
      requestId: uuid(),
      transactions: [{ id: uuid(), operations }]
    })
  })

// TODO: 上传文件并获取文件URL
export const getUploadFileUrl = () =>
  fetchData('/getUploadFileUrl', {
    method: 'POST',
    body: JSON.stringify({
      bucket: 'secure',
      name: 'stn-uIY9eRTCeHljmsZo86OSxppEu2y5Th4wNNNTFqa2.jpeg',
      contentType: 'image/jpeg',
      record: {
        id: 'a72ffa14-f3a3-4edc-92aa-ecc98945dcba',
        table: 'collection',
        spaceId: 'd3a08a39-b3d3-43b3-bd77-621f7704b417'
      },
      supportExtraHeaders: false,
      contentLength: 499835
    })
  }).then(() => {
    const ret = {
      url: 'https://prod-files-secure.s3.us-west-2.amazonaws.com/d3a08a39-b3d3-43b3-bd77-621f7704b417/997f889e-6321-47a5-bb1a-575fce696c0f/stn-uIY9eRTCeHljmsZo86OSxppEu2y5Th4wNNNTFqa2.jpeg',
      signedGetUrl:
        'https://file.notion.so/f/f/d3a08a39-b3d3-43b3-bd77-621f7704b417/997f889e-6321-47a5-bb1a-575fce696c0f/stn-uIY9eRTCeHljmsZo86OSxppEu2y5Th4wNNNTFqa2.jpeg?id=a72ffa14-f3a3-4edc-92aa-ecc98945dcba&table=collection&spaceId=d3a08a39-b3d3-43b3-bd77-621f7704b417&expirationTimestamp=1713916800000&signature=-UsGr2MqNjC7T7VympWuph639sE2ks3sIWfl4YVMqIY',
      signedPutUrl:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/d3a08a39-b3d3-43b3-bd77-621f7704b417/997f889e-6321-47a5-bb1a-575fce696c0f/stn-uIY9eRTCeHljmsZo86OSxppEu2y5Th4wNNNTFqa2.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240422%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240422T030449Z&X-Amz-Expires=86400&X-Amz-Signature=73a68f5f74cf79f254334109a61005d9f8747a8f7ceff9a1d98578f08f80ef08&X-Amz-SignedHeaders=host&x-id=PutObject',
      putHeaders: []
    }
    return fetch(ret.signedPutUrl, {
      method: 'PUT',
      body: new Blob()
    })
  })

export const loadPageChunk = (pageId: string, cursor = false) =>
  fetchData('/loadPageChunk', {
    method: 'POST',
    body: JSON.stringify({
      limit: 100,
      cursor: {
        stack: cursor ? [[{ id: pageId, table: 'block', index: 0 }]] : []
      },
      chunkNumber: 0,
      verticalColumns: false,
      pageId
    })
  }).then((res) => res)

export const getSpaceIds = () =>
  fetchData('/getSpaces', {
    method: 'POST'
  }).then((res: any) => {
    return Object.values(res).reduce<string[]>((p: string[], c: any) => {
      if (!c?.space_view) return p
      const spaceIds = Object.values(c.space_view)
        .map((v: any) => v?.value?.space_id)
        .filter(Boolean)
      return p.concat(spaceIds)
    }, [])
  })

export const getPublicSpaceData = (spaceIds: string[]) =>
  fetchData('/getPublicSpaceData', {
    method: 'POST',
    body: JSON.stringify({ spaceIds, type: 'space-ids' })
  })
    .then((res) => (res.results || []) as Array<SpaceInfo>)
    .then((res) => removeDuplicates(res, 'id'))

export const searchDatabases = (spaceId: string, query = '') =>
  fetchData('/search', {
    method: 'POST',
    body: JSON.stringify({
      type: 'BlocksInSpace',
      query,
      spaceId,
      limit: 20,
      filters: {
        isDeletedOnly: false,
        excludeTemplates: true,
        isNavigableOnly: false,
        navigableBlockContentOnly: true,
        requireEditPermissions: false,
        includePublicPagesWithoutExplicitAccess: false,
        ancestors: [],
        createdBy: [],
        editedBy: [],
        lastEditedTime: {},
        createdTime: {},
        inTeams: []
      },
      sort: {
        field: 'relevance'
      },
      source: 'quick_find_input_change',
      searchExperimentOverrides: {},
      searchSessionId: uuid(),
      searchSessionFlowNumber: 1,
      recentPagesForBoosting: []
    })
  })

export function removeDuplicates<T>(arr: T[], key: string) {
  const ids = [...new Set(arr.map((v) => v[key]))]
  return ids.map((id) => {
    const item = arr.find((v) => v[key] === id)
    return item
  })
}

export function exec_timeout<T, P extends Array<any>>(
  errMsg: string,
  function_call: (...agrs: P) => Promise<T>
) {
  return _exec_timeout(errMsg, EXEC_TIMEOUT, function_call)
}

function _exec_timeout<T, P extends Array<any>>(
  errMsg: string,
  timeout: number,
  function_call: (...agrs: P) => Promise<T>
) {
  return (...agrs: P) =>
    new Promise<T>((resolve, reject) => {
      let timer: number | null = window.setTimeout(() => {
        if (timer) {
          window.clearTimeout(timer)
          timer = null
          let params = ''
          try {
            if (agrs.length > 0) {
              params = JSON.stringify(agrs)
            }
          } catch (error) {
            console.error(error)
          }
          console.error(params ? `[${errMsg}]${params}` : errMsg)
          const e = new Error(errMsg)
          e.name = 'TIMEOUT'

          reject(e)
        }
      }, timeout)

      function_call(...agrs)
        .then((ret) => {
          if (timer) {
            resolve(ret)
            window.clearTimeout(timer)
            timer = null
          }
        })
        .catch((err: Error) => {
          if (timer) {
            window.clearTimeout(timer)
            timer = null

            reject(err)
          }
        })
    })
}
