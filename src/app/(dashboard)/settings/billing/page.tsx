import SettingsBilling from './subscription-management'
import ContentSection from '../components/content-section'

export default function SettingsAccount() {
  return (
    <ContentSection
      title='Billing'
      desc='Manage your billing and subscription plans.'
    >
      <SettingsBilling />
    </ContentSection>
  )
}
