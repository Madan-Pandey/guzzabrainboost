import { render, screen, fireEvent } from '@testing-library/react'
import QuizCard from '@/app/components/quizCard'

describe('QuizCard', () => {
  const mockProps = {
    Question: 'What is the capital of France?',
    Answers: ['London', 'Paris', 'Berlin', 'Madrid'],
    CorrectAns: 1,
    selectedAnswer: -1,
    setSelectedAnswer: jest.fn(),
    checked: false,
    setAnsCorrect: jest.fn(),
  }

  it('renders question and answers', () => {
    render(<QuizCard {...mockProps} />)
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
    mockProps.Answers.forEach(answer => {
      expect(screen.getByText(answer)).toBeInTheDocument()
    })
  })

  it('handles answer selection', () => {
    render(<QuizCard {...mockProps} />)
    const answer = screen.getByText('Paris')
    fireEvent.click(answer)
    expect(mockProps.setSelectedAnswer).toHaveBeenCalledWith(1)
  })

  it('disables buttons when answer is checked', () => {
    const checkedProps = { ...mockProps, checked: true }
    render(<QuizCard {...checkedProps} />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('shows correct answer indicator', () => {
    const checkedProps = {
      ...mockProps,
      checked: true,
      selectedAnswer: 1,
    }
    render(<QuizCard {...checkedProps} />)
    const button = screen.getByText('Paris')
    expect(button.className).toContain('cQuizButton')
  })

  it('shows incorrect answer indicator', () => {
    const checkedProps = {
      ...mockProps,
      checked: true,
      selectedAnswer: 0,
    }
    render(<QuizCard {...checkedProps} />)
    const button = screen.getByText('London')
    expect(button.className).toContain('FquizButton')
  })
}) 