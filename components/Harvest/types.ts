const routeType = ['addForm', 'login', 'savePage', 'selectForm'] as const

export type RouteType = typeof routeType[number]
export interface BaseProps {
  switchRoute: (route: RouteType) => void
}
