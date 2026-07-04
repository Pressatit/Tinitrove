import { useEffect, useState } from 'react'
import { Pencil, Check, X, Plus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToastStore } from '@/stores/toaststore'

interface Category {
  id:          string
  name:        string
  slug:        string
  description: string | null
}

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export default function AdminCategories() {
  const showToast = useToastStore(s => s.showToast)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [editId,     setEditId]     = useState<string | null>(null)
  const [editData,   setEditData]   = useState({ name: '', description: '' })
  const [saving,     setSaving]     = useState(false)
  const [newName,    setNewName]    = useState('')
  const [newDesc,    setNewDesc]    = useState('')
  const [adding,     setAdding]     = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const handleSaveEdit = async (id: string) => {
    setSaving(true)
    const { error } = await supabase
      .from('categories')
      .update({
        name:        editData.name,
        slug:        slugify(editData.name),
        description: editData.description,
      })
      .eq('id', id)

    if (error) {
      showToast('Failed to update category', 'error')
    } else {
      showToast('Category updated', 'success')
      await fetchCategories()
      setEditId(null)
    }
    setSaving(false)
  }

  const handleAddCategory = async () => {
    if (!newName.trim()) return
    setAdding(true)

    const { error } = await supabase
      .from('categories')
      .insert({
        name:        newName.trim(),
        slug:        slugify(newName),
        description: newDesc.trim() || null,
      })

    if (error) {
      showToast('Failed to add category', 'error')
    } else {
      showToast('Category added', 'success')
      setNewName('')
      setNewDesc('')
      await fetchCategories()
    }
    setAdding(false)
  }

  const inputClass = "w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-charcoal">Categories</h1>
        <p className="text-sm text-brand-muted mt-0.5">{categories.length} categories</p>
      </div>

      {/* All categories table */}
      <div>
        <h2 className="text-sm font-semibold text-brand-charcoal mb-3">All categories</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['#', 'Category', 'Slug', 'Description', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-brand-muted font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {[1,2,3,4,5].map(j => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : categories.map((cat, index) => (
                    <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-brand-muted text-xs">{index + 1}</td>
                      <td className="px-4 py-3">
                        {editId === cat.id ? (
                          <input
                            value={editData.name}
                            onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                            className={inputClass}
                          />
                        ) : (
                          <span className="font-medium text-brand-charcoal">{cat.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-brand-muted font-mono text-xs">
                        {editId === cat.id ? slugify(editData.name) : cat.slug}
                      </td>
                      <td className="px-4 py-3">
                        {editId === cat.id ? (
                          <input
                            value={editData.description ?? ''}
                            onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                            className={inputClass}
                            placeholder="Description (optional)"
                          />
                        ) : (
                          <span className="text-brand-muted text-xs">
                            {cat.description ?? '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editId === cat.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSaveEdit(cat.id)}
                              disabled={saving}
                              className="p-1.5 rounded-lg bg-green-50 text-green-500 hover:bg-green-100 transition-colors"
                            >
                              {saving
                                ? <Loader2 size={13} strokeWidth={2} className="animate-spin" />
                                : <Check size={13} strokeWidth={2} />
                              }
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="p-1.5 rounded-lg bg-gray-100 text-brand-muted hover:bg-gray-200 transition-colors"
                            >
                              <X size={13} strokeWidth={2} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditId(cat.id)
                              setEditData({ name: cat.name, description: cat.description ?? '' })
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-brand-muted transition-colors"
                          >
                            <Pencil size={13} strokeWidth={1.5} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Add category form */}
      <div>
        <h2 className="text-sm font-semibold text-brand-charcoal mb-3">Add category</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs text-brand-muted">Category name</label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Candles"
              className={inputClass}
            />
            {newName && (
              <p className="text-xs text-brand-muted">
                Slug: <span className="font-mono text-brand-charcoal">{slugify(newName)}</span>
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-brand-muted">Description (optional)</label>
            <textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Brief description of this category"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <button
            onClick={handleAddCategory}
            disabled={adding || !newName.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-brand-charcoal text-white hover:bg-brand-charcoal/90 disabled:opacity-50 transition-colors"
          >
            {adding
              ? <Loader2 size={14} strokeWidth={2} className="animate-spin" />
              : <Plus size={14} strokeWidth={2} />
            }
            {adding ? 'Adding…' : 'Add category'}
          </button>
        </div>
      </div>
    </div>
  )
}