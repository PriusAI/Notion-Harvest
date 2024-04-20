import React from 'react'
import { BaseProps } from './types'

interface SavePageProps extends BaseProps {
  loading?: boolean
}

export const SavePage = ({loading}: SavePageProps) => {
  return loading ? <div></div> : null
}
