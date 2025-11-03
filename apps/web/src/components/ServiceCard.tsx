import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description?: string;
    durationMin: number;
    priceIls: number;
    imageUrl?: string;
    category: {
      name: string;
    };
  };
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const { t } = useI18n();

  return (
    <Link to={`/services/${service.id}`} className="card hover:shadow-md transition-shadow">
      {service.imageUrl && (
        <img
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{service.category.name}</p>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
        {service.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {service.durationMin} {t('services.minutes')}
          </span>
          <span className="text-primary-600 font-semibold">₪{service.priceIls}</span>
        </div>
      </div>
    </Link>
  );
}
