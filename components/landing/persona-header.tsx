import { ProfileHeader } from '@/components/profile-header'
import { WorldviewCta } from '@/components/worldview-cta'

export function PersonaHeader({
  person
}: {
  person: {
    name: string
    avatar?: string
    xUrl?: string | null
    profileUrl?: string
    profileLabel?: string
    description: string
  }
}) {
  return (
    <ProfileHeader
      name={person.name}
      avatar={person.avatar}
      profileUrl={person.xUrl ?? person.profileUrl}
      profileLabel={
        person.xUrl
          ? `@${person.xUrl.split('/').at(-1)} on X`
          : person.profileLabel
      }
      description={person.description}
    >
      <WorldviewCta />
    </ProfileHeader>
  )
}
