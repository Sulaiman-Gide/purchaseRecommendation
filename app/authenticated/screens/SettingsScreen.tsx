import React from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import LogoutButton from '@/components/Logout'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import tailwind from 'twrnc'
import useUserStore from '@/stores/userStore'
import { useFocusEffect } from '@react-navigation/native'

const ProfileScreen = () => {
  const userData = useUserStore((state) => state.userData)
  const shoppingStats = useUserStore((state) => state.shoppingStats)

  // Load shopping stats when component mounts and becomes focused
  useFocusEffect(
    React.useCallback(() => {
      const loadStats = async () => {
        await useUserStore.getState().loadShoppingStats()
      }
      loadStats()
    }, []),
  )

  return (
    <SafeAreaView style={tailwind`flex-1 bg-gray-50/10`} edges={['top']}>
      <ScrollView contentContainerStyle={tailwind`px-[16px] pt-4`}>
        <View style={tailwind`flex-row items-center justify-between mb-6`}>
          <Text
            style={tailwind.style({
              fontSize: 28,
              fontWeight: '500',
              fontFamily: 'interBold',
              color: '#111827',
              marginTop: 4,
            })}
          >
            Quick Pick
          </Text>
          <TouchableOpacity style={tailwind`p-2 bg-[#FF634720] rounded-full`}>
            <Ionicons name="settings-outline" size={20} color="#FF6347" />
          </TouchableOpacity>
        </View>

        <View style={tailwind`bg-white rounded-xl p-4 mb-4 shadow-md`}>
          <View style={tailwind`flex-row items-center mb-4`}>
            <Image
              source={require('@/assets/images/person.png')}
              style={tailwind`w-20 h-20 rounded-full mr-4`}
            />
            <View>
              <Text style={tailwind`text-xl font-bold text-gray-800`}>
                {userData ? userData.fullName : 'Guest'}
              </Text>
              <Text style={tailwind`text-sm text-gray-600`}>
                Your personal shopping assistant
              </Text>
            </View>
          </View>
          <Text
            style={tailwind`text-gray-700 leading-6 mb-4 tracking-wide text-[15px]`}
          >
            SmartShop AI uses advanced machine learning to understand your
            preferences and provide tailored shopping recommendations.
          </Text>
          <TouchableOpacity style={tailwind`bg-[#FF6347] py-3 px-4 rounded-xl`}>
            <Text style={tailwind`text-white text-center font-bold`}>
              Explore Your Recommendations
            </Text>
          </TouchableOpacity>
        </View>

        <View style={tailwind`bg-white rounded-xl p-4 mb-4 shadow-md`}>
          <Text style={tailwind`text-xl font-bold text-gray-700 mb-4`}>
            How It Works
          </Text>
          {[
            {
              icon: 'brain',
              title: 'AI-Powered Analysis',
              description: 'We analyze your browsing and purchase history',
            },
            {
              icon: 'lightbulb',
              title: 'Smart Predictions',
              description: "Our AI predicts products you'll love",
            },
            {
              icon: 'shopping-bag',
              title: 'Personalized Suggestions',
              description: 'Get tailored product recommendations',
            },
          ].map((item, index) => (
            <View
              key={index}
              style={tailwind`flex-row items-center mb-4 gap-4`}
            >
              <View
                style={tailwind.style(
                  index === 1
                    ? `bg-[#FF634720] px-3 py-2 rounded-full`
                    : `bg-[#FF634720] p-2.5 rounded-full`,
                )}
              >
                <FontAwesome5 name={item.icon} size={20} color="#FF6347" />
              </View>
              <View style={tailwind`flex-1 gap-0.5`}>
                <Text style={tailwind`text-lg font-semibold text-gray-800`}>
                  {item.title}
                </Text>
                <Text style={tailwind`text-gray-600`}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={tailwind`bg-white rounded-xl p-4 mb-4 shadow-md gap-5`}>
          <Text style={tailwind`text-xl font-bold text-gray-700`}>
            Trending Categories
          </Text>
          <View style={tailwind`flex-row flex-wrap justify-between`}>
            {[
              'Electronics',
              'Fashion',
              'Home',
              'Beauty',
              'Sports',
              'Books',
            ].map((category, index) => (
              <TouchableOpacity
                key={index}
                style={tailwind`bg-gray-100 py-3 px-4 rounded-xl mb-3 w-[48%]`}
              >
                <Text style={tailwind`text-gray-800 font-medium text-center`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={tailwind`bg-white rounded-xl p-4 mb-4 shadow-md gap-5`}>
          <Text style={tailwind`text-xl font-bold text-gray-700`}>
            Your Shopping Insights
          </Text>
          <View style={tailwind`flex-row justify-between mt-2 px-2`}>
            {[
              { label: 'Viewed', value: shoppingStats?.viewed || 0 },
              { label: 'Liked', value: shoppingStats?.liked || 0 },
              { label: 'Purchased', value: shoppingStats?.purchased || 0 },
            ].map((stat, index) => (
              <View key={index} style={tailwind`items-center`}>
                <Text style={tailwind`text-xl font-bold text-gray-700`}>
                  {stat.value}
                </Text>
                <Text style={tailwind`text-gray-600`}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <LogoutButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen
