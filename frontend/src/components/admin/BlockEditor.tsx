import { useEffect, useRef, useCallback } from 'react'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import ImageTool from '@editorjs/image'
import Embed from '@editorjs/embed'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import type { ContentBlock } from '../../types'

interface Props {
  initialBlocks?: ContentBlock[]
  onSave: (blocks: { type: string; content: string; position: number }[]) => void
  editorRef?: React.MutableRefObject<EditorJS | null>
}

// Convert our ContentBlock format to Editor.js format
function toEditorJSBlocks(blocks: ContentBlock[]) {
  const sorted = [...blocks].sort((a, b) => a.position - b.position)
  return sorted.map((block) => {
    switch (block.type) {
      case 'text':
        return { type: 'paragraph', data: { text: block.content || '&nbsp;' } }
      case 'image': {
        let url = block.content
        let caption = ''
        try {
          const parsed = JSON.parse(block.content)
          url = parsed.url || block.content
          caption = parsed.caption || ''
        } catch { /* plain URL string */ }
        return {
          type: 'image',
          data: {
            file: { url },
            caption,
            withBorder: false,
            stretched: false,
            withBackground: false,
          },
        }
      }
      case 'youtube':
        return { type: 'embed', data: { service: 'youtube', source: block.content, embed: block.content } }
      default:
        return { type: 'paragraph', data: { text: block.content || '&nbsp;' } }
    }
  })
}

// Convert Editor.js output to our ContentBlock format
function fromEditorJSBlocks(blocks: { type: string; data: Record<string, unknown> }[]) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case 'paragraph':
      case 'header':
        return { type: 'text' as const, content: block.data.text as string, position: index }
      case 'image': {
        const imgUrl = (block.data.file as { url: string })?.url || (block.data.url as string) || ''
        const imgCaption = (block.data.caption as string) || ''
        return {
          type: 'image' as const,
          content: JSON.stringify({ url: imgUrl, caption: imgCaption }),
          position: index,
        }
      }
      case 'embed':
        return { type: 'youtube' as const, content: (block.data.source as string) || '', position: index }
      case 'list': {
        const items = (block.data.items as string[]) || []
        const listHtml = items.map((item: string) => `<li>${item}</li>`).join('')
        const tag = block.data.style === 'ordered' ? 'ol' : 'ul'
        return { type: 'text' as const, content: `<${tag}>${listHtml}</${tag}>`, position: index }
      }
      default:
        return { type: 'text' as const, content: JSON.stringify(block.data), position: index }
    }
  })
}

export default function BlockEditor({ initialBlocks, onSave, editorRef: externalRef }: Props) {
  const holderRef = useRef<HTMLDivElement>(null)
  const editorInstance = useRef<EditorJS | null>(null)
  const initialized = useRef(false)

  const saveEditor = useCallback(async () => {
    if (editorInstance.current) {
      const output = await editorInstance.current.save()
      const blocks = fromEditorJSBlocks(output.blocks as { type: string; data: Record<string, unknown> }[])
      onSave(blocks)
    }
  }, [onSave])

  useEffect(() => {
    if (initialized.current || !holderRef.current) return
    initialized.current = true

    const editorData = initialBlocks && initialBlocks.length > 0
      ? { blocks: toEditorJSBlocks(initialBlocks) }
      : undefined

    const editor = new EditorJS({
      holder: holderRef.current,
      tools: {
        header: {
          class: Header as unknown as EditorJS.ToolConstructable,
          config: { levels: [2, 3, 4], defaultLevel: 2 },
        },
        paragraph: {
          class: Paragraph as unknown as EditorJS.ToolConstructable,
        },
        image: {
          class: ImageTool as unknown as EditorJS.ToolConstructable,
          config: {
            uploader: {
              async uploadByFile(file: File) {
                const formData = new FormData()
                formData.append('file', file)
                const token = localStorage.getItem('token')
                const res = await fetch('/api/upload/image', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` },
                  body: formData,
                })
                return res.json()
              },
            },
          },
        },
        embed: {
          class: Embed as unknown as EditorJS.ToolConstructable,
          config: {
            services: {
              youtube: true,
            },
          },
        },
        list: {
          class: List as unknown as EditorJS.ToolConstructable,
          inlineToolbar: true,
        },
      },
      data: editorData,
      placeholder: 'Начните писать статью...',
      onChange: () => {
        saveEditor()
      },
    })

    editorInstance.current = editor
    if (externalRef) {
      externalRef.current = editor
    }

    return () => {
      if (editorInstance.current && editorInstance.current.destroy) {
        editorInstance.current.destroy()
        editorInstance.current = null
        initialized.current = false
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={holderRef}
      className="min-h-[300px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 prose dark:prose-invert max-w-none"
    />
  )
}
