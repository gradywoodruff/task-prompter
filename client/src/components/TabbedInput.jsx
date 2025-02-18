import { useState, useRef, useEffect } from "react"

const TYPING_SPEED = 50 // milliseconds per character
const TAB_OFFSET = 5 // pixels between stacked tabs
const TAB_GAP = 4 // gap between tabs in pixels
const MAX_HEIGHT = "50vh"
const BUTTON_AREA_HEIGHT = "4rem"
const LINE_HEIGHT = 1.5 // Consistent line height

const TabbedInput = ({ onOpenModal, tabs, activeTab, onTabChange }) => {
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("")
  const textareaRef = useRef(null)
  const tabsContainerRef = useRef(null)

  // Reset and animate placeholder when tabs or activeTab changes
  useEffect(() => {
    const targetPlaceholder = tabs.find(tab => tab.id === activeTab)?.placeholder || ""
    let currentIndex = 0
    setDisplayedPlaceholder("")

    const animationInterval = setInterval(() => {
      if (currentIndex <= targetPlaceholder.length) {
        setDisplayedPlaceholder(targetPlaceholder.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(animationInterval)
      }
    }, TYPING_SPEED)

    return () => clearInterval(animationInterval)
  }, [activeTab, tabs]) // Add tabs to dependency array

  // Add effect to adjust initial scroll position
  useEffect(() => {
    if (tabsContainerRef.current) {
      // Scroll to show all tabs initially
      tabsContainerRef.current.scrollLeft = tabsContainerRef.current.scrollWidth * 0.1
    }
  }, [tabs])

  const handleTabMouseDown = (tabId, event) => {
    event.preventDefault() // This prevents focus loss
    onTabChange(tabId)
    // Add a small delay to ensure the focus happens after the tab switch
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  // Add function to handle textarea auto-grow
  const adjustTextareaHeight = e => {
    const textarea = e.target
    const minHeight = 80 // Reduced from 120 to 80
    const buttonAreaPadding = 24 // Reduced from 32 to 24

    // Only adjust if content length has changed
    if (textarea.value.length === 0) {
      textarea.style.height = `${minHeight + buttonAreaPadding}px`
      return
    }

    // Only measure if content might have changed height
    if (textarea.value.includes("\n") || textarea.scrollHeight > textarea.clientHeight) {
      const scrollPos = window.scrollY
      textarea.style.overflow = "hidden"
      textarea.style.height = `${minHeight + buttonAreaPadding}px`
      const newHeight = Math.max(
        minHeight + buttonAreaPadding,
        Math.min(textarea.scrollHeight + buttonAreaPadding, window.innerHeight * 0.5)
      )
      textarea.style.height = `${newHeight}px`
      textarea.style.overflow = "auto"
      window.scrollTo(0, scrollPos)

      // Keep textarea scrolled to bottom
      requestAnimationFrame(() => {
        textarea.scrollTop = textarea.scrollHeight
      })
    }
  }

  const handleSend = () => {
    if (!textareaRef.current?.value.trim()) return

    // Dispatch a custom event that Chat can listen for
    const event = new CustomEvent("message-send", {
      detail: {
        message: textareaRef.current.value,
        tab: activeTab
      }
    })
    window.dispatchEvent(event)

    // Clear input
    textareaRef.current.value = ""
    adjustTextareaHeight({ target: textareaRef.current })
  }

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Allow default behavior for Shift+Enter (new line)
        return
      }
      // Regular Enter should submit
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="group sticky top-full w-full max-w-3xl mx-auto mt-8">
      <div className="relative">
        {/* Wrapper div for width control */}
        <div className="w-[calc(100%-2rem)]">
          {/* Tabs Container */}
          <div
            ref={tabsContainerRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
            style={{
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch"
            }}
          >
            <div className="flex relative gap-1">
              {tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  onMouseDown={event => handleTabMouseDown(tab.id, event)}
                  className={`p-4 rounded-t-2xl border-2 border-b-0 font-mono font-bold text-2xs cursor-pointer sticky ${
                    activeTab === tab.id
                      ? "bg-white text-gray-800 z-10 group-has-[textarea:focus]:border-gray-400 border-gray-200"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200 border-gray-200 hover:text-gray-600"
                  } transition-colors duration-200`}
                  style={{
                    left: `${Math.min(index * TAB_OFFSET, window.innerWidth - 100)}px`,
                    right: `${Math.min(
                      (tabs.length - index) * TAB_OFFSET,
                      window.innerWidth - 100
                    )}px`,
                    minWidth: "fit-content"
                  }}
                >
                  {tab.label}
                </div>
              ))}
              <div
                onClick={onOpenModal}
                className="p-4 rounded-t-2xl border-2 border-gray-200 border-b-0 font-mono font-bold text-2xs cursor-pointer bg-gray-100 text-gray-400 hover:bg-gray-200 border-gray-200 sticky hover:text-gray-600 transition-colors duration-200"
                style={{
                  left: `${Math.min(
                    tabs.length * TAB_OFFSET,
                    window.innerWidth - 100
                  )}px`,
                  right: "0px",
                  minWidth: "fit-content"
                }}
              >
                +
              </div>
            </div>
          </div>
        </div>

        {/* Input Box */}
        <div className="relative bg-white">
          <div className="relative border-2 border-gray-200 rounded-2xl rounded-tl-none transition-colors duration-200 group-has-[textarea:focus]:border-gray-400 -mt-[2px]">
            <div className="grid grid-rows-[minmax(min-content,1fr),auto]">
              <div className="relative min-h-[104px] max-h-[50vh]">
                <textarea
                  ref={textareaRef}
                  placeholder={displayedPlaceholder}
                  onChange={adjustTextareaHeight}
                  onKeyDown={handleKeyDown}
                  className="w-full h-full p-4 pb-8 bg-white rounded-2xl rounded-tl-none focus:outline-none resize-none transition-colors duration-200 overflow-y-auto font-sans leading-[1.5]"
                />
                {/* Gradient container */}
                <div className="absolute top-0 bottom-0 left-[16px] right-[16px] overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent" />
                </div>
              </div>

              {/* Controls Container */}
              <div className="h-16 px-4 flex items-center justify-between bg-white rounded-b-2xl">
                {/* Attachment and Microphone Icons */}
                <div className="flex gap-3">
                  <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  className="bg-black text-white text-xs px-5 font-mono py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Send ↵
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TabbedInput
