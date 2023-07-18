export const logoSvgPrimaryDataUrl =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAyMDAxMDkwNC8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzM3LjE5IDMzNy4xOSIgZmlsbD0iIzMwYTQ2ZSIgc3Ryb2tlPSIjMzBhNDZlIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMTY4LjU5NSwwIDE2OC41OTUsMTk5LjUyMSA2MC44MzQsMTk5LjUyMSIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIyNzYuMzU2LDEzNy42NjkgMTY4LjU5NSwzMzcuMTkgMTY4LjU5NSwxMzcuNjY5Ii8+CiAgPC9nPgo8L3N2Zz4K'
export const logoSvgDataUrl =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAyMDAxMDkwNC8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzM3LjE5IDMzNy4xOSIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2U9ImN1cnJlbnRDb2xvciI+CiAgPGc+CiAgICA8cG9seWdvbiBwb2ludHM9IjE2OC41OTUsMCAxNjguNTk1LDE5OS41MjEgNjAuODM0LDE5OS41MjEiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMjc2LjM1NiwxMzcuNjY5IDE2OC41OTUsMzM3LjE5IDE2OC41OTUsMTM3LjY2OSIvPgogIDwvZz4KPC9zdmc+Cg=='

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

const figtreeFontFiles = new Map<FontWeight, URL>([
  [400, new URL('../../public/fonts/figtree/Figtree-Regular.ttf', import.meta.url)],
  [500, new URL('../../public/fonts/figtree/Figtree-Medium.ttf', import.meta.url)],
  [600, new URL('../../public/fonts/figtree/Figtree-SemiBold.ttf', import.meta.url)],
  [700, new URL('../../public/fonts/figtree/Figtree-Bold.ttf', import.meta.url)],
])

export type FontOptions = {
  name: string
  style: 'normal'
  weight: FontWeight
  data: ArrayBuffer
}

let ogFontsPromise: Promise<FontOptions[]> | undefined

export async function loadOgFonts(): Promise<FontOptions[]> {
  if (ogFontsPromise) {
    return ogFontsPromise
  } else {
    ogFontsPromise = loadOgFontsInternal()
    return ogFontsPromise
  }
}

async function loadOgFontsInternal() {
  const fonts = [] as FontOptions[]
  for (const [weight, url] of Array.from(figtreeFontFiles.entries())) {
    const resp = await fetch(url)
    const data = await resp.arrayBuffer()
    fonts.push({
      name: 'Figtree',
      style: 'normal',
      weight,
      data,
    })
  }
  return fonts
}
