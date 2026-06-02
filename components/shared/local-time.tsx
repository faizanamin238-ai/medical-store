'use client'

import { useEffect, useState } from 'react'

function isoSlice(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ')
}

export function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState(() => isoSlice(iso))

  useEffect(() => {
    setText(new Date(iso).toLocaleString())
  }, [iso])

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  )
}
