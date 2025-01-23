import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import tailwind from 'twrnc'
import AntDesign from '@expo/vector-icons/AntDesign'
import CustomText from '@/components/CustomText'
import { Image } from 'react-native'

interface HomeSearchProps {
  onSearch: (query: string) => void
  searchQuery: string
}

export default function HomeSearch({ onSearch, searchQuery }: HomeSearchProps) {
  return (
    <View style={tailwind.style('px-4 gap-5')}>
      {/* Search Input */}
      <View
        style={tailwind.style(
          'px-4 py-3 rounded-xl bg-[#F2F2F2] flex-row items-center gap-2 shadow-sm',
        )}
      >
        <AntDesign name="search1" size={18} color="#6b7280" />
        <TextInput
          style={tailwind.style('flex-1 text-base leading-5', {
            fontFamily: 'interMedium',
            color: '#374151',
          })}
          value={searchQuery}
          onChangeText={onSearch}
          placeholder="Search products..."
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
        />
      </View>

      {/* Promotional Banner */}
      <View
        style={[
          tailwind.style('overflow-hidden shadow-lg rounded-2xl bg-[#FF6347]'),
        ]}
      >
        <View style={tailwind.style('flex-row items-center p-5 relative')}>
          {/* Decorative Elements */}
          <View style={tailwind.style('absolute top-0 left-0 w-full h-full')}>
            <View
              style={[
                tailwind.style(
                  'absolute -top-10 -left-10 w-40 h-40 rounded-full',
                ),
                { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              ]}
            />
            <View
              style={[
                tailwind.style(
                  'absolute -bottom-10 -right-10 w-32 h-32 rounded-full',
                ),
                { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              ]}
            />
          </View>

          {/* Content Section */}
          <View style={tailwind.style('flex-1 pr-4')}>
            <View
              style={[
                tailwind.style('self-start rounded-full px-3 py-1 mb-3'),
                { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              ]}
            >
              <Text
                style={tailwind.style('text-white text-xs', {
                  fontFamily: 'interBold',
                })}
              >
                LIMITED TIME OFFER
              </Text>
            </View>

            <Text
              style={tailwind.style('text-2xl font-bold text-white mb-2', {
                fontFamily: 'interBold',
              })}
            >
              50% OFF
            </Text>

            <Text
              style={[
                tailwind.style('text-sm leading-5', {
                  fontFamily: 'interMedium',
                }),
                { color: 'rgba(255, 255, 255, 0.9)' },
              ]}
            >
              Shop now and save big on premium products. Hurry before the offer
              ends!
            </Text>

            <TouchableOpacity
              style={tailwind.style(
                'bg-white mt-4 self-start px-4 py-2 rounded-full',
              )}
            >
              <Text
                style={tailwind.style('text-[#FF6347]', {
                  fontFamily: 'interSemiBold',
                })}
              >
                Shop Now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Image Section */}
          <View style={tailwind.style('w-1/3')}>
            <Image
              source={require('@/assets/images/photo-3.png')}
              style={tailwind.style('w-full h-32 rounded-xl', {
                resizeMode: 'contain',
              })}
            />
            <View
              style={[
                tailwind.style(
                  'absolute -top-2 -right-2 bg-yellow-400 rounded-full w-12 h-12 items-center justify-center',
                ),
                { transform: [{ rotate: '12deg' }] },
              ]}
            >
              <Text
                style={tailwind.style('text-lg font-bold text-white', {
                  fontFamily: 'interBold',
                })}
              >
                50%
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
