import React from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Platform,
} from 'react-native'

interface CustomTabBarProps {
  state: any
  descriptors: any
  navigation: any
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  type TabLabel = 'Home' | 'Chart' | 'Favourite' | 'Settings'

  // Define icon sources with explicit type
  const iconSource: Record<TabLabel, any> = {
    Home: require('@/assets/images/home.png'),
    Chart: require('@/assets/images/chartIcon.png'),
    Favourite: require('@/assets/images/favoriteIcon.png'),
    Settings: require('@/assets/images/profile.png'),
  }

  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key]
        const label = options.tabBarLabel ?? options.title ?? route.name

        const isFocused = state.index === index

        const icon = iconSource[label as TabLabel]

        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name)
        }

        const iconStyle = [
          styles.icon,
          { tintColor: isFocused ? '#FF6347' : '#27272a' },
          label === 'Settings' ? { width: 22, height: 22 } : {},
          label === 'Chart' ? { width: 35, height: 23 } : {},
        ]

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[styles.tabButton, isFocused && styles.activeTab]}
          >
            <Image source={icon} style={iconStyle} />
            <Text
              style={[
                styles.label,
                { color: isFocused ? '#FF6347' : '#27272a' },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 12,
    paddingBottom: Platform.select({
      ios: 30,
      android: 12,
    }),
    justifyContent: 'space-around',
    borderTopWidth: 0.8,
    borderColor: '#69696950',
  },
  tabButton: {
    width: 80,
    height: 55,
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'interSemiBold',
  },
})

export default CustomTabBar
