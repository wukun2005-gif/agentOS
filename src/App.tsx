import { Orb } from './components/orb/Orb'
import { StateControls } from './components/controls/StateControls'
import { IntentInput } from './components/controls/IntentInput'
import './App.css'

function App() {
  return (
    <div className="app">
      <Orb />
      <StateControls />
      <IntentInput />
    </div>
  )
}

export default App
