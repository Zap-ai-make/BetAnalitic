import { useState, useEffect, useCallback, useRef } from "react"

interface MentionState {
  isOpen: boolean
  filterText: string
  cursorPosition: number
  matchStart: number
}

interface UseMentionReturn<T> {
  isOpen: boolean
  filteredItems: T[]
  selectedIndex: number
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleInput: (value: string, selectionStart: number) => void
  selectItem: (item: T) => void
  closeDropdown: () => void
}

export function useMention<T extends { name: string }>(
  items: T[],
  onSelect: (item: T) => void
): UseMentionReturn<T> {
  const [mentionState, setMentionState] = useState<MentionState>({
    isOpen: false,
    filterText: "",
    cursorPosition: 0,
    matchStart: -1,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const debounceTimer = useRef<NodeJS.Timeout>()

  const filteredItems = mentionState.filterText
    ? items.filter((item) =>
        item.name.toLowerCase().includes(mentionState.filterText.toLowerCase())
      )
    : items

  useEffect(() => {
    setSelectedIndex(0)
  }, [mentionState.filterText])

  const selectItem = useCallback(
    (item: T) => {
      onSelect(item)
      setMentionState({ isOpen: false, filterText: "", cursorPosition: 0, matchStart: -1 })
      setSelectedIndex(0)
    },
    [onSelect]
  )

  const closeDropdown = useCallback(() => {
    setMentionState((prev) => ({ ...prev, isOpen: false }))
    setSelectedIndex(0)
  }, [])

  const handleInput = useCallback((value: string, selectionStart: number) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      const textBeforeCursor = value.substring(0, selectionStart)
      const lastAtIndex = textBeforeCursor.lastIndexOf("@")
      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
        if (!textAfterAt.includes(" ")) {
          setMentionState({ isOpen: true, filterText: textAfterAt, cursorPosition: selectionStart, matchStart: lastAtIndex })
          return
        }
      }
      setMentionState((prev) => ({ ...prev, isOpen: false }))
    }, 100)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!mentionState.isOpen) return
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1))
          break
        case "Enter":
        case "Tab": {
          const item = filteredItems[selectedIndex]
          if (item) { e.preventDefault(); selectItem(item) }
          break
        }
        case "Escape":
          e.preventDefault()
          closeDropdown()
          break
      }
    },
    [mentionState.isOpen, filteredItems, selectedIndex, selectItem, closeDropdown]
  )

  return { isOpen: mentionState.isOpen, filteredItems, selectedIndex, handleKeyDown, handleInput, selectItem, closeDropdown }
}
