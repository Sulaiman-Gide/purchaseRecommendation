import React from 'react'
import * as Haptics from 'expo-haptics'
import { View, TouchableOpacity, Image } from 'react-native'
import tailwind from 'twrnc'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import CustomText from '@/components/CustomText'
import BellIcon from '@/assets/images/bellIcon.svg'

interface HomeTopProps {
  userName: string
}

const HomeTop: React.FC<HomeTopProps> = ({ userName }) => {
  return (
    <View
      style={tailwind.style(
        'flex-row justify-between items-end px-[16px] pt-[10px]',
      )}
    >
      {/* User Icon */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        }}
        style={tailwind.style('bg-[#F2F2F2] rounded-full mb-[-5px]', {
          padding: 12,
        })}
      >
        <FontAwesome name="user-circle-o" size={22} color="black" />
      </TouchableOpacity>

      {/* Center Section */}
      <View style={tailwind.style('flex-col items-center')}>
        <CustomText
          style={tailwind.style({
            fontSize: 14,
            fontWeight: '500',
            color: '#6B7280',
          })}
        >
          Username
        </CustomText>
        <CustomText
          style={tailwind.style({
            fontSize: 16,
            fontWeight: '500',
            fontFamily: 'interBold',
            color: '#111827',
            marginTop: 4,
          })}
        >
          {userName}
        </CustomText>
      </View>

      {/* Notification Bell Icon */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        }}
        style={tailwind.style('bg-[#F2F2F2] rounded-full', {
          padding: 12,
        })}
      >
        <BellIcon width={15} height={15} />
      </TouchableOpacity>
    </View>
  )
}

export default HomeTop
