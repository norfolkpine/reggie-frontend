import { UserTokenUsage } from './token-usage'
import ContentSection from '../components/content-section'

export default function SettingsUsage() {
  return (
    <ContentSection
      title='Token Usage'
      desc="Your token usage and breakdown the list."
    >
      <UserTokenUsage />
    </ContentSection>
  )
}
