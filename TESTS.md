# Testes Automatizados - Magic Life Counter

Este projeto contém testes unitários e de integração para as funcionalidades de incremento de vida (+1 e +10).

## 📊 Cobertura de Testes

- **Total de Testes:** 57
- **Suites:** 3
- **Cobertura:** 87.5%
- **Cobertura em lib/increment.ts:** 100%

## 🚀 Como Rodar os Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch (reexecuta ao salvar)
```bash
npm run test:watch
```

### Gerar relatório de cobertura
```bash
npm run test:coverage
```

### Executar testes específicos
```bash
npm test -- increment.test.ts          # Testes da lógica de incremento
npm test -- hold-behavior.test.ts      # Testes de comportamento do hold
npm test -- player-panel.test.tsx      # Testes do componente PlayerPanel
```

## 📝 Descrição dos Testes

### 1. **increment.test.ts** (25 testes)
Testa a lógica pura de incremento de vida isoladamente.

**O que é testado:**
- ✅ Incremento simples (+1)
- ✅ Decremento simples (-1)
- ✅ Limites (não vai abaixo de 0, não ultrapassa 99)
- ✅ Incrementos grandes (hold de +10)
- ✅ Decrementos grandes
- ✅ Imutabilidade do estado
- ✅ Sequências de múltiplos incrementos

### 2. **hold-behavior.test.ts** (19 testes)
Testa o comportamento realista do jogo com comportamento de hold.

**O que é testado:**
- ✅ Click simples (+1 e -1)
- ✅ Hold (pressionar e manter) com incremento de +10
- ✅ Sequências contínuas de hold
- ✅ Cenários realistas de jogo (dano, ganho de vida)
- ✅ Incrementos customizáveis
- ✅ Alternância entre incremento e decremento
- ✅ Limites de jogo (0 a 99)

### 3. **player-panel.test.tsx** (13 testes)
Testa o componente React PlayerPanel com cliques reais nos botões.

**O que é testado:**
- ✅ Click no botão +
- ✅ Click no botão -
- ✅ Comportamento de hold (pointerDown/pointerUp)
- ✅ Exibição correta da vida
- ✅ Atualização dinâmica do valor
- ✅ Valores extremos (0, 99)
- ✅ Alternância entre botões
- ✅ Acessibilidade (labels ARIA)

## 🎯 Cenários Testados

### Incremento Simples (+1)
```typescript
// Uma única press no botão resulta em +1
estado: 20 vida
ação: click no botão +
resultado: 21 vida
```

### Hold (+10 por segundo)
```typescript
// Segurar o botão por 500ms, depois incrementa 10 a cada 1s
estado: 20 vida
ação: segurar botão + por 1.5 segundos
resultado: 40 vida (primeira trigger aos 500ms: +10, segundo tick: +10)
```

### Limites
```typescript
// Vida nunca vai abaixo de 0 ou acima de 99
estado: 2 vida
ação: decrementar 10
resultado: 0 vida (capped)

estado: 95 vida
ação: incrementar 10
resultado: 99 vida (capped)
```

## 📈 Exemplos de Uso em Testes

### Teste simples
```typescript
it('should increment life by 1', () => {
  const result = incrementByOne({ life: 20, maxLife: 99 }, 1)
  expect(result.life).toBe(21)
})
```

### Teste com hold
```typescript
it('should increment by 10 with hold', () => {
  const result = incrementByAmount({ life: 20, maxLife: 99 }, 1, 10)
  expect(result.life).toBe(30)
})
```

### Teste de componente
```typescript
it('should call onHoldStart with correct direction', () => {
  render(<PlayerPanel player={mockPlayer} onHoldStart={mockFn} />)
  const plusButton = screen.getByRole('button', { name: /Add life/i })
  fireEvent.pointerDown(plusButton)
  expect(mockFn).toHaveBeenCalledWith(1)
})
```

## 🔍 Checklist de Funcionalidades

- [x] Incremento de +1 ao clicar no botão +
- [x] Decremento de -1 ao clicar no botão -
- [x] Incremento de +10 ao manter o botão + pressionado
- [x] Decremento de -10 ao manter o botão - pressionado
- [x] Limite mínimo de 0 vida
- [x] Limite máximo de 99 vida
- [x] Suporte a incrementos customizáveis
- [x] Sequências de múltiplos incrementos
- [x] Comportamento realista de jogo (dano, heal)
- [x] Acessibilidade nos componentes

## 📦 Dependências de Teste

```json
{
  "@testing-library/react": "^16.3.3",
  "@testing-library/jest-dom": "^7.0.1",
  "@testing-library/user-event": "^14.6.6",
  "@types/jest": "^30.0.0",
  "jest": "^30.5.0",
  "jest-environment-jsdom": "^30.5.0",
  "ts-node": "^10.9.2"
}
```

## 🛠️ Configuração

- **jest.config.js** - Configuração do Jest para Next.js
- **jest.setup.js** - Setup inicial dos testes

## 📋 Próximos Passos

- [ ] Adicionar testes E2E com Playwright ou Cypress
- [ ] Aumentar cobertura para 100%
- [ ] Testes de snapshot para componentes
- [ ] Testes de performance
- [ ] CI/CD integration (GitHub Actions)
