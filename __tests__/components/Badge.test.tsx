import { render, screen, fireEvent } from '@testing-library/react'
import Badge from '@/app/components/Badge'
import { Badge as BadgeType } from '@/types/types'

describe('Badge', () => {
  const mockBadge: BadgeType = {
    type: 'SCORE',
    name: 'Score Master',
    tier: 'GOLD',
    description: 'Achieved high scores',
    progress: 75,
    total: 100,
  }

  it('renders badge with correct emoji', () => {
    render(<Badge badge={mockBadge} size="lg" showProgress={true} />)
    expect(screen.getByText('🥇')).toBeInTheDocument()
  })

  it('shows badge details when clicked', () => {
    render(<Badge badge={mockBadge} size="lg" showProgress={true} />)
    
    // Click the badge
    fireEvent.click(screen.getByText('🥇'))

    // Check if details are shown
    expect(screen.getByText('Score Master')).toBeInTheDocument()
    expect(screen.getByText('GOLD 🥇')).toBeInTheDocument()
    expect(screen.getByText('Achieved high scores')).toBeInTheDocument()
    expect(screen.getByText('Progress: 75/100')).toBeInTheDocument()
  })

  it('applies correct size class', () => {
    const { container } = render(<Badge badge={mockBadge} size="sm" showProgress={true} />)
    const badgeElement = container.querySelector('[class*="w-12 h-12"]')
    expect(badgeElement).toBeInTheDocument()
  })

  it('applies correct tier styling', () => {
    const { container } = render(<Badge badge={mockBadge} size="lg" showProgress={true} />)
    const badgeElement = container.querySelector('[class*="from-yellow-600"]')
    expect(badgeElement).toBeInTheDocument()
  })

  it('shows progress bar when showProgress is true', () => {
    const { container } = render(<Badge badge={mockBadge} showProgress={true} />)
    const progressBar = container.querySelector('.bg-gray-200')
    expect(progressBar).toBeInTheDocument()
  })

  it('hides progress bar when showProgress is false', () => {
    const { container } = render(<Badge badge={mockBadge} showProgress={false} />)
    const progressBar = container.querySelector('.bg-gray-200')
    expect(progressBar).not.toBeInTheDocument()
  })
}) 