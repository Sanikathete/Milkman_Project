import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { readStoredJson } from './authStorage'

const CART_KEY = 'milkman_cart'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredJson(CART_KEY, []))
  const [popupItem, setPopupItem] = useState(null)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    if (!popupItem) return
    const timer = setTimeout(() => setPopupItem(null), 3500)
    return () => clearTimeout(timer)
  }, [popupItem])

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [...prev, { product, quantity }]
    })
    setPopupItem({ product, quantity })
  }

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const dismissPopup = () => {
    setPopupItem(null)
  }

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      popupItem,
      dismissPopup,
    }),
    [items, cartCount, cartTotal, popupItem],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return context
}
