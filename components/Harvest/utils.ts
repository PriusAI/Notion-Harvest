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

export const fetchData = exec_timeout(
  '请求数据超时',
  async (url: string, init?: RequestInit) => {
    window.parent.postMessage(
      { s: 'notion-harvest', type: 'fetchData', value: { url, init } },
      '*'
    )
    return new Promise<any>((resolve, reject) => {
      PubSub.sub('fetchData', (res) => {
        if (res.ok) {
          resolve(res.data)
        } else {
          const err: any = Error(res?.error || '请求数据失败')
          err.code = res.code
          reject(err)
        }
      })
    })
  }
)

export const loadPageChunk = (pageId: string, cursor = false) =>
  fetchData('/loadPageChunk', {
    method: 'POST',
    body: JSON.stringify({
      limit: 100,
      cursor: {
        stack: cursor
          ? [
              [
                {
                  id: pageId,
                  table: 'block',
                  index: 0
                }
              ]
            ]
          : []
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
