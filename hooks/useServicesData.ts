import { useTranslation } from 'react-i18next';
import { servicesData as staticServicesData, ServiceData } from '../data/services';

export const useServicesData = () => {
  const { t } = useTranslation();

  const services: ServiceData[] = staticServicesData.map((service) => {
      const id = service.id;
      return {
          ...service,
          title: t(`services.items.${id}.title`),
          shortDesc: t(`services.items.${id}.shortDesc`),
          fullDesc: t(`services.items.${id}.fullDesc`),
          features: service.features.map((_, idx) => ({
              title: t(`services.items.${id}.features.${idx}.title`),
              description: t(`services.items.${id}.features.${idx}.description`)
          })),
          workflow: service.workflow.map((_, idx) => ({
              title: t(`services.items.${id}.workflow.${idx}.title`),
              description: t(`services.items.${id}.workflow.${idx}.description`)
          })),
          benefits: service.benefits.map((_, idx) => t(`services.items.${id}.benefits.${idx}`)),
          useCase: {
              title: t(`services.items.${id}.useCase.title`),
              description: t(`services.items.${id}.useCase.description`)
          },
          useCasesList: service.useCasesList.map((_, idx) => ({
              title: t(`services.items.${id}.useCasesList.${idx}.title`),
              description: t(`services.items.${id}.useCasesList.${idx}.description`)
          }))
      };
  });

  return services;
};
