import React, { useState, useEffect } from "react"
import TabbedInput from "./TabbedInput"
import ChatMessages from "./ChatMessages"

const Chat = ({
  onMessagesUpdate,
  tabs,
  onOpenModal,
  activeTab: externalActiveTab,
  onActiveTabChange
}) => {
  const [messages, setMessages] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("description")

  // Sync internal activeTab with external
  useEffect(() => {
    if (externalActiveTab) {
      setActiveTab(externalActiveTab)
    }
  }, [externalActiveTab])

  // Add debugging
  useEffect(() => {
    console.log("Current activeTab:", activeTab)
    console.log("Current messages:", messages)
  }, [activeTab, messages])

  // Update parent when messages change
  useEffect(() => {
    onMessagesUpdate(messages)
  }, [messages, onMessagesUpdate])

  useEffect(() => {
    const handleMessageSend = async event => {
      const { message, tab } = event.detail

      // Update activeTab when message is sent
      setActiveTab(tab)

      // Add user message immediately
      setMessages(prev => ({
        ...prev,
        [tab]: [
          ...(prev[tab] || []),
          {
            role: "user",
            content: message
          }
        ]
      }))

      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:3001/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: message,
            section: tab,
            systemPrompt:
              "Please format your responses using Markdown. Use code blocks with language specifications for code snippets, and utilize other Markdown features like lists, tables, and emphasis where appropriate."
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Add AI response
        setMessages(prev => ({
          ...prev,
          [tab]: [
            ...(prev[tab] || []),
            {
              role: "assistant",
              content: data.message
            }
          ]
        }))
      } catch (error) {
        console.error("Error sending message:", error)
        // Add error message to chat
        setMessages(prev => ({
          ...prev,
          [tab]: [
            ...(prev[tab] || []),
            {
              role: "assistant",
              content:
                "Sorry, there was an error processing your message. Please try again."
            }
          ]
        }))
      } finally {
        setIsLoading(false)
      }
    }

    window.addEventListener("message-send", handleMessageSend)
    return () => window.removeEventListener("message-send", handleMessageSend)
  }, [])

  // Handle tab changes from TabbedInput
  const handleTabChange = tabId => {
    setActiveTab(tabId)
    onActiveTabChange(tabId)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={messages[activeTab] || []} isLoading={isLoading} />
      </div>

      {/* Input area - fixed at bottom */}
      <div className="sticky pb-4 bottom-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),white_44px)]">
        <TabbedInput
          tabs={tabs}
          onOpenModal={onOpenModal}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  )
}

export default Chat
