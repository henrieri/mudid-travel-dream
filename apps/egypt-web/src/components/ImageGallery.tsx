import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

export type GalleryImage = {
  url: string
  name: string
  path: string
}

type ImageGalleryProps = {
  images: GalleryImage[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

export function ImageGallery({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)

  // Reset index when opening with a new initial index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setIsZoomed(false)
    }
  }, [isOpen, initialIndex])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setIsZoomed(false)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setIsZoomed(false)
  }, [images.length])

  const toggleZoom = useCallback(() => {
    setIsZoomed((prev) => !prev)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case ' ':
          e.preventDefault()
          toggleZoom()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when gallery is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, goToPrevious, goToNext, toggleZoom])

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
              {currentIndex + 1} / {images.length}
            </span>
            <span className="hidden text-sm text-slate-400 sm:block">
              {currentImage.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleZoom}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              title={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              {isZoomed ? (
                <ZoomOut className="h-5 w-5" />
              ) : (
                <ZoomIn className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main image area */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4 sm:px-16">
          {/* Previous button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-2 z-10 rounded-full bg-slate-800/80 p-2 text-white shadow-lg transition hover:bg-slate-700 sm:left-4 sm:p-3"
              title="Previous (Left arrow)"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Image container */}
          <div
            className={`flex h-full w-full items-center justify-center ${
              isZoomed ? 'cursor-zoom-out overflow-auto' : 'cursor-zoom-in'
            }`}
            onClick={toggleZoom}
          >
            <img
              src={currentImage.url}
              alt={currentImage.name}
              className={`transition-transform duration-200 ${
                isZoomed
                  ? 'max-w-none'
                  : 'max-h-full max-w-full object-contain'
              }`}
              style={isZoomed ? { transform: 'scale(1.5)' } : undefined}
            />
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-2 z-10 rounded-full bg-slate-800/80 p-2 text-white shadow-lg transition hover:bg-slate-700 sm:right-4 sm:p-3"
              title="Next (Right arrow)"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 px-4 pb-4">
            {images.map((image, index) => (
              <button
                key={image.path}
                type="button"
                onClick={() => {
                  setCurrentIndex(index)
                  setIsZoomed(false)
                }}
                className={`relative h-12 w-16 overflow-hidden rounded-lg border-2 transition sm:h-14 sm:w-20 ${
                  index === currentIndex
                    ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Keyboard hints */}
        <div className="hidden items-center justify-center gap-6 pb-3 text-xs text-slate-500 sm:flex">
          <span>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">
              ←
            </kbd>{' '}
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">
              →
            </kbd>{' '}
            Navigate
          </span>
          <span>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">
              Space
            </kbd>{' '}
            Zoom
          </span>
          <span>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">
              Esc
            </kbd>{' '}
            Close
          </span>
        </div>
      </div>
    </div>
  )
}
