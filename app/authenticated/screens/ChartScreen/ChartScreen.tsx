import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  StatusBar,
  useColorScheme,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native'
import tailwind from 'twrnc'
import { SafeAreaView } from 'react-native-safe-area-context'
import ChartTop from './components/ChartTop'
import CartItems from './components/CartItems'
import CustomText from '@/components/CustomText'
import useUserStore from '@/stores/userStore'
import { firestore } from '@/components/firebaseConfig'
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore'
import LottieView from 'lottie-react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RootStackParamList } from '@/app/_layout'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useProductTracking } from '@/hooks/useProductTracking'

interface CartItem {
  id: string
  productPrice: number
  image: string
  productName: string
  quantity: number
  productCategories?: string[] // Make this optional to match the actual data
}

const ChartScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const animation = useRef<LottieView>(null)
  const colorScheme = useColorScheme()
  const { cart, userData } = useUserStore()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)
  const { trackPurchase } = useProductTracking()

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true

      const loadData = async () => {
        try {
          setLoading(true)
          await useUserStore.getState().loadCart()
          if (isActive) {
            await loadCartItems()
          }
        } catch (error) {
          console.error('Error loading data:', error)
        } finally {
          if (isActive) {
            setLoading(false)
          }
        }
      }

      loadData()

      return () => {
        isActive = false
      }
    }, []),
  )

  const loadCartItems = async () => {
    try {
      const currentCart = useUserStore.getState().cart
      console.log('Current cart:', currentCart) // Debug log

      if (!currentCart || currentCart.length === 0) {
        console.log('Cart is empty') // Debug log
        setCartItems([])
        setTotalAmount(0)
        return
      }

      const productPromises = currentCart.map(async (cartItem) => {
        try {
          const docRef = doc(firestore, 'products', cartItem.productId)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            const productData = docSnap.data()
            console.log('Product data found:', productData) // Debug log
            return {
              id: docSnap.id,
              productPrice: productData.productPrice || 0,
              image: productData.image || '',
              productName: productData.productName || '',
              quantity: cartItem.quantity,
              productCategories: productData.productCategories || [],
            } as CartItem
          }
        } catch (error) {
          console.error('Error fetching product:', cartItem.productId, error)
        }
        return null
      })

      const productsWithNull = await Promise.all(productPromises)
      const products = productsWithNull.filter(
        (product): product is CartItem => product !== null,
      )

      console.log('Processed products:', products) // Debug log
      setCartItems(products)
      setTotalAmount(
        products.reduce(
          (sum, item) => sum + item.productPrice * item.quantity,
          0,
        ),
      )
    } catch (error) {
      console.error('Error loading cart items:', error)
      Alert.alert('Error', 'Failed to load cart items')
    }
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    useUserStore.getState().updateQuantity(productId, newQuantity)
    const updatedItems = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item,
    )
    setCartItems(updatedItems)

    const newTotal = updatedItems.reduce(
      (sum, item) => sum + item.productPrice * item.quantity,
      0,
    )
    setTotalAmount(newTotal)
  }

  const initializePaystack = async () => {
    // TODO: Initialize Paystack SDK here
    console.log('Initializing Paystack...')
  }

  useEffect(() => {
    initializePaystack()
  }, [])

  const processPaystackPayment = async () => {
    try {
      setLoading(true)

      // TODO: Implement Paystack payment flow here
      console.log('Processing Paystack payment...')

      // For now, we'll just simulate a successful payment
      const paymentSuccessful = true

      if (paymentSuccessful) {
        // Track the purchase
        await trackPurchase()

        // Save order to Firebase
        const ordersRef = collection(firestore, 'orders')
        await addDoc(ordersRef, {
          userId: userData?.uid,
          items: cartItems.map((item) => ({
            productId: item.id,
            productName: item.productName,
            quantity: item.quantity,
            price: item.productPrice,
            categories: Array.isArray(item.productCategories)
              ? item.productCategories
              : typeof item.productCategories === 'string'
              ? [item.productCategories]
              : [],
          })),
          totalAmount,
          createdAt: serverTimestamp(),
          status: 'completed',
        })

        // Clear cart
        const { removeAllFromCart } = useUserStore.getState()
        await removeAllFromCart()
        await AsyncStorage.removeItem('cart')

        setCartItems([])
        setTotalAmount(0)

        Alert.alert('Order Successful!', 'Thank you for your purchase.', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('authenticated/index')
            },
          },
        ])
      } else {
        Alert.alert('Payment Failed', 'Please try again.')
      }
    } catch (error) {
      console.error('Detailed payment error:', error)
      Alert.alert('Error', 'Failed to process payment')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = () => {
    Alert.alert(
      'Confirm Purchase',
      `Total amount: ₦${totalAmount.toLocaleString()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: processPaystackPayment },
      ],
    )
  }

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white')} edges={['top']}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ChartTop />
      <CartItems
        items={cartItems}
        onUpdate={loadCartItems}
        onQuantityChange={handleQuantityChange}
        loading={loading}
      />
      {cartItems.length > 0 && (
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <View style={styles.buttonContent}>
            <MaterialIcons name="lock" size={20} color="#FFF" />
            <CustomText style={styles.checkoutText}>
              Pay with Paystack
            </CustomText>
            <CustomText style={styles.totalInButton}>
              ₦ {totalAmount.toLocaleString()}
            </CustomText>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  checkoutButton: {
    backgroundColor: '#059669',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalInButton: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default ChartScreen
