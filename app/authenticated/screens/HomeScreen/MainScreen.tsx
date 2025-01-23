import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  StatusBar,
  useColorScheme,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  RefreshControl,
} from 'react-native'
import tailwind from 'twrnc'
import useUserStore from '@/stores/userStore'
import { SafeAreaView } from 'react-native-safe-area-context'
import HomeTop from './components/HomeTop'
import HomeSearch from './components/HomeSearch'
import HomeFilter from './components/HomeFilter'

const HomeScreen = () => {
  const colorScheme = useColorScheme()
  const userData = useUserStore((state) => state.userData)
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true)
    // Reset search and trigger product reload
    setSearchQuery('')
    // Wait for animation
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }, [])

  return (
    <SafeAreaView
      style={tailwind.style('bg-[#FFF]', { flex: 1 })}
      edges={['top']}
    >
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'dark-content' : 'dark-content'}
      />
      <HomeTop userName={userData ? userData.fullName : 'Guest'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={tailwind.style('flex-1 mt-4')}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#059669']}
            tintColor="#059669"
          />
        }
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1 }}>
            <HomeSearch onSearch={handleSearch} searchQuery={searchQuery} />
            <HomeFilter searchQuery={searchQuery} />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen
