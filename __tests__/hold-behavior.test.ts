import { incrementByOne, incrementByAmount } from '@/lib/increment'

describe('Hold Button Behavior - Simulating Real User Interaction', () => {
  const initialState = { life: 20, maxLife: 99 }

  describe('Single click (+1 increment)', () => {
    it('should increment by 1 on single click', () => {
      const result = incrementByOne(initialState, 1)
      expect(result.life).toBe(21)
    })

    it('should handle multiple single clicks sequentially', () => {
      let state = initialState
      for (let i = 0; i < 5; i++) {
        state = incrementByOne(state, 1)
      }
      expect(state.life).toBe(25)
    })

    it('should decrement by 1 on single click (minus button)', () => {
      const result = incrementByOne(initialState, -1)
      expect(result.life).toBe(19)
    })
  })

  describe('Hold button behavior (+10 per second)', () => {
    it('should increment by 10 on first hold trigger (after 500ms)', () => {
      const result = incrementByAmount(initialState, 1, 10)
      expect(result.life).toBe(30)
    })

    it('should increment by 10 for each subsequent hold tick (every 1s)', () => {
      let state = initialState
      // First hold trigger (at 500ms)
      state = incrementByAmount(state, 1, 10)
      expect(state.life).toBe(30)
      // Subsequent holds (every 1s)
      state = incrementByAmount(state, 1, 10)
      expect(state.life).toBe(40)
      state = incrementByAmount(state, 1, 10)
      expect(state.life).toBe(50)
    })

    it('should handle continuous hold until cap', () => {
      let state = initialState
      const targetLife = 99
      while (state.life < targetLife) {
        state = incrementByAmount(state, 1, 10)
      }
      expect(state.life).toBe(99)
    })

    it('should decrement by 10 on hold minus button', () => {
      const result = incrementByAmount(initialState, -1, 10)
      expect(result.life).toBe(10)
    })

    it('should handle hold decrement until 0', () => {
      let state = initialState
      while (state.life > 0) {
        state = incrementByAmount(state, -1, 10)
      }
      expect(state.life).toBe(0)
    })
  })

  describe('Realistic game scenarios', () => {
    it('starting hand to after first attack', () => {
      let state = initialState // 20 life
      state = incrementByOne(state, -1) // Attack for 1
      state = incrementByOne(state, -1) // Attack for 1
      state = incrementByOne(state, -1) // Attack for 1
      expect(state.life).toBe(17)
    })

    it('gaining life with spell', () => {
      let state = { life: 15, maxLife: 99 } // Already taken damage
      state = incrementByOne(state, 1) // Gain 1 life
      state = incrementByAmount(state, 1, 10) // Heal for 10
      expect(state.life).toBe(26)
    })

    it('getting back to 20 after multiple attacks', () => {
      let state = initialState // 20
      state = incrementByAmount(state, -1, 10) // Attack for 10 damage
      expect(state.life).toBe(10)
      state = incrementByAmount(state, 1, 10) // Gain 10 life
      expect(state.life).toBe(20)
    })

    it('complex damage and heal sequence', () => {
      let state = initialState // 20
      state = incrementByAmount(state, -1, 5) // -5
      expect(state.life).toBe(15)
      state = incrementByOne(state, 1) // +1
      expect(state.life).toBe(16)
      state = incrementByAmount(state, 1, 8) // +8
      expect(state.life).toBe(24)
      state = incrementByAmount(state, -1, 3) // -3
      expect(state.life).toBe(21)
    })
  })

  describe('Custom hold increments', () => {
    it('should work with different hold amounts', () => {
      const holds = [5, 10, 15, 20, 25]
      holds.forEach(amount => {
        const result = incrementByAmount(initialState, 1, amount)
        expect(result.life).toBe(initialState.life + amount)
      })
    })

    it('should respect bounds with any hold amount', () => {
      const state95 = { life: 95, maxLife: 99 }
      const result = incrementByAmount(state95, 1, 15)
      expect(result.life).toBe(99) // Should cap at maxLife
    })
  })

  describe('Boundary conditions during gameplay', () => {
    it('should not go below 0 even with large decrement', () => {
      const state5 = { life: 5, maxLife: 99 }
      const result = incrementByAmount(state5, -1, 100)
      expect(result.life).toBe(0)
    })

    it('should not exceed 99 even with large increment', () => {
      const state95 = { life: 95, maxLife: 99 }
      const result = incrementByAmount(state95, 1, 100)
      expect(result.life).toBe(99)
    })

    it('should handle exact boundary values', () => {
      const state0 = { life: 0, maxLife: 99 }
      const resultIncrement = incrementByOne(state0, 1)
      expect(resultIncrement.life).toBe(1)

      const state99 = { life: 99, maxLife: 99 }
      const resultDecrement = incrementByOne(state99, -1)
      expect(resultDecrement.life).toBe(98)
    })
  })

  describe('Toggle direction (alternate buttons)', () => {
    it('should handle rapid direction changes', () => {
      let state = initialState
      state = incrementByOne(state, 1) // +1
      state = incrementByOne(state, -1) // -1
      state = incrementByOne(state, 1) // +1
      expect(state.life).toBe(21)
    })

    it('should handle hold direction changes', () => {
      let state = initialState
      state = incrementByAmount(state, 1, 10) // +10
      state = incrementByAmount(state, -1, 10) // -10
      expect(state.life).toBe(20)
    })
  })
})
