import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/HomeScreen/MainScreen'
import ChartScreen from '../screens/ChartScreen/ChartScreen'
import FavouriteScreen from '../screens/FavouriteScreen/FavouriteScreen'
import SettingsScreen from '../screens/SettingsScreen'
import CustomTabBar from '@/components/CustomTabBar'

const Tabs = createBottomTabNavigator()

const TabNavigator = () => {
  return (
    <Tabs.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Favourite" component={FavouriteScreen} />
      <Tabs.Screen name="Chart" component={ChartScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  )
}

export default TabNavigator
