import * as React from 'react'
import NextImage from 'next/image'

import { isString } from '@gpahal/std/string'

export type ImageProps = React.ComponentPropsWithoutRef<typeof NextImage>

export const Image = React.forwardRef<React.ElementRef<typeof NextImage>, ImageProps>(({ src, alt, ...props }, ref) => {
  let svgStaticImageData: { src: string; width?: number; height?: number } | undefined
  if (src) {
    if (isString(src)) {
      if (src.endsWith('.svg')) {
        svgStaticImageData = {
          src,
          width: parseSafeNumber(props.width),
          height: parseSafeNumber(props.height),
        }
      }
    } else {
      const staticImageData = 'default' in src ? src.default : src
      if (staticImageData.src.endsWith('.svg')) {
        svgStaticImageData = staticImageData
      }
    }
  }

  return svgStaticImageData ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={svgStaticImageData.src}
      alt={alt}
      width={svgStaticImageData.width}
      height={svgStaticImageData.height}
      {...props}
    />
  ) : (
    <NextImage ref={ref} src={src} alt={alt} {...props} />
  )
})
Image.displayName = 'Image'

function parseSafeNumber(value?: number | string): number | undefined {
  if (value == null) {
    return undefined
  } else if (typeof value === 'number') {
    return value
  } else {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? undefined : parsed
  }
}
