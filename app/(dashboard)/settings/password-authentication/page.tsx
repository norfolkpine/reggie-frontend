import PasswordMfaSettings from './password-mfa-settings'
import ContentSection from '../components/content-section'

export default function SettingsAccount() {
  return (
    <ContentSection
      title='Password and Authentication'
      desc='Update your password and configure Multi-Factor Authentication.'
    >
      <PasswordMfaSettings />
    </ContentSection>
  )
}
