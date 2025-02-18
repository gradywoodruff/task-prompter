import { useState, useRef, useEffect } from 'react'
import TabManageModal from './TabManageModal'

const TYPING_SPEED = 50 // milliseconds per character
const TAB_OFFSET = 5 // pixels between stacked tabs
const TAB_GAP = 4 // gap between tabs in pixels

const TabbedInput = () => {
  const [activeTab, setActiveTab] = useState('description')
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const textareaRef = useRef(null)
  const tabsContainerRef = useRef(null)
  
  const [tabs, setTabs] = useState([
    { id: 'description', label: 'Description', placeholder: 'Type your message here...' },
    { id: 'acceptance', label: 'Acceptance Criteria', placeholder: 'Type your acceptance criteria here...' },
    { id: 'assumptions', label: 'Assumptions', placeholder: 'Type your assumptions here...' },
    { id: 'technical', label: 'Technical Approach', placeholder: 'Type your technical approach here...' }
  ])

  useEffect(() => {
    const targetPlaceholder = tabs.find(tab => tab.id === activeTab)?.placeholder || ''
    let currentIndex = 0
    setDisplayedPlaceholder('')
    
    const animationInterval = setInterval(() => {
      if (currentIndex <= targetPlaceholder.length) {
        setDisplayedPlaceholder(targetPlaceholder.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(animationInterval)
      }
    }, TYPING_SPEED)

    return () => clearInterval(animationInterval)
  }, [activeTab])

  // Add effect to adjust initial scroll position
  useEffect(() => {
    if (tabsContainerRef.current) {
      // Scroll to show all tabs initially
      tabsContainerRef.current.scrollLeft = tabsContainerRef.current.scrollWidth * 0.1
    }
  }, [tabs])

  const handleTabMouseDown = (tabId, event) => {
    event.preventDefault() // This prevents focus loss
    setActiveTab(tabId)
    // Add a small delay to ensure the focus happens after the tab switch
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const handleSaveTabs = (newTabs) => {
    setTabs(newTabs)
    setIsModalOpen(false)
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
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex relative gap-1">
              {tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  onMouseDown={(event) => handleTabMouseDown(tab.id, event)}
                  className={`p-4 rounded-t-2xl border-2 border-gray-200 border-b-0 font-mono font-bold text-2xs cursor-pointer sticky ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-800 z-10 group-has-[textarea:focus]:border-gray-400'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border-gray-200 hover:text-gray-600'
                  }`}
                  style={{ 
                    left: `${Math.min(index * TAB_OFFSET, window.innerWidth - 100)}px`,
                    right: `${Math.min((tabs.length - index) * TAB_OFFSET, window.innerWidth - 100)}px`,
                    minWidth: 'fit-content'
                  }}
                >
                  {tab.label}
                </div>
              ))}
              <div
                onClick={() => setIsModalOpen(true)}
                className="p-4 rounded-t-2xl border-2 border-gray-200 border-b-0 font-mono font-bold text-2xs cursor-pointer bg-gray-100 text-gray-400 hover:bg-gray-200 border-gray-200 sticky hover:text-gray-600"
                style={{ 
                  left: `${Math.min(tabs.length * TAB_OFFSET, window.innerWidth - 100)}px`,
                  right: '0px',
                  minWidth: 'fit-content'
                }}
              >
                +
              </div>
            </div>
          </div>
        </div>

        {/* Input Box */}
        <div className="relative -mt-[2px]">
          <textarea
            ref={textareaRef}
            placeholder={displayedPlaceholder}
            className="w-full min-h-[200px] p-4 rounded-2xl rounded-tl-none bg-white border-2 border-gray-200 focus:outline-none focus:border-gray-400 focus:ring-0 resize-none"
          />

          {/* Attachment and Microphone Icons */}
          <div className="absolute bottom-4 left-4 flex gap-3">
            <button className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>

          {/* Send Button */}
          <button className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
            Send ↵
          </button>
        </div>
      </div>

      <TabManageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tabs={tabs}
        onSave={handleSaveTabs}
      />
    </div>
  )
}

export default TabbedInput 