import { useState } from "react"
import MarkdownMessage from "./MarkdownMessage"

const CopyPrompt = ({ content, onEdit }) => {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editableContent, setEditableContent] = useState("")

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEdit = () => {
    setEditableContent(content)
    setIsEditing(true)
  }

  const handleSave = () => {
    onEdit(editableContent)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditableContent("")
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 overflow-auto bg-white rounded-xl p-6">
        {isEditing ? (
          <textarea
            value={editableContent}
            onChange={e => setEditableContent(e.target.value)}
            className="w-full h-full p-4 border rounded-lg focus:outline-none focus:border-gray-400 font-mono text-sm resize-none"
          />
        ) : (
          <MarkdownMessage
            content={content || "Start chatting to build your prompt..."}
          />
        )}
      </div>
      <div className="flex justify-end items-center mb-4 gap-4">
        {isEditing ? (
          <>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-transparent text-black border border-black rounded-lg hover:bg-black hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-transparent text-black border border-black rounded-lg hover:bg-black hover:text-white text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CopyPrompt
