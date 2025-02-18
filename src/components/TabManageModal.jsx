import { useState } from 'react'

const TabManageModal = ({ isOpen, onClose, tabs, onSave }) => {
  const [editedTabs, setEditedTabs] = useState(tabs)
  const [newTabName, setNewTabName] = useState('')

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    const dragIndex = Number(e.dataTransfer.getData('text/plain'))
    const newTabs = [...editedTabs]
    const [draggedTab] = newTabs.splice(dragIndex, 1)
    newTabs.splice(dropIndex, 0, draggedTab)
    setEditedTabs(newTabs)
  }

  const handleNameChange = (index, newName) => {
    const newTabs = [...editedTabs]
    newTabs[index] = { ...newTabs[index], label: newName }
    setEditedTabs(newTabs)
  }

  const handleAddTab = (e) => {
    e.preventDefault()
    if (newTabName.trim()) {
      const newTab = {
        id: newTabName.toLowerCase().replace(/\s+/g, '-'),
        label: newTabName,
        placeholder: `Type your ${newTabName.toLowerCase()} here...`
      }
      setEditedTabs([...editedTabs, newTab])
      setNewTabName('')
    }
  }

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4">Manage Tabs</h2>
        
        <form onSubmit={handleAddTab} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              placeholder="New tab name..."
              className="flex-1 p-2 border border-gray-200 rounded-lg font-mono text-sm focus:border-gray-400 focus:ring-0"
            />
            <button
              type="submit"
              disabled={!newTabName.trim()}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto">
          {editedTabs.map((tab, index) => (
            <div
              key={tab.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2 cursor-move"
            >
              <div className="text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <input
                type="text"
                value={tab.label}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm"
              />
              <button
                onClick={() => setEditedTabs(editedTabs.filter((_, i) => i !== index))}
                className="text-gray-400 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedTabs)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  ) : null
}

export default TabManageModal 