import { AlgorithmStep, Language } from '../types'

export const nQueensCode: Record<Language, string> = {
  typescript: `function solveNQueens(n) {
  let board = Array(n).fill(0).map(() => Array(n).fill(null));
  function backtrack(row) {
    if (row === n) return true;
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row][col] = 'Q';
        if (backtrack(row + 1)) return true;
        board[row][col] = null;
      }
    }
    return false;
  }
  backtrack(0);
}`,
  python: `def solve_n_queens(n):
    board = [['.' for _ in range(n)] for _ in range(n)]
    def backtrack(row):
        if row == n:
            return True
        for col in range(n):
            if is_safe(row, col):
                board[row][col] = 'Q'
                if backtrack(row + 1):
                    return True
                board[row][col] = '.'
        return False
    backtrack(0)`,
  javascript: `function solveNQueens(n) {
  const board = Array.from({length: n}, () => Array(n).fill(null));
  function solve(row) {
    if (row === n) return true;
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col, board)) {
        board[row][col] = 'Q';
        if (solve(row + 1)) return true;
        board[row][col] = null;
      }
    }
    return false;
  }
  solve(0);
}`,
  cpp: `bool solve(int row) {
    if (row == n) return true;
    for (int col = 0; col < n; col++) {
        if (isSafe(row, col)) {
            board[row][col] = 'Q';
            if (solve(row + 1)) return true;
            board[row][col] = '.';
        }
    }
    return false;
}`
}

export function* nQueensGenerator(n: number = 4): Generator<AlgorithmStep> {
  const board = Array.from({ length: n }, () => Array<string | null>(n).fill(null))

  function isSafe(r: number, c: number, b: (string | null)[][]) {
    for (let i = 0; i < r; i++) {
      if (b[i][c] === 'Q') return false
      const diff = r - i
      if (c - diff >= 0 && b[i][c - diff] === 'Q') return false
      if (c + diff < n && b[i][c + diff] === 'Q') return false
    }
    return true
  }

  function* backtrack(row: number): Generator<AlgorithmStep, boolean, unknown> {
    if (row === n) {
      yield {
        codeLine: 4,
        description: 'All queens placed successfully!',
        state: { grid: board.map(r => [...r]) }
      }
      return true
    }

    for (let col = 0; col < n; col++) {
      board[row][col] = 'X' // trying
      yield {
        codeLine: 5,
        description: `Trying to place queen at row ${row}, col ${col}.`,
        state: { grid: board.map(r => [...r]) }
      }

      if (isSafe(row, col, board)) {
        board[row][col] = 'Q'
        yield {
          codeLine: 7,
          description: `Safe! Queen placed at row ${row}, col ${col}. Moving to row ${row + 1}.`,
          state: { grid: board.map(r => [...r]) }
        }
        const solved: boolean = yield* backtrack(row + 1)
        if (solved) return true
        
        board[row][col] = 'X' // failed deep — mark as backtracked
        yield {
          codeLine: 9,
          description: `Backtracking from row ${row + 1}. Row ${row}, col ${col} didn't lead to a solution.`,
          state: { grid: board.map(r => [...r]) }
        }
      } else {
        yield {
          codeLine: 6,
          description: `Conflict at row ${row}, col ${col}.`,
          state: { grid: board.map(r => [...r]) }
        }
      }
      board[row][col] = null
    }
    return false
  }

  yield* backtrack(0)

  yield {
    codeLine: 1,
    description: 'N-Queens backtracking complete!',
    state: { grid: board.map(r => [...r]) }
  }
}
