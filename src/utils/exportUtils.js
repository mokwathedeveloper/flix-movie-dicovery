/**
 * Utility functions for exporting watchlist data
 */

// Export watchlist as CSV
export const exportWatchlistAsCSV = (watchlist) => {
  if (!watchlist || watchlist.length === 0) {
    throw new Error('No watchlist data to export')
  }

  // Define CSV headers
  const headers = [
    'Title',
    'Type',
    'Status',
    'Rating',
    'Release Date',
    'Added Date',
    'Overview'
  ]

  // Convert watchlist items to CSV rows
  const rows = watchlist.map(item => [
    `"${(item.title || item.name || '').replace(/"/g, '""')}"`,
    item.media_type || 'movie',
    item.status || 'want_to_watch',
    item.vote_average || '',
    item.release_date || item.first_air_date || '',
    item.addedAt ? new Date(item.addedAt).toLocaleDateString() : '',
    `"${(item.overview || '').replace(/"/g, '""').substring(0, 200)}"`
  ])

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `flix-watchlist-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Export watchlist as JSON
export const exportWatchlistAsJSON = (watchlist) => {
  if (!watchlist || watchlist.length === 0) {
    throw new Error('No watchlist data to export')
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    totalItems: watchlist.length,
    watchlist: watchlist.map(item => ({
      id: item.id,
      title: item.title || item.name,
      mediaType: item.media_type,
      status: item.status,
      rating: item.vote_average,
      releaseDate: item.release_date || item.first_air_date,
      addedDate: item.addedAt,
      updatedDate: item.updatedAt,
      overview: item.overview,
      posterPath: item.poster_path,
      genreIds: item.genre_ids
    }))
  }

  const jsonContent = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `flix-watchlist-${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Generate PDF content (requires jsPDF library)
export const generateWatchlistPDF = async (watchlist) => {
  // Dynamic import to avoid bundling jsPDF if not used
  try {
    const jsPDFModule = await import('jspdf')
    const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default
    
    if (!watchlist || watchlist.length === 0) {
      throw new Error('No watchlist data to export')
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    let yPosition = 20

    // Title
    doc.setFontSize(20)
    doc.setFont(undefined, 'bold')
    doc.text('My Flix Watchlist', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Export info
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' })
    doc.text(`Total items: ${watchlist.length}`, pageWidth / 2, yPosition + 5, { align: 'center' })
    yPosition += 20

    // Group by status
    const groupedByStatus = watchlist.reduce((acc, item) => {
      const status = item.status || 'want_to_watch'
      if (!acc[status]) acc[status] = []
      acc[status].push(item)
      return acc
    }, {})

    const statusLabels = {
      want_to_watch: 'Want to Watch',
      watching: 'Currently Watching',
      watched: 'Watched'
    }

    // Render each status group
    Object.entries(groupedByStatus).forEach(([status, items]) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 20
      }

      // Status header
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.text(statusLabels[status] || status, 20, yPosition)
      yPosition += 10

      // Items
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      
      items.forEach((item, index) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 20
        }

        const title = item.title || item.name || 'Unknown Title'
        const type = item.media_type === 'tv' ? 'TV Show' : 'Movie'
        const rating = item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : ''
        const year = item.release_date || item.first_air_date ? 
          new Date(item.release_date || item.first_air_date).getFullYear() : ''

        doc.text(`${index + 1}. ${title} (${type})`, 25, yPosition)
        if (year || rating) {
          doc.text(`${year} ${rating}`, 25, yPosition + 4)
          yPosition += 8
        } else {
          yPosition += 6
        }
      })

      yPosition += 10
    })

    // Save the PDF
    doc.save(`flix-watchlist-${new Date().toISOString().split('T')[0]}.pdf`)
    
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    throw new Error('PDF generation failed. Please try CSV export instead.')
  }
}

// Import watchlist from JSON
export const importWatchlistFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        
        // Validate format
        if (!data.watchlist || !Array.isArray(data.watchlist)) {
          throw new Error('Invalid watchlist format')
        }

        // Transform back to internal format
        const watchlist = data.watchlist.map(item => ({
          id: item.id,
          title: item.title,
          name: item.title, // For compatibility
          media_type: item.mediaType,
          status: item.status,
          vote_average: item.rating,
          release_date: item.releaseDate,
          first_air_date: item.releaseDate,
          addedAt: item.addedDate,
          updatedAt: item.updatedDate,
          overview: item.overview,
          poster_path: item.posterPath,
          genre_ids: item.genreIds
        }))

        resolve({
          watchlist,
          metadata: {
            exportDate: data.exportDate,
            version: data.version,
            totalItems: data.totalItems
          }
        })
      } catch (error) {
        reject(new Error('Failed to parse watchlist file: ' + error.message))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

// Get export statistics
export const getExportStats = (watchlist) => {
  if (!watchlist || watchlist.length === 0) {
    return {
      total: 0,
      byStatus: {},
      byType: {},
      byYear: {}
    }
  }

  const stats = {
    total: watchlist.length,
    byStatus: {},
    byType: {},
    byYear: {}
  }

  watchlist.forEach(item => {
    // By status
    const status = item.status || 'want_to_watch'
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1

    // By type
    const type = item.media_type || 'movie'
    stats.byType[type] = (stats.byType[type] || 0) + 1

    // By year
    const date = item.release_date || item.first_air_date
    if (date) {
      const year = new Date(date).getFullYear()
      if (!isNaN(year)) {
        stats.byYear[year] = (stats.byYear[year] || 0) + 1
      }
    }
  })

  return stats
}
