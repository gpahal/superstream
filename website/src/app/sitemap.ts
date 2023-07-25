import type { MetadataRoute } from 'next'

import { getFlattenedDocs } from '@/lib/docs.server'
import { WEBSITE_ORGIN } from '@/lib/metadata'

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = getFlattenedDocs()
  const lastModified = new Date()

  return [
    {
      url: `${WEBSITE_ORGIN}`,
      lastModified,
    },
    ...docs.map((post) => ({
      url: `${WEBSITE_ORGIN}/docs/${post.path}`,
      lastModified,
    })),
    {
      url: `${WEBSITE_ORGIN}/dashboard`,
      lastModified,
    },
    {
      url: `${WEBSITE_ORGIN}/dashboard/create`,
      lastModified,
    },
  ]
}
