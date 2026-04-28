import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-void)] text-[var(--ink-primary)] flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 md:py-24 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-[var(--fs-4xl)] font-display font-bold text-[var(--ink-primary)]">
            {t('privacy.title', 'Privacy Policy')}
          </h1>
          <p className="text-[var(--fs-lg)] text-[var(--ink-muted)]">
            {t('privacy.lastUpdated', 'Last updated: April 2026')}
          </p>
        </div>

        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-[var(--fs-base)] text-[var(--ink-primary)] leading-relaxed">
            {t('privacy.intro', 'This simulator is built with a strict privacy-first approach. We believe in providing a powerful educational tool without compromising your personal data.')}
          </p>

          <h2 className="text-[var(--fs-xl)] font-display font-bold text-[var(--ink-primary)] mt-8 mb-4">
            {t('privacy.noCookies.title', 'No Cookies, No Tracking')}
          </h2>
          <p className="text-[var(--fs-base)] text-[var(--ink-primary)] leading-relaxed">
            {t('privacy.noCookies.desc', 'We do not use cookies. We do not track your individual behavior across the site. We use Cloudflare Web Analytics, which is a privacy-first, cookie-less analytics service that only provides aggregated metrics (like page views and referrers) without fingerprinting or tracking individual users.')}
          </p>

          <h2 className="text-[var(--fs-xl)] font-display font-bold text-[var(--ink-primary)] mt-8 mb-4">
            {t('privacy.thirdParties.title', 'Third-Party Services')}
          </h2>
          <p className="text-[var(--fs-base)] text-[var(--ink-primary)] leading-relaxed">
            {t('privacy.thirdParties.desc', 'We minimize third-party dependencies to protect your privacy. The only external services we use are:')}
          </p>
          <ul className="list-disc pl-6 mt-2 text-[var(--fs-base)] text-[var(--ink-primary)] leading-relaxed">
            <li>{t('privacy.thirdParties.maps', 'OpenFreeMap for rendering the map tiles.')}</li>
            <li>{t('privacy.thirdParties.cf', 'Cloudflare for hosting and privacy-preserving analytics.')}</li>
          </ul>

          <h2 className="text-[var(--fs-xl)] font-display font-bold text-[var(--ink-primary)] mt-8 mb-4">
            {t('privacy.data.title', 'Personal Data')}
          </h2>
          <p className="text-[var(--fs-base)] text-[var(--ink-primary)] leading-relaxed">
            {t('privacy.data.desc', 'We do not collect, store, or process any personal data. Your simulation parameters and saved scenarios are stored entirely locally on your device using your browser\'s local storage. This makes our service fully compliant with GDPR, CCPA, and other privacy regulations by default.')}
          </p>

          <h2 className="text-[var(--fs-xl)] font-display font-bold text-[var(--ink-primary)] mt-8 mb-4">
            {t('privacy.disclaimer.title', 'Educational Use Disclaimer')}
          </h2>
          <p className="text-[var(--fs-base)] text-[var(--ink-primary)] leading-relaxed">
            {t('privacy.disclaimer.desc', 'This simulator is for educational and scientific visualization purposes only. The impact models are based on published scientific papers (Collins, Melosh, and Marcus 2005) but are approximations. Do not use this tool for emergency planning, risk assessment, or life-critical decisions.')}
          </p>

          <h2 className="text-[var(--fs-xl)] font-display font-bold text-[var(--ink-primary)] mt-8 mb-4">
            {t('privacy.contact.title', 'Contact')}
          </h2>
          <p className="text-[var(--fs-base)] text-[var(--ink-primary)] leading-relaxed">
            {t('privacy.contact.desc', 'If you have any questions about this privacy policy, please contact us at privacy@asteroid-simulator.example.com.')}
          </p>
        </div>
      </main>
      
      <footer className="border-t border-[var(--ink-faint)] py-8 px-6 mt-auto">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[var(--fs-sm)] text-[var(--ink-muted)]">
            © 2026 Asteroid Impact Simulator
          </p>
          <div className="flex gap-4">
            <Link to="/" className="text-[var(--fs-sm)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)] transition-colors">
              {t('footer.home', 'Home')}
            </Link>
            <Link to="/simulator" className="text-[var(--fs-sm)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)] transition-colors">
              {t('footer.simulator', 'Simulator')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
