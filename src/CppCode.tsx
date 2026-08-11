const controlKeywords = new Set([
  'alignas', 'alignof', 'asm', 'break', 'case', 'catch', 'class', 'concept', 'const', 'constexpr',
  'continue', 'default', 'delete', 'do', 'else', 'enum', 'explicit', 'export', 'extern', 'for',
  'friend', 'goto', 'if', 'inline', 'namespace', 'new', 'noexcept', 'operator', 'private', 'protected',
  'public', 'requires', 'return', 'sizeof', 'static', 'struct', 'switch', 'template', 'this', 'throw',
  'try', 'typedef', 'typename', 'union', 'using', 'virtual', 'while',
])

const typeKeywords = new Set([
  'auto', 'bool', 'char', 'double', 'float', 'int', 'long', 'short', 'signed', 'unsigned', 'void',
  'size_t', 'string', 'vector', 'array', 'deque', 'queue', 'stack', 'set', 'map', 'unordered_map',
  'unordered_set', 'priority_queue', 'pair', 'tuple', 'bitset', 'll', 'Point', 'Token', 'State',
])

const constants = new Set(['true', 'false', 'nullptr', 'nullopt', 'INF', 'LLONG_MAX', 'INT_MAX'])
const tokenPattern = /(\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b0x[\da-fA-F]+\b|\b\d+(?:\.\d+)?\b|#[A-Za-z_]\w*|\b[A-Za-z_]\w*\b|::|->|<<|>>|<=|>=|==|!=|&&|\|\||\+\+|--|[{}()[\];,.<>+\-*/%=!&|^~?:]|\s+)/g

const tokenClass = (token: string, following: string) => {
  if (token.startsWith('//')) return 'syntax-comment'
  if (token.startsWith('"') || token.startsWith("'")) return 'syntax-string'
  if (token.startsWith('#')) return 'syntax-preprocessor'
  if (/^(?:0x[\da-f]+|\d+(?:\.\d+)?)$/i.test(token)) return 'syntax-number'
  if (controlKeywords.has(token)) return 'syntax-control'
  if (typeKeywords.has(token)) return 'syntax-type'
  if (constants.has(token)) return 'syntax-constant'
  if (/^[A-Za-z_]\w*$/.test(token) && following.trimStart().startsWith('(')) return 'syntax-function'
  if (/^(?:::|->|<<|>>|<=|>=|==|!=|&&|\|\||\+\+|--|[{}()[\];,.<>+\-*/%=!&|^~?:])$/.test(token)) return 'syntax-operator'
  return ''
}

export function CppCode({ line }: { line: string }) {
  const matches = [...line.matchAll(tokenPattern)]
  if (!matches.length) return <> </>
  return <>{matches.map((match, index) => {
    const token = match[0]
    const end = (match.index ?? 0) + token.length
    const className = tokenClass(token, line.slice(end))
    return <span key={`${end}-${index}`} className={className}>{token}</span>
  })}</>
}
