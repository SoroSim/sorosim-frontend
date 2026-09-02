import { useState } from 'react'
import {
  encodeSessionToUrl,
  copyUrlToClipboard,
  getUrlLengthCategory,
  isUrlSafeLength,
  type ShareableSessionState,
} from '../utils/urlStateManager'

interface ShareSessionButtonProps {
  state: ShareableSessionState
  disabled?: boolean
}

export default function ShareSessionButton({ state, disabled }: ShareSessionButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [shareUrl, setShareUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleShare = () => {
    try {
      setError(null)
      const url = encodeSessionToUrl(state)
      setShareUrl(url)
      setShowModal(true)
      setCopied(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate share URL')
    }
  }

  const handleCopy = async () => {
    const success = await copyUrlToClipboard(shareUrl)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } else {
      setError('Failed to copy to clipboard')
    }
  }

  const urlCategory = shareUrl ? getUrlLengthCategory(shareUrl) : 'short'
  const isSafe = shareUrl ? isUrlSafeLength(shareUrl) : true

  return (
    <>
      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={disabled}
        className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        title="Share session via URL"
      >
        🔗 Share Session
      </button>

      {/* Error Display */}
      {error && !showModal && (
        <div className="mt-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Share Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
              {/* Header */}
              <div className="bg-stellar-purple text-white px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">🔗 Share Session</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* URL Display */}
                <div>
                  <label className="label">Shareable URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="input-field font-mono text-xs flex-1"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <button
                      onClick={handleCopy}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-stellar-purple text-white hover:bg-purple-700'
                      }`}
                    >
                      {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>

                {/* URL Info */}
                <div className="bg-gray-50 rounded p-3 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">URL Length:</span>
                    <span className="font-mono font-semibold">
                      {shareUrl.length} characters
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size Category:</span>
                    <span className={`font-semibold ${
                      urlCategory === 'short' ? 'text-green-600' :
                      urlCategory === 'medium' ? 'text-blue-600' :
                      urlCategory === 'long' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {urlCategory.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Safe for sharing:</span>
                    <span className={`font-semibold ${isSafe ? 'text-green-600' : 'text-red-600'}`}>
                      {isSafe ? '✓ Yes' : '⚠ May be too long'}
                    </span>
                  </div>
                </div>

                {/* Warning for long URLs */}
                {!isSafe && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-sm text-yellow-800">
                    ⚠️ <strong>Warning:</strong> This URL is very long and may not work in all contexts (email, chat apps, etc.). 
                    Consider reducing the number of ledger entries or using session export instead.
                  </div>
                )}

                {/* What's Included */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="text-sm font-semibold text-blue-900 mb-2">
                    📦 What's included in this URL:
                  </div>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>✓ Ledger entries ({state.ledgerEntries.length})</li>
                    {state.selectedFunction && (
                      <li>✓ Selected function ({state.selectedFunction})</li>
                    )}
                    {state.functionArguments && state.functionArguments.length > 0 && (
                      <li>✓ Function arguments ({state.functionArguments.length})</li>
                    )}
                    {state.contractName && (
                      <li>✓ Contract name ({state.contractName})</li>
                    )}
                  </ul>
                  <p className="text-xs text-blue-700 mt-2">
                    <strong>Note:</strong> WASM files and simulation history are NOT included. 
                    Recipients will need to upload the WASM file.
                  </p>
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    📖 How to use:
                  </div>
                  <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Copy the URL above</li>
                    <li>Share it with others via email, chat, or social media</li>
                    <li>Recipients can open the URL to load your session state</li>
                    <li>They'll need to upload the WASM file to run simulations</li>
                  </ol>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t flex justify-end">
                <button onClick={() => setShowModal(false)} className="btn-primary">
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
