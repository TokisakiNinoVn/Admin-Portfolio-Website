<template>
  <div class="rich-text-editor">
    <div v-if="editor" class="rte-toolbar">
      <button
        type="button"
        :class="{ active: editor.isActive('heading', { level: 2 }) }"
        title="Tiêu đề lớn"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >H2</button>
      <button
        type="button"
        :class="{ active: editor.isActive('heading', { level: 3 }) }"
        title="Tiêu đề nhỏ"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >H3</button>

      <span class="rte-sep" />

      <button
        type="button"
        :class="{ active: editor.isActive('bold') }"
        title="In đậm"
        @click="editor.chain().focus().toggleBold().run()"
      ><i class="fa-solid fa-bold"></i></button>
      <button
        type="button"
        :class="{ active: editor.isActive('italic') }"
        title="In nghiêng"
        @click="editor.chain().focus().toggleItalic().run()"
      ><i class="fa-solid fa-italic"></i></button>
      <button
        type="button"
        :class="{ active: editor.isActive('strike') }"
        title="Gạch ngang"
        @click="editor.chain().focus().toggleStrike().run()"
      ><i class="fa-solid fa-strikethrough"></i></button>

      <span class="rte-sep" />

      <button
        type="button"
        :class="{ active: editor.isActive('bulletList') }"
        title="Danh sách"
        @click="editor.chain().focus().toggleBulletList().run()"
      ><i class="fa-solid fa-list-ul"></i></button>
      <button
        type="button"
        :class="{ active: editor.isActive('orderedList') }"
        title="Danh sách đánh số"
        @click="editor.chain().focus().toggleOrderedList().run()"
      ><i class="fa-solid fa-list-ol"></i></button>
      <button
        type="button"
        :class="{ active: editor.isActive('blockquote') }"
        title="Trích dẫn"
        @click="editor.chain().focus().toggleBlockquote().run()"
      ><i class="fa-solid fa-quote-right"></i></button>

      <span class="rte-sep" />

      <button type="button" title="Hoàn tác" @click="editor.chain().focus().undo().run()">
        <i class="fa-solid fa-rotate-left"></i>
      </button>
      <button type="button" title="Làm lại" @click="editor.chain().focus().redo().run()">
        <i class="fa-solid fa-rotate-right"></i>
      </button>

      <button
        type="button"
        :class="{ active: editor.isActive('link') }"
        title="Chèn link"
        @click="setLink"
      >
        <i class="fa-solid fa-link"></i>
      </button>

      <button
        type="button"
        title="Xóa link"
        @click="editor.chain().focus().unsetLink().run()"
      >
        <i class="fa-solid fa-link-slash"></i>
      </button>
    </div>

    <editor-content :editor="editor" class="rte-content" />
  </div>
</template>

<script setup>
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Nhập nội dung mô tả...' },
});
const emit = defineEmits(['update:modelValue']);

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
  ],
  editorProps: {
    attributes: {
      class: 'rte-prosemirror',
    },
  },
  onUpdate: ({ editor: ed }) => {
    emit('update:modelValue', ed.getHTML());
  },
});

const setLink = () => {
  const previousUrl = editor.value.getAttributes('link').href;

  const url = window.prompt('Nhập URL', previousUrl);

  if (url === null) return;

  if (url === '') {
    editor.value.chain().focus().unsetLink().run();
    return;
  }

  editor.value
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url })
    .run();
};

// Đồng bộ khi giá trị bên ngoài thay đổi (vd: reset form)
watch(
  () => props.modelValue,
  (val) => {
    if (!editor.value) return;
    const current = editor.value.getHTML();
    if ((val || '') !== current) {
      editor.value.commands.setContent(val || '', false);
    }
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.rte-content :deep(.rte-prosemirror a) {
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
}
.rich-text-editor {
  border: 1px solid #c4c4c4;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.rich-text-editor:focus-within {
  border-color: #1976d2;
  box-shadow: 0 0 0 1px #1976d2;
}

.rte-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: #f5f7fa;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}
.rte-toolbar button {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: #555;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.rte-toolbar button:hover {
  background: #e3eefc;
}
.rte-toolbar button.active {
  background: #1976d2;
  color: #fff;
}
.rte-sep {
  width: 1px;
  height: 18px;
  background: #dcdcdc;
  margin: 0 4px;
}

.rte-content :deep(.rte-prosemirror) {
  min-height: 90px;
  max-height: 260px;
  overflow-y: auto;
  padding: 10px 12px;
  font-size: 0.875rem;
  outline: none;
}
.rte-content :deep(.rte-prosemirror p) {
  margin: 0 0 6px;
}
.rte-content :deep(.rte-prosemirror ul),
.rte-content :deep(.rte-prosemirror ol) {
  padding-left: 20px;
  margin: 0 0 6px;
}
.rte-content :deep(.rte-prosemirror blockquote) {
  border-left: 3px solid #90caf9;
  margin: 0 0 6px;
  padding-left: 10px;
  color: #666;
}
.rte-content :deep(.rte-prosemirror h2) {
  font-size: 1.1rem;
  margin: 0 0 6px;
}
.rte-content :deep(.rte-prosemirror h3) {
  font-size: 1rem;
  margin: 0 0 6px;
}
</style>
