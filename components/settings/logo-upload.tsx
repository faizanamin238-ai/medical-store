'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadLogo } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface LogoUploadProps {
  currentUrl: string | null
  pharmacyName: string
}

export function LogoUpload({ currentUrl, pharmacyName }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setPreview(URL.createObjectURL(file))

    const fd = new FormData()
    fd.append('logo', file)

    startTransition(async () => {
      const result = await uploadLogo(fd)
      if (result.error) {
        setError(result.error)
        setPreview(currentUrl)
      }
    })
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {preview ? (
          // Use plain img — src can be a Supabase storage URL or blob: URL;
          // next/image would throw without remotePatterns for external domains.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={pharmacyName} width={64} height={64} className="h-full w-full object-contain" />
        ) : (
          <span className="text-xl font-semibold text-muted-foreground">
            {pharmacyName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          {isPending ? 'Uploading…' : 'Upload logo'}
        </Button>
        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or SVG · max 2 MB</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
