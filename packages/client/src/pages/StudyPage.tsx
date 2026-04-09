import { useState, type ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import ModeSelect, { type StudyMode } from '../components/study/ModeSelect'
import ClassicMode from '../components/study/ClassicMode'

export default function StudyPage(): ReactElement {
  const { id } = useParams()
  const [mode, setMode] = useState<StudyMode | null>(null)

  // Cards will be fetched from the deck API once Firestore integration is wired
  const cards: Array<{ front: string; back: string }> = []

  if (!mode) return <ModeSelect deckId={id ?? ''} onSelect={setMode} />
  return <ClassicMode cards={cards} onExit={() => setMode(null)} />
}
