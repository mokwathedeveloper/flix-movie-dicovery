import React, { useState } from 'react'
import { Download, FileText, Database, Upload, BarChart3, X } from 'lucide-react'
import { 
  exportWatchlistAsCSV, 
  exportWatchlistAsJSON, 
  generateWatchlistPDF,
  importWatchlistFromJSON,
  getExportStats
} from '../../utils/exportUtils'

const ExportWatchlist = ({ 
  watchlist = [], 
  onImport = null,
  className = '',
  isOpen = false,
  onToggle
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState(null)
  const [showStats, setShowStats] = useState(false)

  const stats = getExportStats(watchlist)

  const handleExport = async (format) => {
    if (watchlist.length === 0) {
      alert('Your watchlist is empty. Add some movies or TV shows first!')
      return
    }

    setIsExporting(true)
    try {
      switch (format) {
        case 'csv':
          exportWatchlistAsCSV(watchlist)
          break
        case 'json':
          exportWatchlistAsJSON(watchlist)
          break
        case 'pdf':
          await generateWatchlistPDF(watchlist)
          break
        default:
          throw new Error('Unsupported format')
      }
    } catch (error) {
      alert('Export failed: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setImportError('Please select a JSON file exported from Flix')
      return
    }

    setIsImporting(true)
    setImportError(null)

    try {
      const importData = await importWatchlistFromJSON(file)
      
      if (onImport) {
        onImport(importData.watchlist, importData.metadata)
      }
      
      alert(`Successfully imported ${importData.watchlist.length} items!`)
    } catch (error) {
      setImportError(error.message)
    } finally {
      setIsImporting(false)
      event.target.value = '' // Reset file input
    }
  }

  const exportOptions = [
    {
      format: 'csv',
      label: 'CSV Spreadsheet',
      description: 'Compatible with Excel, Google Sheets',
      icon: FileText,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      format: 'json',
      label: 'JSON Data',
      description: 'Complete data with metadata',
      icon: Database,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      format: 'pdf',
      label: 'PDF Document',
      description: 'Printable formatted list',
      icon: FileText,
      color: 'text-red-600 dark:text-red-400'
    }
  ]

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors ${className}`}
      >
        <Download className="w-4 h-4" />
        <span className="font-medium">Export</span>
      </button>
    )
  }

  return (
    <div className={`bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Export & Import Watchlist
        </h3>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 dark:hover:bg-dark-100 rounded"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Watchlist Statistics ({stats.total} items)</span>
        </button>
        
        {showStats && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">By Status</h4>
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">By Type</h4>
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="capitalize">{type === 'tv' ? 'TV Shows' : 'Movies'}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Formats</h4>
        <div className="grid gap-3">
          {exportOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                disabled={isExporting || watchlist.length === 0}
                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon className={`w-5 h-5 ${option.color}`} />
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Import Section */}
      {onImport && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Import Watchlist
          </h4>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Choose JSON file
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Import a previously exported watchlist
                </div>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
            </label>

            {importError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {importError}
                </p>
              </div>
            )}

            {isImporting && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Importing watchlist...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Status */}
      {isExporting && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Preparing your export...
          </p>
        </div>
      )}

      {watchlist.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Your watchlist is empty. Add some movies or TV shows to export them.
          </p>
        </div>
      )}
    </div>
  )
}

export default ExportWatchlist
