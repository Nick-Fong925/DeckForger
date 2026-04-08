import { useState, type ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import ModeSelect, { type StudyMode } from '../components/study/ModeSelect'
import ClassicMode from '../components/study/ClassicMode'

const mockCards = [
  { front: 'What is mitosis?', back: 'Cell division producing two genetically identical daughter cells.' },
  { front: 'What is meiosis?', back: 'Cell division producing four genetically unique gametes with half the chromosomes.' },
  { front: 'Define osmosis.',  back: 'Movement of water across a semipermeable membrane from low to high solute concentration.' },
]

export default function StudyPage(): ReactElement {
  const { id } = useParams()
  const [mode, setMode] = useState<StudyMode | null>(null)

  if (!mode) return <ModeSelect deckId={id ?? ''} onSelect={setMode} />
  return <ClassicMode cards={mockCards} onExit={() => setMode(null)} />
}
