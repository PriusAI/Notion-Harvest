const routeType = [
  'addForm',
  'login',
  'savePage',
  'selectForm',
  'saveDone'
] as const

export type RouteType = typeof routeType[number]
export interface BaseProps {
  userId: string
  switchRoute: (route: RouteType, data?: any) => void
}

export interface SpaceInfo {
  id: string
  name: string
}
export interface CollectionInfo {
  id: string
  icon: string
  name: string
  user_id: string
}
