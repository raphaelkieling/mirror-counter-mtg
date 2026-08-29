import { incrementLife, incrementByOne, incrementByAmount, IncrementState } from '@/lib/increment'

describe('Increment Functions', () => {
  const initialState: IncrementState = { life: 20, maxLife: 99 }

  describe('incrementLife', () => {
    it('should increment life by positive delta', () => {
      const result = incrementLife(initialState, 1)
      expect(result.life).toBe(21)
    })

    it('should decrement life by negative delta', () => {
      const result = incrementLife(initialState, -3)
      expect(result.life).toBe(17)
    })

    it('should not go below 0', () => {
      const state = { life: 2, maxLife: 99 }
      const result = incrementLife(state, -5)
      expect(result.life).toBe(0)
    })

    it('should not exceed maxLife', () => {
      const state = { life: 98, maxLife: 99 }
      const result = incrementLife(state, 10)
      expect(result.life).toBe(99)
    })

    it('should handle zero delta', () => {
      const result = incrementLife(initialState, 0)
      expect(result.life).toBe(20)
    })
  })

  describe('incrementByOne', () => {
    it('should increment life by 1 when direction is 1', () => {
      const result = incrementByOne(initialState, 1)
      expect(result.life).toBe(21)
    })

    it('should decrement life by 1 when direction is -1', () => {
      const result = incrementByOne(initialState, -1)
      expect(result.life).toBe(19)
    })

    it('should respect minimum bound (0)', () => {
      const state = { life: 0, maxLife: 99 }
      const result = incrementByOne(state, -1)
      expect(result.life).toBe(0)
    })

    it('should respect maximum bound', () => {
      const state = { life: 99, maxLife: 99 }
      const result = incrementByOne(state, 1)
      expect(result.life).toBe(99)
    })
  })

  describe('incrementByAmount (Hold functionality)', () => {
    it('should increment by 10 when holding +', () => {
      const result = incrementByAmount(initialState, 1, 10)
      expect(result.life).toBe(30)
    })

    it('should decrement by 10 when holding -', () => {
      const result = incrementByAmount(initialState, -1, 10)
      expect(result.life).toBe(10)
    })

    it('should handle custom amounts', () => {
      const result = incrementByAmount(initialState, 1, 5)
      expect(result.life).toBe(25)
    })

    it('should respect maximum bound with hold increment', () => {
      const state = { life: 95, maxLife: 99 }
      const result = incrementByAmount(state, 1, 10)
      expect(result.life).toBe(99)
    })

    it('should respect minimum bound with hold decrement', () => {
      const state = { life: 5, maxLife: 99 }
      const result = incrementByAmount(state, -1, 10)
      expect(result.life).toBe(0)
    })

    it('should work with different hold increments', () => {
      const result15 = incrementByAmount(initialState, 1, 15)
      expect(result15.life).toBe(35)

      const result20 = incrementByAmount(initialState, 1, 20)
      expect(result20.life).toBe(40)
    })
  })

  describe('Edge cases', () => {
    it('should handle life at exactly maxLife', () => {
      const state = { life: 99, maxLife: 99 }
      const result = incrementLife(state, 5)
      expect(result.life).toBe(99)
    })

    it('should handle life at exactly 0', () => {
      const state = { life: 0, maxLife: 99 }
      const result = incrementLife(state, -5)
      expect(result.life).toBe(0)
    })

    it('should preserve state object immutability', () => {
      const originalState = { ...initialState }
      incrementLife(initialState, 10)
      expect(initialState).toEqual(originalState)
    })

    it('should handle large positive increments', () => {
      const result = incrementByAmount(initialState, 1, 50)
      expect(result.life).toBe(70) // 20 + 50 = 70
    })

    it('should handle large negative decrements', () => {
      const result = incrementByAmount(initialState, -1, 50)
      expect(result.life).toBe(0) // 20 - 50 = -30, capped at 0
    })

    it('should cap large increments at maxLife', () => {
      const state = { life: 80, maxLife: 99 }
      const result = incrementByAmount(state, 1, 50)
      expect(result.life).toBe(99) // 80 + 50 = 130, capped at 99
    })
  })

  describe('Multiple increments sequence (simulating button presses)', () => {
    it('should handle sequence of single increments', () => {
      let state = initialState
      state = incrementByOne(state, 1)
      state = incrementByOne(state, 1)
      state = incrementByOne(state, 1)
      expect(state.life).toBe(23)
    })

    it('should handle sequence of hold increments', () => {
      let state = initialState
      state = incrementByAmount(state, 1, 10)
      state = incrementByAmount(state, 1, 10)
      expect(state.life).toBe(40)
    })

    it('should handle mixed increment and decrement', () => {
      let state = initialState
      state = incrementByOne(state, 1)
      state = incrementByAmount(state, -1, 10)
      state = incrementByOne(state, 1)
      expect(state.life).toBe(12)
    })

    it('should handle increments at boundaries', () => {
      let state = { life: 98, maxLife: 99 }
      state = incrementByOne(state, 1)
      expect(state.life).toBe(99)
      state = incrementByOne(state, 1) // should stay at 99
      expect(state.life).toBe(99)
    })
  })
})
