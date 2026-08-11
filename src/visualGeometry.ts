export const clipSegmentToNodeRadii = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  startRadius: number,
  endRadius: number,
) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  return {
    x1: x1 + ux * startRadius,
    y1: y1 + uy * startRadius,
    x2: x2 - ux * endRadius,
    y2: y2 - uy * endRadius,
  }
}

export const edgeLabelPosition = (x1: number, y1: number, x2: number, y2: number, offset = 18) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.hypot(dx, dy) || 1
  return {
    x: (x1 + x2) / 2 - (dy / length) * offset,
    y: (y1 + y2) / 2 + (dx / length) * offset,
  }
}
