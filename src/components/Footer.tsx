import { Link } from 'react-router-dom';
import { getTranslations, getCurrentLanguage, getLocalizedPathForLanguage } from './language-utils';
import { footerTranslations } from './footer-translations';
import BrandLink from './BrandLink';

const Footer = () => {
  const t = getTranslations(footerTranslations);
  const language = getCurrentLanguage();
  const getLocalized = (path: string) => getLocalizedPathForLanguage(path, language);
  return (
    <footer className="border-t border-white/10 bg-neutral-950 text-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Logo & tagline */}
          <div>
            <BrandLink to={getLocalized('/')} className="mb-3" />
            <p className="max-w-xs text-sm text-neutral-300">
              {t.tagline}
            </p>
          </div>

          {/* Product links */}
          <nav aria-label={t.productTitle}>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">{t.productTitle}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={getLocalized('/automated-reselling-platform-guide')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.automatedResellingGuide}
                </Link>
              </li>
              <li>
                <Link to={getLocalized('/price-checker')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.priceChecker}
                </Link>
              </li>
              <li>
                <Link to={getLocalized('/how-it-works')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.howItWorks}
                </Link>
              </li>
              <li>
                <Link to={getLocalized('/success-stories')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.successStories}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Tutorials links */}
          <nav aria-label={t.tutorialsTitle}>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">{t.tutorialsTitle}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={getLocalized('/articles')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.tutorials}
                </Link>
              </li>
              <li>
                <Link to={getLocalized('/articles/vinted-relisting-tool')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.vintedRelistingTool}
                </Link>
              </li>
              <li>
                <Link to={getLocalized('/articles/cross-list-vinted-to-facebook-marketplace')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.crosslistVintedFb}
                </Link>
              </li>
              <li>
                <Link to={getLocalized('/articles/product-relister-for-vinted')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.productRelister}
                </Link>
              </li>
              <li>
                <Link to={getLocalized('/articles/olx-listing-automation-by-country')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.olxAutomation}
                </Link>
              </li>
              <li>
                <Link to={getLocalized('/articles/etsy-listing-tool')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.etsyListingTool}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Support links */}
          <nav aria-label={t.supportTitle}>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">{t.supportTitle}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={getLocalized('/faq')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.faq}
                </Link>
              </li>
              <li>
                <a href="mailto:myflipit@arrpo.com" className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.contactUs}
                </a>
              </li>
              <li>
                <Link to={getLocalized('/privacy')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link to={getLocalized('/terms')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.terms}
                </Link>
              </li>
              <li>
                <Link to={getLocalized('/cookies')} className="text-neutral-300 transition-colors hover:text-cyan-400">
                  {t.cookiesPolicy}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-neutral-500 md:mt-16 md:pt-8">
          <p>&copy; {new Date().getFullYear()} {t.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
