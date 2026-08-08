import { create } from 'zustand'
import type { OrbState } from '../components/orb/OrbState'

interface OrbStore {
  orbState: OrbState
  setOrbState: (state: OrbState) => void
  transcript: string
  setTranscript: (text: string) => void
  intentFlowActive: boolean
  setIntentFlowActive: (active: boolean) => void
}

export const useOrbStore = create<OrbStore>((set) => ({
  orbState: 'idle',
  setOrbState: (orbState) => set({ orbState }),
  transcript: '',
  setTranscript: (transcript) => set({ transcript }),
  intentFlowActive: false,
  setIntentFlowActive: (intentFlowActive) => set({ intentFlowActive }),
}))
