'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadLogo, removeLogo } from '@/lib/actions/settings'
import { Upload, X, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoUploadProps {
  currentUrl: string | null
  pharmacyName: string
}

export function LogoUpload({ currentUrl, pharmacyName }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, startUploadTransition] = useTransition()
  const [isRemoving, startRemoveTransition] = useTransition()
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isBusy = isUploading || isRemoving
  const hasLogo = Boolean(preview)

  function handleFile(file: File | null) {
    if (!file) return
    setError(null)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    const fd = new FormData()
    fd.append('logo', file)

    startUploadTransition(async () => {
      const result = await uploadLogo(fd)
      if (result.error) {
        setError(result.error)
        setPreview(currentUrl)
      }
    })
  }

  function handleRemove() {
    setError(null)
    setPreview(null)
    startRemoveTransition(async () => {
      const result = await removeLogo()
      if (result.error) {
        setError(result.error)
        setPreview(currentUrl)
      }
    })
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0] ?? null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-4">
        <div
          role="button"
          tabIndex={0}
          aria-label={hasLogo ? 'Change logo' : 'Upload logo'}
          onClick={() => !isBusy && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (!isBusy) inputRef.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            if (!isBusy) setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            if (!isBusy) handleDrop(e)
          }}
          className={cn(
            'group relative h-24 w-24 shrink-0 rounded-xl border-2 border-dashed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isBusy && 'opacity-60 cursor-wait',
            !isBusy && 'cursor-pointer hover:border-foreground/40',
            isDragging
              ? 'border-foreground/60 bg-muted'
              : hasLogo
                ? 'border-transparent bg-muted/60'
                : 'border-border bg-muted/40',
          )}
        >
          {hasLogo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview!}
                alt={pharmacyName}
                width={96}
                height={96}
                className="h-full w-full rounded-xl object-contain p-2"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 text-xs font-medium text-foreground">
                  <Upload className="h-3 w-3" />
                  Change
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImagePlus className="h-5 w-5" />
              <span className="text-[10px] font-medium uppercase tracking-wide">
                {isUploading ? 'Uploading…' : 'Upload'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1.5 pt-1">
          <p className="text-sm font-medium">
            {pharmacyName || 'Your pharmacy'}
          </p>
          <p className="text-xs text-muted-foreground">
            Click the tile or drop an image. JPEG, PNG, WebP or SVG · max 2 MB.
          </p>
          {hasLogo && !isBusy && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <X className="h-3 w-3" />
              Remove logo
            </button>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}
