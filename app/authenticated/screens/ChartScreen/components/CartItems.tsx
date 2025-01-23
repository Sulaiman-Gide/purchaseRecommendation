import React, { useRef, useState } from 'react'
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  StyleSheet,
} from 'react-native'
import tailwind from 'twrnc'
import CustomText from '@/components/CustomText'
import useUserStore from '@/stores/userStore'
import { AntDesign } from '@expo/vector-icons'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '@/components/firebaseConfig'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import LottieView from 'lottie-react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface CartItem {
  id: string
  image: string
  productName: string
  productPrice: number
  quantity: number
}

interface CartItemProps {
  item: CartItem
  onQuantityChange: (id: string, newQuantity: number) => void
  onRemove: (id: string) => void
}

interface CartItemsProps {
  items: CartItem[]
  onUpdate: () => void
  onQuantityChange: (id: string, newQuantity: number) => void
  loading?: boolean
}

const CartItemCard: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
}) => {
  const [loading, setLoading] = useState(false)
  const animation = useRef<LottieView>(null)
  const [stockLimit, setStockLimit] = useState(99)

  const checkStock = async () => {
    const docRef = doc(firestore, 'products', item.id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data().productQuantity
    }
    return 0
  }

  const handleQuantityChange = async (increment: boolean) => {
    setLoading(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    try {
      const availableStock = await checkStock()
      const newQuantity = increment ? item.quantity + 1 : item.quantity - 1

      if (increment && newQuantity > availableStock) {
        Alert.alert('Stock Limit', 'Maximum available stock reached')
        return
      }

      if (newQuantity >= 1) {
        onQuantityChange(item.id, newQuantity)
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutLeft}
      style={styles.cartItem}
    >
      <View style={styles.cardContent}>
        {/* Product Image Container */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <View style={styles.quantityTag}>
            <CustomText style={styles.quantityTagText}>
              {item.quantity}x
            </CustomText>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <CustomText style={styles.productName} numberOfLines={1}>
              {item.productName}
            </CustomText>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(item.id)}
            >
              <MaterialIcons name="delete-outline" size={22} color="#FF4B55" />
            </TouchableOpacity>
          </View>

          {/* Price and Quantity Controls */}
          <View style={styles.bottomSection}>
            <CustomText style={styles.productPrice}>
              ₦ {(item.productPrice * item.quantity).toLocaleString()}.00
            </CustomText>

            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  item.quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                onPress={() => handleQuantityChange(false)}
                disabled={item.quantity <= 1 || loading}
              >
                <MaterialIcons
                  name="remove"
                  size={18}
                  color={item.quantity <= 1 ? '#9CA3AF' : '#374151'}
                />
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                {loading ? (
                  <LottieView
                    autoPlay
                    style={styles.lottie}
                    source={require('@/assets/Lottie/appLoading.json')}
                  />
                ) : (
                  <CustomText style={styles.quantityText}>
                    {item.quantity}
                  </CustomText>
                )}
              </View>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(true)}
                disabled={loading}
              >
                <MaterialIcons name="add" size={18} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  )
}

const CartItems: React.FC<CartItemsProps> = ({
  items = [],
  onUpdate,
  onQuantityChange,
  loading = false,
}) => {
  const { removeFromCart } = useUserStore()
  console.log('CartItems render - items:', items, 'loading:', loading) // Debug log

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId)
      onUpdate()
    } catch (error) {
      console.error('Error removing item:', error)
      Alert.alert('Error', 'Failed to remove item')
    }
  }

  if (loading) {
    return (
      <View
        style={[
          tailwind.style('flex-1 justify-center items-center p-4'),
          { minHeight: 200 },
        ]}
      >
        <LottieView
          autoPlay
          style={{ width: 100, height: 100 }}
          source={require('@/assets/Lottie/appLoading.json')}
        />
      </View>
    )
  }

  if (!items || items.length === 0) {
    return (
      <View
        style={[
          tailwind.style('flex-1 justify-center items-center p-4'),
          { minHeight: 200 },
        ]}
      >
        <CustomText style={tailwind.style('text-lg text-gray-500 text-center')}>
          Your cart is empty
        </CustomText>
      </View>
    )
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={tailwind.style('flex-1')}
      contentContainerStyle={{ paddingVertical: 8 }}
    >
      {items.map((item) => (
        <CartItemCard
          key={`cart-item-${item.id}`}
          item={item}
          onQuantityChange={onQuantityChange}
          onRemove={handleRemoveItem}
        />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  cartItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#242424',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 10,
    elevation: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_WIDTH * 0.25,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  quantityTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6347',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantityTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'interSemiBold',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 16,
    fontFamily: 'interSemiBold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  bottomSection: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontFamily: 'interBold',
    color: '#059669',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
  },
  quantityButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  quantityButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  quantityDisplay: {
    paddingHorizontal: 12,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontFamily: 'interSemiBold',
    color: '#374151',
  },
  removeButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  lottie: {
    width: 20,
    height: 20,
  },
})

export default CartItems
