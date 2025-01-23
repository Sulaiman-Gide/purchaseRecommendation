import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/app/_layout'
import tailwind from 'twrnc'

const LogoutButton: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await SecureStore.deleteItemAsync('authToken')
      await SecureStore.deleteItemAsync('userEmail')
      navigation.navigate('auth/index')
      navigation.reset({
        index: 0,
        routes: [{ name: 'auth/index' }],
      })
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <TouchableOpacity
      style={tailwind.style(
        'w-full items-center justify-center py-[12px] rounded-lg bg-red-500',
      )}
      onPress={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <ActivityIndicator size={20} color="#FFFFFF" />
      ) : (
        <Text
          style={tailwind.style('text-center text-[16px] tracking-wide', {
            fontWeight: '600',
            color: 'white',
          })}
        >
          Logout
        </Text>
      )}
    </TouchableOpacity>
  )
}

export default LogoutButton
