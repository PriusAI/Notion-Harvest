import PubSub from '@/lib/PubSub'

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
    return new Promise((resolve) => {
      PubSub.sub('fetchData', (data) => {
        resolve(data)
      })
    })
  }
)

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
