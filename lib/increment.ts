export interface IncrementState {
  life: number
  maxLife: number
}

export function incrementLife(state: IncrementState, delta: number): IncrementState {
  const newLife = Math.max(0, Math.min(state.maxLife, state.life + delta))
  return {
    ...state,
    life: newLife,
  }
}

export function incrementByOne(state: IncrementState, direction: 1 | -1): IncrementState {
  return incrementLife(state, direction)
}

export function incrementByAmount(state: IncrementState, direction: 1 | -1, amount: number): IncrementState {
  return incrementLife(state, direction * amount)
}
