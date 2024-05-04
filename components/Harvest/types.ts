const routeType = [
  'addForm',
  'login',
  'savePage',
  'firstSelectForm',
  'selectForm',
  'saveDone'
] as const

export type RouteType = typeof routeType[number]
export interface BaseProps {
  userId: string
  closeModal: () => void
  switchRoute: (route: RouteType, data?: any) => void
}

export interface UserInfo {
  id: string
  name: string
  email: string
}
export interface UserInfoWithSpace extends UserInfo {
  spaceIds: string[]
  spaces: SpaceInfo[]
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
