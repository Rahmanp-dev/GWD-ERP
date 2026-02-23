"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';

export default function RichTextEditor({
    content,
    onChange,
    placeholder = "Type here..."
}: {
    content: string,
    onChange: (html: string) => void,
    placeholder?: string
}) {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm prose-blue max-w-none focus:outline-none min-h-[120px] p-3 text-sm text-gray-900 border rounded-b-lg border-gray-200 bg-white',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return <div className="min-h-[160px] border rounded-lg bg-gray-50 flex items-center justify-center text-sm text-gray-400">Loading editor...</div>;
    }

    return (
        <div className="flex flex-col flex-grow border border-gray-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all overflow-hidden bg-white">
            <div className="flex items-center space-x-1 border-b border-gray-200 bg-gray-50 p-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded text-gray-600 hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 text-gray-900' : ''}`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded text-gray-600 hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 text-gray-900' : ''}`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded text-gray-600 hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200 text-gray-900' : ''}`}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded text-gray-600 hover:bg-gray-200 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-200 text-gray-900' : ''}`}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="p-1.5 rounded text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="p-1.5 rounded text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
