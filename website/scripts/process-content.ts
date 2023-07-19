import fs from 'node:fs/promises'
import path from 'node:path'

import { formatDistanceToNow } from 'date-fns'
import sizeOf from 'image-size'
import fetch from 'node-fetch'

import {
  formatParseDirectoryResultErrors,
  FrontmatterSchema,
  getRenderableTreeNodeTopLevelSections,
  linkSchema,
  parseDirectory,
  ParseResultSuccess,
  renderableNodesToString,
  renderableNodeToString,
} from '@gpahal/markdoc'
import { FS_MODULE } from '@gpahal/std-node/fs'
import { createFlattenedFileMapIndex, FileMap, FlattenedFileMapIndex } from '@gpahal/std/fs'
import { isAbsoluteUrl } from '@gpahal/std/url'

import { ContentCollectionMetadata, ContentSearchDocument } from '../src/lib/content'
import { DOCS_FRONTMATTER_SCHEMA, DocsFrontmatterSchema } from '../src/lib/docs'

const PUBLIC_DIR_PATH = path.join(__dirname, '..', 'public')
const CONTENT_DIR_PATH = path.join(__dirname, '..', 'content')
const CONTENT_GEN_DB_DIR_PATH = path.join(__dirname, '..', 'src', 'gen', 'content')

async function transformImageSrcAndGetSize(src: string): Promise<{ src: string; width?: number; height?: number }> {
  let input: string | Buffer = src
  if (isAbsoluteUrl(src)) {
    const resp = await fetch(src)
    input = Buffer.from(await resp.arrayBuffer())
  } else {
    if (!src.startsWith('/')) {
      throw new Error('Image src should start with a slash')
    }

    src = path.join('/images', src)
    input = path.join(PUBLIC_DIR_PATH, src)
  }

  const { width, height } = sizeOf(input)
  if (width == null || height == null) {
    throw new Error('Image size could not be calculated')
  }
  return { src, width, height }
}

async function generateCollectionDb<TFrontmatterSchema extends FrontmatterSchema>(
  collection: ContentCollectionMetadata<TFrontmatterSchema>,
): Promise<void> {
  const startTime = new Date()
  await generateCollectionDbInner(collection)
  console.info(`Time: ${formatDistanceToNow(startTime, { includeSeconds: true })}\n`)
}

async function generateCollectionDbInner<TFrontmatterSchema extends FrontmatterSchema>(
  collection: ContentCollectionMetadata<TFrontmatterSchema>,
): Promise<void> {
  const { path: collectionPath, frontmatterSchema, transformFileName, transformConfig } = collection
  console.info(`Generating collection db for ${collectionPath}...`)

  const contentDir = path.join(CONTENT_GEN_DB_DIR_PATH, collectionPath)
  await fs.mkdir(contentDir, { mode: 0o755, recursive: true })
  const collectionContentDirPath = path.join(CONTENT_DIR_PATH, collectionPath)
  const result = await parseDirectory(FS_MODULE, collectionContentDirPath, () => 'index.mdoc', {
    frontmatterSchema,
    transformConfig: {
      ...(transformConfig || {}),
      tags: {
        link: {
          ...linkSchema,
          attributes: {
            ...(linkSchema.attributes || {}),
            variant: {
              type: String,
              default: 'highlighted',
              matches: ['unstyled', 'highlighted', 'hover-highlighted', 'link'],
            },
          },
        },
        'code-block': {
          render: 'CodeBlock',
          attributes: {
            'data-content': { type: String },
            'data-name': { type: String },
            'data-language': { type: String },
            'data-variant': { type: String },
          },
        },
        'code-block-group': {
          render: 'CodeBlockGroup',
        },
        alert: {
          render: 'Alert',
          attributes: {
            variant: {
              type: String,
              default: 'info',
              matches: ['info', 'warn', 'error'],
            },
          },
        },
        badges: {
          render: 'Badges',
        },
        badge: {
          render: 'Badge',
        },
        ...(transformConfig?.tags || {}),
      },
      image: { transformImageSrcAndGetSize },
      codeAndFence: {
        theme: {
          light: 'github-light',
          dark: 'github-dark',
        },
        wrapperTagName: 'code-block',
      },
    },
    transformFileName: (fileName, fsFileMapFileItem) =>
      transformFileName && fsFileMapFileItem.data.isSuccessful
        ? transformFileName(fileName, fsFileMapFileItem.data.frontmatter)
        : fileName,
  })
  if (!result.isSuccessful) {
    console.error(
      `Error generating collection db for ${collectionPath}:\n\n${formatParseDirectoryResultErrors(result.data)}`,
    )
    process.exit(1)
  }

  const data = result.data satisfies FileMap<unknown>
  const flattenedFileMapIndex = createFlattenedFileMapIndex(data, collection.compareFileMapItems)
  const contentGenDbFilePath = path.join(contentDir, 'db.json')
  await fs.writeFile(contentGenDbFilePath, JSON.stringify(flattenedFileMapIndex), { mode: 0o644 })

  const searchDocuments = generateContentCollectioSearchDocuments(collection, flattenedFileMapIndex)
  const contentGenSearchIndexFilePath = path.join(contentDir, 'search-documents.json')
  await fs.writeFile(contentGenSearchIndexFilePath, JSON.stringify(searchDocuments), { mode: 0o644 })

  console.info(`Generated collection db for ${collectionPath}`)
}

function generateContentCollectioSearchDocuments<TFrontmatterSchema extends FrontmatterSchema>(
  collection: ContentCollectionMetadata<TFrontmatterSchema>,
  flattenedFileMapIndex: FlattenedFileMapIndex<ParseResultSuccess<TFrontmatterSchema>>,
): ContentSearchDocument[] {
  const documents: ContentSearchDocument[] = []
  for (const item of flattenedFileMapIndex) {
    const topLevelSections = getRenderableTreeNodeTopLevelSections(item.data.content)
    documents.push({
      type: 'page',
      id: item.path,
      path: item.path,
      pagePath: item.path,
      title: collection.getTitle(item.data.frontmatter),
      content: renderableNodesToString(topLevelSections.nodes) || '',
    })

    if (topLevelSections.sections.length === 0) {
      continue
    }

    for (const section of topLevelSections.sections) {
      const headingNode = section.headingNode
      const id = (headingNode.attributes?.id as string | undefined)?.trim()
      if (!id) {
        continue
      }

      const headingNodePath = `${item.path}#${id}`

      documents.push({
        type: 'section',
        id: headingNodePath,
        path: headingNodePath,
        pagePath: item.path,
        title: renderableNodeToString(headingNode) || '',
        content: renderableNodesToString(section.nodes) || '',
      })
    }
  }

  return documents
}

const DOCS_CONTENT_COLLECTION_METADATA: ContentCollectionMetadata<DocsFrontmatterSchema> = {
  path: 'docs',
  frontmatterSchema: DOCS_FRONTMATTER_SCHEMA,
  getTitle: (frontmatter) => frontmatter.title,
  getDescription: (frontmatter) => frontmatter.description,
  compareFileMapItems: (a, b) => a.data.frontmatter.position - b.data.frontmatter.position,
  transformFileName: (_, frontmatter) => frontmatter.slug,
}

const CONTENT_COLLECTION_MATADATAS = [DOCS_CONTENT_COLLECTION_METADATA] as const

async function generateCollectionDbs(): Promise<void> {
  await Promise.all(CONTENT_COLLECTION_MATADATAS.map((collection) => generateCollectionDb(collection)))
}

void generateCollectionDbs()
