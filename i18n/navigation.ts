import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Locale-aware wrappers: an English href stays unprefixed, others gain /<code>.
const navigation = createNavigation(routing)
export const { Link, usePathname, useRouter, getPathname } = navigation
// Explicit annotations let TypeScript treat these `never` calls as exits.
export const redirect: typeof navigation.redirect = navigation.redirect
export const permanentRedirect: typeof navigation.permanentRedirect =
  navigation.permanentRedirect
