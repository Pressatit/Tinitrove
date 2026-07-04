import { useState, useEffect } from 'react'

/**
 * useDebounce
 *
 * Takes a value and a delay in milliseconds.
 * Returns a version of that value that only updates
 * after the user has stopped changing it for `delay` ms.
 *
 * Example:
 *   const [search, setSearch] = useState('')
 *   const debouncedSearch = useDebounce(search, 400)
 *
 *   // debouncedSearch only changes 400ms after the user
 *   // stops typing — perfect for triggering DB queries
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Start a timer to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // This is the key part:
    // If value changes before the timer fires (user kept typing),
    // we clear the old timer and start a fresh one.
    // The previous query never fires.
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}