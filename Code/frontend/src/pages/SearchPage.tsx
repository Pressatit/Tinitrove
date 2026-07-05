import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useDebounce } from '@/hooks/useDebounce'
import { useProducts } from '@/hooks/useProduct'
import ProductCard from '@/components/ui/productcard'
import ProductCardSkeleton from '@/components/ui/productcardskeleton'

// ── Category type ─────────────────────────────────────────────
interface Category {
  id:   string
  name: string
  slug: string
}

// ── Sort options ──────────────────────────────────────────────
const SORT_OPTIONS = [
  { label: 'Newest first',   value: 'newest'      },
  { label: 'Price: low–high', value: 'price_asc'  },
  { label: 'Price: high–low', value: 'price_desc' },
]

// Match HomePage: these slugs use product flags, not category_id
const FLAG_CATEGORY_SLUGS = {
  'new-arrivals': { is_new_arrival: true as const, label: 'New arrivals' },
  'hot-products': { is_hot_deal: true as const, label: 'Hot products' },
} as const

function buildProductFilter(activeCategory: string, search?: string) {
  const base = { search: search || undefined }

  if (activeCategory === 'new-arrivals') {
    return { ...base, is_new_arrival: true }
  }
  if (activeCategory === 'hot-products') {
    return { ...base, is_hot_deal: true }
  }
  if (activeCategory) {
    return { ...base, category_slug: activeCategory }
  }
  return base
}

