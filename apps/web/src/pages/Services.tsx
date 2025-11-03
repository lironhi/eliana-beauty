import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useI18n } from '@/i18n';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Services() {
  const { t } = useI18n();
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadServices();
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (loading) return;

    // Setup scroll animations after services are loaded or category changes
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const timer = setTimeout(() => {
      document.querySelectorAll('.scroll-fade-in').forEach((el) => {
        observer.observe(el);
        // Immediately show elements already in viewport
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('visible');
        }
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [loading, selectedCategory]);

  const loadServices = async () => {
    try {
      const data = await api.getServices();

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }

      setServices(data);

      // Extract unique categories
      const uniqueCategories = data.reduce((acc: any[], service: any) => {
        if (service.category && !acc.find((cat) => cat.id === service.category.id)) {
          acc.push(service.category);
        }
        return acc;
      }, []);
      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category && s.category.slug === selectedCategory);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="decorative-blob w-96 h-96 bg-pink-300 -top-20 -right-20"></div>
          <div className="decorative-blob w-80 h-80 bg-purple-300 bottom-0 -left-20" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="badge-premium mb-4">{t('services.badge')}</span>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            {t('services.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('services.hero.description')}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            {t('services.allServices')}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category.slug
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xl text-gray-600">{t('services.noServicesInCategory')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="group card-premium hover-lift scroll-fade-in"
              >
                {/* Service Image */}
                <div className="aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-pink-100 to-purple-100">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">💅</span>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-pink-600 shadow-md">
                      {service.category.name}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t('services.viewDetails')}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gradient transition-all duration-300">
                    {service.name}
                  </h3>

                  {service.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  {/* Price and Duration */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">{service.durationMin} {t('services.minutes')}</span>
                    </div>
                    <div className="text-2xl font-bold text-gradient">
                      ₪{service.priceIls}
                    </div>
                  </div>

                  {/* Book Button */}
                  <button className="w-full mt-4 btn-primary text-center">
                    {t('services.bookNow')}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-500 via-purple-600 to-pink-600 text-white py-16 animate-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('services.cta.title')}
          </h2>
          <p className="text-lg mb-8 opacity-90">
            {t('services.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+972XXXXXXXX" className="btn-secondary inline-flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t('services.cta.callUs')}
            </a>
            <a href="mailto:contact@elianabeauty.com" className="btn-secondary inline-flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('services.cta.emailUs')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
