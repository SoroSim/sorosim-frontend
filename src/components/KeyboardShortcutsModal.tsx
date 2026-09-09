import { useEffect } from 'react'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: Shortcut[] = [
  {
    keys: ['Ctrl', 'K'],
    description: 'Toggle Settings Panel',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', 'H'],
    description: 'Toggle Invocation History',
    category: 'Navigation',
  },
  {
    keys: ['Escape'],
    description: 'Close Modal/Panel',
    category: 'Navigation',
  },
  {
    keys: ['?'],
    description: 'Show Keyboard Shortcuts',
    category: 'Help',
  },
  {
    keys: ['Ctrl', '/'],
    description: 'Show Keyboard Shortcuts',
    category: 'Help',
  },
]

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-labelledby="shortcuts-title"
          aria-modal="true"
        >
          {/* Header */}
          <div className="sticky top-0 bg-stellar-dark dark:bg-gray-900 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 id="shortcuts-title" className="text-xl font-bold flex items-center gap-2">
                ⌨️ Keyboard Shortcuts
              </h2>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Close shortcuts modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <section key={category}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center">
                            <kbd className="px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-gray-800 dark:text-gray-200">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-gray-500 dark:text-gray-400">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Info Section */}
            <section className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded p-4">
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <div className="font-semibold mb-2">💡 Pro Tip</div>
                <p className="text-xs">
                  On Mac, use <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded text-xs">⌘ Cmd</kbd> instead of <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded text-xs">Ctrl</kbd> for most shortcuts.
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-b-lg border-t border-gray-200 dark:border-gray-600 flex items-center justify-end">
            <button onClick={onClose} className="btn-primary">
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
