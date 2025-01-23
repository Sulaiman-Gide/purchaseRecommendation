import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface CartItem {
  productId: string
  quantity: number
}

interface UserState {
  userData: Record<string, any> | null
  setUserData: (userData: Record<string, any>) => void
  cart: CartItem[] // An array to hold product IDs
  addToCart: (productId: string) => void
  removeFromCart: (productId: string) => void
  isProductInCart: (productId: string) => boolean
  cartCount: number
  setCartCount: (count: number) => void
  loadCart: () => void
  saveCart: () => void
  removeAllFromCart: () => void
  updateQuantity: (productId: string, quantity: number) => void
  shoppingStats: {
    viewed: number
    liked: number
    purchased: number
  }
  incrementStat: (stat: 'viewed' | 'liked' | 'purchased') => void
  loadShoppingStats: () => Promise<void>
  likedProducts: string[]
  addLikedProduct: (productId: string) => void
}

const useUserStore = create<UserState>((set, get) => ({
  userData: null,
  setUserData: (userData) => set({ userData }),
  cart: [],
  cartCount: 0,
  setCartCount: (count) => set({ cartCount: count }),

  // Load cart data from AsyncStorage
  loadCart: async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart')

      if (cartData) {
        const parsedCart = JSON.parse(cartData)
        // Ensure we have the correct structure
        const formattedCart = Array.isArray(parsedCart)
          ? parsedCart.map((item) => {
              if (typeof item === 'string') {
                return { productId: item, quantity: 1 }
              }
              return item
            })
          : []

        const totalCount = formattedCart.reduce(
          (acc, item) => acc + item.quantity,
          0,
        )
        // console.log('Formatted cart:', formattedCart) // Debug log
        set({ cart: formattedCart, cartCount: totalCount })
      } else {
        set({ cart: [], cartCount: 0 })
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      set({ cart: [], cartCount: 0 })
    }
  },

  // Save cart data to AsyncStorage
  saveCart: async () => {
    const { cart } = get()
    await AsyncStorage.setItem('cart', JSON.stringify(cart))
  },

  addToCart: (productId) => {
    set((state) => {
      // console.log('Adding to cart:', productId) // Debug log
      const existingItemIndex = state.cart.findIndex(
        (item) => item.productId === productId,
      )
      let newCart

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        newCart = state.cart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      } else {
        // Add new item
        newCart = [...state.cart, { productId, quantity: 1 }]
      }

      const totalCount = newCart.reduce((acc, item) => acc + item.quantity, 0)
      // console.log('New cart state:', newCart) // Debug log

      AsyncStorage.setItem('cart', JSON.stringify(newCart))
      return { cart: newCart, cartCount: totalCount }
    })
  },

  removeFromCart: (productId) => {
    set((state) => {
      const newCart = state.cart.filter((item) => item.productId !== productId)
      return { cart: newCart, cartCount: newCart.length }
    })
    get().saveCart()
  },

  isProductInCart: (productId) => {
    const state = get()
    return state.cart.some((item) => item.productId === productId)
  },

  removeAllFromCart: async () => {
    try {
      // Clear AsyncStorage first
      await AsyncStorage.removeItem('cart')
      // Then update state
      set({ cart: [], cartCount: 0 })
    } catch (error) {
      console.error('Error clearing cart:', error)
      // Still try to clear state even if AsyncStorage fails
      set({ cart: [], cartCount: 0 })
    }
  },

  updateQuantity: (productId: string, quantity: number) => {
    set((state) => {
      const newCart = state.cart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      )
      const totalCount = newCart.reduce((acc, item) => acc + item.quantity, 0)
      AsyncStorage.setItem('cart', JSON.stringify(newCart))
      return { cart: newCart, cartCount: totalCount }
    })
  },

  shoppingStats: {
    viewed: 0,
    liked: 0,
    purchased: 0,
  },

  incrementStat: async (stat) => {
    const { shoppingStats } = get()
    const newStats = {
      ...shoppingStats,
      [stat]: shoppingStats[stat] + 1,
    }
    set({ shoppingStats: newStats })

    try {
      await AsyncStorage.setItem('shoppingStats', JSON.stringify(newStats))
    } catch (error) {
      console.error('Error saving shopping stats:', error)
    }
  },

  loadShoppingStats: async () => {
    try {
      const [statsData, likedData] = await Promise.all([
        AsyncStorage.getItem('shoppingStats'),
        AsyncStorage.getItem('likedProducts'),
      ])

      const updates: Partial<UserState> = {}

      if (statsData) {
        updates.shoppingStats = JSON.parse(statsData)
      }
      if (likedData) {
        updates.likedProducts = JSON.parse(likedData)
      }

      set(updates)
    } catch (error) {
      console.error('Error loading shopping stats:', error)
    }
  },

  likedProducts: [],

  addLikedProduct: async (productId) => {
    const { likedProducts } = get()
    if (!likedProducts.includes(productId)) {
      const newLikedProducts = [...likedProducts, productId]
      set({ likedProducts: newLikedProducts })
      try {
        await AsyncStorage.setItem(
          'likedProducts',
          JSON.stringify(newLikedProducts),
        )
      } catch (error) {
        console.error('Error saving liked products:', error)
      }
    }
  },
}))

export default useUserStore
