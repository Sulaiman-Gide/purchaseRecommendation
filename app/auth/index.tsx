import * as SecureStore from 'expo-secure-store'
import React, { useState, useRef } from 'react'
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native'
import useUserStore from '@/stores/userStore'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Fontisto, MaterialCommunityIcons } from '@expo/vector-icons'
import { doc, getDoc } from 'firebase/firestore'
import { firebase, firestore } from '@/components/firebaseConfig'
import tailwind from 'twrnc'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import CustomText from '@/components/CustomText'
import { RootStackParamList } from '@/app/_layout'
import LottieView from 'lottie-react-native'

const Login: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const iosStyle = Platform.OS === 'ios' ? tailwind.style('-mb-[3px]') : {}
  const animation = useRef<LottieView>(null)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const toggleShowPassword = () => setShowPassword(!showPassword)

  const handlePress = () => {
    navigation.navigate('auth/signup')
  }

  const saveAuthToken = async (token: string, email: string) => {
    try {
      await SecureStore.setItemAsync('authToken', token)
      await SecureStore.setItemAsync('userEmail', email)
    } catch (error) {
      console.error('Error saving token:', error)
    }
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const userCredential = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
      const user = userCredential.user

      if (user) {
        // Save authentication token
        await saveAuthToken(user.uid, email)

        // Fetch user data from Firestore
        const userRef = doc(firestore, 'userDb', email)
        const userSnapshot = await getDoc(userRef)

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data()

          // Update Zustand store
          useUserStore.getState().setUserData(userData)

          // Navigate to authenticated screen
          navigation.navigate('authenticated/index')
          navigation.reset({
            index: 0,
            routes: [{ name: 'authenticated/index' }],
          })
        } else {
          setErrorMessage('User data is not available in the database.')
        }
      } else {
        setErrorMessage('User authentication failed.')
      }
    } catch (error: any) {
      const errorMessage = error.message.replace('Firebase: ', '')
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            setErrorMessage('No user found with this email.')
            break
          case 'auth/wrong-password':
            setErrorMessage('Incorrect password. Please try again.')
            break
          case 'auth/invalid-email':
            setErrorMessage('Invalid email format.')
            break
          case 'auth/network-request-failed':
            setErrorMessage('Network error. Please try again later.')
            break
          default:
            setErrorMessage(
              `Error: ${errorMessage || 'An unknown error occurred.'}`,
            )
            break
        }
      } else {
        setErrorMessage(
          `Error: ${errorMessage || 'An error occurred. Please try again.'}`,
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isButtonDisabled = !email || password.length < 6

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={['#FFF', '#FFF']} style={{ flex: 1 }}>
          <SafeAreaView
            style={tailwind.style('flex-1 px-0.5 justify-end')}
            edges={['top']}
          >
            <View
              style={tailwind.style('justify-center items-center', {
                flex: 0.4,
              })}
            >
              <Image
                source={require('@/assets/images/logoIcon.png')}
                style={{ width: 80, resizeMode: 'contain' }}
              />
            </View>

            <View style={tailwind.style('bg-white flex-1 items-start px-3.5')}>
              <CustomText
                style={tailwind.style({
                  color: '#292626',
                  fontFamily: 'interBold',
                  fontSize: 25,
                })}
              >
                Login
              </CustomText>
              <CustomText
                style={tailwind.style({
                  color: '#292626',
                  fontSize: 16,
                  marginTop: 14,
                })}
              >
                Sign in to access Excellence Shop and enjoy a seamless shopping
                experience.
              </CustomText>

              <View style={tailwind.style('flex-1 w-full mt-5 mb-12 gap-2.5')}>
                {errorMessage && (
                  <CustomText
                    style={tailwind.style('text-red-500 text-center mb-2')}
                  >
                    {errorMessage}
                  </CustomText>
                )}

                <View style={tailwind.style('mb-3')}>
                  <CustomText
                    style={tailwind.style({
                      color: '#595959',
                      fontSize: 14,
                      marginBottom: 10,
                    })}
                  >
                    Email address
                  </CustomText>
                  <View
                    style={tailwind.style(
                      'flex-row items-center border border-gray-300 p-3 rounded-lg',
                    )}
                  >
                    <Fontisto name="email" size={17} color="#000" />
                    <TextInput
                      style={tailwind.style('flex-1 ml-3 text-sm')}
                      value={email}
                      onChangeText={(text) => {
                        const updatedEmail =
                          text.charAt(0).toLowerCase() + text.slice(1)
                        setEmail(updatedEmail)
                      }}
                      placeholder="e.g example@gmail.com"
                      placeholderTextColor="#979999"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View>
                  <CustomText
                    style={tailwind.style({
                      color: '#595959',
                      fontSize: 14,
                      marginBottom: 10,
                    })}
                  >
                    Password
                  </CustomText>
                  <View
                    style={tailwind.style(
                      'flex-row items-center border border-gray-300 p-3 rounded-lg',
                    )}
                  >
                    <Fontisto name="locked" size={15} color="black" />
                    <TextInput
                      style={tailwind.style('flex-1 ml-3 text-sm')}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="********"
                      placeholderTextColor="#979999"
                    />
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={17}
                      color="#000"
                      onPress={toggleShowPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={tailwind.style(
                    'w-full items-center justify-center py-[12px] rounded-lg mt-3',
                    isButtonDisabled ? 'bg-gray-200/80' : 'bg-[#FF6347]',
                  )}
                  onPress={handleLogin}
                  disabled={isButtonDisabled}
                >
                  {isLoading ? (
                    <LottieView
                      autoPlay
                      ref={animation}
                      style={{
                        width: 22,
                        height: 22,
                        backgroundColor: 'transparent',
                      }}
                      source={require('@/assets/Lottie/appLoadingWhite.json')}
                    />
                  ) : (
                    <CustomText
                      style={tailwind.style(
                        'text-center text-[16px] tracking-wide',
                        {
                          fontWeight: 600,
                          fontFamily: 'interSemiBold',
                          color: isButtonDisabled ? '#71717a' : 'white',
                        },
                      )}
                    >
                      Login
                    </CustomText>
                  )}
                </TouchableOpacity>

                <View>
                  <CustomText
                    style={tailwind.style(
                      'mt-4.5 text-center text-[#595959] text-[15px] tracking-wide',
                    )}
                  >
                    Don't have an account?{' '}
                    <TouchableOpacity onPress={handlePress}>
                      <Text
                        style={[
                          tailwind.style('text-[#FF6347] underline'),
                          iosStyle,
                        ]}
                      >
                        Sign Up
                      </Text>
                    </TouchableOpacity>
                  </CustomText>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default Login
