import { Link } from 'react-router-dom'
import { useUiStore } from '@/stores/uistore'
import { Menu } from 'lucide-react'

const CATEGORIES = [
  'New arrivals','Hot products','Fans','Toys','Lamps','Lighters','Jewellery'
]

export default function TopBar() {
  const toggle = useUiStore(s => s.toggleSidebar)
  return (
    <header className="sticky top-0 z-30 bg-brand-cream/95 backdrop-blur border-b border-pink-100 w-full">
      <div className="lg:hidden flex items-center justify-between px-6 pt-4 pb-2">
        <Link to="/" className="block">
          <h1 className="font-display text-2xl tracking-tight leading-none">TiniTrove </h1>
          <p className="text-xs text-brand-muted italic mt-2">
            Curated gifts and cute aestheic finds
          </p>
        </Link>
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 -mr-2 text-brand-charcoal hover:text-brand-pink transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
      </div>

      <div className="hidden lg:block text-center pt-5 pb-3 px-6">
        <Link to="/" className="inline-block">
          <h1 className="font-display text-2xl tracking-tight leading-none">
            TiniTrove 
            {/*<img src={'tini.jpg'}/>*/}
          </h1>
          <p className="text-xs text-brand-muted italic mt-1.5">
            Curated gifts and cute aestheic finds
          </p>
        </Link>
      </div>

      {/* Scrollable category strip */}
      <nav className="flex px-6 pb-3 text-sm text-brand-muted
          gap-4 overflow-x-auto lg:overflow-x-visible
          lg:justify-between
          pt-0 lg:pt-1"
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
