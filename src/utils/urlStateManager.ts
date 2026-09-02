import type { LedgerEntry, FunctionArgument } from '../types'

/**
 * Minimal session state for URL sharing
 * Only includes essential data to keep URLs manageable
 */
export interface ShareableSessionState {
  ledgerEntries: LedgerEntry[]
  selectedFunction?: string
  functionArguments?: FunctionArgument[]
  contractName?: string
}

/**
 * Encode session state to base64 URL parameter
 */
export function encodeSessionToUrl(state: ShareableSessionState): string {
  try {
    const json = JSON.stringify(state)
    const base64 = btoa(encodeURIComponent(json))
    
    // Build URL with current origin
    const url = new URL(window.location.href)
    url.searchParams.set('session', base64)
    
    return url.toString()
  } catch (error) {
    console.error('Failed to encode session:', error)
    throw new Error('Failed to create shareable URL')
  }
}

/**
 * Decode session state from URL parameter
 */
export function decodeSessionFromUrl(url: string = window.location.href): ShareableSessionState | null {
  try {
    const urlObj = new URL(url)
    const sessionParam = urlObj.searchParams.get('session')
    
    if (!sessionParam) {
      return null
    }
    
    const json = decodeURIComponent(atob(sessionParam))
    const state = JSON.parse(json) as ShareableSessionState
    
    // Validate structure
    if (!state.ledgerEntries || !Array.isArray(state.ledgerEntries)) {
      throw new Error('Invalid session structure')
    }
    
    return state
  } catch (error) {
    console.error('Failed to decode session from URL:', error)
    return null
  }
}

/**
 * Check if current URL contains a session parameter
 */
export function hasSessionInUrl(url: string = window.location.href): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.has('session')
  } catch {
    return false
  }
}

/**
 * Remove session parameter from URL without page reload
 */
export function clearSessionFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('session')
  window.history.replaceState({}, '', url.toString())
}

/**
 * Copy URL to clipboard
 */
export async function copyUrlToClipboard(url: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Get URL length category for user feedback
 */
export function getUrlLengthCategory(url: string): 'short' | 'medium' | 'long' | 'very-long' {
  const length = url.length
  
  if (length < 500) return 'short'
  if (length < 1500) return 'medium'
  if (length < 3000) return 'long'
  return 'very-long'
}

/**
 * Estimate if URL is safe for sharing across platforms
 */
export function isUrlSafeLength(url: string): boolean {
  // Most browsers support up to 2000 characters safely
  // Some platforms (email, chat) may have lower limits
  return url.length < 2000
}
