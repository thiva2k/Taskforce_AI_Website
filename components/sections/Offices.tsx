import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TechPanel } from '../ui/TechPanel';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchOffices, WpOffice } from '../../lib/wordpress';

interface OfficeItem {
  id: string;
  city: string;
  region: string;
}

export const Offices: React.FC = () => {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<OfficeItem[]>([
    { id: 'london', city: t('offices.locations.london.city'), region: t('offices.locations.london.region') },
    { id: 'muscat', city: t('offices.locations.muscat.city'), region: t('offices.locations.muscat.region') },
    { id: 'colombo', city: t('offices.locations.colombo.city'), region: t('offices.locations.colombo.region') }
  ]);

  useEffect(() => {
    const loadOffices = async () => {
      try {
        const offices = await fetchOffices();

        if (!offices.length) return;

        const sortedOffices = offices.sort(
          (a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0)
        );

        setLocations(
          sortedOffices.map((office: WpOffice) => ({
            id: office.slug,
            city: office.title.rendered || office.acf?.city || '',
            region: office.acf?.country || '',
          }))
        );
      } catch (error) {
        console.error('Failed to load offices:', error);
      }
    };

    loadOffices();
  }, []);
  return (
    <section className="py-16 md:py-24 relative z-10">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center mb-12"
        >
          <span className="text-accent font-mono text-xs tracking-[0.2em] uppercase mb-3">
            {t('offices.subtitle')}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {t('offices.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {locations.map((loc, idx) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <TechPanel className="h-full p-6 rounded-2xl bg-[#0A0A0A]/60 backdrop-blur-xl border-white/5 group hover:border-primary-DEFAULT/30 transition-all duration-300 flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary-DEFAULT/10 group-hover:bg-primary-DEFAULT/20 text-primary-light transition-colors shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white group-hover:text-primary-light transition-colors">
                    {loc.city}
                  </span>
                  <span className="text-sm text-gray-500 font-mono uppercase tracking-wider">
                    {loc.region}
                  </span>
                </div>
              </TechPanel>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};