import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Layout from './Layout'

const logout = vi.fn()

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { fullName: 'Ada Lovelace' }, logout }),
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
  AnimatePresence: ({ children }) => children,
}))

afterEach(() => {
  cleanup()
  logout.mockReset()
})

describe('Layout profile navigation', () => {
  it('links to the profile route and marks it active at that location', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="profile" element={<p>Profile outlet</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const profileLink = screen.getByRole('link', { name: 'Profile' })
    expect(profileLink).toHaveAttribute('href', '/profile')
    expect(profileLink).toHaveStyle({ color: '#fff', background: 'rgba(255,255,255,.06)' })
    expect(screen.getByText('Profile outlet')).toBeInTheDocument()
  })

  it('includes profile navigation in the mobile menu and closes it after selection', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<p>Dashboard outlet</p>} />
            <Route path="profile" element={<p>Profile outlet</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const unnamedButtons = screen.getAllByRole('button', { name: '' })
    fireEvent.click(unnamedButtons.at(-1))
    const profileLinks = screen.getAllByRole('link', { name: 'Profile' })
    expect(profileLinks).toHaveLength(2)

    fireEvent.click(profileLinks[1])

    expect(screen.getByText('Profile outlet')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Profile' })).toHaveLength(1)
  })
})
