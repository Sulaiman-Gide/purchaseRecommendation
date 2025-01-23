import {
  View,
  TextInput,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Image,
} from 'react-native'
import React, { useState, useRef } from 'react'
import tailwind from 'twrnc'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Fontisto, MaterialCommunityIcons } from '@expo/vector-icons'
import CustomText from '@/components/CustomText'
import { StatusBar } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/app/_layout'
import { TouchableOpacity } from 'react-native'
import { Text } from 'react-native'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, firestore } from '@/components/firebaseConfig'
import { setDoc, doc } from 'firebase/firestore'
import useUserStore from '@/stores/userStore'
import * as SecureStore from 'expo-secure-store'
import LottieView from 'lottie-react-native'

export default function SignUp() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const iosStyle = Platform.OS === 'ios' ? tailwind.style('-mb-[3px]') : {}
  const animation = useRef<LottieView>(null)
  const colorScheme = useColorScheme()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isButtonDisabled =
    !fullName ||
    !email ||
    password.length < 6 ||
    confirmPassword.length < 6 ||
    password !== confirmPassword

  const toggleShowPassword = () => setShowPassword(!showPassword)
  const showToggleShowPassword = () =>
    setShowConfirmPassword(!showConfirmPassword)

  const handlePress = () => {
    navigation.navigate('auth/index')
  }

  const saveAuthToken = async (token: string, email: string) => {
    try {
      await SecureStore.setItemAsync('authToken', token)
      await SecureStore.setItemAsync('userEmail', email)
    } catch (error) {
      console.error('Error saving token:', error)
    }
  }

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      )
      const user = userCredential.user

      const emailDocId = email.toLowerCase()
      const userData = {
        fullName,
        email,
        walletBalance: 0,
        createdAt: new Date().toISOString(),
        uid: user.uid,
      }
      await setDoc(doc(firestore, 'userDb', emailDocId), userData)

      // Save authentication token
      await saveAuthToken(user.uid, email)

      // Update Zustand store with user data
      useUserStore.getState().setUserData(userData)

      setIsLoading(false)
      navigation.navigate('authenticated/index')
      navigation.reset({
        index: 0,
        routes: [{ name: 'authenticated/index' }],
      })
    } catch (err: any) {
      switch (err.code) {
        case 'auth/invalid-email':
          setError('The email address is not valid.')
          break
        case 'auth/email-already-in-use':
          setError('This email address is already in use.')
          break
        case 'auth/weak-password':
          setError(
            'The password is too weak. It should be at least 6 characters.',
          )
          break
        case 'auth/network-request-failed':
          setError('Network error. Please try again later.')
          break
        default:
          setError('An error occurred. Please try again.')
          break
      }
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'dark-content' : 'dark-content'}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={['#FFF', '#FFF']} style={{ flex: 1 }}>
          <SafeAreaView
            style={tailwind.style('flex-1 px-0.5 justify-end')}
            edges={['top']}
          >
            <View
              style={tailwind.style('justify-center items-center', {
                flex: 0.33,
              })}
            >
              <Image
                source={require('@/assets/images/logoIcon.png')}
                style={{ width: 80, resizeMode: 'contain' }}
              />
            </View>
            <ScrollView
              style={tailwind.style({
                flex: 1,
                backgroundColor: '#FFF',
              })}
            >
              <View style={tailwind.style('flex-1 items-center pt-3 px-3.5')}>
                <View style={tailwind.style(`flex-1 w-full mb-12 gap-[10px]`)}>
                  <CustomText
                    style={tailwind.style({
                      color: '#292626',
                      fontFamily: 'interBold',
                      fontSize: 25,
                    })}
                  >
                    Sign Up
                  </CustomText>
                  <CustomText
                    style={tailwind.style({
                      color: '#292626',
                      fontSize: 16,
                      marginBottom: 10,
                    })}
                  >
                    Create an account to explore Excellence Shop and elevate
                    your shopping experience.
                  </CustomText>

                  {error && (
                    <CustomText
                      style={tailwind.style('text-red-500 text-center mb-2')}
                    >
                      {error}
                    </CustomText>
                  )}
                  <View>
                    <CustomText
                      style={tailwind.style({
                        color: '#595959',
                        lineHeight: 20,
                        fontSize: 14,
                        fontWeight: 400,
                        marginBottom: 10,
                        fontFamily: 'interMedium',
                      })}
                    >
                      Full name
                    </CustomText>
                    <View style={tailwind.style('mb-3')}>
                      <View
                        style={tailwind.style(
                          'w-full flex-row justify-between items-center',
                          {
                            borderWidth: 1,
                            borderColor: '#69696998',
                            color: 'black',
                            paddingHorizontal: 12,
                            paddingVertical: 12.5,
                            borderRadius: 8,
                          },
                        )}
                      >
                        <TextInput
                          style={tailwind.style('text-[13px] flex-1', {
                            backgroundColor: 'transparent',
                          })}
                          value={fullName}
                          onChangeText={setFullName}
                          placeholder="Musa Abdullahi"
                          placeholderTextColor="#979999"
                          underlineColorAndroid="transparent"
                        />
                      </View>
                    </View>
                  </View>

                  <View>
                    <CustomText
                      style={tailwind.style({
                        color: '#595959',
                        lineHeight: 20,
                        fontSize: 14,
                        fontWeight: 400,
                        marginBottom: 10,
                        fontFamily: 'interMedium',
                      })}
                    >
                      Email address
                    </CustomText>
                    <View style={tailwind.style('mb-3')}>
                      <View
                        style={tailwind.style(
                          'w-full flex-row justify-between items-center',
                          {
                            borderWidth: 1,
                            borderColor: '#69696998',
                            color: 'black',
                            paddingHorizontal: 12,
                            paddingVertical: 12.5,
                            borderRadius: 8,
                          },
                        )}
                      >
                        <Fontisto name="email" size={17} color="#000" />
                        <TextInput
                          style={tailwind.style('text-[13px] flex-1 ml-3', {
                            backgroundColor: 'transparent',
                          })}
                          value={email}
                          onChangeText={(text) => {
                            const updatedEmail =
                              text.charAt(0).toLowerCase() + text.slice(1)
                            setEmail(updatedEmail)
                          }}
                          placeholder="e.g example@gmail.com"
                          placeholderTextColor="#979999"
                          underlineColorAndroid="transparent"
                        />
                      </View>
                    </View>
                  </View>

                  <View
                    style={tailwind.style(
                      'flex-1 flex-row justify-between items-center gap-2',
                    )}
                  >
                    <View style={tailwind.style('flex-0.5')}>
                      <CustomText
                        style={tailwind.style({
                          color: '#595959',
                          lineHeight: 20,
                          fontSize: 14,
                          fontWeight: 400,
                          marginBottom: 10,
                          fontFamily: 'interMedium',
                        })}
                      >
                        Password
                      </CustomText>
                      <View
                        style={tailwind.style(
                          'w-full flex-row justify-between items-center',
                          {
                            borderWidth: 1,
                            borderColor: '#69696998',
                            color: 'black',
                            paddingHorizontal: 12,
                            paddingVertical: 12.5,
                            borderRadius: 8,
                          },
                        )}
                      >
                        <Fontisto name="locked" size={15} color="black" />
                        <TextInput
                          style={tailwind.style(
                            'text-[13px] flex-1 mx-2 mt-1 h-full',
                            {
                              backgroundColor: 'transparent',
                            },
                          )}
                          secureTextEntry={!showPassword}
                          value={password}
                          onChangeText={setPassword}
                          placeholder="********"
                          placeholderTextColor="#979999"
                          underlineColorAndroid="transparent"
                        />
                        <MaterialCommunityIcons
                          name={showPassword ? 'eye-off' : 'eye'}
                          size={17}
                          color="#000"
                          onPress={toggleShowPassword}
                        />
                      </View>
                    </View>

                    <View style={tailwind.style('flex-0.5')}>
                      <CustomText
                        style={tailwind.style({
                          color: '#595959',
                          lineHeight: 20,
                          fontSize: 14,
                          fontWeight: 400,
                          marginBottom: 10,
                          fontFamily: 'interMedium',
                        })}
                      >
                        Confirm password
                      </CustomText>
                      <View
                        style={tailwind.style(
                          'w-full flex-row justify-between items-center',
                          {
                            borderWidth: 1,
                            borderColor: '#69696998',
                            color: 'black',
                            paddingHorizontal: 12,
                            paddingVertical: 12.5,
                            borderRadius: 8,
                          },
                        )}
                      >
                        <Fontisto name="locked" size={15} color="black" />
                        <TextInput
                          style={tailwind.style(
                            'text-[13px] flex-1 mx-2 mt-1 h-full',
                            {
                              backgroundColor: 'transparent',
                            },
                          )}
                          secureTextEntry={!showConfirmPassword}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="********"
                          placeholderTextColor="#979999"
                          underlineColorAndroid="transparent"
                        />
                        <MaterialCommunityIcons
                          name={showConfirmPassword ? 'eye-off' : 'eye'}
                          size={17}
                          color="#000"
                          onPress={showToggleShowPassword}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={tailwind.style('flex-1 pt-0.5 pb-10')}>
                    <TouchableOpacity
                      style={tailwind.style(
                        'w-full items-center justify-center py-[12px] rounded-lg mt-3',
                        isButtonDisabled ? 'bg-gray-200/80' : 'bg-[#FF6347]',
                      )}
                      onPress={handleSignUp}
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
                          Sign Up
                        </CustomText>
                      )}
                    </TouchableOpacity>
                    <View>
                      <CustomText
                        style={tailwind.style(
                          'mt-4.5 text-center text-[#595959] text-[15px] tracking-wide',
                        )}
                      >
                        Already have an account?{' '}
                        <TouchableOpacity onPress={handlePress}>
                          <Text
                            style={[
                              tailwind.style('text-[#FF6347] underline'),
                              iosStyle,
                            ]}
                          >
                            Sign In
                          </Text>
                        </TouchableOpacity>
                      </CustomText>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
