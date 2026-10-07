import { useNavigate,
 } from 'react-router-dom'
 import { useState,useEffect } from 'react'
import { ChevronRight, Sparkles, Flame } from 'lucide-react'
import { useProducts } from '@/hooks/useProduct'
import ProductCard from '@/components/ui/productcard'
import ProductCardSkeleton from '@/components/ui/productcardskeleton'
import { supabase } from '@/lib/supabaseClient'
import { SEO } from '@/components/Seo/seo'
        


// ── Section header with underline and "see all" link ─────────
function SectionHeader({
  title,
  icon: Icon,
  slug,
}: {
  title: string
  icon: React.ElementType
  slug: string
}) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-xl text-brand-charcoal border-b-2 border-brand-charcoal pb-0.5">
          {title}
        </h2>
        <Icon size={16} className="text-brand-pink" strokeWidth={1.5} />
      </div>
      <button
        onClick={() => navigate(`/category/${slug}`)}
        className="flex items-center gap-0.5 text-xs text-brand-muted hover:text-brand-charcoal transition-colors"
      >
        See all <ChevronRight size={13} strokeWidth={1.5} />
      </button>
    </div>
  )
}

// ── Product grid — 2 columns matching wireframe ───────────────
function ProductGrid({
  loading,
  products,
  skeletonCount = 2,
}: {
  loading: boolean
  products: ReturnType<typeof useProducts>['products']
  skeletonCount?: number
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-brand-muted py-4">
        Nothing here yet — check back soon.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default function HomePage() {
  // Two separate queries — new arrivals and hot deals
  // limit:4 shows 2 rows of 2 on mobile matching the wireframe
  const { products: newArrivals, loading: newLoading } =
    useProducts({ is_new_arrival: true, limit: 4 })

  const { products: hotProducts, loading: hotLoading } =
    useProducts({ is_hot_deal: true, limit: 4 })

  const { products: allProducts, loading: allLoading } =
    useProducts({ limit: 12})

  const [activeBanner, setActiveBanner] = useState<{ image_url: string, title: string | null } | null>(null)

  useEffect(() => {
    const fetchActiveBanner = async () => {
      const { data } = await supabase
        .from('banners')
        .select('image_url, title')
        .eq('is_showing', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle() // Use maybeSingle to prevent errors if no banner is active

      if (data) {
        setActiveBanner(data)
      }
    }

    fetchActiveBanner()
  }, [])


  return (
    <div className="py-4 space-y-8">

      <SEO 
        title="Curated Aesthetic Gifts in Kenya" 
        description="Discover aesthetic gifts, tech accessories, lamps, and self-care finds at TiniTrove. Nationwide delivery in Kenya." 
        path="/"
      />

      {/* ── Hero banner ───────────────────────────────────── */}
      {/* Dark rounded rectangle from wireframe */}
      {activeBanner ? (
        
        <div className="w-full rounded-2xl overflow-hidden relative bg-brand-charcoal">
          <img 
            src={activeBanner.image_url} 
            alt={activeBanner.title ?? 'TiniTrove Banner'} 
            className="w-full h-auto block"
          />
        </div>
      ) : (
        <div className="w-full rounded-2xl overflow-hidden bg-brand-charcoal aspect-[16/5] flex items-center justify-center relative">
          <div className="text-center text-white/60 space-y-1">
            <p className="text-sm">Banner of products</p>
            <p className="text-xs">Upload a banner image in Supabase Storage</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </div>
      )}

      {/* ── New arrivals section ──────────────────────────── */}
      <section>
        <SectionHeader
          title="New arrivals"
          icon={Sparkles}
          slug="new-arrivals"
        />
        <ProductGrid
          loading={newLoading}
          products={newArrivals}
          skeletonCount={2}
        />
      </section>

      {/* ── Hot products section ──────────────────────────── */}
      <section>
        <SectionHeader
          title="Hot products"
          icon={Flame}
          slug="hot-products"
        />
        <ProductGrid
          loading={hotLoading}
          products={hotProducts}
          skeletonCount={2}
        />
      </section>

      {/* ── All products section ──────────────────────────── */}

      <section>
        <SectionHeader
          title="All products"
          icon={Sparkles}
          slug="all"      // Ensure you have a route set up for /category/all
        />
        <ProductGrid
          loading={allLoading}
          products={allProducts}
          skeletonCount={8}
        />
      </section>
    </div>
  )
}