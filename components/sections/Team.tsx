import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TechPanel } from '../ui/TechPanel';
import { User, Cpu, Activity, Zap, Eye, Share2, Workflow } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  description: string;
  icon: React.FC<any>;
  image: string;
  delay: number;
  order: number;
}

interface WpTeamMember {
  id: number;
  menu_order?: number;
  title?: {
    rendered?: string;
  };
  content?: {
    rendered?: string;
  };
  acf?: {
    name?: string;
    role?: string;
    description?: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
    }>;
  };
}

const teamIcons = [User, Activity, Share2, Cpu, Zap, Eye, Workflow];

const decodeHtml = (text: string) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = text;
  return txt.value;
};

const stripHtml = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const wpApi = import.meta.env.VITE_WP_API;
        const response = await fetch(`${wpApi}/team?_embed`);

        if (!response.ok) {
          throw new Error(`Failed to fetch team members: ${response.status}`);
        }

        const data: WpTeamMember[] = await response.json();

        const sortedData = [...data].sort(
          (a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0)
        );

        const mappedTeam = sortedData.map((member, index) => ({
          name: decodeHtml(
            member.acf?.name ||
              member.title?.rendered ||
              'Unnamed Member'
          ),
          role: decodeHtml(member.acf?.role || ''),
          description: decodeHtml(
            member.acf?.description ||
              stripHtml(member.content?.rendered || '')
          ),
          icon: teamIcons[index % teamIcons.length],
          image:
            member._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
            '/images/team/default-member.png',
          delay: index * 0.1,
          order: member.menu_order ?? 0,
        }));

        setTeamMembers(mappedTeam);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <section className="container mx-auto px-6 mb-32 relative">
      <div className="text-center mb-16">
        <span className="text-accent font-mono text-xs tracking-widest uppercase">
          Command Structure
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-white mt-4">
          Elite Squad
        </h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          The humans behind the machines. Orchestrating the future of work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teamMembers.map((member, index) => (
          <motion.div
            key={`${member.name}-${member.order}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: member.delay }}
            
          >
            <TechPanel
              className="h-full p-6 hover:border-primary-DEFAULT/50 transition-colors group relative overflow-hidden"
              animateScan={false}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <member.icon className="w-24 h-24 text-primary-DEFAULT" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-primary-DEFAULT/30 shadow-[0_0_15px_-5px_var(--primary)] group-hover:scale-105 transition-transform duration-500 bg-white/5 flex items-center justify-center">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-500" />
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-primary-DEFAULT/10 border border-primary-DEFAULT/20 flex items-center justify-center text-primary-light">
                    <member.icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-light transition-colors">
                  {member.name}
                </h3>
                <div className="text-xs font-mono text-accent uppercase tracking-wider mb-4">
                  {member.role}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed flex-grow">
                  {member.description}
                </p>

                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                  <div className="h-1 w-8 bg-primary-DEFAULT/30 rounded-full" />
                  <div className="h-1 w-2 bg-primary-DEFAULT/30 rounded-full" />
                </div>
              </div>
            </TechPanel>
          </motion.div>
        ))}
      </div>
    </section>
  );
};