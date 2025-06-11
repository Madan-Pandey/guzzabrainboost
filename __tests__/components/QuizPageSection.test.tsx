import { render, screen, fireEvent, act } from '@testing-library/react'
import QuizPageSection from '@/app/components/quizPageSection'
import { PlayerType } from '@/types/types'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // Convert boolean props to strings
    const imgProps = {
      ...props,
      fill: props.fill ? "true" : undefined,
      priority: props.priority ? "true" : undefined,
    }
    return <img {...imgProps} />
  },
}))

// Mock cookies-next
jest.mock('cookies-next', () => ({
  setCookie: jest.fn(),
}))

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

// Mock utility functions
jest.mock('@/utils/fPlayers', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@/utils/fRanking', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@/utils/fUser', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('QuizPageSection', () => {
  const mockQuizes = [
    {
      question: 'What is 2 + 2?',
      comment: 'Basic addition',
      test_answer: 1,
      answers: ['3', '4', '5', '6'],
    },
    {
      question: 'What is 3 x 3?',
      comment: 'Basic multiplication',
      test_answer: 1,
      answers: ['6', '9', '12', '15'],
    },
  ]

  const mockPlayer: PlayerType = {
    Player_ID: 1,
    Player_name: 'Test Player',
    email: 'test@example.com',
    Playerpoint: 100,
    Level_Id: 1,
  }

  const defaultProps = {
    Quizes: mockQuizes,
    levelNumber: '1',
    levelTitle: 'Basic Math',
    player: mockPlayer,
  }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    // Mock fetch for API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as jest.Mock
  })

  it('renders quiz title and first question', () => {
    render(<QuizPageSection {...defaultProps} />)
    expect(screen.getByText(/Level 1: Basic Math/)).toBeInTheDocument()
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('shows question progress', () => {
    render(<QuizPageSection {...defaultProps} />)
    const questionText = screen.getByText(/Question/i)
    expect(questionText).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('handles answer selection and checking', async () => {
    render(<QuizPageSection {...defaultProps} />)
    
    // Select an answer
    const answer = screen.getByText('4')
    fireEvent.click(answer)

    // Check answer
    const checkButton = screen.getByText('Check Answer')
    fireEvent.click(checkButton)

    // Wait for score update
    expect(await screen.findByText(/\+0/)).toBeInTheDocument()
  })

  it('shows time up modal when timer expires', async () => {
    jest.useFakeTimers()
    render(<QuizPageSection {...defaultProps} />)

    // Fast forward 30 seconds (timer duration)
    act(() => {
      jest.advanceTimersByTime(30000)
    })

    // Wait for the modal to appear
    await screen.findByText(/sec remaining/)

    jest.useRealTimers()
  })

  it('allows retrying a question after incorrect answer', async () => {
    render(<QuizPageSection {...defaultProps} />)
    
    // Select wrong answer
    const wrongAnswer = screen.getByText('3')
    fireEvent.click(wrongAnswer)

    // Check answer
    const checkButton = screen.getByText('Check Answer')
    fireEvent.click(checkButton)

    // Click try again
    const tryAgainButton = await screen.findByText('Try Again')
    fireEvent.click(tryAgainButton)

    // Verify we can select a new answer
    const correctAnswer = screen.getByText('4')
    expect(correctAnswer).not.toBeDisabled()
  })
}) 