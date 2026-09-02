import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Profile from './Profile'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

vi.mock('../services/api', () => ({
  default: { put: vi.fn() },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => React.forwardRef(function MotionElement(
      { children, ...props },
      ref,
    ) {
      const domProps = { ...props }
      for (const prop of ['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap']) {
        delete domProps[prop]
      }
      return React.createElement(tag, { ...domProps, ref }, children)
    }),
  }),
}))

const user = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+44 1234',
  bio: 'Computing pioneer',
  jobTitle: 'Mathematician',
  company: 'Analytical Engines Ltd',
}

const renderProfile = ({ initialEntries = ['/profile'] } = {}) => render(
  <MemoryRouter initialEntries={initialEntries}>
    <Routes>
      <Route path="/previous" element={<p>Previous page</p>} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  </MemoryRouter>,
)

const controlFor = (label) => {
  const labelElement = screen.getByText(label, { selector: 'label' })
  return labelElement.parentElement.querySelector('input, textarea')
}

const toggleFor = (label) => {
  const labelElement = screen.getByText(label)
  let container = labelElement.parentElement
  while (container && !Array.from(container.children).some((child) => child.tagName === 'BUTTON')) {
    container = container.parentElement
  }
  return Array.from(container.children).find((child) => child.tagName === 'BUTTON')
}

describe('Profile', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user, logout: vi.fn() })
    api.put.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('initializes every editable field from the signed-in user', () => {
    renderProfile()

    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(controlFor('Full Name')).toHaveValue(user.fullName)
    expect(controlFor('Email')).toHaveValue(user.email)
    expect(controlFor('Email')).toBeDisabled()
    expect(controlFor('Phone')).toHaveValue(user.phone)
    expect(controlFor('Job Title')).toHaveValue(user.jobTitle)
    expect(controlFor('Company')).toHaveValue(user.company)
    expect(controlFor('Bio')).toHaveValue(user.bio)
  })

  it('falls back to empty form values when optional user details are absent', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })

    renderProfile()

    for (const label of ['Full Name', 'Email', 'Phone', 'Job Title', 'Company', 'Bio']) {
      expect(controlFor(label)).toHaveValue('')
    }
  })

  it('submits edited profile data, shows pending state, and dismisses success feedback', async () => {
    vi.useFakeTimers()
    let finishRequest
    api.put.mockReturnValue(new Promise((resolve) => { finishRequest = resolve }))
    renderProfile()

    fireEvent.change(controlFor('Full Name'), { target: { value: 'Ada Byron' } })
    fireEvent.change(controlFor('Phone'), { target: { value: '+44 5678' } })
    fireEvent.change(controlFor('Job Title'), { target: { value: 'Programmer' } })
    fireEvent.change(controlFor('Company'), { target: { value: 'Difference Engine Co' } })
    fireEvent.change(controlFor('Bio'), { target: { value: 'First programmer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
    expect(api.put).toHaveBeenCalledWith('/users/profile', {
      fullName: 'Ada Byron',
      email: user.email,
      phone: '+44 5678',
      bio: 'First programmer',
      jobTitle: 'Programmer',
      company: 'Difference Engine Co',
    })

    await act(async () => finishRequest({ data: {} }))

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled()
    expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(3000))
    expect(screen.queryByText('Profile updated successfully!')).not.toBeInTheDocument()
  })

  it('restores the save action and withholds success feedback when the request fails', async () => {
    const error = new Error('network unavailable')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    api.put.mockRejectedValue(error)
    renderProfile()

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByRole('button', { name: 'Save Changes' })).toBeEnabled()
    expect(screen.queryByText('Profile updated successfully!')).not.toBeInTheDocument()
    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it.each([
    ['Security', 'Security'],
    ['Notifications', 'Notifications'],
    ['Privacy', 'Privacy'],
    ['Appearance', 'Appearance'],
    ['About', 'About AI Interviewer'],
    ['Profile', 'Profile Information'],
  ])('switches to the %s settings panel', (tab, heading) => {
    renderProfile()

    fireEvent.click(screen.getByRole('button', { name: tab }))

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('toggles security, notification, and privacy preferences independently', () => {
    renderProfile()

    fireEvent.click(screen.getByRole('button', { name: 'Security' }))
    const twoFactor = toggleFor('Two-Factor Authentication')
    expect(screen.getByText('Disabled')).toBeInTheDocument()
    fireEvent.click(twoFactor)
    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(toggleFor('Two-Factor Authentication').style.background).toBe('rgb(99, 102, 241)')

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))
    const emailResults = toggleFor('Email interview results')
    const weeklyReport = toggleFor('Weekly progress report')
    expect(emailResults.style.background).toBe('rgb(99, 102, 241)')
    expect(weeklyReport.style.background).toBe('rgba(255, 255, 255, 0.1)')
    fireEvent.click(weeklyReport)
    expect(toggleFor('Weekly progress report').style.background).toBe('rgb(99, 102, 241)')
    expect(toggleFor('Email interview results').style.background).toBe('rgb(99, 102, 241)')

    fireEvent.click(screen.getByRole('button', { name: 'Privacy' }))
    const shareHistory = toggleFor('Share interview history')
    expect(shareHistory.style.background).toBe('rgba(255, 255, 255, 0.1)')
    fireEvent.click(shareHistory)
    expect(toggleFor('Share interview history').style.background).toBe('rgb(99, 102, 241)')
  })

  it('navigates back to the prior history entry', () => {
    renderProfile({ initialEntries: ['/previous', '/profile'] })

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByText('Previous page')).toBeInTheDocument()
  })
})
