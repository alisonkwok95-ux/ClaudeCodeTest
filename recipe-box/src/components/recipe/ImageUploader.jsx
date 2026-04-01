import { useRef, useState } from 'react'

export default function ImageUploader({ files, onChange }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(newFiles) {
    const accepted = Array.from(newFiles)
      .filter(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
      .slice(0, 3 - files.length)
    if (accepted.length > 0) onChange([...files, ...accepted].slice(0, 3))
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-terracotta bg-terracotta/5' : 'border-stone-300 hover:border-terracotta/60'
        } ${files.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <p className="text-stone-500 font-sans text-sm">
          {files.length >= 3
            ? 'Maximum 3 images uploaded'
            : 'Drop recipe screenshots here, or click to browse'}
        </p>
        <p className="text-stone-400 font-sans text-xs mt-1">JPEG, PNG, WEBP · max 10MB each · up to 3 images</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      {files.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {files.map((file, i) => (
            <div key={`${file.name}-${file.size}-${file.lastModified}`} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={`Upload ${i + 1}`}
                className="h-24 w-24 object-cover rounded-lg border border-stone-200"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -top-2 -right-2 bg-white border border-stone-300 rounded-full w-5 h-5 flex items-center justify-center text-stone-500 hover:text-red-500 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
