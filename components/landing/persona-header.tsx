import { useTranslations } from 'next-intl'
import { ProfileHeader } from '@/components/profile-header'

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
  const t = useTranslations('Persona')
  return (
    <ProfileHeader
      name={person.name}
      avatar={person.avatar}
      profileUrl={person.xUrl ?? person.profileUrl}
      profileLabel={
        person.xUrl
          ? `x.com/${person.xUrl.split('/').at(-1)}`
          : (person.profileLabel ?? t('profile'))
      }
      description={person.description}
    />
  )
}
