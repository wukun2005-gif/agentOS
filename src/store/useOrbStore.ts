import { create } from 'zustand'
import type { OrbState, Artifact } from '../components/orb/OrbState'

interface OrbStore {
  orbState: OrbState
  setOrbState: (state: OrbState) => void
  transcript: string
  setTranscript: (text: string) => void
  intentFlowActive: boolean
  setIntentFlowActive: (active: boolean) => void
  /** 错误态的原因（error 态显示） */
  errorMessage: string
  setErrorMessage: (message: string) => void
  /** 当前活跃的任务产物列表 */
  artifacts: Artifact[]
  setArtifacts: (artifacts: Artifact[]) => void
}

export const useOrbStore = create<OrbStore>((set) => ({
  orbState: 'idle',
  setOrbState: (orbState) => set({ orbState }),
  transcript: '',
  setTranscript: (transcript) => set({ transcript }),
  intentFlowActive: false,
  setIntentFlowActive: (intentFlowActive) => set({ intentFlowActive }),
  errorMessage: '',
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  artifacts: [],
  setArtifacts: (artifacts) => set({ artifacts }),
}))
