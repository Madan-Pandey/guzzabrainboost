import { render, screen } from '@testing-library/react'
import BadgeCollection from '@/app/components/BadgeCollection'
import { UserBadges, Badge } from '@/types/types'

describe('BadgeCollection', () => {
  const mockBadges: UserBadges = {
    scoreMaster: {
      type: 'SCORE',
      name: 'Score Master',
      tier: 'GOLD',
      description: 'Achieved high scores',
      progress: 75,
      total: 100,
    },
    streakChampion: {
      type: 'STREAK',
      name: 'Streak Champion',
      tier: 'SILVER',
      description: 'Maintained a streak',
      progress: 50,
      total: 100,
    },
    perfectScore: {
      type: 'PERFECT',
      name: 'Perfect Score',
      tier: 'BRONZE',
      description: 'Got perfect scores',
      progress: 25,
      total: 100,
    },
    quizProgress: {
      type: 'PROGRESS',
      name: 'Quiz Progress',
      tier: 'NO_BADGE',
      description: 'Overall progress',
      progress: 0,
      total: 100,
    },
    sectionMaster: {
      type: 'SECTION',
      name: 'Section Master',
      tier: 'NO_BADGE',
      description: 'Mastered sections',
      progress: 0,
      total: 100,
    }
  }

  it('renders badge collection with title', () => {
    render(<BadgeCollection badges={mockBadges} />)
    expect(screen.getByText('My Badges')).toBeInTheDocument()
  })

  it('displays earned badges in the grid', () => {
    render(<BadgeCollection badges={mockBadges} />)
    expect(screen.getAllByText('Score Master')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Streak Champion')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Perfect Score')[0]).toBeInTheDocument()
  })

  it('shows progress when showProgress is true', () => {
    render(<BadgeCollection badges={mockBadges} showProgress={true} />)
    expect(screen.getByText('Badge Progress')).toBeInTheDocument()
    expect(screen.getByText('75/100')).toBeInTheDocument()
    expect(screen.getByText('50/100')).toBeInTheDocument()
    expect(screen.getByText('25/100')).toBeInTheDocument()
  })

  it('hides progress when showProgress is false', () => {
    render(<BadgeCollection badges={mockBadges} showProgress={false} />)
    expect(screen.queryByText('Badge Progress')).not.toBeInTheDocument()
  })

  it('displays NO_BADGE tier badges with lock icon', () => {
    render(<BadgeCollection badges={mockBadges} />)
    const lockIcons = screen.getAllByText('🔒')
    expect(lockIcons).toHaveLength(2) // quizProgress and sectionMaster
  })
}) 