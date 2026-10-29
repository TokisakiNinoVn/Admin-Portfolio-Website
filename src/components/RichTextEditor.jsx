'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button, Divider, Tooltip, theme } from 'antd';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  Unlink,
} from 'lucide-react';
import { useEffect } from 'react';

// Trình soạn thảo HTML dùng như một control của antd Form (value / onChange)
export default function RichTextEditor({ value = '', onChange }) {
  const { token } = theme.useToken();

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    content: value || '',
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
        },
      }),
    ],
    onUpdate: ({ editor: ed }) => onChange?.(ed.getHTML()),
  });

  // Đồng bộ khi giá trị bên ngoài thay đổi (vd: reset form, tải dữ liệu)
  useEffect(() => {
    if (!editor) return;
    if ((value || '') !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Nhập URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const tools = editor
    ? [
        { title: 'Tiêu đề lớn', icon: Heading2, active: editor.isActive('heading', { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { title: 'Tiêu đề nhỏ', icon: Heading3, active: editor.isActive('heading', { level: 3 }), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        'sep',
        { title: 'In đậm', icon: Bold, active: editor.isActive('bold'), run: () => editor.chain().focus().toggleBold().run() },
        { title: 'In nghiêng', icon: Italic, active: editor.isActive('italic'), run: () => editor.chain().focus().toggleItalic().run() },
        { title: 'Gạch ngang', icon: Strikethrough, active: editor.isActive('strike'), run: () => editor.chain().focus().toggleStrike().run() },
        'sep',
        { title: 'Danh sách', icon: List, active: editor.isActive('bulletList'), run: () => editor.chain().focus().toggleBulletList().run() },
        { title: 'Danh sách đánh số', icon: ListOrdered, active: editor.isActive('orderedList'), run: () => editor.chain().focus().toggleOrderedList().run() },
        { title: 'Trích dẫn', icon: Quote, active: editor.isActive('blockquote'), run: () => editor.chain().focus().toggleBlockquote().run() },
        'sep',
        { title: 'Hoàn tác', icon: Undo2, run: () => editor.chain().focus().undo().run() },
        { title: 'Làm lại', icon: Redo2, run: () => editor.chain().focus().redo().run() },
        { title: 'Chèn link', icon: LinkIcon, active: editor.isActive('link'), run: setLink },
        { title: 'Xóa link', icon: Unlink, run: () => editor.chain().focus().unsetLink().run() },
      ]
    : [];

  return (
    <div className="rte" style={{ '--rte-border': token.colorBorder, background: token.colorBgContainer }}>
      <div className="rte-toolbar">
        {tools.map((tool, index) =>
          tool === 'sep' ? (
            <Divider key={index} type="vertical" style={{ height: 24, margin: '0 4px' }} />
          ) : (
            <Tooltip key={tool.title} title={tool.title}>
              <Button
                size="small"
                type={tool.active ? 'primary' : 'text'}
                icon={<tool.icon size={14} />}
                onClick={tool.run}
              />
            </Tooltip>
          ),
        )}
      </div>
      <EditorContent editor={editor} className="rte-content" />
    </div>
  );
}
