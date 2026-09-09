import { Camera, Music2, Phone, Mail, MessageCircle } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="py-6 max-w-xl mx-auto space-y-6">

      {/* Page header */}
      <h2 className="font-display text-2xl text-brand-charcoal border-b-2 border-brand-charcoal pb-0.5 inline-block">
        About us
      </h2>

      {/* ── Description ───────────────────────────────────── */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-brand-charcoal">Description:</h3>
        <div className="bg-white rounded-2xl border border-pink-100 p-5">
          <p className="text-sm text-brand-charcoal leading-relaxed">
            Tinitrove is an e-commerce website that majors in providing cute,
            aesthetic and rare gifts to our customers at affordable prices.
          </p>
        </div>
      </section>

      {/* ── Contacts ──────────────────────────────────────── */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-brand-charcoal">Contacts:</h3>
        <div className="bg-white rounded-2xl border border-pink-100 p-5 space-y-4">

          {/* Phone */}
          <a
            href="tel:0111970400"
            className="flex items-center gap-3 text-sm text-brand-charcoal hover:text-brand-pink transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
              <Phone size={15} strokeWidth={1.5} className="text-brand-pink" />
            </div>
            <div>
              <p className="text-xs text-brand-muted">Phone number</p>
              <p className="font-medium">0111970400</p>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/254111970400"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-brand-charcoal hover:text-brand-pink transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <MessageCircle size={15} strokeWidth={1.5} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-brand-muted">WhatsApp</p>
              <p className="font-medium">0111970400</p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:tinitrove@gmail.com"
            className="flex items-center gap-3 text-sm text-brand-charcoal hover:text-brand-pink transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
              <Mail size={15} strokeWidth={1.5} className="text-brand-pink" />
            </div>
            <div>
              <p className="text-xs text-brand-muted">Email</p>
              <p className="font-medium">tinitrove@gmail.com</p>
            </div>
          </a>

          {/* Divider */}
          <div className="border-t border-pink-100 pt-3">
            <p className="text-xs text-brand-muted mb-3">Socials:</p>

            <div className="space-y-3">
              {/* Instagram */}
              <a
                href="https://instagram.com/tini.troveke"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-brand-charcoal hover:text-brand-pink transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
                  }}
                >
                  <Camera size={15} strokeWidth={1.5} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-brand-muted">Instagram</p>
                  <p className="font-medium">@tini.troveke</p>
                </div>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com/@tini.troveke"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-brand-charcoal hover:text-brand-pink transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-charcoal flex items-center justify-center shrink-0">
                  <Music2 size={15} strokeWidth={1.5} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-brand-muted">TikTok</p>
                  <p className="font-medium">@tini.troveke</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}