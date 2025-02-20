import React, { useState, useEffect } from "react"
import TabbedInput from "./TabbedInput"
import ChatMessages from "./ChatMessages"
import { useCredentials } from "ai-creds-manager"

const Chat = ({
  onMessagesUpdate,
  onDocumentUpdate,
  tabs,
  onOpenModal,
  activeTab: externalActiveTab,
  onActiveTabChange,
  currentDocument
}) => {
  const [messages, setMessages] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("description")
  const { getCredential } = useCredentials()

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

  const parseMarkdownToMessages = markdownText => {
    const newMessages = { ...messages } // Start with existing messages to keep user history

    // Split the markdown into sections
    const sections = markdownText.split(/(?=###\s+[A-Z])/)

    sections.forEach(section => {
      if (!section.trim()) return

      const match = section.match(/^###\s+([A-Za-z]+)\s*\n([\s\S]*)$/)
      if (!match) return

      const [, sectionName, content] = match
      const sectionKey = sectionName.toLowerCase()

      // Keep existing messages but update or add the AI response
      if (!newMessages[sectionKey]) {
        newMessages[sectionKey] = []
      }

      // Find the last AI message
      const lastAiIndex = [...newMessages[sectionKey]]
        .reverse()
        .findIndex(msg => msg.role === "assistant")

      if (lastAiIndex !== -1) {
        // Update existing AI message
        const actualIndex = newMessages[sectionKey].length - 1 - lastAiIndex
        newMessages[sectionKey][actualIndex] = {
          role: "assistant",
          content: content.trim()
        }
      } else {
        // Add new AI message
        newMessages[sectionKey].push({
          role: "assistant",
          content: content.trim()
        })
      }
    })

    return newMessages
  }

  useEffect(() => {
    const handleMessageSend = async event => {
      const { message, tab } = event.detail

      // Get API keys from credential manager
      const anthropicKey = getCredential("anthropic")
      const openaiKey = getCredential("openai")

      if (!anthropicKey) {
        setMessages(prev => ({
          ...prev,
          [tab]: [
            ...(prev[tab] || []),
            {
              role: "assistant",
              content: "Please configure your Anthropic API key in the settings first."
            }
          ]
        }))
        return
      }

      setActiveTab(tab)
      setIsLoading(true)

      // Add user message immediately
      const updatedMessages = {
        ...messages,
        [tab]: [
          ...(messages[tab] || []),
          {
            role: "user",
            content: message
          }
        ]
      }
      setMessages(updatedMessages)

      try {
        // Send credentials with the request
        const response = await fetch("http://localhost:3001/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: message,
            section: tab,
            model: "claude",
            allMessages: updatedMessages,
            currentDocument: currentDocument,
            credentials: {
              anthropic: anthropicKey,
              openai: openaiKey
            }
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Add AI's chat response to the messages
        setMessages(prev => ({
          ...prev,
          [tab]: [
            ...(prev[tab] || []),
            {
              role: "assistant",
              content: data.message,
              confidence: data.confidence
            }
          ]
        }))

        // Update the document directly
        onDocumentUpdate(data.document)

        // If the AI suggests updating a different section, switch to it
        if (data.section !== tab) {
          setActiveTab(data.section)
          onActiveTabChange(data.section)
        }
      } catch (error) {
        console.error("Error sending message:", error)
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
  }, [messages, onActiveTabChange, currentDocument, getCredential])

  // Handle tab changes from TabbedInput
  const handleTabChange = tabId => {
    setActiveTab(tabId)
    onActiveTabChange(tabId)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto rounded-tr-xl">
        <ChatMessages messages={messages[activeTab] || []} isLoading={isLoading} />
      </div>

      {/* Input area - fixed at bottom */}
      <div className="sticky bottom-0 bg-[linear-gradient(to_bottom,rgba(243,244,246,0),rgb(243,244,246)_44px)]">
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
