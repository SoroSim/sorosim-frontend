export default function StatePanel() {
  return (
    <div className="space-y-6">
      {/* Mock Ledger State */}
      <div className="panel">
        <div className="panel-header flex justify-between items-center">
          <span>Mock Ledger State</span>
          <button className="text-sm text-stellar-purple hover:underline">
            + Add Entry
          </button>
        </div>
        <div className="panel-content">
          <div className="bg-gray-50 rounded p-4 text-sm text-gray-500">
            No ledger entries configured yet
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Configure mock ledger entries to simulate contract storage and account state
          </p>
        </div>
      </div>

      {/* State Diff Viewer */}
      <div className="panel">
        <div className="panel-header">State Changes</div>
        <div className="panel-content">
          <div className="bg-gray-50 rounded p-4 text-sm text-gray-500">
            State changes will appear here after simulation
          </div>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              Added
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-500 rounded"></span>
              Modified
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              Removed
            </span>
          </div>
        </div>
      </div>

      {/* Events Panel */}
      <div className="panel">
        <div className="panel-header">Contract Events</div>
        <div className="panel-content">
          <div className="bg-gray-50 rounded p-4 text-sm text-gray-500">
            Emitted events will appear here after simulation
          </div>
        </div>
      </div>
    </div>
  )
}
