import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  StatusBar,
  useColorScheme,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import useUserStore from '@/stores/userStore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'
import Entypo from '@expo/vector-icons/Entypo'
import AntDesign from '@expo/vector-icons/AntDesign'
import { useRoute, RouteProp } from '@react-navigation/native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { firestore } from '@/components/firebaseConfig'
import { doc, onSnapshot } from 'firebase/firestore'
import CustomText from '@/components/CustomText'
import LottieView from 'lottie-react-native'
import tailwind from 'twrnc'
import { useProductTracking } from '@/hooks/useProductTracking'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Define the ParamList for navigation
type RootStackParamList = {
  'authenticated/screens/HomeScreen/ProductDetailsScreen': {
    productId: string
  }
  'authenticated/screens/ChartScreen/ChartScreen': undefined
}

// Define the RouteProps for screen
type ProductDetailsRouteProp = RouteProp<
  RootStackParamList,
  'authenticated/screens/HomeScreen/ProductDetailsScreen'
>

interface Product {
  id: string
  productName: string
  productPrice: number
  productDetails: string
  productQuantity: number
  image: string
}

const ProductDetailsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const colorScheme = useColorScheme()
  const { loadCart } = useUserStore()
  const route = useRoute<ProductDetailsRouteProp>()
  const { productId } = route.params
  const animation = useRef<LottieView>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const { trackProductView, trackProductLike } = useProductTracking()
  const [isLiked, setIsLiked] = useState(false)

  // Access cart and cart actions from Zustand store
  const { addToCart, isProductInCart, cartCount, setCartCount } = useUserStore()

  // Check if the product is in the favorites list (AsyncStorage)
  useEffect(() => {
    const checkIfFavorited = async () => {
      const storedFavorites = await AsyncStorage.getItem('favorites')
      if (storedFavorites) {
        const favoritesArray = JSON.parse(storedFavorites)
        if (favoritesArray.includes(productId)) {
          setIsFavorited(true)
        }
      }
    }
    checkIfFavorited()
  }, [productId])

  useEffect(() => {
    const productDocRef = doc(firestore, 'products', productId)

    // Real-time listener for updates
    const unsubscribe = onSnapshot(productDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProduct(docSnap.data() as Product)
        setLoading(false)
      }
    })

    // Cleanup listener when component unmounts or productId changes
    return () => {
      unsubscribe()
    }
  }, [productId])

  // Handle toggling of heart icon and AsyncStorage update
  const handleFavoriteAndLike = async () => {
    // Handle both favoriting and liking in one function
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})

    let storedFavorites = await AsyncStorage.getItem('favorites')
    let favoritesArray = storedFavorites ? JSON.parse(storedFavorites) : []

    if (isFavorited) {
      favoritesArray = favoritesArray.filter((id: string) => id !== productId)
      setIsFavorited(false)
    } else {
      favoritesArray.push(productId)
      setIsFavorited(true)
      await trackProductLike()
      setIsLiked(true)
    }

    // Store updated favorites array in AsyncStorage
    await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray))
  }

  useEffect(() => {
    loadCart()
  }, [])

  // Track view when component mounts
  useEffect(() => {
    trackProductView()
  }, [])

  const handleLikePress = async () => {
    if (!isLiked) {
      await trackProductLike()
      setIsLiked(true)
    }
  }

  const handleAddToCart = () => {
    addToCart(productId)
  }

  if (loading) {
    return (
      <View style={styles.containerLoading}>
        <LottieView
          autoPlay
          ref={animation}
          style={styles.lottie}
          source={require('@/assets/Lottie/appLoading.json')}
        />
      </View>
    )
  }

  return (
    <SafeAreaView
      style={tailwind.style('bg-[#FFF]', { flex: 1 })}
      edges={['top']}
    >
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'dark-content' : 'dark-content'}
      />
      <ScrollView style={tailwind.style({})}>
        <View
          style={tailwind.style(
            'flex-row justify-between items-center px-[16px] py-3',
          )}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
              )
              navigation.goBack()
            }}
            style={tailwind.style('bg-[#F2F2F2] rounded-full mb-[-5px]', {
              paddingVertical: 4,
              paddingHorizontal: 5,
            })}
          >
            <Entypo name="chevron-small-left" size={30} color="#4b5563" />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/**Heart Icon */}
            <TouchableOpacity
              onPress={handleFavoriteAndLike}
              style={tailwind.style('bg-[#F2F2F2] rounded-full mb-[-5px]', {
                padding: 11,
              })}
            >
              {isFavorited ? (
                <AntDesign name="heart" size={17} color="#FF6347" />
              ) : (
                <AntDesign name="hearto" size={17} color="#4b5563" />
              )}
            </TouchableOpacity>

            {/**Basket Icon */}
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(
                  'authenticated/screens/ChartScreen/ChartScreen',
                )
              }}
              style={tailwind.style(
                'bg-[#F2F2F2] relative rounded-full mb-[-5px]',
                {
                  padding: 11,
                },
              )}
            >
              <FontAwesome name="shopping-basket" size={17} color="#4b5563" />
              <View
                style={tailwind.style(
                  'bg-[#FF6347] absolute top-[-4px] right-[-4px] rounded-full mb-[-5px]',
                  {
                    paddingVertical: 3,
                    paddingHorizontal: 6,
                  },
                )}
              >
                <Text style={tailwind.style({ fontSize: 14, color: '#FFF' })}>
                  {cartCount || 0}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {product && (
          <View style={{ paddingTop: 20 }}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
              />
              {product.productQuantity < 5 && (
                <View style={styles.lowStockBadge}>
                  <CustomText style={styles.lowStockText}>Low Stock</CustomText>
                </View>
              )}
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.headerSection}>
                <CustomText style={styles.productName} numberOfLines={2}>
                  {product.productName}
                </CustomText>
                <View style={styles.quantityBadge}>
                  <CustomText style={styles.quantityText}>
                    {product.productQuantity} units left
                  </CustomText>
                </View>
              </View>

              <View style={styles.priceSection}>
                <View style={styles.priceContainer}>
                  <View>
                    <CustomText style={styles.oldPrice}>
                      ₦ {(product.productPrice * 1.27).toLocaleString()}.00
                    </CustomText>
                    <View />
                  </View>
                  <CustomText style={styles.currentPrice}>
                    ₦ {product.productPrice.toLocaleString()}.00
                  </CustomText>
                </View>
                <View style={styles.savingsContainer}>
                  <CustomText style={styles.savingsText}>Save 27%</CustomText>
                </View>
              </View>

              <View style={styles.descriptionSection}>
                <CustomText style={styles.descriptionTitle}>
                  Description
                </CustomText>
                <CustomText style={styles.descriptionText}>
                  {product.productDetails}
                </CustomText>
              </View>
              <View style={styles.span} />
              <View style={styles.actionSection}>
                <TouchableOpacity
                  style={[
                    styles.addToCartButton,
                    isProductInCart(productId) && styles.addedToCartButton,
                  ]}
                  onPress={handleAddToCart}
                  disabled={isProductInCart(productId)}
                >
                  <CustomText style={styles.addToCartText}>
                    {isProductInCart(productId)
                      ? 'Added to Cart'
                      : 'Add to Cart'}
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  containerLoading: {
    flex: 1,
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  lottie: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.85,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  span: {
    height: SCREEN_WIDTH * 0.08,
  },
  detailsContainer: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
    marginTop: -20,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontFamily: 'interBold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  quantityBadge: {
    backgroundColor: '#FF6347',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  quantityText: {
    color: '#FFFFFF',
    fontFamily: 'interSemiBold',
    fontSize: 14,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10',
  },
  oldPrice: {
    fontSize: 20,
    color: '#9CA3AF',
    fontFamily: 'interRegular',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 24,
    color: '#1F2937',
    fontFamily: 'interBold',
  },
  savingsContainer: {
    backgroundColor: '#DCF2E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  savingsText: {
    color: '#059669',
    fontFamily: 'interSemiBold',
    fontSize: 14,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontFamily: 'interBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    fontFamily: 'interRegular',
  },
  recommendationSection: {
    marginBottom: 24,
  },
  recommendationTitle: {
    fontSize: 18,
    fontFamily: 'interBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  recommendationScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  recommendationCard: {
    width: SCREEN_WIDTH * 0.35,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationImage: {
    width: '100%',
    height: SCREEN_WIDTH * 0.35,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  recommendationPrice: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'interSemiBold',
    color: '#1F2937',
  },
  actionSection: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addToCartButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addedToCartButton: {
    backgroundColor: '#9CA3AF',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'interSemiBold',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  lowStockText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'interSemiBold',
  },
})

export default ProductDetailsScreen
