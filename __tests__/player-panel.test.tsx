import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PlayerPanel } from '@/components/player-panel'
import type { Player } from '@/components/life-counter'

const mockPlayer: Player = {
  id: 1,
  name: 'Player 1',
  color: '#ffffff',
  life: 20,
  history: [],
  inverted: false,
}

describe('PlayerPanel - Button Click Tests', () => {
  const mockProps = {
    showPlayerName: false,
    showFloatingNumbers: true,
    onChange: jest.fn(),
    onSettings: jest.fn(),
    onHistory: jest.fn(),
    hasPendingHistory: false,
    onSaveHistory: jest.fn(),
    historyDelay: 2,
    onHoldStart: jest.fn(),
    onHoldEnd: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Simple clicks on + button', () => {
    it('should call onHoldStart and onHoldEnd on + button press', () => {
      render(<PlayerPanel player={mockPlayer} {...mockProps} />)
      const plusButton = screen.getByRole('button', { name: /Add life/i })
      fireEvent.pointerDown(plusButton)
      expect(mockProps.onHoldStart).toHaveBeenCalledWith(1)
      fireEvent.pointerUp(plusButton)
      expect(mockProps.onHoldEnd).toHaveBeenCalled()
    })
  })

  describe('Simple clicks on - button', () => {
    it('should call onHoldStart and onHoldEnd on - button click', () => {
      render(<PlayerPanel player={mockPlayer} {...mockProps} />)
      const minusButton = screen.getByRole('button', { name: /Subtract life/i })
      fireEvent.pointerDown(minusButton)
      expect(mockProps.onHoldStart).toHaveBeenCalledWith(-1)
      fireEvent.pointerUp(minusButton)
      expect(mockProps.onHoldEnd).toHaveBeenCalled()
    })

    it('should call onHoldStart with -1 for minus button', () => {
      render(<PlayerPanel player={mockPlayer} {...mockProps} />)
      const minusButton = screen.getByRole('button', { name: /Subtract life/i })
      fireEvent.pointerDown(minusButton)
      expect(mockProps.onHoldStart).toHaveBeenCalledWith(-1)
    })
  })

  describe('Display life value', () => {
    it('should display the current life value', () => {
      render(<PlayerPanel player={mockPlayer} {...mockProps} />)
      expect(screen.getByLabelText(/20 life/i)).toBeInTheDocument()
    })

    it('should update life display when player life changes', () => {
      const { rerender } = render(<PlayerPanel player={mockPlayer} {...mockProps} />)
      expect(screen.getByLabelText(/20 life/i)).toBeInTheDocument()

      const updatedPlayer = { ...mockPlayer, life: 25 }
      rerender(<PlayerPanel player={updatedPlayer} {...mockProps} />)
      expect(screen.getByLabelText(/25 life/i)).toBeInTheDocument()
    })
  })

  describe('Hold behavior triggers', () => {
    it('should trigger hold on pointerDown and release on pointerUp', () => {
      render(<PlayerPanel player={mockPlayer} {...mockProps} />)
      const plusButton = screen.getByRole('button', { name: /Add life/i })

      fireEvent.pointerDown(plusButton)
      expect(mockProps.onHoldStart).toHaveBeenCalledWith(1)

      fireEvent.pointerUp(plusButton)
      expect(mockProps.onHoldEnd).toHaveBeenCalled()
    })

    it('should trigger hold release on pointerLeave', () => {
      render(<PlayerPanel player={mockPlayer} {...mockProps} />)
      const minusButton = screen.getByRole('button', { name: /Subtract life/i })

      fireEvent.pointerDown(minusButton)
      fireEvent.pointerLeave(minusButton)
      expect(mockProps.onHoldEnd).toHaveBeenCalled()
    })
  })

  describe('Multiple button interactions', () => {
    it('should handle alternating + and - button clicks', () => {
      const onHoldStart = jest.fn()
      const onHoldEnd = jest.fn()
      render(
        <PlayerPanel
          player={mockPlayer}
          {...mockProps}
          onHoldStart={onHoldStart}
          onHoldEnd={onHoldEnd}
        />
      )

      const plusButton = screen.getByRole('button', { name: /Add life/i })
      const minusButton = screen.getByRole('button', { name: /Subtract life/i })

      fireEvent.pointerDown(plusButton)
      expect(onHoldStart).toHaveBeenCalledWith(1)
      fireEvent.pointerUp(plusButton)

      fireEvent.pointerDown(minusButton)
      expect(onHoldStart).toHaveBeenCalledWith(-1)
      fireEvent.pointerUp(minusButton)
    })
  })

  describe('UI elements', () => {
    it('should have accessible labels for buttons', () => {
      render(<PlayerPanel player={mockPlayer} {...mockProps} />)
      expect(screen.getByRole('button', { name: /Add life/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Subtract life/i })).toBeInTheDocument()
    })

    it('should display settings button', () => {
      render(<PlayerPanel player={mockPlayer} {...mockProps} />)
      const settingsButton = screen.getByRole('button', { name: /Configure/i })
      expect(settingsButton).toBeInTheDocument()
      fireEvent.click(settingsButton)
      expect(mockProps.onSettings).toHaveBeenCalled()
    })
  })

  describe('Player with different life values', () => {
    it('should display life value of 0', () => {
      const zeroLifePlayer = { ...mockPlayer, life: 0 }
      render(<PlayerPanel player={zeroLifePlayer} {...mockProps} />)
      expect(screen.getByLabelText(/0 life/i)).toBeInTheDocument()
    })

    it('should display life value of 99', () => {
      const maxLifePlayer = { ...mockPlayer, life: 99 }
      render(<PlayerPanel player={maxLifePlayer} {...mockProps} />)
      expect(screen.getByLabelText(/99 life/i)).toBeInTheDocument()
    })

    it('should display large life values', () => {
      const largeLifePlayer = { ...mockPlayer, life: 50 }
      render(<PlayerPanel player={largeLifePlayer} {...mockProps} />)
      expect(screen.getByLabelText(/50 life/i)).toBeInTheDocument()
    })
  })
})
