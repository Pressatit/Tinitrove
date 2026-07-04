/** AboutPage — scaffold stub. Build this page out next. */
import { Home } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function AboutPage() {
  const navigate =useNavigate()
  return (
    <div className="text-center pt-5 pb-3 px-7">
      <h2 className="font-display text-2xl text-brand-charcoal">Page 404</h2>
      <p className="text-brand-muted mt-2 text-sm">🎀</p>

      <div className="text-center pt-20 pb-9 px-15">
        
        <button
          onClick={() => navigate('/')}
          className="
            flex items-center gap-2
            px-19 py-3 rounded-xl text-sm font-medium
            bg-brand-charcoal text-white
            hover:bg-brand-charcoal/90
            transition-colors shadow-md
          "
        >
          <Home size={15} strokeWidth={1.5} />
          Back home
        
        </button>
         
    </div>
    </div>

    
  )
}
