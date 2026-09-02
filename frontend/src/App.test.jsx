import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Outlet } from 'react-router-dom'
import App from './App'

vi.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ user: { fullName: 'Ada Lovelace' }, loading: false }),
}))

vi.mock('./components/common/ProtectedRoute', () => ({
  default: ({ children }) => children,
}))

vi.mock('./components/common/Layout', () => ({
  default: () => <Outlet />,
}))

vi.mock('./pages/Profile', () => ({
  default: () => <h1>Profile route content</h1>,
}))

vi.mock('./pages/Landing', () => ({ default: () => null }))
vi.mock('./pages/Login', () => ({ default: () => null }))
vi.mock('./pages/Register', () => ({ default: () => null }))
vi.mock('./pages/Dashboard', () => ({ default: () => null }))
vi.mock('./pages/NewInterview', () => ({ default: () => null }))
vi.mock('./pages/Interview', () => ({ default: () => null }))
vi.mock('./pages/Report', () => ({ default: () => null }))
vi.mock('./pages/JobDescriptions', () => ({ default: () => null }))
vi.mock('./pages/Resumes', () => ({ default: () => null }))

describe('App profile route', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/profile')
  })

  afterEach(() => {
    cleanup()
    window.history.replaceState({}, '', '/')
  })

  it('renders the profile page at the protected /profile path', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Profile route content' })).toBeInTheDocument()
  })
})
