import SessionsList from './sessions-list'
import ContentSection from '../components/content-section'


export default function SettingsSessions() {
  return (
    <ContentSection
      title='Sessions'
      desc='This is a list of devices that have logged into your account. Revoke any sessions that you do not recognize.
'
    >
      <SessionsList />
    </ContentSection>
  )
}
