export type NodeStatus = 'idle' | 'active' | 'partial' | 'accepted' | 'returned' | 'ignored'

export interface TreeNode {
  id: string
  left: number
  right: number
  sum: number
  depth: number
  x: number
  y: number
  parentId?: string
}

export interface TraceStep {
  id: string
  kind: 'start' | 'visit' | 'partial' | 'accept' | 'ignore' | 'return' | 'complete'
  activeId?: string
  statuses: Record<string, NodeStatus>
  returnedValues: Record<string, number>
  runningTotal: number
  title: string
  explanation: string
}

const nodeId = (left: number, right: number) => `${left}-${right}`

export function buildTree(values: number[]): TreeNode[] {
  const nodes: TreeNode[] = []
  const build = (left: number, right: number, depth: number, parentId?: string): number => {
    const id = nodeId(left, right)
    const middle = Math.floor((left + right) / 2)
    const sum = left === right
      ? values[left]
      : build(left, middle, depth + 1, id) + build(middle + 1, right, depth + 1, id)
    nodes.push({
      id,
      left,
      right,
      sum,
      depth,
      x: ((left + right + 1) / 2 / values.length) * 100,
      y: 12 + depth * 23,
      parentId,
    })
    return sum
  }
  build(0, values.length - 1, 0)
  return nodes.sort((a, b) => a.depth - b.depth || a.left - b.left)
}

export function createQueryTrace(values: number[], queryLeft: number, queryRight: number): TraceStep[] {
  const nodes = buildTree(values)
  const statuses: Record<string, NodeStatus> = Object.fromEntries(nodes.map((node) => [node.id, 'idle']))
  const returnedValues: Record<string, number> = {}
  const steps: TraceStep[] = []
  let runningTotal = 0
  let sequence = 0

  const push = (step: Omit<TraceStep, 'id' | 'statuses' | 'returnedValues' | 'runningTotal'>) => {
    steps.push({
      ...step,
      id: `${sequence++}-${step.kind}-${step.activeId ?? 'scene'}`,
      statuses: { ...statuses },
      returnedValues: { ...returnedValues },
      runningTotal,
    })
  }

  push({
    kind: 'start',
    title: `查詢 [${queryLeft + 1}, ${queryRight + 1}]`,
    explanation: '光帶標出目標範圍。接著從代表整個陣列的根節點開始。',
  })

  const query = (left: number, right: number): number => {
    const id = nodeId(left, right)
    statuses[id] = 'active'
    push({
      kind: 'visit', activeId: id, title: `查看 [${left + 1}, ${right + 1}]`,
      explanation: `目前節點涵蓋第 ${left + 1} 到 ${right + 1} 個元素，先比較它和查詢範圍。`,
    })

    if (right < queryLeft || left > queryRight) {
      statuses[id] = 'ignored'
      returnedValues[id] = 0
      push({
        kind: 'ignore', activeId: id, title: '沒有重疊',
        explanation: '這段完全在查詢範圍之外，不會貢獻答案，直接回傳 0。',
      })
      return 0
    }

    const node = nodes.find((item) => item.id === id)!
    if (queryLeft <= left && right <= queryRight) {
      statuses[id] = 'accepted'
      returnedValues[id] = node.sum
      runningTotal += node.sum
      push({
        kind: 'accept', activeId: id, title: `完整包含 · 取用 ${node.sum}`,
        explanation: `整段都在查詢範圍內，可以直接使用節點預先存好的總和 ${node.sum}。`,
      })
      return node.sum
    }

    statuses[id] = 'partial'
    push({
      kind: 'partial', activeId: id, title: '部分重疊 · 繼續往下',
      explanation: '這段只有一部分落在目標範圍，必須拆成左右兩半分別查詢。',
    })
    const middle = Math.floor((left + right) / 2)
    const value = query(left, middle) + query(middle + 1, right)
    statuses[id] = 'returned'
    returnedValues[id] = value
    push({
      kind: 'return', activeId: id, title: `合併結果 · ${value}`,
      explanation: `左右子樹的結果相加為 ${value}，現在把這個小計往上一層傳。`,
    })
    return value
  }

  const total = query(0, values.length - 1)
  statuses[nodeId(0, values.length - 1)] = 'returned'
  push({
    kind: 'complete', activeId: nodeId(0, values.length - 1), title: `查詢完成 · ${total}`,
    explanation: `所有需要的區段都已合併，區間總和是 ${total}。`,
  })
  return steps
}
