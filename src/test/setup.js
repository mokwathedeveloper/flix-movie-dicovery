import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock environment variables
vi.mock('../utils/env', () => ({
  TMDB_API_KEY: 'test-tmdb-key',
  OMDB_API_KEY: 'test-omdb-key',
  VAPID_PUBLIC_KEY: 'test-vapid-key'
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock scrollTo
global.scrollTo = vi.fn()

// Mock fetch
global.fetch = vi.fn()

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock navigator
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
})

Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({
      installing: null,
      waiting: null,
      active: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
    getRegistration: vi.fn().mockResolvedValue(null),
  },
  writable: true,
})

// Mock Notification
global.Notification = {
  permission: 'default',
  requestPermission: vi.fn().mockResolvedValue('granted'),
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console logs in tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
}

// Mock image loading
global.Image = class {
  constructor() {
    setTimeout(() => {
      this.onload?.()
    }, 100)
  }
}

// Mock CSS.supports
global.CSS = {
  supports: vi.fn().mockReturnValue(true),
}

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn()

// Mock performance
global.performance = {
  ...global.performance,
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn().mockReturnValue([]),
  getEntriesByType: vi.fn().mockReturnValue([]),
  now: vi.fn(() => Date.now()),
}

// Setup test utilities
export const createMockMovie = (overrides = {}) => ({
  id: 1,
  title: 'Test Movie',
  overview: 'This is a test movie',
  poster_path: '/test-poster.jpg',
  backdrop_path: '/test-backdrop.jpg',
  release_date: '2023-01-01',
  vote_average: 8.5,
  vote_count: 1000,
  genre_ids: [28, 12],
  popularity: 95.5,
  media_type: 'movie',
  ...overrides,
})

export const createMockTVShow = (overrides = {}) => ({
  id: 1,
  name: 'Test TV Show',
  overview: 'This is a test TV show',
  poster_path: '/test-tv-poster.jpg',
  backdrop_path: '/test-tv-backdrop.jpg',
  first_air_date: '2023-01-01',
  vote_average: 7.8,
  vote_count: 800,
  genre_ids: [18, 10765],
  popularity: 85.2,
  media_type: 'tv',
  ...overrides,
})

export const createMockPerson = (overrides = {}) => ({
  id: 1,
  name: 'Test Actor',
  profile_path: '/test-profile.jpg',
  popularity: 75.5,
  known_for_department: 'Acting',
  known_for: [createMockMovie()],
  media_type: 'person',
  ...overrides,
})

// Mock API responses
export const mockApiResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
})

export const mockApiError = (status = 500, message = 'Internal Server Error') => ({
  ok: false,
  status,
  statusText: message,
  json: vi.fn().mockRejectedValue(new Error('Failed to parse JSON')),
  text: vi.fn().mockResolvedValue(message),
})

// Test helpers
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  window.IntersectionObserver = mockIntersectionObserver
  window.IntersectionObserverEntry = vi.fn()
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
  sessionStorageMock.getItem.mockReturnValue(null)
  fetch.mockClear()
})
