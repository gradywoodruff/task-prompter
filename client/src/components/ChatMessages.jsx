import React, { useEffect, useRef } from "react"
import MarkdownMessage from "./MarkdownMessage"

const ChatMessages = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full space-y-6 py-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-end gap-2 ${
                message.role === "user"
                  ? "max-w-[90%] md:max-w-[70%] flex-row-reverse"
                  : "flex-row"
              }`}
            >
              <div
                className={`p-4 rounded-2xl ${
                  message.role === "user" ? "bg-blue-600 text-white" : ""
                }`}
              >
                {message.role === "user" ? (
                  <p
                    className={`text-md ${
                      message.role === "user" ? "text-white" : "text-black"
                    }`}
                  >
                    {message.content}
                  </p>
                ) : (
                  <>
                    <MarkdownMessage content={message.content} />
                    {message.confidence !== undefined && (
                      <div className="mt-2 text-xs text-gray-500">
                        Confidence: {Math.round(message.confidence * 100)}%
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex px-[10px] justify-start">
            <div className="max-w-[90%] md:max-w-[70%] flex items-end gap-2">
              <div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-black rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-black rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default ChatMessages
