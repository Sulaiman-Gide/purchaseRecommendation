import React, { useEffect, useRef } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AuthProvider } from '@/hooks/useAuth'
import LottieView from 'lottie-react-native'
import { NavigationContainer } from '@react-navigation/native'

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export type RootStackParamList = {
  LoanScreen: undefined
  'authenticated/index': undefined
  'authenticated/screens/HomeScreen/ProductDetailsScreen': { productId: string }
  'authenticated/screens/ChartScreen/ChartScreen': undefined
  'authenticated/screens/FavouriteScreen/FavouriteScreen': undefined
  'authenticated/screens/HomeScreen/MainScreen': undefined
  'auth/index': undefined
  'auth/signup': undefined
}

export default function RootLayout() {
  const animation = useRef<LottieView>(null)
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    interRegular: require('../assets/fonts/Inter-Regular.ttf'),
    interMedium: require('../assets/fonts/Inter-Medium.ttf'),
    interSemiBold: require('../assets/fonts/Inter-SemiBold.ttf'),
    interBold: require('../assets/fonts/Inter-Bold.ttf'),
    ...FontAwesome.font,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <LottieView
          autoPlay
          ref={animation}
          style={{
            width: 70,
            height: 70,
            backgroundColor: '#FFF',
          }}
          source={require('../assets/Lottie/appLoading.json')}
        />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen
            name="authenticated/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="authenticated/screens/HomeScreen/MainScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="authenticated/screens/HomeScreen/ProductDetailsScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="authenticated/screens/FavouriteScreen/FavouriteScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="authenticated/screens/ChartScreen/ChartScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="authenticated/screens/SettingsScreen"
            options={{ headerShown: false }}
          />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
})
