import { Link } from 'react-router-dom'

import { useCart } from '../context/CartContext'

function CartPopup() {
  const { popupItem, dismissPopup } = useCart()

  if (!popupItem) {
    return null
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[320px] rounded-xl border border-slate-200 bg-white p-4 shadow-dairy">
      <p className="text-sm font-semibold text-slate-900">Added to Cart</p>
      <p className="mt-1 text-sm text-slate-600">{popupItem.product.name} x{popupItem.quantity}</p>
      <div className="mt-3 flex gap-2">
        <Link
          to="/cart"
          onClick={dismissPopup}
          className="rounded-lg bg-brandBlue px-3 py-2 text-xs font-semibold text-white"
        >
          View Cart
        </Link>
        <button
          type="button"
          onClick={dismissPopup}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

export default CartPopup
