import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ComponentProps, ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { SiteSocialLinks } from '@/components/site-social-links'
import { LanguageSelect } from '@/components/language-select'
import { siteCreator } from '@/lib/site'
import { footerPosts } from '@/lib/blog/footer-posts'

const repositoryUrl = 'https://github.com/transitive-bullshit/doom-or-bloom'
const creatorSite = 'https://transitivebullsh.it'

function FooterLink(props: ComponentProps<typeof Link>) {
  return (
    <Link
      className='text-muted-foreground hover:text-foreground rounded-sm transition-colors'
      {...props}
    />
  )
}

function ExternalLink({
  href,
  children
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-muted-foreground hover:text-foreground rounded-sm transition-colors'
    >
      {children}
    </a>
  )
}

function FooterColumn({
  id,
  title,
  className,
  children
}: {
  id: string
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <nav aria-labelledby={id} className={className}>
      <p id={id} className='text-foreground mb-3 text-sm font-medium'>
        {title}
      </p>
      <ul className='flex flex-col gap-2.5 text-sm'>{children}</ul>
    </nav>
  )
}

/** Site-wide footer: what to explore, featured posts and the project pages. */
export function SiteFooter({ languageSelect }: { languageSelect: boolean }) {
  const t = useTranslations('Footer')
  return (
    <footer
      style={{ viewTransitionName: 'site-footer' }}
      className='border-border/70 mt-12 border-t'
    >
      <div className='mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-9 px-4 pt-10 pb-8 sm:px-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] md:gap-x-10'>
        <div className='col-span-2 flex flex-col gap-3 md:col-span-1'>
          <Link
            href='/'
            className='inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold tracking-tight'
          >
            <Image
              src='/icon.svg'
              alt=''
              width={24}
              height={24}
              className='size-6 shrink-0'
              unoptimized
            />
            Doom or Bloom
          </Link>
          <p className='text-muted-foreground max-w-xs text-sm text-balance'>
            {t('tagline')}
          </p>
        </div>

        <FooterColumn id='footer-explore' title={t('explore')}>
          <li>
            <FooterLink
              href={{ pathname: '/assessments', query: { start: '1' } }}
              prefetch={false}
              rel='nofollow'
            >
              {t('mapWorldview')}
            </FooterLink>
          </li>
          <li>
            <FooterLink href='/users'>{t('thoughtLeaders')}</FooterLink>
          </li>
          <li>
            <FooterLink href='/p-doom'>{t('pdoom')}</FooterLink>
          </li>
        </FooterColumn>

        <FooterColumn
          id='footer-blog'
          title={t('blog')}
          className='order-last col-span-2 md:order-none md:col-span-1'
        >
          {footerPosts.map(({ slug, label, translated }) => (
            <li key={slug} lang={translated ? undefined : 'en'}>
              <FooterLink href={`/blog/${slug}`}>
                {t(`posts.${label}`)}
              </FooterLink>
            </li>
          ))}
          <li>
            <FooterLink href='/blog'>{t('allPosts')}</FooterLink>
          </li>
        </FooterColumn>

        <FooterColumn id='footer-project' title={t('project')}>
          <li>
            <FooterLink href='/about'>{t('about')}</FooterLink>
          </li>
          <li>
            <FooterLink href='/about#methodology'>
              {t('methodology')}
            </FooterLink>
          </li>
          <li>
            <FooterLink href='/privacy'>{t('privacy')}</FooterLink>
          </li>
          <li>
            <ExternalLink href={repositoryUrl}>{t('sourceCode')}</ExternalLink>
          </li>
        </FooterColumn>
      </div>

      <div className='mx-auto w-full max-w-6xl px-4 sm:px-6'>
        <div className='border-border/70 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t py-4'>
          <p className='text-muted-foreground text-sm'>
            {t.rich('madeBy', {
              name: siteCreator.name,
              link: (chunks) => (
                <a
                  href={creatorSite}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-foreground underline decoration-current/30 underline-offset-2 transition-colors'
                >
                  {chunks}
                </a>
              )
            })}
          </p>
          <div className='flex flex-wrap items-center gap-1'>
            <SiteSocialLinks />
            {languageSelect && <LanguageSelect />}
          </div>
        </div>
      </div>
    </footer>
  )
}
