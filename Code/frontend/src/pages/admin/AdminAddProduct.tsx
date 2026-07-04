import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Upload, X, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToastStore } from '@/stores/toaststore'

interface Category { id: string; name: string }

export default function AdminAddProduct() {
  const navigate  = useNavigate()
  const showToast = useToastStore(s => s.showToast)

  const [categories,  setCategories]  = useState<Category[]>([])
  const [saving,      setSaving]      = useState(false)
  const [uploading,   setUploading]   = useState(false)

  // Form state
  const [name,         setName]         = useState('')
  const [description,  setDescription]  = useState('')
  const [price,        setPrice]        = useState('')
  const [stockCount,   setStockCount]   = useState('')
  const [categoryId,   setCategoryId]   = useState('')
  const [isNewArrival, setIsNewArrival] = useState(false)
  const [isHotDeal,    setIsHotDeal]    = useState(false)
  const [imageUrls,    setImageUrls]    = useState<string[]>([])
  const [colorInput,   setColorInput]   = useState('')
  const [colors,       setColors]       = useState<string[]>([])
  const [tagInput,     setTagInput]     = useState('')
  const [tags,         setTags]         = useState<string[]>([])

  useEffect(() => {
    supabase.from('categories').select('id, name').order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  // Upload image to Supabase Storage
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // 1. Enforce the 4-image maximum limit
  if (imageUrls.length >= 4) {
    showToast('You can only upload up to 4 images for Tiny Trove products.', 'error')
    return
  }

  setUploading(true)
  try {
    // 2. Generate a clean, unique file path inside your bucket
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`
    const filePath = `product-images/${fileName}`

    // 3. Upload the file to your existing Supabase storage bucket
    // NOTE: Replace 'products' with your actual bucket name if named differently
    const { error: uploadError } = await supabase.storage
      .from('Tini-bucket') 
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // 4. Retrieve the reliable Public URL from the bucket
    const { data: { publicUrl } } = supabase.storage
      .from('Tini-bucket')
      .getPublicUrl(filePath)

    // 5. Append the fresh URL into your array state
    setImageUrls(prev => [...prev, publicUrl])
    showToast('Image uploaded successfully!', 'success')

  } catch (error: any) {
    console.error('Upload error:', error)
    showToast(`Upload failed: ${error.message || 'Unknown error'}`, 'error')
  } finally {
    setUploading(false)
    // Clear input target value so the same file can be re-uploaded if deleted
    e.target.value = ''
  }
}
  const addColor = () => {
    const c = colorInput.trim()
    if (c && !colors.includes(c)) {
      setColors(prev => [...prev, c])
      setColorInput('')
    }
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  const handleSubmit = async () => {
    if (!name || !price || !stockCount || !categoryId) {
      showToast('Fill in all required fields', 'error')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('products').insert({
      name,
      description:    description || null,
      price:          parseFloat(price),
      stock_count:    parseInt(stockCount),
      category_id:    categoryId,
      is_new_arrival: isNewArrival,
      is_hot_deal:    isHotDeal,
      is_active:      true,
      image_urls:     imageUrls,
      color_variants: colors,
      tags,
    })

    if (error) {
      showToast('Failed to add product: ' + error.message, 'error')
      setSaving(false)
      return
    }

    showToast('Product added successfully', 'success')
    navigate('/admin/products')
  }

  const inputClass = "w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all"
  const labelClass = "text-xs text-brand-muted font-medium"

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl text-brand-charcoal">Add product</h1>
        <p className="text-sm text-brand-muted mt-0.5">Fill in the details below</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">

        {/* Name */}
        <div className="space-y-1.5">
          <label className={labelClass}>Product name *</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Mini USB Desk Fan" className={inputClass} />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className={labelClass}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Product description…" rows={3}
            className={`${inputClass} resize-none`} />
        </div>

        {/* Price + Stock side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Price (KES) *</label>
            <input value={price} onChange={e => setPrice(e.target.value)}
              type="number" placeholder="0" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Stock count *</label>
            <input value={stockCount} onChange={e => setStockCount(e.target.value)}
              type="number" placeholder="0" className={inputClass} />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className={labelClass}>Category *</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
            className={`${inputClass} appearance-none cursor-pointer`}>
            <option value="" disabled>Select a category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        

        {/* Toggles */}
        <div className="flex gap-6">
          {[
            { label: 'New arrival', value: isNewArrival, set: setIsNewArrival },
            { label: 'Hot deal',    value: isHotDeal,    set: setIsHotDeal    },
          ].map(({ label, value, set }) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer">
              <button
                type="button"
                onClick={() => set(v => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-brand-charcoal' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-brand-charcoal">{label}</span>
            </label>
          ))}
        </div>

        {/* Color variants */}
        <div className="space-y-2">
          <label className={labelClass}>Color variants</label>
          <div className="flex gap-2">
            <input value={colorInput} onChange={e => setColorInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addColor()}
              placeholder="e.g. Pink" className={`${inputClass} flex-1`} />
            <button onClick={addColor}
              className="px-3 py-2 rounded-xl bg-brand-charcoal text-white text-sm hover:bg-brand-charcoal/90 transition-colors">
              <Plus size={15} strokeWidth={2} />
            </button>
          </div>
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {colors.map(c => (
                <span key={c} className="flex items-center gap-1 px-3 py-1 bg-pink-50 text-brand-pink rounded-full text-xs">
                  {c}
                  <button onClick={() => setColors(p => p.filter(x => x !== c))}>
                    <X size={11} strokeWidth={2} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className={labelClass}>Tags (for search)</label>
          <div className="flex gap-2">
            <input value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="e.g. gift" className={`${inputClass} flex-1`} />
            <button onClick={addTag}
              className="px-3 py-2 rounded-xl bg-brand-charcoal text-white text-sm hover:bg-brand-charcoal/90 transition-colors">
              <Plus size={15} strokeWidth={2} />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-brand-muted rounded-full text-xs">
                  {t}
                  <button onClick={() => setTags(p => p.filter(x => x !== t))}>
                    <X size={11} strokeWidth={2} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <label className={labelClass}>Product images</label>
          <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-pink transition-colors">
            <Upload size={16} strokeWidth={1.5} className="text-brand-muted" />
            <span className="text-sm text-brand-muted">
              {uploading ? 'Uploading…' : 'Click to upload image'}
            </span>
            <input type="file" accept="image/*" onChange={handleImageUpload}
              className="hidden" disabled={uploading} />
          </label>
          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                  <button
                    onClick={() => setImageUrls(p => p.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center"
                  >
                    <X size={10} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate('/admin/products')}
            className="px-5 py-2.5 rounded-xl text-sm border border-gray-200 text-brand-muted hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-brand-charcoal text-white hover:bg-brand-charcoal/90 disabled:opacity-50 transition-colors"
          >
            {saving
              ? <Loader2 size={14} strokeWidth={2} className="animate-spin" />
              : <Plus size={14} strokeWidth={2} />
            }
            {saving ? 'Adding…' : 'Add product'}
          </button>
        </div>
      </div>
    </div>
  )
}