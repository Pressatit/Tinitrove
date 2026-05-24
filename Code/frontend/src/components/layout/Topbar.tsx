import { Link } from 'react-router-dom'
import { useUiStore } from '@/stores/uistore'

const CATEGORIES = [
  'New arrivals','Hot products','Fans','Toys','Lamps','Lighters','Jewellery'
]

export default function TopBar() {
  const toggle = useUiStore(s => s.toggleSidebar)
  return (
    <header className="sticky top-0 z-30 bg-brand-cream/95 backdrop-blur border-b border-pink-100">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="block">
          <h1 className="font-display text-xl tracking-tight leading-none">TiniTrove 🎀</h1>
          <p className="text-xs text-brand-muted italic mt-0.5">
            curated gifts and cute aestheic finds
          </p>
        </Link>
        {/* Hamburger — mobile only */}
        <button onClick={toggle} className="lg:hidden p-2 -mr-2" aria-label="Toggle menu">
          <span className="block w-5 h-0.5 bg-brand-charcoal mb-1.5" />
          <span className="block w-5 h-0.5 bg-brand-charcoal mb-1.5" />
          <span className="block w-5 h-0.5 bg-brand-charcoal" />
        </button>
      </div>
      {/* Scrollable category strip */}
      <nav className="flex gap-5 px-4 pb-2.5 overflow-x-auto text-sm text-brand-muted"
           style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <Link key={cat}
            to={`/category/${cat.toLowerCase().replace(/\s+/g,'-')}`}
            className="shrink-0 hover:text-brand-charcoal transition-colors whitespace-nowrap">
            {cat}
          </Link>
        ))}
      </nav>
    </header>
  )
}
