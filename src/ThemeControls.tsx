import { useEffect, useState, type CSSProperties } from 'react'
import { Check, Palette, RotateCcw, X } from 'lucide-react'

export type ThemeSettings = {
  preset: string
  accentMode: 'lesson' | 'custom'
  accent: string
  background: string
  panel: string
  codeBackground: string
  codeText: string
  codeKeyword: string
  codeType: string
  fontScale: number
}

const STORAGE_KEY = 'algovista-theme-v1'

export const DEFAULT_THEME: ThemeSettings = {
  preset: 'midnight',
  accentMode: 'lesson',
  accent: '#a995ff',
  background: '#080a0f',
  panel: '#10131b',
  codeBackground: '#090c12',
  codeText: '#d7dce5',
  codeKeyword: '#c7a7ff',
  codeType: '#82b1ff',
  fontScale: 1,
}

const PRESETS: { id: string; label: string; values: Partial<ThemeSettings> }[] = [
  { id: 'midnight', label: 'Midnight', values: DEFAULT_THEME },
  { id: 'ocean', label: 'Ocean', values: { accentMode: 'custom', accent: '#55d6ff', background: '#061017', panel: '#0c1a24', codeBackground: '#07131c', codeText: '#d9f3ff', codeKeyword: '#69d5ff', codeType: '#8ab4ff' } },
  { id: 'ember', label: 'Ember', values: { accentMode: 'custom', accent: '#ffad72', background: '#110b09', panel: '#1c1210', codeBackground: '#120c0b', codeText: '#f4ddd2', codeKeyword: '#ff9d76', codeType: '#ffd17d' } },
  { id: 'contrast', label: 'Contrast', values: { accentMode: 'custom', accent: '#6fffd2', background: '#020504', panel: '#080d0b', codeBackground: '#020604', codeText: '#f5fff9', codeKeyword: '#84ffd8', codeType: '#8cc8ff', fontScale: 1.08 } },
]

const readTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...DEFAULT_THEME, ...JSON.parse(saved) } as ThemeSettings : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function useThemeSettings() {
  const [theme, setTheme] = useState<ThemeSettings>(readTheme)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(theme)) } catch { /* Browser storage may be disabled. */ }
  }, [theme])
  return [theme, setTheme] as const
}

export function themeStyle(theme: ThemeSettings): CSSProperties {
  return {
    '--theme-accent': theme.accent,
    '--bg': theme.background,
    '--panel': theme.panel,
    '--panel2': theme.panel,
    '--code-bg': theme.codeBackground,
    '--code-surface': theme.panel,
    '--code-text': theme.codeText,
    '--code-control': theme.codeKeyword,
    '--code-type': theme.codeType,
    '--app-font-scale': String(theme.fontScale),
  } as CSSProperties
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="theme-color-field"><span>{label}</span><div><input type="color" value={value} onChange={(event) => onChange(event.target.value)}/><code>{value.toUpperCase()}</code></div></label>
}

export function ThemeControls({ theme, onChange }: { theme: ThemeSettings; onChange: (theme: ThemeSettings) => void }) {
  const [open, setOpen] = useState(false)
  const update = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => onChange({ ...theme, preset: 'custom', [key]: value })
  return <div className="theme-controls">
    <button className="theme-launcher" onClick={() => setOpen(true)} aria-label="調整網站配色"><Palette size={16}/><span>外觀</span></button>
    <AnimateThemePanel open={open}>
      <div className="theme-backdrop" onClick={() => setOpen(false)}/>
      <aside className="theme-panel" aria-label="外觀與程式碼配色設定">
        <header><div><Palette size={17}/><span>自訂網站外觀</span></div><button onClick={() => setOpen(false)} aria-label="關閉外觀設定"><X size={17}/></button></header>
        <section><span>快速風格</span><div className="theme-presets">{PRESETS.map((preset) => <button key={preset.id} className={theme.preset === preset.id ? 'active' : ''} onClick={() => onChange({ ...theme, ...preset.values, preset: preset.id })}><i style={{ background: preset.values.accent ?? DEFAULT_THEME.accent }}/>{preset.label}{theme.preset === preset.id && <Check size={13}/>}</button>)}</div></section>
        <section><span>動畫主色</span><div className="accent-mode"><button className={theme.accentMode === 'lesson' ? 'active' : ''} onClick={() => onChange({ ...theme, preset: 'custom', accentMode: 'lesson' })}>依課程分類</button><button className={theme.accentMode === 'custom' ? 'active' : ''} onClick={() => onChange({ ...theme, preset: 'custom', accentMode: 'custom' })}>全部使用自訂色</button></div>{theme.accentMode === 'custom' && <ColorField label="自訂主色" value={theme.accent} onChange={(value) => update('accent', value)}/>}</section>
        <section><span>介面顏色</span><div className="theme-color-grid"><ColorField label="網站背景" value={theme.background} onChange={(value) => update('background', value)}/><ColorField label="面板背景" value={theme.panel} onChange={(value) => update('panel', value)}/><ColorField label="程式碼背景" value={theme.codeBackground} onChange={(value) => update('codeBackground', value)}/><ColorField label="程式碼文字" value={theme.codeText} onChange={(value) => update('codeText', value)}/><ColorField label="關鍵字" value={theme.codeKeyword} onChange={(value) => update('codeKeyword', value)}/><ColorField label="型別" value={theme.codeType} onChange={(value) => update('codeType', value)}/></div></section>
        <section><label className="theme-scale"><span>整體字級</span><output>{Math.round(theme.fontScale * 100)}%</output><input type="range" min="0.9" max="1.25" step="0.05" value={theme.fontScale} onChange={(event) => update('fontScale', Number(event.target.value))}/></label></section>
        <footer><button onClick={() => onChange(DEFAULT_THEME)}><RotateCcw size={14}/>恢復預設</button><span>設定會自動保存在這台裝置</span></footer>
      </aside>
    </AnimateThemePanel>
  </div>
}

function AnimateThemePanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  return open ? <div className="theme-layer">{children}</div> : null
}
