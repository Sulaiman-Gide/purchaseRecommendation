import useUserStore from '@/stores/userStore'

export const useProductTracking = () => {
  const incrementStat = useUserStore((state) => state.incrementStat)

  const trackProductView = async () => {
    await incrementStat('viewed')
  }

  const trackProductLike = async () => {
    await incrementStat('liked')
  }

  const trackPurchase = async () => {
    await incrementStat('purchased')
  }

  return {
    trackProductView,
    trackProductLike,
    trackPurchase,
  }
}
