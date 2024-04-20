import React from 'react'

import { BaseProps } from './types'

interface AddFormProps extends BaseProps {
  open?: boolean
}

export const AddForm = ({ open }: AddFormProps) => {
  return open ? <div></div> : null
}
