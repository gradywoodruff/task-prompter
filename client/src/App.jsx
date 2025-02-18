import TabbedInput from './components/TabbedInput'

function App() {
  return (
    <div className="flex w-full">
      <div className="min-h-screen w-2/5 bg-white p-4">
        <TabbedInput />
      </div>
      <div className="min-h-screen bg-gray-100 p-4 flex-1">
        test
      </div>
    </div>
  )
}

export default App 