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
import { TechPanel } from '../ui/TechPanel';
import {
  fetchServices,
  fetchServiceRepeatItems,
  cleanServiceItemTitle,
  decodeHtmlEntities,
  stripHtml,
} from '../../lib/wordpress';

const serviceIdAliasMap: Record<string, string> = {
  'ai-workflow-agents': 'ai-workflows',
  'ai-voice-agents': 'ai-voice-agents',
  'ai-document-processing': 'ai-document-processing',
  'business-intelligence': 'business-intelligence',
  'custom-ai-software': 'custom-ai-software',
  'ai-booking-agents': 'ai-booking-agents',
};

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const routeSlug = id || '';
  const normalizedId = routeSlug ? (serviceIdAliasMap[routeSlug] || routeSlug) : '';

  // Resolve static fallback synchronously so the page renders immediately —
  // no loading state means the prerender always captures real content.
  const staticFallback =
    servicesData.find((s) => s.id === normalizedId) ||
    servicesData.find((s) => s.id === routeSlug) ||
    (routeSlug === 'ai-booking-agents'
      ? servicesData.find((s) => s.id === 'ai-micro-apps')
      : undefined);

  const [service, setService] = useState<ServiceData | null>(
    staticFallback ? { ...staticFallback, id: routeSlug } : null
  );
  const [seoCards, setSeoCards] = useState<string[]>([]);
  const [loading] = useState(false); // Static data is ready immediately

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    // Enhance with WordPress data in the background — static content already showing
    const enhanceWithWordPress = async () => {
      if (!routeSlug || !staticFallback) return;

      try {
        const [wpServices, repeatItems] = await Promise.all([
          fetchServices(),
          fetchServiceRepeatItems(routeSlug),
        ]);

        const wpService =
          wpServices.find((s) => s.slug === routeSlug) ||
          (routeSlug === 'ai-booking-agents'
            ? wpServices.find((s) => s.slug === 'ai-micro-apps')
            : undefined);

        const serviceAcf = wpService?.acf as any;

        const cards = [
          serviceAcf?.seo_card_1_content,
          serviceAcf?.seo_card_2_content,
          serviceAcf?.seo_card_3_content,
          serviceAcf?.seo_card_4_content,
          serviceAcf?.seo_card_5_content,
          serviceAcf?.seo_card_6_content,
        ].filter((card) => card && card.trim() !== '');

        setSeoCards(cards);

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
        console.error('Error enhancing service with WordPress data:', error);
        // Static data already showing — nothing to do here
      }
    };

    enhanceWithWordPress();
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

  const isBookingAgents = service.id === 'ai-booking-agents';

  // Unique SEO descriptions per service for better keyword targeting
  const serviceMetaMap: Record<string, { description: string; keywords: string }> = {
    'ai-workflows': {
      description: "AI workflow automation for Sri Lanka businesses — eliminate manual data entry, sync your CRM, email and databases, and automate repetitive operations 24/7. Cut manual work by 80%. Built and maintained by TaskForce AI in Colombo.",
      keywords: "AI workflow automation Sri Lanka, business process automation Sri Lanka, AI automation company Sri Lanka, workflow agents Colombo, RPA Sri Lanka, TaskForce AI",
    },
    'ai-voice-agents': {
      description: "AI voice agents for Sri Lankan businesses — handle inbound and outbound calls in English, Sinhala, Tamil and Arabic. 24/7 call handling, lead qualification and appointment booking without a human on the line. Deployed by TaskForce AI.",
      keywords: "AI voice agent Sri Lanka, AI voice receptionist Sri Lanka, AI calling agent Sri Lanka, AI customer service Sri Lanka, voice AI Colombo, multilingual voice agent",
    },
    'ai-document-processing': {
      description: "AI document processing for Sri Lanka enterprises — automatically extract, validate and process data from invoices, contracts, shipping documents and compliance records with near-perfect accuracy. Cut document handling time by 80%. Built by TaskForce AI.",
      keywords: "AI document processing Sri Lanka, automated data extraction Sri Lanka, invoice processing AI, document automation Colombo, OCR AI Sri Lanka, TaskForce AI",
    },
    'business-intelligence': {
      description: "AI-powered business intelligence for Sri Lanka — unify your sales, inventory and operations data into real-time dashboards that show you exactly why things are happening and what to do next. Custom BI solutions by TaskForce AI.",
      keywords: "business intelligence Sri Lanka, AI dashboards Sri Lanka, data analytics Colombo, real-time reporting AI, BI automation Sri Lanka, TaskForce AI",
    },
    'custom-ai-software': {
      description: "Custom AI software development in Sri Lanka — from internal management systems to proprietary SaaS platforms, TaskForce AI designs and builds tailor-made AI applications engineered to your exact business workflows.",
      keywords: "custom AI software Sri Lanka, AI development company Sri Lanka, bespoke AI solutions Colombo, AI software agency Sri Lanka, TaskForce AI",
    },
    'ai-booking-agents': {
      description: "AI booking agents for Sri Lanka hotels, restaurants, clinics and salons — 24/7 reservation management in multiple languages without the overhead of a reservations team. Handle bookings, cancellations and inquiries automatically. By TaskForce AI.",
      keywords: "AI booking agent Sri Lanka, automated reservations Sri Lanka, hotel booking AI Colombo, restaurant booking automation, appointment scheduling AI Sri Lanka, TaskForce AI",
    },
  };

  const pageMeta = serviceMetaMap[normalizedId] || {
    description: service.shortDesc,
    keywords: `AI ${service.title}, ${service.title} automation, AI agent Sri Lanka, ${normalizedId}`,
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: pageMeta.description,
    url: `https://www.taskforceai.tech/service/${normalizedId}`,
    provider: {
      '@type': 'Organization',
      name: 'TaskForce AI',
      url: 'https://www.taskforceai.tech',
      logo: 'https://www.taskforceai.tech/logo-horizontal.png',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Nugegoda Business Center, Unit 37, 2nd Floor, 80 Nawala Rd',
        addressLocality: 'Nugegoda',
        postalCode: '10250',
        addressCountry: 'LK',
      },
    },
    areaServed: ['Sri Lanka', 'Oman', 'United Kingdom'],
    serviceType: 'AI Automation',
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative selection:bg-primary-DEFAULT selection:text-white">
      <SEO
        title={`${service.title} | TaskForce AI`}
        description={pageMeta.description}
        keywords={pageMeta.keywords}
        url={`/service/${normalizedId}`}
        schema={serviceSchema}
      />
      <ServiceNavigation title={service.title} />

      <div className="relative z-10 pt-32 pb-20">
        <ServiceHero service={service} />
        <ServiceUseCases service={service} />
        <ServiceWorkflow workflow={service.workflow} />
        <ServiceInterface serviceId={service.id} />
        {!isBookingAgents && <ServiceDossier service={service} />}
        {seoCards.length > 0 && (
          <section className="px-6 py-24 relative z-10">
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary-DEFAULT/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

            <div className="container mx-auto max-w-7xl relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {seoCards.map((cardContent, index) => {
                  const isLastOdd =
                    seoCards.length % 2 === 1 && index === seoCards.length - 1;

                  return (
                    <div
                      key={index}
                      className={
                        isLastOdd
                          ? 'md:col-span-2 md:max-w-4xl md:mx-auto md:w-full'
                          : ''
                      }
                    >
                      <TechPanel
                        className="p-8 border-white/5 hover:border-primary-DEFAULT/30 transition-colors duration-500 group h-full flex flex-col rounded-2xl"
                        animateScan={true}
                      >
                        <div
                          className="relative z-10 flex-1"
                          dangerouslySetInnerHTML={{ __html: cardContent }}
                        />
                      </TechPanel>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
        <ServiceCTA />
      </div>

      <Footer />
    </div>
  );
};
