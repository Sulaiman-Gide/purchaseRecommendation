import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Alert, Text } from 'react-native'
import { Href, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import LottieView from 'lottie-react-native'
import NetInfo from '@react-native-community/netinfo'
import { doc, onSnapshot } from 'firebase/firestore'
import { firestore } from '@/components/firebaseConfig'
import useUserStore from '@/stores/userStore'

export default function Root() {
  const animation = useRef<LottieView>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const setUserData = useUserStore((state) => state.setUserData)
  const router = useRouter()

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected)
    })

    return () => {
      unsubscribeNetInfo()
    }
  }, [])

  // Fetch user details and listen for changes
  useEffect(() => {
    const checkAuthAndSubscribeToUser = async () => {
      if (isConnected === false) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
        )
        setLoading(false)
        return
      }

      try {
        const token = await SecureStore.getItemAsync('authToken')
        const email = await SecureStore.getItemAsync('userEmail')

        if (token && email) {
          const userRef = doc(firestore, 'userDb', email)

          // Subscribe to real-time updates
          const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data()
              setUserData(userData) // Set the userData globally using Zustand
              router.replace('/authenticated' as Href)
            } else {
              router.replace('/auth' as Href)
            }
          })

          // Clean up the listener when the component unmounts
          return () => unsubscribe()
        } else {
          router.replace('/auth' as Href)
        }
      } catch (error) {
        console.error('Error setting up user listener:', error)
        Alert.alert(
          'Error',
          'Something went wrong while setting up user listener.',
        )
      }
    }

    if (isConnected !== null) {
      checkAuthAndSubscribeToUser()
    }
  }, [isConnected, router, setUserData])

  if (loading) {
    return (
      <View style={styles.container}>
        <LottieView
          autoPlay
          ref={animation}
          style={styles.lottie}
          source={require('../assets/Lottie/appLoading.json')}
        />
      </View>
    )
  }

  // No Internet screen
  if (isConnected === false) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No Internet Connection</Text>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  lottie: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    fontWeight: 'bold',
  },
})
