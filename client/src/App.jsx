import { useState, useEffect } from "react"
import Chat from "./components/Chat"
import CopyPrompt from "./components/CopyPrompt"
import TabManageModal from "./components/TabManageModal"

function App() {
  const [messages, setMessages] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("description")
  const [formattedText, setFormattedText] = useState("")
  const [tabs, setTabs] = useState([
    {
      id: "description",
      label: "Description",
      placeholder: "Type your message here...",
      prompt:
        "This section is for describing the overall task or feature. Focus on what needs to be built from a user's perspective. Include the context, purpose, and expected outcome of the task."
    },
    {
      id: "acceptance",
      label: "Acceptance Criteria",
      placeholder: "Type your acceptance criteria here...",
      prompt:
        "This section is for defining the specific conditions that must be met for the task to be considered complete. List measurable outcomes, edge cases, and validation rules. Format criteria as 'Given/When/Then' statements when applicable."
    },
    {
      id: "assumptions",
      label: "Assumptions",
      placeholder: "Type your assumptions here...",
      prompt:
        "This section is for documenting any assumptions made about the task. Include technical constraints, business rules, dependencies, and any unclear aspects that you've made decisions about."
    },
    {
      id: "technical",
      label: "Technical Approach",
      placeholder: "Type your technical approach here...",
      prompt:
        "This section is for outlining the technical implementation strategy. Include architecture decisions, design patterns, potential challenges, and any specific technologies or libraries that will be used."
    }
  ])

  const handleSaveTabs = newTabs => {
    const updatedMessages = {}
    newTabs.forEach(tab => {
      if (messages[tab.id]) {
        updatedMessages[tab.id] = messages[tab.id]
      }
    })

    const activeTabExists = newTabs.some(tab => tab.id === activeTab)
    if (!activeTabExists && newTabs.length > 0) {
      setActiveTab(newTabs[0].id)
    }

    setTabs(newTabs)
    setMessages(updatedMessages)
    setIsModalOpen(false)
  }

  const handlePromptEdit = newContent => {
    setFormattedText(newContent)
  }

  return (
    <div className="flex w-full">
      <div className="min-h-screen w-2/5 bg-white px-4">
        <Chat
          onMessagesUpdate={setMessages}
          onDocumentUpdate={setFormattedText}
          tabs={tabs}
          onOpenModal={() => setIsModalOpen(true)}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          currentDocument={formattedText}
        />
      </div>
      <div className="sticky top-0 bottom-0 h-screen bg-gray-100 p-4 flex-1">
        <CopyPrompt content={formattedText} onEdit={handlePromptEdit} />
      </div>

      {/* Modal at App level */}
      <TabManageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tabs={tabs}
        onSave={handleSaveTabs}
      />
    </div>
  )
}

export default App
