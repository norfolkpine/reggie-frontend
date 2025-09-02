//import { AccountForm } from './account-form'
import ContentSection from '../components/content-section'
import { EmailSettingsForm } from './email-form'

export default function SettingsEmail() {
  return (
    <ContentSection
      title='Email'
      desc='Manage your account email addresses'
    >
      <EmailSettingsForm />
    </ContentSection>
  )
}
