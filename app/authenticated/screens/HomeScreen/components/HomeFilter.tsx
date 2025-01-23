import React, { useState, useEffect, useRef } from 'react'
import {
  collection,
  onSnapshot,
  query,
  where,
  QueryDocumentSnapshot,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore'
import { firestore } from '@/components/firebaseConfig'
import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native'
import CustomText from '@/components/CustomText'
import { Image } from 'react-native'
import LottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '@/app/_layout'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

const ScreenWidth = Dimensions.get('window').width

interface Product {
  id: string
  productName: string
  productPrice: number
  image: string
  productCategories: string
  productQuantity: number
}

interface HomeFilterProps {
  searchQuery: string
}

export default function CategoriesFilter({ searchQuery }: HomeFilterProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const animation = useRef<LottieView>(null)
  const [filter, setFilter] = useState('All')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const categories = [
    'All',
    'Smartphones',
    'Headphones',
    'Laptops',
    'Electronics',
    'Watches',
  ]

  const shuffleProducts = (productList: Product[]) => {
    return [...productList].sort(() => Math.random() - 0.5)
  }

  useEffect(() => {
    const productsRef: CollectionReference<DocumentData> = collection(
      firestore,
      'products',
    )

    let productQuery =
      filter === 'All'
        ? productsRef
        : query(productsRef, where('productCategories', '==', filter))

    const unsubscribe = onSnapshot(
      productQuery,
      (snapshot) => {
        let productList = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Product[]

        if (searchQuery) {
          productList = productList.filter((product) =>
            product.productName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
          )
        }

        // Shuffle products before setting state
        setProducts(shuffleProducts(productList))
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching product data: ', error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [filter, searchQuery])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.headerText}>Categories</CustomText>
        <CustomText style={styles.subHeaderText}>
          Choose a category to explore products
        </CustomText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setFilter(category)}
            style={[
              styles.categoryButton,
              filter === category && styles.activeCategory,
            ]}
          >
            <CustomText
              style={[
                styles.categoryText,
                filter === category && styles.activeCategoryText,
              ]}
            >
              {category}
            </CustomText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.productsContainer}>
        {loading ? (
          <View style={styles.containerLoading}>
            <LottieView
              autoPlay
              ref={animation}
              style={styles.lottie}
              source={require('@/assets/Lottie/appLoading.json')}
            />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LottieView
              autoPlay
              ref={animation}
              style={styles.lottieSad}
              source={require('@/assets/Lottie/face.json')}
            />
            <CustomText style={styles.emptyText}>No products found</CustomText>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
          >
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.card}
                onPress={() => {
                  navigation.navigate(
                    'authenticated/screens/HomeScreen/ProductDetailsScreen',
                    { productId: product.id },
                  )
                }}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <CustomText style={styles.productName} numberOfLines={1}>
                    {product.productName}
                  </CustomText>
                  <CustomText style={styles.productPrice}>
                    ₦ {product.productPrice.toLocaleString()}
                  </CustomText>
                </View>
                <View style={styles.quantityBadge}>
                  <CustomText style={styles.quantityText}>
                    {product.productQuantity} units left
                  </CustomText>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    color: '#1F2937',
    fontFamily: 'interBold',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'interRegular',
  },
  scrollView: {
    marginBottom: 16,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 40,
  },
  activeCategory: {
    backgroundColor: '#FF6347',
    borderColor: '#FF6347',
  },
  categoryText: {
    fontSize: 15,
    color: '#4B5563',
    fontFamily: 'interSemiBold',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  card: {
    width: (ScreenWidth - 48) / 2,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 12,
    borderWidth: 2,
    borderColor: '#24242420',
  },
  productImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'interSemiBold',
  },
  productPrice: {
    fontSize: 18,
    color: '#059669',
    fontFamily: 'interBold',
  },
  quantityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(237, 235, 235, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  quantityText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'interSemiBold',
  },
  containerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 60,
    height: 60,
  },
  lottieSad: {
    width: 120,
    height: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'interMedium',
    textAlign: 'center',
    marginTop: 16,
  },
})
