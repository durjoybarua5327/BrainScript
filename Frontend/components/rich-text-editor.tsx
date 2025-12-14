"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Code } from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    editable?: boolean;
    onImageUpload?: (file: File) => Promise<string>; // Returns URL
}

export function RichTextEditor({ content, onChange, editable = true, onImageUpload }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit, Image],
        content: content, // Initial content only if deps are set
        editable,
        immediatelyRender: false, // Fix for SSR hydration mismatch
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] prose-pre:bg-zinc-100 prose-pre:text-zinc-900 dark:prose-pre:bg-zinc-900 dark:prose-pre:text-zinc-50 prose-pre:p-4 prose-pre:rounded-lg [&_pre_code]:bg-transparent [&_pre_code]:text-inherit",
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith("image/") && onImageUpload) {
                        onImageUpload(file).then(url => {
                            const { schema } = view.state;
                            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                            if (coordinates) {
                                const node = schema.nodes.image.create({ src: url });
                                const transaction = view.state.tr.insert(coordinates.pos, node);
                                view.dispatch(transaction);
                            }
                        });
                        return true;
                    }
                }
                return false;
            }
        }
    }, [editable]); // Dependency array ensures stability

    // Sync content updates from parent if they differ from editor state
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border rounded-md flex flex-col bg-white dark:bg-slate-950">
            {editable && (
                <div className="p-2 flex gap-2 flex-wrap bg-slate-50 dark:bg-slate-900 border-b sticky top-[158px] z-40 rounded-t-md">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("bold")}
                        onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    >
                        <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("italic")}
                        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <Italic className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("codeBlock")}
                        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                    >
                        <Code className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("heading", { level: 1 })}
                        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                        <Heading1 className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("heading", { level: 2 })}
                        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        <Heading2 className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("bulletList")}
                        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <List className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("orderedList")}
                        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("blockquote")}
                        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <Quote className="h-4 w-4" />
                    </Toggle>
                </div>
            )}
            <div className="p-4 overflow-y-auto h-[600px] rounded-b-md">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
