
import { checkPhoneStatus } from './actions'
import PhoneSettingsPage from './phone-settings-client'

export default async function Page() {
    const status = await checkPhoneStatus()
    return <PhoneSettingsPage activeNumber={status?.twilioNumber || null} personalNumber={status?.phone || null} smsEnabled={status?.smsAutoReplyEnabled ?? true} />
}
