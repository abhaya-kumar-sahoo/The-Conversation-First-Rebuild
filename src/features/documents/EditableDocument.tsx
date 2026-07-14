import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Save, RotateCcw, RotateCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Artifact } from '@/types';
import { useAppDispatch } from '@/hooks/useStore';
import { updateArtifact } from '@/store/slices/artifactSlice';

interface EditableDocumentProps {
  artifact: Artifact;
}

export default function EditableDocument({ artifact }: EditableDocumentProps) {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);
  
  const payload = artifact.payload as { title?: string, content?: string };
  const initialContent = payload.content || `
    <h1>${payload.title || 'Document'}</h1>
    <p>Start writing your document here...</p>
    <ul>
      <li>Use the toolbar to format</li>
      <li>Document auto-saves as you type</li>
    </ul>
  `;

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      const html = editor.getHTML();
      // Auto save after a delay
      const timeout = setTimeout(() => {
        dispatch(updateArtifact({
          id: artifact.id,
          payload: { payload: { ...payload, content: html } }
        }));
        setIsSaving(false);
      }, 1000);
      return () => clearTimeout(timeout);
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-[#27272a] transition-colors ${editor.isActive('bold') ? 'bg-[#27272a] text-white' : 'text-[#a1a1aa]'}`}
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-[#27272a] transition-colors ${editor.isActive('italic') ? 'bg-[#27272a] text-white' : 'text-[#a1a1aa]'}`}
          >
            <Italic size={14} />
          </button>
          <div className="w-px h-4 bg-[#27272a] mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded hover:bg-[#27272a] transition-colors text-xs font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-[#27272a] text-white' : 'text-[#a1a1aa]'}`}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-[#27272a] transition-colors text-xs font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-[#27272a] text-white' : 'text-[#a1a1aa]'}`}
          >
            H2
          </button>
          <div className="w-px h-4 bg-[#27272a] mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-[#27272a] transition-colors ${editor.isActive('bulletList') ? 'bg-[#27272a] text-white' : 'text-[#a1a1aa]'}`}
          >
            <List size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-[#27272a] transition-colors ${editor.isActive('orderedList') ? 'bg-[#27272a] text-white' : 'text-[#a1a1aa]'}`}
          >
            <ListOrdered size={14} />
          </button>
          <div className="w-px h-4 bg-[#27272a] mx-1" />
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-[#27272a] transition-colors text-[#a1a1aa] disabled:opacity-30"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-[#27272a] transition-colors text-[#a1a1aa] disabled:opacity-30"
          >
            <RotateCw size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {isSaving ? (
            <span className="text-xs text-[#52525b] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Saving...
            </span>
          ) : (
            <span className="text-xs text-[#52525b] flex items-center gap-1">
              <Save size={12} className="text-emerald-500" />
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
