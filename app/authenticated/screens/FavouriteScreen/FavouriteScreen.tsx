import React, { useState, useEffect, useRef } from 'react'
import {
  ScrollView,
  StatusBar,
  useColorScheme,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native'
import tailwind from 'twrnc'
import useUserStore from '@/stores/userStore'
import { SafeAreaView } from 'react-native-safe-area-context'
import LottieView from 'lottie-react-native'
import CustomText from '@/components/CustomText'
import FavouritesTop from './components/FavouriteTop'
import { useNavigation } from '@react-navigation/native'
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { firestore } from '@/components/firebaseConfig'
import { RootStackParamList } from '@/app/_layout'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface RecommendedProduct {
  id: string
  productName: string
  productPrice: number
  image: string
  productCategories: string[]
  matchScore: number
}

interface OrderItem {
  productCategories: string[]
  productId: string
}

interface OrderData {
  items: OrderItem[]
}

const FavouriteScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>(
    [],
  )
  const [loading, setLoading] = useState(true)
  const { userData } = useUserStore()
  const colorScheme = useColorScheme()
  const animation = useRef<LottieView>(null)

  const fetchPersonalizedProducts = async () => {
    try {
      setLoading(true)
      if (!userData?.uid) return

      const ordersRef = collection(firestore, 'orders')
      const simpleQuery = query(ordersRef, where('userId', '==', userData.uid))
      const orderDocs = await getDocs(simpleQuery)

      // Debug log orders
      console.log('Number of orders found:', orderDocs.size)

      const categoryScores = new Map<string, number>()
      let purchaseCount = 0

      orderDocs.forEach((doc) => {
        const orderData = doc.data()
        console.log('Order data:', orderData) // Debug log

        if (!orderData.items || !Array.isArray(orderData.items)) {
          console.log('No items array in order:', doc.id)
          return
        }

        orderData.items.forEach((item: any) => {
          // Debug log each item
          console.log('Processing item:', item)

          // Handle both possible category field names and ensure it's an array
          let categories = []
          if (Array.isArray(item.categories)) {
            categories = item.categories
          } else if (Array.isArray(item.productCategories)) {
            categories = item.productCategories
          } else if (typeof item.categories === 'string') {
            categories = [item.categories]
          } else if (typeof item.productCategories === 'string') {
            categories = [item.productCategories]
          }

          // Debug log categories
          console.log('Item categories:', categories)

          const quantity = item.quantity || 1
          categories.forEach((category: string) => {
            if (typeof category === 'string') {
              const currentScore = categoryScores.get(category) || 0
              categoryScores.set(category, currentScore + quantity)
            }
          })
        })
        purchaseCount++
      })

      console.log('Category scores:', Object.fromEntries(categoryScores))

      if (categoryScores.size === 0) {
        console.log('No categories found in orders')
        setRecommendations([])
        setLoading(false)
        return
      }

      // Fetch products
      const productsRef = collection(firestore, 'products')
      const productDocs = await getDocs(productsRef)
      const scoredProducts: RecommendedProduct[] = []

      productDocs.forEach((doc) => {
        const product = doc.data()
        let score = 0

        // Handle product categories in the same way
        let productCategories = []
        if (Array.isArray(product.productCategories)) {
          productCategories = product.productCategories
        } else if (typeof product.productCategories === 'string') {
          productCategories = [product.productCategories]
        }

        productCategories.forEach((category) => {
          if (typeof category === 'string') {
            score += categoryScores.get(category) || 0
          }
        })

        if (score > 0) {
          scoredProducts.push({
            id: doc.id,
            productName: product.productName || '',
            productPrice: product.productPrice || 0,
            image: product.image || '',
            productCategories: productCategories,
            matchScore:
              score / Math.max(...Array.from(categoryScores.values())),
          })
        }
      })

      const sortedProducts = scoredProducts
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10)

      console.log('Found recommendations:', sortedProducts.length)
      setRecommendations(sortedProducts)
    } catch (error) {
      console.error('Detailed error:', error)
      Alert.alert('Error', 'Unable to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to diversify recommendations
  const diversifyRecommendations = (products: RecommendedProduct[]) => {
    const categoryGroups = new Map<string, RecommendedProduct[]>()

    products.forEach((product) => {
      const mainCategory = product.productCategories[0]
      if (!categoryGroups.has(mainCategory)) {
        categoryGroups.set(mainCategory, [])
      }
      categoryGroups.get(mainCategory)!.push(product)
    })

    const diversified: RecommendedProduct[] = []
    const categories = Array.from(categoryGroups.keys())

    while (diversified.length < products.length && categories.length > 0) {
      categories.forEach((category) => {
        const products = categoryGroups.get(category)
        if (products && products.length > 0) {
          diversified.push(products.shift()!)
        }
      })
    }

    return diversified
  }

  // Add refresh functionality
  const handleRefresh = () => {
    fetchPersonalizedProducts()
  }

  useEffect(() => {
    fetchPersonalizedProducts()
  }, [userData])

  // Add loading state UI
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <FavouritesTop onRefresh={handleRefresh} />
        <View style={styles.loadingContainer}>
          <LottieView
            autoPlay
            style={styles.loadingAnimation}
            source={require('@/assets/Lottie/appLoading.json')}
          />
          <CustomText style={styles.loadingText}>
            Loading your personalized recommendations...
          </CustomText>
        </View>
      </SafeAreaView>
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
      <FavouritesTop onRefresh={handleRefresh} />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={['#059669']}
          />
        }
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, marginTop: 15 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {recommendations.length === 0 ? (
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{ flex: 1 }}>
              <View
                style={tailwind.style(
                  'flex-1 justify-center items-center px-7 gap-3',
                )}
              >
                <LottieView
                  autoPlay
                  ref={animation}
                  style={tailwind.style({ width: 150, height: 200 })}
                  source={require('@/assets/Lottie/emptyBasket.json')}
                />
                <CustomText
                  style={tailwind.style('text-[#6b7280] text-center mb-10', {
                    fontSize: 16,
                  })}
                >
                  Your preference module is empty. Make several purchases before
                  products are recommended based on your preferences, likes, and
                  previous purchases.
                </CustomText>
              </View>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View style={styles.productsGrid}>
            {recommendations.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() =>
                  navigation.navigate(
                    'authenticated/screens/HomeScreen/ProductDetailsScreen',
                    {
                      productId: product.id,
                    },
                  )
                }
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <CustomText numberOfLines={1} style={styles.productName}>
                    {product.productName}
                  </CustomText>
                  <CustomText style={styles.productPrice}>
                    ₦ {product.productPrice.toLocaleString()}
                  </CustomText>
                </View>
                <View style={styles.matchBadge}>
                  <CustomText style={styles.matchText}>
                    {Math.min(Math.round(product.matchScore * 10), 100)}% Match
                  </CustomText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  productCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: (SCREEN_WIDTH - 48) / 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'interSemiBold',
    color: '#374151',
  },
  productPrice: {
    fontSize: 18,
    fontFamily: 'interBold',
    color: '#059669',
  },
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#059669',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'interSemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingAnimation: {
    width: 100,
    height: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'interMedium',
  },
})

export default FavouriteScreen
