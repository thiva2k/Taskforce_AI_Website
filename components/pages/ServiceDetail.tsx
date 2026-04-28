import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servicesData, ServiceData, WorkflowStep, UseCaseItem, ServiceFeature } from '../../data/services';
import { Footer } from '../layout/Footer';
import { ServiceNavigation } from '../service-detail/ServiceNavigation';
import { ServiceHero } from '../service-detail/ServiceHero';
import { ServiceWorkflow } from '../service-detail/ServiceWorkflow';
import { ServiceInterface } from '../service-detail/ServiceInterface';
import { ServiceDossier } from '../service-detail/ServiceDossier';
import { ServiceUseCases } from '../service-detail/ServiceUseCases';
import { ServiceCTA } from '../service-detail/ServiceCTA';
import { SEO } from '../seo/SEO';
import { GlitchButton } from '../ui/GlitchButton';
import {
  fetchServices,
  fetchServiceRepeatItems,
  cleanServiceItemTitle,
  decodeHtmlEntities,
  stripHtml,
  WpYoastHeadJson,
} from '../../lib/wordpress';

const serviceIdAliasMap: Record<string, string> = {
  'ai-workflow-agents': 'ai-workflows',
  'voice-agents': 'voice-agents',
  'document-processing': 'document-processing',
  'business-intelligence': 'business-intelligence',
  'custom-software': 'custom-software',
  'ai-micro-apps': 'ai-micro-apps',
};

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [yoast, setYoast] = useState<WpYoastHeadJson | null>(null);

  const routeSlug = id || '';
  const normalizedId = routeSlug ? (serviceIdAliasMap[routeSlug] || routeSlug) : '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const loadServiceDetail = async () => {
      if (!routeSlug) {
        setService(null);
        setLoading(false);
        return;
      }

      try {
        const staticFallback = servicesData.find((s) => s.id === normalizedId);

        if (!staticFallback) {
          setService(null);
          setLoading(false);
          return;
        }

        const [wpServices, repeatItems] = await Promise.all([
          fetchServices(),
          fetchServiceRepeatItems(routeSlug),
        ]);

        const wpService = wpServices.find((s) => s.slug === routeSlug);

        if (wpService?.yoast_head_json) setYoast(wpService.yoast_head_json);

        const workflow: WorkflowStep[] =
          repeatItems.howItWorks.length > 0
            ? repeatItems.howItWorks.map((item) => ({
                title: cleanServiceItemTitle(item.title.rendered, routeSlug),
                description: stripHtml(item.content.rendered),
              }))
            : staticFallback.workflow;

        const useCasesList: UseCaseItem[] =
          repeatItems.useCases.length > 0
            ? repeatItems.useCases.map((item) => ({
                title: cleanServiceItemTitle(item.title.rendered, routeSlug),
                description: stripHtml(item.content.rendered),
              }))
            : staticFallback.useCasesList;

        const features: ServiceFeature[] =
          repeatItems.systemCapabilities.length > 0
            ? repeatItems.systemCapabilities.map((item) => ({
                title: cleanServiceItemTitle(item.title.rendered, routeSlug),
                description: stripHtml(item.content.rendered),
              }))
            : staticFallback.features;

        const mergedService: ServiceData = {
          ...staticFallback,
          id: routeSlug,
          title: decodeHtmlEntities(
            wpService?.acf?.inner_hero_title ||
              wpService?.title?.rendered ||
              staticFallback.title
          ),
          shortDesc: decodeHtmlEntities(
            wpService?.acf?.inner_hero_short_desc || staticFallback.shortDesc
          ),
          fullDesc: decodeHtmlEntities(
            wpService?.acf?.inner_hero_long_desc || staticFallback.fullDesc
          ),
          primaryButtonText: decodeHtmlEntities(
            wpService?.acf?.inner_primary_button_text ||
              staticFallback.primaryButtonText ||
              'Initialize Agent'
          ),
          primaryButtonLink:
            wpService?.acf?.inner_primary_button_link ||
            staticFallback.primaryButtonLink ||
            '/book-demo',
          secondaryButtonText: decodeHtmlEntities(
            wpService?.acf?.inner_secondary_button_text ||
              staticFallback.secondaryButtonText ||
              'Contact HQ'
          ),
          secondaryButtonLink:
            wpService?.acf?.inner_secondary_button_link ||
            staticFallback.secondaryButtonLink ||
            '/contact',
          workflow,
          useCasesList,
          features,
        };

        setService(mergedService);
      } catch (error) {
        console.error('Error loading service detail:', error);

        const staticFallback = servicesData.find((s) => s.id === normalizedId);
        setService(staticFallback || null);
      } finally {
        setLoading(false);
      }
    };

    loadServiceDetail();
  }, [routeSlug, normalizedId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6 text-white">
        <div>
          <h1 className="text-2xl font-bold mb-2">Loading Service...</h1>
          <p className="text-gray-400">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6 text-white">
        <SEO title="Service Not Found - AI TaskForce" />
        <div>
          <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
          <GlitchButton onClick={() => navigate('/')} variant="ghost">
            Return to Base
          </GlitchButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden relative selection:bg-primary-DEFAULT selection:text-white">
      <SEO
        title={yoast?.title || `${service.title} - AI TaskForce Agents`}
        description={yoast?.description || service.shortDesc}
        image={yoast?.og_image?.[0]?.url || '/logo-horizontal.png'}
        keywords={`AI ${service.title}, ${service.title} automation, AI agent, ${routeSlug}`}
        url={`/service/${routeSlug}`}
      />

      <ServiceNavigation title={service.title} />

      <div className="relative z-10 pt-32 pb-20">
        <ServiceHero service={service} />
        <ServiceWorkflow workflow={service.workflow} />
        <ServiceUseCases service={service} />
        <ServiceInterface serviceId={service.id} />
        <ServiceDossier service={service} />
        <ServiceCTA />
      </div>

      <Footer />
    </div>
  );
};