export default function SearchPage() {
  const { slug }                   = useParams<{ slug?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate                   = useNavigate()

  // ── State ─────────────────────────────────────────────────
  // inputValue: what the user is typing RIGHT NOW
  // debouncedSearch: only updates 400ms after user stops typing
  // This is the split that makes debouncing work
  const [inputValue,      setInputValue]      = useState(
    searchParams.get('q') ?? ''
  )
  const [categories,      setCategories]      = useState<Category[]>([])
  const [activeCategory,  setActiveCategory]  = useState<string>(slug ?? '')
  const [sortBy,          setSortBy]          = useState('newest')
  const [showFilters,     setShowFilters]     = useState(false)

  // THE KEY LINE: debouncedSearch lags 400ms behind inputValue
  // useProducts uses debouncedSearch, not inputValue directly
  // so the DB query only fires after the user pauses typing
  const debouncedSearch = useDebounce(inputValue, 400)

  // ── Fetch categories for the filter strip ────────────────
  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, slug')
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [])

  // ── Sync URL slug → activeCategory ───────────────────────
  // When user taps "Fans" in the TopBar, slug changes to "fans"
  // This effect keeps the active category pill in sync
  useEffect(() => {
    if (slug) setActiveCategory(slug)
  }, [slug])

  // ── Build the filter object for useProducts ───────────────
  const filter = buildProductFilter(activeCategory, debouncedSearch)
  const { products, loading } = useProducts(filter)

  const activeCategoryLabel =
    activeCategory in FLAG_CATEGORY_SLUGS
      ? FLAG_CATEGORY_SLUGS[activeCategory as keyof typeof FLAG_CATEGORY_SLUGS].label
      : categories.find(c => c.slug === activeCategory)?.name

  // ── Sort products client-side ─────────────────────────────
  // Supabase already filtered — we just reorder in memory
  // This is fine because the result set is small
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_asc')  return a.price - b.price
    if (sortBy === 'price_desc') return b.price - a.price
    // newest: already ordered by created_at desc from DB
    return 0
  })

  // ── Handle search input change ────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    // Update URL query param so the search is shareable/bookmarkable
    // e.g. /search?q=lighter
    if (val) {
      setSearchParams({ q: val })
    } else {
      setSearchParams({})
    }
  }

  // ── Handle category pill tap ──────────────────────────────
  {/**const _handleCategoryClick = (categorySlug: string) => {
    if (activeCategory === categorySlug) {
      // Tapping active category deselects it
      setActiveCategory('')
      navigate('/search')
    } else {
      setActiveCategory(categorySlug)
      navigate(`/category/${categorySlug}`)
    }
    // Clear the search text when switching categories
    // so results aren't doubly filtered confusingly
    setInputValue('')
    setSearchParams({})
  }*/}

  // ── Clear everything ──────────────────────────────────────
  const handleClear = () => {
    setInputValue('')
    setActiveCategory('')
    setSearchParams({})
    navigate('/search')
  }

  const hasActiveFilter = inputValue || activeCategory

  return (
    <div className="py-4 space-y-4">

      {/* ── Search input ────────────────────────────────────── */}
      <div className="relative">
        <Search
          size={16}
          strokeWidth={1.5}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
        />
        <input
          type="search"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search products…"
          autoComplete="off"
          className="
            w-full pl-10 pr-10 py-3 text-sm
            bg-white border border-pink-100 rounded-2xl outline-none
            focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
            placeholder:text-brand-muted/60
            transition-all duration-150
          "
        />

        {/* Clear button — only shows when there's input 
        {inputValue && (
          <button
            onClick={() => { setInputValue(''); setSearchParams({}) }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-charcoal transition-colors"
            aria-label="Clear search"
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        )}*/}
      </div>

      {/* ── Category pills ──────────────────────────────────── */}
      {/* Horizontally scrollable strip of category buttons */}
      {/* Shows which category is active with a filled style */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* "All" pill — deselects category filter 
        <button
          onClick={handleClear}
          className={`
            shrink-0 px-4 py-1.5 rounded-full text-xs font-medium
            border transition-colors duration-150
            ${!activeCategory
              ? 'bg-brand-charcoal text-white border-brand-charcoal'
              : 'bg-white text-brand-muted border-pink-100 hover:border-brand-pink hover:text-brand-charcoal'}
          `}
        >
          All
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`
              shrink-0 px-4 py-1.5 rounded-full text-xs font-medium
              border transition-colors duration-150
              ${activeCategory === cat.slug
                ? 'bg-brand-charcoal text-white border-brand-charcoal'
                : 'bg-white text-brand-muted border-pink-100 hover:border-brand-pink hover:text-brand-charcoal'}
            `}
          >
            {cat.name}
          </button>
        ))}*/}
      </div>

      {/* ── Results header — count + sort ───────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Results count — shows immediately using inputValue */}
          {/* NOT debouncedSearch — so count doesn't lag behind typing */}
          <p className="text-sm text-brand-muted">
            {loading
              ? 'Searching…'
              : `${sortedProducts.length} result${sortedProducts.length !== 1 ? 's' : ''}`
            }
            {activeCategory && !loading && activeCategoryLabel && (
              <span className="text-brand-charcoal font-medium ml-1">
                in {activeCategoryLabel}
              </span>
            )}
          </p>

          {/* Clear filter badge */}
          {hasActiveFilter && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-brand-pink hover:underline"
            >
              <X size={11} strokeWidth={2} />
              Clear
            </button>
          )}
        </div>

        {/* Sort dropdown toggle */}
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`
            flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-colors
            ${showFilters
              ? 'bg-brand-charcoal text-white border-brand-charcoal'
              : 'bg-white text-brand-muted border-pink-100 hover:border-brand-pink'}
          `}
        >
          <SlidersHorizontal size={13} strokeWidth={1.5} />
          Sort
          <ChevronDown
            size={12}
            strokeWidth={2}
            className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* ── Sort options — slides open ───────────────────────── */}
      {showFilters && (
        <div className="flex gap-2 flex-wrap">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSortBy(opt.value); setShowFilters(false) }}
              className={`
                px-4 py-1.5 rounded-full text-xs font-medium border transition-colors
                ${sortBy === opt.value
                  ? 'bg-brand-charcoal text-white border-brand-charcoal'
                  : 'bg-white text-brand-muted border-pink-100 hover:border-brand-pink'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Results grid ────────────────────────────────────── */}
      {loading ? (
        // Skeleton grid while fetching
        // Shows 4 placeholders so layout doesn't jump
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)}
        </div>
      ) : sortedProducts.length === 0 ? (
        // Empty state — different message for search vs category
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center">
            <Search size={24} strokeWidth={1} className="text-brand-pink" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-charcoal">
              {inputValue
                ? `No results for "${inputValue}"`
                : activeCategory
                  ? `Nothing in ${activeCategoryLabel ?? 'this category'} yet`
                  : 'No products found'
              }
            </p>
            <p className="text-xs text-brand-muted">
              {inputValue ? 'Try a different search term' : 'Check back soon'}
            </p>
          </div>
          {hasActiveFilter && (
            <button
              onClick={handleClear}
              className="text-xs text-brand-pink hover:underline mt-1"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}