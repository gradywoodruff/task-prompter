import { useState } from "react"
import { Dialog } from "@headlessui/react"

const TabManageModal = ({ isOpen, onClose, tabs, onSave }) => {
  const [editedTabs, setEditedTabs] = useState(tabs)
  const [openDrawerId, setOpenDrawerId] = useState(null)

  const handleTabChange = (index, field, value) => {
    const newTabs = [...editedTabs]
    newTabs[index] = { ...newTabs[index], [field]: value }
    setEditedTabs(newTabs)
  }

  const handleAddTab = () => {
    const newTab = {
      id: `tab-${editedTabs.length + 1}`,
      label: `New Tab ${editedTabs.length + 1}`,
      placeholder: "Type your message here...",
      prompt: "Enter instructions for the AI about this section..."
    }
    setEditedTabs([...editedTabs, newTab])
    setOpenDrawerId(newTab.id) // Open the drawer for the new tab
  }

  const handleRemoveTab = index => {
    const newTabs = editedTabs.filter((_, i) => i !== index)
    setEditedTabs(newTabs)
  }

  const handleSave = () => {
    onSave(editedTabs)
  }

  const toggleDrawer = id => {
    setOpenDrawerId(openDrawerId === id ? null : id)
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-2xl p-6">
          <Dialog.Title className="text-xl font-bold mb-4">Manage Tabs</Dialog.Title>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {editedTabs.map((tab, index) => (
              <div key={index} className="border rounded-lg">
                {/* Tab Header */}
                <div className="flex items-center p-4 bg-gray-50 rounded-t-lg">
                  <input
                    type="text"
                    value={tab.label}
                    onChange={e => handleTabChange(index, "label", e.target.value)}
                    className="flex-1 px-2 py-1 border rounded mr-4"
                    placeholder="Tab Label"
                  />
                  <button
                    onClick={() => toggleDrawer(tab.id)}
                    className="text-gray-500 hover:text-gray-700 mr-2"
                  >
                    {openDrawerId === tab.id ? "▼" : "▶"}
                  </button>
                  <button
                    onClick={() => handleRemoveTab(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={editedTabs.length <= 1}
                  >
                    ✕
                  </button>
                </div>

                {/* Drawer Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openDrawerId === tab.id ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placeholder Text
                      </label>
                      <input
                        type="text"
                        value={tab.placeholder}
                        onChange={e =>
                          handleTabChange(index, "placeholder", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded"
                        placeholder="Enter placeholder text..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        AI Prompt
                      </label>
                      <textarea
                        value={tab.prompt}
                        onChange={e => handleTabChange(index, "prompt", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg resize-none h-32"
                        placeholder="Enter AI prompt instructions..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Tab Button */}
          <button
            onClick={handleAddTab}
            className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            + Add New Tab
          </button>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Save Changes
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default TabManageModal
