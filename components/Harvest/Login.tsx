import React from 'react'

import { BaseProps } from './types'

interface LoginProps extends BaseProps {
  open?: boolean
}

export const Login = ({open}: LoginProps) => {
  return open ? <div></div> : null
}
