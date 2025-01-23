import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Entypo from '@expo/vector-icons/Entypo'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import tailwind from 'twrnc'
import CustomText from '@/components/CustomText'

interface FavouriteTopProps {
  onRefresh: () => void
}

export default function FavouritesTop({ onRefresh }: FavouriteTopProps) {
  const navigation = useNavigation()

  return (
    <View style={tailwind.style('px-4 py-3 flex-row items-center')}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={tailwind.style('bg-[#F2F2F2] rounded-full', {
          paddingVertical: 4,
          paddingHorizontal: 5,
        })}
      >
        <Entypo name="chevron-small-left" size={30} color="#4b5563" />
      </TouchableOpacity>
      <CustomText
        style={tailwind.style('text-2xl font-bold ml-5 flex-1 text-[#1F2937]')}
      >
        For You
      </CustomText>
      <TouchableOpacity
        onPress={onRefresh}
        style={tailwind.style('bg-[#F2F2F2] rounded-full p-2')}
      >
        <MaterialIcons name="refresh" size={24} color="#4b5563" />
      </TouchableOpacity>
    </View>
  )
}
