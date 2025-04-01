import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    await import('react-quill/dist/quill.snow.css');
    return function comp({ forwardedRef, ...props }) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false }
);

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean'],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    ['code-block']
  ],
  clipboard: {
    matchVisual: false
  }
};

const formats = [
  'header',
  'font',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align',
  'link', 'image', 'video',
  'indent',
  'direction',
  'code-block'
];

export default function QuillEditor({ value, onChange, error, productId }) {
  const editorRef = useRef(null);

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Image = e.target.result; // Convert image to Base64
          const editor = editorRef.current?.getEditor();
          if (editor) {
            const range = editor.getSelection();
            editor.insertEmbed(range.index, 'image', base64Image); // Insert Base64 image into editor
          }
        };
        reader.readAsDataURL(file); // Read file as Base64
      }
    };
  };

  useEffect(() => {
    const editor = editorRef.current?.getEditor();
    if (editor) {
      const toolbar = editor.getModule('toolbar');
      toolbar.addHandler('image', handleImageUpload);
    }
  }, []);

  return (
    <div className={`quill-editor ${error ? 'error' : ''}`}>
      <ReactQuill
        forwardedRef={editorRef}
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        theme="snow"
        placeholder="Write your product description here..."
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      <style jsx global>{`
        .quill-editor {
          margin-bottom: 1.5rem;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .quill-editor:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .quill-editor .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border: 1px solid #e2e8f0;
          border-bottom: none;
          background: #f8fafc;
          padding: 12px;
        }

        .quill-editor .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border: 1px solid #e2e8f0;
          border-top: none;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
        }

        .quill-editor .ql-editor {
          min-height: 250px;
          padding: 16px;
          color: #1a202c;
          line-height: 1.6;
        }

        .quill-editor .ql-editor p {
          margin-bottom: 1em;
        }

        .quill-editor .ql-snow.ql-toolbar button {
          width: 32px;
          height: 32px;
          padding: 6px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .quill-editor .ql-snow.ql-toolbar button:hover {
          background-color: #edf2f7;
        }

        .quill-editor .ql-snow.ql-toolbar button.ql-active {
          background-color: #e2e8f0;
        }

        .quill-editor .ql-snow .ql-stroke {
          stroke: #4a5568;
        }

        .quill-editor .ql-snow .ql-fill {
          fill: #4a5568;
        }

        .quill-editor .ql-snow.ql-toolbar button:hover .ql-stroke {
          stroke: #2d3748;
        }

        .quill-editor .ql-snow.ql-toolbar button:hover .ql-fill {
          fill: #2d3748;
        }

        .quill-editor .ql-snow.ql-toolbar button.ql-active .ql-stroke {
          stroke: #3182ce;
        }

        .quill-editor .ql-snow.ql-toolbar button.ql-active .ql-fill {
          fill: #3182ce;
        }

        .quill-editor.error .ql-toolbar {
          border-color: #fc8181;
        }

        .quill-editor.error .ql-container {
          border-color: #fc8181;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .quill-editor .ql-toolbar {
            padding: 8px;
          }

          .quill-editor .ql-snow.ql-toolbar button {
            width: 28px;
            height: 28px;
            padding: 4px;
          }

          .quill-editor .ql-editor {
            min-height: 200px;
            padding: 12px;
          }
        }

        @media (max-width: 480px) {
          .quill-editor .ql-toolbar {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 4px;
          }

          .quill-editor .ql-formats {
            margin-right: 0 !important;
            margin-bottom: 4px;
          }
        }
      `}</style>
    </div>
  );
}