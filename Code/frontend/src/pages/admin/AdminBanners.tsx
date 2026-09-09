import { useEffect, useState } from 'react'
import { ToggleLeft, ToggleRight, Trash2, Upload, Plus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToastStore } from '@/stores/toaststore'

interface Banner {
  id:         string
  title:      string | null
  image_url:  string
  is_showing: boolean
  created_at: string 
}

export default function AdminBanners() {
  const showToast = useToastStore(s => s.showToast)

  const [banners,   setBanners]   = useState<Banner[]>([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [adding,    setAdding]    = useState(false)
  const [newTitle,  setNewTitle]  = useState('')
  const [newUrl,    setNewUrl]    = useState('')

  const fetchBanners = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })
    setBanners(data as Banner[] ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchBanners() }, [])

  const toggleShowing = async (banner: Banner) => {
    const { error } = await supabase
      .from('banners')
      .update({ is_showing: !banner.is_showing })
      .eq('id', banner.id)

    if (error) {
      showToast('Failed to update banner', 'error')
    } else {
      setBanners(b => b.map(ban =>
        ban.id === banner.id ? { ...ban, is_showing: !ban.is_showing } : ban
      ))
    }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) {
      showToast('Failed to delete banner', 'error')
    } else {
      showToast('Banner deleted', 'info')
      setBanners(b => b.filter(ban => ban.id !== id))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const filename = `banner-${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('Tini-bucket').upload(filename, file)

    if (error) {console.error('Banner insert error:', JSON.stringify(error, null, 2)); showToast('Upload failed', 'error'); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('Tini-bucket').getPublicUrl(filename)
    setNewUrl(publicUrl)
    setUploading(false)
    showToast('Image uploaded', 'success')
  }

  const handleAdd = async () => {
    if (!newUrl) { showToast('Upload an image first', 'error'); return }
    setAdding(true)

    const { error } = await supabase.from('banners').insert({
      title:      newTitle || null,
      image_url:  newUrl,
      is_showing: false,
    })

    if (error) {
      console.error('Banner insert error:', JSON.stringify(error, null, 2))
      showToast('Failed to add banner', 'error')
    } else {
      showToast('Banner added (set is_showing to display it)', 'success')
      setNewTitle('')
      setNewUrl('')
      await fetchBanners()
    }
    setAdding(false)
  }

  const inputClass = "w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-charcoal">Banners</h1>
        <p className="text-sm text-brand-muted mt-0.5">Manage homepage banner images</p>
      </div>

      {/* Banner grid */}
      <div>
        <h2 className="text-sm font-semibold text-brand-charcoal mb-3">All banners</h2>
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1,2].map(i => (
              <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-sm text-brand-muted">No banners yet — add one below</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {banners.map(banner => (
              <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Banner image */}
                <div className="aspect-[16/5] relative">
                  <img
                    src={banner.image_url}
                    alt={banner.title ?? 'Banner'}
                    className="w-full h-full object-cover"
                  />
                  {/* Showing badge */}
                  <div className={`
                    absolute top-2 right-2 text-xs px-2.5 py-1 rounded-full font-medium
                    ${banner.is_showing ? 'bg-green-500 text-white' : 'bg-gray-900/60 text-white'}
                  `}>
                    {banner.is_showing ? 'Live' : 'Hidden'}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium text-brand-charcoal">
                      {banner.title ?? 'Untitled banner'}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {new Date(banner.created_at).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Toggle is_showing */}
                    <button
                      onClick={() => toggleShowing(banner)}
                      title={banner.is_showing ? 'Hide banner' : 'Show banner'}
                    >
                      {banner.is_showing
                        ? <ToggleRight size={24} className="text-green-500" />
                        : <ToggleLeft  size={24} className="text-gray-300"  />
                      }
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-brand-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add banner form */}
      <div>
        <h2 className="text-sm font-semibold text-brand-charcoal mb-3">Add banner</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs text-brand-muted font-medium">Title (optional)</label>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Summer Sale" className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-brand-muted font-medium">Banner image *</label>
            <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-pink transition-colors">
              <Upload size={16} strokeWidth={1.5} className="text-brand-muted" />
              <span className="text-sm text-brand-muted">
                {uploading ? 'Uploading…' : newUrl ? 'Image ready ✓' : 'Upload banner image'}
              </span>
              <input type="file" accept="image/*" onChange={handleImageUpload}
                className="hidden" disabled={uploading} />
            </label>
            {newUrl && (
              <img src={newUrl} alt="Preview"
                className="w-full aspect-[16/5] object-cover rounded-xl mt-2" />
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={adding || uploading || !newUrl}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-brand-charcoal text-white hover:bg-brand-charcoal/90 disabled:opacity-50 transition-colors"
          >
            {adding
              ? <Loader2 size={14} strokeWidth={2} className="animate-spin" />
              : <Plus size={14} strokeWidth={2} />
            }
            {adding ? 'Adding…' : 'Add banner'}
          </button>
        </div>
      </div>
    </div>
  )
}