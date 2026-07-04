import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, ToggleLeft, ToggleRight, Search, Check, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToastStore } from '@/stores/toaststore'
import { useDebounce } from '@/hooks/useDebounce'
import type { Product } from '@/types'

interface EditProductState {
  name: string
  price: number
  stock_count: number
}

export default function AdminProducts() {
  const navigate  = useNavigate()
  const showToast = useToastStore(s => s.showToast)

  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<EditProductState | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })

    if (debouncedSearch) {
      query = query.ilike('name', `%${debouncedSearch}%`)
    }

    const { data } = await query
    setProducts((data as Product[]) || [])
    setLoading(false)
  }

  useEffect(() => { 
    fetchProducts() 
  }, [debouncedSearch])

  useEffect(() => {
  const channel = supabase
    .channel('products_grid_realtime')
    .on<any>(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' }, // Note: fixed 'schema' spelling
      () => { fetchProducts() }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [debouncedSearch])

  const toggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    if (error) {
      showToast('Failed to update product', 'error')
    } else {
      showToast(
        `${product.name} ${!product.is_active ? 'activated' : 'deactivated'}`,
        'success'
      )
      setProducts(p => p.map(prod =>
        prod.id === product.id
          ? { ...prod, is_active: !prod.is_active }
          : prod
      ))
    }
  }

  const handleStartEdit = (product: Product) => {
    setEditId(product.id)
    setEditData({
      name: product.name,
      price: product.price,
      stock_count: product.stock_count
    })
  }

  const handleSaveInlineEdit = async (id: string) => {
    if (!editData || !editData.name.trim()) {
      showToast('Product name cannot be empty', 'error')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('products')
      .update({
        name: editData.name,
        price: Number(editData.price),
        stock_count: Number(editData.stock_count)
      })
      .eq('id', id)

    if (error) {
      showToast(`Failed to update product: ${error.message}`, 'error')
    } else {
      showToast('Product saved successfully!', 'success')
      setProducts(p => p.map(prod => 
        prod.id === id 
          ? { ...prod, name: editData.name, price: Number(editData.price), stock_count: Number(editData.stock_count) }
          : prod
      ))
      setEditId(null)
      setEditData(null)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-brand-charcoal">Products</h1>
          <p className="text-sm text-brand-muted mt-0.5">{products.length} products</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/add')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-charcoal text-white hover:bg-brand-charcoal/90 transition-colors"
        >
          <Plus size={15} strokeWidth={2} />
          Add product
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} strokeWidth={1.5}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['#','Image','Name','Category','Price','Stock','New','Hot','Active','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-brand-muted font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : products.map((product, index) => {
                    const isEditing = editId === product.id

                    return (
                      <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-brand-muted text-xs">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                            {product.image_urls && product.image_urls.length > 0 ? (
                              <img
                                src={product.image_urls[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>
                        </td>

                        <td className="px-4 py-3 font-medium text-brand-charcoal min-w-[180px]">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData?.name || ''}
                              onChange={e => setEditData(prev => prev ? { ...prev, name: e.target.value } : null)}
                              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-brand-pink"
                            />
                          ) : (
                            <span className="truncate block max-w-[180px]">{product.name}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-brand-muted whitespace-nowrap">
                          {(product as any).categories?.name || '—'}
                        </td>

                        <td className="px-4 py-3 text-brand-charcoal whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editData?.price || 0}
                              onChange={e => setEditData(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                              className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-brand-pink"
                            />
                          ) : (
                            `KES ${product.price.toLocaleString('en-KE')}`
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editData?.stock_count || 0}
                              onChange={e => setEditData(prev => prev ? { ...prev, stock_count: Number(e.target.value) } : null)}
                              className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-brand-pink"
                            />
                          ) : (
                            <span className={`
                              text-xs px-2 py-0.5 rounded-full font-medium
                              ${product.stock_count < 5
                                ? 'bg-red-50 text-red-400'
                                : 'bg-green-50 text-green-600'}
                            `}>
                              {product.stock_count}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs ${product.is_new_arrival ? 'text-green-500' : 'text-gray-300'}`}>
                            {product.is_new_arrival ? '✓' : '—'}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs ${product.is_hot_deal ? 'text-orange-500' : 'text-gray-300'}`}>
                            {product.is_hot_deal ? '✓' : '—'}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <button onClick={() => toggleActive(product)} className="transition-colors">
                            {product.is_active ? (
                              <ToggleRight className="text-green-500" size={24} />
                            ) : (
                              <ToggleLeft className="text-gray-300" size={24} />
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveInlineEdit(product.id)}
                                  disabled={saving}
                                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                                >
                                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                </button>
                                <button
                                  onClick={() => { setEditId(null); setEditData(null) }}
                                  className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                  <X size={15} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(product)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-brand-muted hover:text-brand-charcoal transition-colors"
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}