import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/i18n';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ServiceDetail() {
  const { t, locale } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [service, setService] = useState<any>(null);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadServiceDetail();
    }
  }, [id, locale]); // Ajout de locale comme dépendance

  const loadServiceDetail = async () => {
    try {
      setLoading(true);
      const [serviceData, allServices] = await Promise.all([
        api.getService(id!),
        api.getServices(),
      ]);

      setService(serviceData);

      // Get related services (same category, exclude current)
      const related = allServices
        .filter(s => s.category.id === serviceData.category.id && s.id !== serviceData.id)
        .slice(0, 3);
      setRelatedServices(related);
    } catch (error) {
      console.error('Failed to load service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/service/${id}` } });
      return;
    }
    navigate(`/booking?serviceId=${id}`);
  };

  if (loading) return <LoadingSpinner />;
  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('common.error')}</h2>
          <Link to="/services" className="btn-primary">
            {t('common.back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      {/* Breadcrumb */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600 overflow-x-auto">
            <Link to="/" className="hover:text-pink-600 transition-colors whitespace-nowrap">{t('serviceDetail.breadcrumb.home')}</Link>
            <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/services" className="hover:text-pink-600 transition-colors whitespace-nowrap">{t('serviceDetail.breadcrumb.services')}</Link>
            <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium truncate">{service.name}</span>
          </div>
        </div>
      </div>

      {/* Service Detail */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3 md:space-y-4">
            <div className="aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-2xl animate-fade-in">
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                  <span className="text-6xl md:text-9xl">💅</span>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 animate-fade-in animation-delay-200">
              <div className="card p-2 md:p-4 text-center">
                <svg className="w-5 h-5 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="font-bold text-gray-900 text-xs md:text-base">{service.durationMin} {t('services.minutes')}</div>
                <div className="text-[10px] md:text-xs text-gray-500">{t('serviceDetail.features.duration')}</div>
              </div>

              <div className="card p-2 md:p-4 text-center">
                <svg className="w-5 h-5 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="font-bold text-gray-900 text-xs md:text-base">Pro</div>
                <div className="text-[10px] md:text-xs text-gray-500">{t('serviceDetail.features.staff')}</div>
              </div>

              <div className="card p-2 md:p-4 text-center">
                <svg className="w-5 h-5 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="font-bold text-gray-900 text-xs md:text-base">{t('serviceDetail.features.quality')}</div>
                <div className="text-[10px] md:text-xs text-gray-500 hidden sm:block">{t('serviceDetail.trustBadge.title')}</div>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="animate-fade-in animation-delay-300">
            <span className="badge-premium mb-3 md:mb-4 text-xs md:text-sm">{service.category.name}</span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              {service.name}
            </h1>

            <div className="flex items-baseline gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="text-3xl md:text-5xl font-bold text-gradient">
                {service.priceFrom && <span className="text-xl md:text-2xl font-normal mr-2">{t('common.from')}</span>}
                ₪{service.priceIls}
              </div>
              <div className="text-sm md:text-base text-gray-500">{t('common.perSession')}</div>
            </div>

            {service.description && (
              <div className="mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed text-sm md:text-lg">
                  {service.description}
                </p>
              </div>
            )}

            {/* What's Included */}
            <div className="mb-6 md:mb-8 card-glass p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-pink-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('serviceDetail.whatsIncluded.title')}
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {[
                  t('serviceDetail.whatsIncluded.consultation'),
                  t('serviceDetail.whatsIncluded.products'),
                  t('serviceDetail.whatsIncluded.aftercare'),
                  t('serviceDetail.whatsIncluded.guarantee')
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 md:space-y-4">
              <button
                onClick={handleBookNow}
                className="w-full btn-primary text-base md:text-lg py-3 md:py-4 animate-glow"
              >
                {t('serviceDetail.bookService')}
                <svg className="inline-block ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <div className="flex gap-2 md:gap-4">
                <a
                  href="tel:+972XXXXXXXX"
                  className="flex-1 btn-secondary text-center inline-flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base py-2.5 md:py-3"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="hidden sm:inline">{t('serviceDetail.callNow')}</span>
                  <span className="sm:hidden">Call</span>
                </a>
                <button className="flex-1 btn-secondary inline-flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base py-2.5 md:py-3">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="hidden sm:inline">{t('serviceDetail.share')}</span>
                  <span className="sm:hidden">Share</span>
                </button>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-6 md:mt-8 flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg md:rounded-xl">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-bold text-green-900 text-sm md:text-base">{t('serviceDetail.trustBadge.title')}</div>
                <div className="text-xs md:text-sm text-green-700">{t('serviceDetail.trustBadge.description')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-12 md:pb-20">
          <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 text-center">
            {t('serviceDetail.relatedServices.title')} <span className="text-gradient">{t('serviceDetail.relatedServices.titleHighlight')}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {relatedServices.map((relatedService) => (
              <Link
                key={relatedService.id}
                to={`/service/${relatedService.id}`}
                className="group card-premium hover-lift"
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-pink-100 to-purple-100">
                  {relatedService.imageUrl ? (
                    <img
                      src={relatedService.imageUrl}
                      alt={relatedService.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl md:text-6xl">💅</span>
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 group-hover:text-gradient transition-all">
                    {relatedService.name}
                  </h3>
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100">
                    <span className="text-sm md:text-base text-gray-600">{relatedService.durationMin} min</span>
                    <span className="text-lg md:text-xl font-bold text-gradient">
                      {relatedService.priceFrom && <span className="text-sm font-normal mr-1">{t('common.from')}</span>}
                      ₪{relatedService.priceIls}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
