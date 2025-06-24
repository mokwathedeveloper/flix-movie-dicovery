import jsPDF from 'jspdf'
import 'jspdf-autotable'

class ExportService {
  // Export watchlist as CSV
  exportWatchlistCSV(watchlist, filename = 'my-watchlist.csv') {
    const headers = ['Title', 'Type', 'Release Date', 'Rating', 'Status', 'Added Date']
    
    const csvContent = [
      headers.join(','),
      ...watchlist.map(movie => [
        `"${(movie.title || movie.name || '').replace(/"/g, '""')}"`,
        movie.media_type || 'movie',
        movie.release_date || movie.first_air_date || '',
        movie.vote_average || '',
        movie.watchlist_status || 'want_to_watch',
        movie.added_to_watchlist || new Date().toISOString().split('T')[0]
      ].join(','))
    ].join('\n')

    this.downloadFile(csvContent, filename, 'text/csv')
  }

  // Export watchlist as JSON
  exportWatchlistJSON(watchlist, filename = 'my-watchlist.json') {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      totalMovies: watchlist.length,
      watchlist: watchlist.map(movie => ({
        id: movie.id,
        title: movie.title || movie.name,
        mediaType: movie.media_type || 'movie',
        releaseDate: movie.release_date || movie.first_air_date,
        rating: movie.vote_average,
        overview: movie.overview,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        genres: movie.genre_ids || [],
        status: movie.watchlist_status || 'want_to_watch',
        addedDate: movie.added_to_watchlist || new Date().toISOString(),
        userRating: movie.user_rating || null,
        userNotes: movie.user_notes || ''
      }))
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    this.downloadFile(jsonContent, filename, 'application/json')
  }

  // Export watchlist as PDF
  async exportWatchlistPDF(watchlist, filename = 'my-watchlist.pdf') {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text('My Movie Watchlist', 20, 20)
    
    // Subtitle
    doc.setFontSize(12)
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30)
    doc.text(`Total Movies: ${watchlist.length}`, 20, 40)
    
    // Prepare table data
    const tableData = watchlist.map(movie => [
      movie.title || movie.name || 'Unknown Title',
      movie.media_type === 'tv' ? 'TV Show' : 'Movie',
      movie.release_date || movie.first_air_date || 'Unknown',
      movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
      this.formatStatus(movie.watchlist_status || 'want_to_watch')
    ])

    // Add table
    doc.autoTable({
      head: [['Title', 'Type', 'Release Date', 'Rating', 'Status']],
      body: tableData,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })

    // Add statistics
    const finalY = doc.lastAutoTable.finalY + 20
    doc.setFontSize(14)
    doc.text('Statistics', 20, finalY)
    
    const stats = this.calculateWatchlistStats(watchlist)
    doc.setFontSize(10)
    let yPos = finalY + 10
    
    Object.entries(stats).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 20, yPos)
      yPos += 7
    })

    // Save the PDF
    doc.save(filename)
  }

  // Export analytics data
  exportAnalytics(analyticsData, filename = 'flix-analytics.json') {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      analytics: analyticsData
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    this.downloadFile(jsonContent, filename, 'application/json')
  }

  // Export complete user data
  exportCompleteData(userData, filename = 'flix-complete-data.json') {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      userData
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    this.downloadFile(jsonContent, filename, 'application/json')
  }

  // Import watchlist from JSON
  importWatchlistJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          if (data.watchlist && Array.isArray(data.watchlist)) {
            resolve(data.watchlist)
          } else {
            reject(new Error('Invalid watchlist format'))
          }
        } catch (error) {
          reject(new Error('Failed to parse JSON file'))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Import watchlist from CSV
  importWatchlistCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const csv = e.target.result
          const lines = csv.split('\n')
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          
          const watchlist = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = this.parseCSVLine(line)
              const movie = {}
              
              headers.forEach((header, index) => {
                const value = values[index]?.replace(/"/g, '') || ''
                
                switch (header.toLowerCase()) {
                  case 'title':
                    movie.title = value
                    break
                  case 'type':
                    movie.media_type = value === 'TV Show' ? 'tv' : 'movie'
                    break
                  case 'release date':
                    movie.release_date = value
                    break
                  case 'rating':
                    movie.vote_average = parseFloat(value) || 0
                    break
                  case 'status':
                    movie.watchlist_status = this.parseStatus(value)
                    break
                  case 'added date':
                    movie.added_to_watchlist = value
                    break
                }
              })
              
              // Generate a temporary ID
              movie.id = Date.now() + Math.random()
              
              return movie
            })
          
          resolve(watchlist)
        } catch (error) {
          reject(new Error('Failed to parse CSV file'))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Helper methods
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  formatStatus(status) {
    const statusMap = {
      'want_to_watch': 'Want to Watch',
      'watching': 'Watching',
      'watched': 'Watched',
      'on_hold': 'On Hold',
      'dropped': 'Dropped'
    }
    return statusMap[status] || 'Want to Watch'
  }

  parseStatus(statusText) {
    const statusMap = {
      'want to watch': 'want_to_watch',
      'watching': 'watching',
      'watched': 'watched',
      'on hold': 'on_hold',
      'dropped': 'dropped'
    }
    return statusMap[statusText.toLowerCase()] || 'want_to_watch'
  }

  parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  calculateWatchlistStats(watchlist) {
    const stats = {
      'Total Movies': watchlist.filter(m => m.media_type !== 'tv').length,
      'Total TV Shows': watchlist.filter(m => m.media_type === 'tv').length,
      'Want to Watch': watchlist.filter(m => (m.watchlist_status || 'want_to_watch') === 'want_to_watch').length,
      'Watching': watchlist.filter(m => m.watchlist_status === 'watching').length,
      'Watched': watchlist.filter(m => m.watchlist_status === 'watched').length
    }

    const ratings = watchlist.filter(m => m.vote_average).map(m => m.vote_average)
    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      stats['Average Rating'] = avgRating.toFixed(1)
    }

    return stats
  }
}

export default new ExportService()
