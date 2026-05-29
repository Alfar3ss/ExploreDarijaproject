import fs from 'fs/promises'
import path from 'path'

export type BlogPost = {
  slug: string
  title: string
  description: string
  excerpt?: string
  content: string
  image?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  canonical_url?: string
  meta_robots?: string
  og_image?: string
  category?: string
  featured?: boolean
  date?: string
}

const postsFile = path.join(process.cwd(), 'public', 'assets', 'data', 'posts.json')

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(lt|gt|amp|quot|#39);/g, (entity) => {
    switch (entity) {
      case '&lt;':
        return '<'
      case '&gt;':
        return '>'
      case '&amp;':
        return '&'
      case '&quot;':
        return '"'
      case '&#39;':
        return "'"
      default:
        return entity
    }
  })
}

function normalizePost(raw: any): BlogPost {
  const date = raw.date ? String(raw.date) : new Date().toISOString()
  return {
    slug: String(raw.slug || '').trim(),
    title: String(raw.title || '').trim(),
    description: String(raw.description || '').trim(),
    excerpt: String(raw.excerpt || raw.description || '').trim(),
    content: decodeHtmlEntities(String(raw.content || '<p></p>')),
    image: raw.image ? String(raw.image).trim() : undefined,
    meta_title: raw.meta_title ? String(raw.meta_title).trim() : raw.title,
    meta_description: raw.meta_description ? String(raw.meta_description).trim() : raw.description,
    meta_keywords: raw.meta_keywords ? String(raw.meta_keywords).trim() : undefined,
    canonical_url: raw.canonical_url ? String(raw.canonical_url).trim() : `/blog/${raw.slug}`,
    meta_robots: raw.meta_robots ? String(raw.meta_robots).trim() : 'index, follow',
    og_image: raw.og_image ? String(raw.og_image).trim() : raw.image ? String(raw.image).trim() : undefined,
    category: raw.category ? String(raw.category).trim() : 'Insights',
    featured: !!raw.featured,
    date,
  }
}

async function readPostsFile(): Promise<any[]> {
  try {
    const raw = await fs.readFile(postsFile, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writePostsFile(posts: BlogPost[]) {
  await fs.mkdir(path.dirname(postsFile), { recursive: true })
  await fs.writeFile(postsFile, JSON.stringify(posts, null, 2), 'utf8')
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await readPostsFile()
  return posts
    .map(normalizePost)
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  if (!slug) return undefined
  const posts = await getAllPosts()
  return posts.find((post) => post.slug === slug)
}

export async function upsertPost(post: BlogPost): Promise<BlogPost> {
  if (!post.slug) throw new Error('Post slug is required')
  const normalized = normalizePost(post)
  const posts = await getAllPosts()
  const others = posts.filter((item) => item.slug !== normalized.slug)
  const next = [normalized, ...others]
  await writePostsFile(next)
  return normalized
}

export async function deletePost(slug: string): Promise<boolean> {
  const posts = await getAllPosts()
  const next = posts.filter((post) => post.slug !== slug)
  if (next.length === posts.length) return false
  await writePostsFile(next)
  return true
}

export async function getAllPostSlugs(): Promise<string[]> {
  return (await getAllPosts()).map((post) => post.slug)
}
