import type { ContentBlock } from '../types'

interface Props {
  blocks: ContentBlock[]
}

export default function ContentBlockRenderer({ blocks }: Props) {
  const sorted = [...blocks].sort((a, b) => a.position - b.position)

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {sorted.map((block) => {
        switch (block.type) {
          case 'text':
            return (
              <div
                key={block.id}
                className="mb-4"
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            )
          case 'image': {
            let imgUrl = block.content
            let imgCaption = ''
            try {
              const parsed = JSON.parse(block.content)
              imgUrl = parsed.url || block.content
              imgCaption = parsed.caption || ''
            } catch { /* plain URL string */ }
            return (
              <figure key={block.id} className="my-6">
                <img
                  src={imgUrl}
                  alt={imgCaption}
                  className="w-full rounded-lg"
                  loading="lazy"
                />
                {imgCaption && (
                  <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {imgCaption}
                  </figcaption>
                )}
              </figure>
            )
          }
          case 'youtube': {
            // Extract YouTube video ID or use embed URL directly
            let embedUrl = block.content
            const match = block.content.match(
              /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
            )
            if (match) {
              embedUrl = `https://www.youtube.com/embed/${match[1]}`
            }
            return (
              <div key={block.id} className="my-6 aspect-video">
                <iframe
                  src={embedUrl}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )
          }
          default:
            return null
        }
      })}
    </div>
  )
}
