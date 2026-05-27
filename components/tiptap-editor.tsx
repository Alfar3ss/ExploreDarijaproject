"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'

interface TiptapEditorProps {
  value: string
  onChange: (content: string) => void
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          languageClassPrefix: 'language-',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return <div className="p-4 border rounded bg-gray-50">Loading editor...</div>
  }

  const addLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run()
  }

  return (
    <div className="border rounded overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('strike') ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('code') ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Inline code"
        >
          {'<>'}
        </button>

        <div className="border-l mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="border-l mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Bullet list"
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Numbered list"
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Code block"
        >
          Code
        </button>

        <div className="border-l mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('blockquote') ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Blockquote"
        >
          " "
        </button>
        <button
          onClick={addLink}
          className={`px-3 py-1 rounded border text-sm ${
            editor.isActive('link') ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          title="Insert link"
        >
          🔗 Link
        </button>
        <button
          onClick={addImage}
          className="px-3 py-1 rounded border text-sm bg-white"
          title="Insert image"
        >
          🖼️ Image
        </button>
        <button
          onClick={insertTable}
          className="px-3 py-1 rounded border text-sm bg-white"
          title="Insert table"
        >
          📊 Table
        </button>

        <div className="border-l mx-1" />

        <button
          onClick={() => editor.chain().focus().clearNodes().run()}
          className="px-3 py-1 rounded border text-sm bg-white"
          title="Clear formatting"
        >
          Clear
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1 rounded border text-sm bg-white"
          title="Horizontal rule"
        >
          ━━
        </button>
      </div>

      {/* Editor content */}
      <div className="prose prose-sm max-w-none p-4 min-h-[300px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
