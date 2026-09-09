import { useState, useEffect } from 'react'
import type { AppSettings } from '../types'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  settings: AppSettings
  onSave: (settings: AppSettings) => void
}

const DEFAULT_RPC_ENDPOINTS = {
  testnet: 'https://soroban-testnet.stellar.org',
  futurenet: 'https://rpc-futurenet.stellar.org',
  mainnet: 'https://soroban-rpc.stellar.org',
  local: 'http://localhost:8000/soroban/rpc',
}

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
    setHasChanges(false)
  }, [settings, isOpen])

  const handleChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleNetworkChange = (network: AppSettings['network']) => {
    const defaultEndpoint = DEFAULT_RPC_ENDPOINTS[network]
    setLocalSettings((prev) => ({
      ...prev,
      network,
      rpcEndpoint: defaultEndpoint,
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(localSettings)
    setHasChanges(false)
    onClose()
  }

  const handleReset = () => {
    const defaultSettings: AppSettings = {
      rpcEndpoint: DEFAULT_RPC_ENDPOINTS.testnet,
      network: 'testnet',
      theme: 'light',
    }
    setLocalSettings(defaultSettings)
    setHasChanges(true)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Settings Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-stellar-dark text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">⚙️ Settings</h2>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white transition-colors"
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
            {/* Network Configuration */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🌐 Network Configuration
              </h3>
              
              <div className="space-y-4">
                {/* Network Selection */}
                <div>
                  <label htmlFor="network" className="label">
                    Stellar Network
                  </label>
                  <select
                    id="network"
                    value={localSettings.network}
                    onChange={(e) =>
                      handleNetworkChange(e.target.value as AppSettings['network'])
                    }
                    className="input-field"
                  >
                    <option value="testnet">Testnet</option>
                    <option value="futurenet">Futurenet</option>
                    <option value="mainnet">Mainnet</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the Stellar network for contract simulations
                  </p>
                </div>

                {/* RPC Endpoint */}
                <div>
                  <label htmlFor="rpc-endpoint" className="label">
                    RPC Endpoint URL
                  </label>
                  <input
                    id="rpc-endpoint"
                    type="text"
                    value={localSettings.rpcEndpoint}
                    onChange={(e) => handleChange('rpcEndpoint', e.target.value)}
                    placeholder="https://soroban-testnet.stellar.org"
                    className="input-field font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Soroban RPC endpoint for network interactions
                  </p>
                </div>

                {/* Quick Endpoint Selection */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="text-xs font-semibold text-blue-900 mb-2">
                    Quick Select:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(DEFAULT_RPC_ENDPOINTS).map(([key, url]) => (
                      <button
                        key={key}
                        onClick={() => handleChange('rpcEndpoint', url)}
                        className={`text-xs px-3 py-1 rounded transition-colors ${
                          localSettings.rpcEndpoint === url
                            ? 'bg-stellar-purple text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Appearance */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🎨 Appearance
              </h3>
              
              <div>
                <label htmlFor="theme" className="label">
                  Theme
                </label>
                <select
                  id="theme"
                  value={localSettings.theme}
                  onChange={(e) =>
                    handleChange('theme', e.target.value as AppSettings['theme'])
                  }
                  className="input-field"
                >
                  <option value="light">☀️ Light</option>
                  <option value="dark">🌙 Dark</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose your preferred color scheme
                </p>
              </div>
            </section>

            {/* Backend Configuration */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🔧 Backend Configuration
              </h3>
              
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Backend API:</span>
                    <code className="text-xs font-mono bg-white px-2 py-1 rounded border">
                      {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
                    </code>
                  </div>
                  <p className="text-xs text-gray-500">
                    Configured via <code className="font-mono bg-white px-1">.env</code> file
                  </p>
                </div>
              </div>
            </section>

            {/* Info Section */}
            <section className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="text-sm text-blue-900">
                <div className="font-semibold mb-2">💡 About Settings</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Settings are saved to browser localStorage</li>
                  <li>Network selection updates RPC endpoint automatically</li>
                  <li>Use Local network for development with stellar-core</li>
                  <li>Changes take effect immediately after saving</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              🔄 Reset to Defaults
            </button>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasChanges ? '💾 Save Changes' : '✓ Saved'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
