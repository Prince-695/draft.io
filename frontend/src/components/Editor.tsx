'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml'; // html
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import { useState, useEffect } from 'react';

const lowlight = createLowlight();
lowlight.register({ javascript, typescript, python, bash, css, xml, json, sql });

const LANGUAGES = [
  { value: '', label: 'Plain text' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'css', label: 'CSS' },
  { value: 'xml', label: 'HTML / XML' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
];

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function Editor({ content, onChange, placeholder = 'Start writing...' }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable Link in StarterKit (TipTap v3 includes it) to avoid duplicate extension warning
        // @ts-ignore – StarterKit v3 exposes link configuration
        link: false,
        // Disable built-in codeBlock — we use CodeBlockLowlight instead
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'bash',
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-4 py-3 text-foreground',
      },
    },
  });

  // Sync external content changes (e.g. AI generation) into Tiptap
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function EditorToolbar({ editor }: { editor: any }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const isCodeBlockActive = editor.isActive('codeBlock');

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const currentLanguage = editor.getAttributes('codeBlock')?.language ?? '';

  return (
    <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 rounded text-foreground hover:bg-accent ${editor.isActive('bold') ? 'bg-accent' : ''}`}
        type="button"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 rounded text-foreground hover:bg-accent ${editor.isActive('italic') ? 'bg-accent' : ''}`}
        type="button"
      >
        <em>I</em>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-3 py-1.5 rounded text-foreground hover:bg-accent ${editor.isActive('strike') ? 'bg-accent' : ''}`}
        type="button"
      >
        <s>S</s>
      </button>
      
      <div className="w-px bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1.5 rounded text-foreground hover:bg-accent ${editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}`}
        type="button"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1.5 rounded text-foreground hover:bg-accent ${editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}`}
        type="button"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1.5 rounded text-foreground hover:bg-accent ${editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}`}
        type="button"
      >
        H3
      </button>

      <div className="w-px bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1.5 rounded text-foreground hover:bg-accent ${editor.isActive('bulletList') ? 'bg-accent' : ''}`}
        type="button"
      >
        • List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1.5 rounded text-foreground hover:bg-accent ${editor.isActive('orderedList') ? 'bg-accent' : ''}`}
        type="button"
      >
        1. List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1.5 rounded text-foreground hover:bg-accent ${editor.isActive('blockquote') ? 'bg-accent' : ''}`}
        type="button"
      >
        Quote
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1.5 rounded text-foreground hover:bg-accent ${isCodeBlockActive ? 'bg-accent' : ''}`}
        type="button"
        title="Code block"
      >
        {'</>'}
      </button>
      {isCodeBlockActive && (
        <select
          value={currentLanguage}
          onChange={(e) =>
            editor.chain().focus().updateAttributes('codeBlock', { language: e.target.value || null }).run()
          }
          className="px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
          title="Select language"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      )}

      <div className="w-px bg-border mx-1" />

      <button
        onClick={() => setShowLinkInput(!showLinkInput)}
        className={`px-3 py-1.5 rounded text-foreground hover:bg-accent ${editor.isActive('link') ? 'bg-accent' : ''}`}
        type="button"
      >
        Link
      </button>
      <button
        onClick={addImage}
        className="px-3 py-1.5 rounded text-foreground hover:bg-accent"
        type="button"
      >
        Image
      </button>

      {showLinkInput && (
        <div className="flex gap-2 ml-auto">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="px-2 py-1 border rounded text-sm bg-background text-foreground border-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setLink();
              }
            }}
          />
          <button
            onClick={setLink}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
            type="button"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
