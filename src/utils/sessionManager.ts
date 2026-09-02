import type { SessionState, LedgerEntry, InvocationHistory } from '../types'

/**
 * Session file format for SoroSim
 */
interface SessionFile {
  version: string
  timestamp: number
  metadata: {
    exportedAt: string
    totalInvocations: number
    ledgerEntriesCount: number
  }
  session: SessionState
}

/**
 * Export current session to JSON file
 */
export function exportSession(
  history: InvocationHistory[],
  ledgerEntries: LedgerEntry[],
  wasmFileName?: string
): void {
  const session: SessionState = {
    wasmFile: undefined, // WASM file not serializable, only store filename
    ledgerEntries,
    history,
    settings: {
      rpcEndpoint: 'http://localhost:3000',
      network: 'testnet',
      theme: 'light',
    },
  }

  const sessionFile: SessionFile = {
    version: '1.0.0',
    timestamp: Date.now(),
    metadata: {
      exportedAt: new Date().toISOString(),
      totalInvocations: history.length,
      ledgerEntriesCount: ledgerEntries.length,
    },
    session,
  }

  const json = JSON.stringify(sessionFile, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  const filename = wasmFileName 
    ? `sorosim-session-${sanitizeFilename(wasmFileName)}-${Date.now()}.json`
    : `sorosim-session-${Date.now()}.json`
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Import session from JSON file
 */
export async function importSession(
  file: File
): Promise<{ history: InvocationHistory[]; ledgerEntries: LedgerEntry[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const sessionFile = JSON.parse(content) as SessionFile

        // Validate structure
        if (!sessionFile.version || !sessionFile.session) {
          throw new Error('Invalid session file format')
        }

        if (!sessionFile.session.history || !Array.isArray(sessionFile.session.history)) {
          throw new Error('Invalid session file: missing history')
        }

        if (!sessionFile.session.ledgerEntries || !Array.isArray(sessionFile.session.ledgerEntries)) {
          throw new Error('Invalid session file: missing ledger entries')
        }

        resolve({
          history: sessionFile.session.history,
          ledgerEntries: sessionFile.session.ledgerEntries,
        })
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to parse session file'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read session file'))
    }

    reader.readAsText(file)
  })
}

/**
 * Sanitize filename for safe file system usage
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.wasm$/, '')
    .replace(/[^a-z0-9_-]/gi, '_')
    .toLowerCase()
    .slice(0, 50)
}

/**
 * Generate session summary for display
 */
export function getSessionSummary(sessionFile: SessionFile): string {
  const lines = [
    `Session Export`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Version: ${sessionFile.version}`,
    `Exported: ${new Date(sessionFile.timestamp).toLocaleString()}`,
    ``,
    `📊 Summary:`,
    `  • Invocations: ${sessionFile.metadata.totalInvocations}`,
    `  • Ledger Entries: ${sessionFile.metadata.ledgerEntriesCount}`,
    `  • Network: ${sessionFile.session.settings.network}`,
  ]

  return lines.join('\n')
}
