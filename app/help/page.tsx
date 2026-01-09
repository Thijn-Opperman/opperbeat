'use client';

import Sidebar from '../components/Sidebar';
import { HelpCircle, Music, FileSearch, Library, Layers, TrendingUp, ListMusic, Volume2, Settings, Info, Database, Code, Zap, BarChart3 } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function HelpPage() {
  const { t } = useI18n();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in-down">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                <HelpCircle className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">{t.help.title}</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">{t.help.subtitle}</p>
          </div>

          {/* Over de Applicatie */}
          <Section title={t.help.aboutTitle} description={t.help.aboutDescription}>
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title={t.help.feature1Title}
              description={t.help.feature1Description}
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title={t.help.feature2Title}
              description={t.help.feature2Description}
            />
            <FeatureCard
              icon={<Database className="w-5 h-5" />}
              title={t.help.feature3Title}
              description={t.help.feature3Description}
            />
            <FeatureCard
              icon={<Code className="w-5 h-5" />}
              title={t.help.feature4Title}
              description={t.help.feature4Description}
            />
          </Section>

          {/* Functionaliteiten per Pagina */}
          <Section title={t.help.featuresTitle} description={t.help.featuresDescription}>
            <FeaturePageCard
              icon={<BarChart3 className="w-5 h-5" />}
              title={t.nav.overview}
              route="/"
              description={t.help.overviewDescription}
              features={[
                t.help.overviewFeature1,
                t.help.overviewFeature2,
                t.help.overviewFeature3
              ]}
            />

            <FeaturePageCard
              icon={<FileSearch className="w-5 h-5" />}
              title={t.nav.musicAnalysis}
              route="/analyze"
              description={t.help.analyzeDescription}
              features={[
                t.help.analyzeFeature1,
                t.help.analyzeFeature2,
                t.help.analyzeFeature3,
                t.help.analyzeFeature4,
                t.help.analyzeFeature5
              ]}
            />

            <FeaturePageCard
              icon={<Library className="w-5 h-5" />}
              title={t.nav.library}
              route="/library"
              description={t.help.libraryDescription}
              features={[
                t.help.libraryFeature1,
                t.help.libraryFeature2,
                t.help.libraryFeature3
              ]}
            />

            <FeaturePageCard
              icon={<Layers className="w-5 h-5" />}
              title={t.nav.mixesSets}
              route="/mixes"
              description={t.help.mixesDescription}
              features={[
                t.help.mixesFeature1,
                t.help.mixesFeature2,
                t.help.mixesFeature3
              ]}
            />

            <FeaturePageCard
              icon={<TrendingUp className="w-5 h-5" />}
              title={t.nav.analytics}
              route="/analytics"
              description={t.help.analyticsDescription}
              features={[
                t.help.analyticsFeature1,
                t.help.analyticsFeature2,
                t.help.analyticsFeature3
              ]}
            />

            <FeaturePageCard
              icon={<ListMusic className="w-5 h-5" />}
              title={t.nav.playlistBuilder}
              route="/playlists"
              description={t.help.playlistsDescription}
              features={[
                t.help.playlistsFeature1,
                t.help.playlistsFeature2,
                t.help.playlistsFeature3
              ]}
            />

            <FeaturePageCard
              icon={<Volume2 className="w-5 h-5" />}
              title={t.nav.soundSettings}
              route="/sound"
              description={t.help.soundDescription}
              features={[
                t.help.soundFeature1,
                t.help.soundFeature2,
                t.help.soundFeature3
              ]}
            />

            <FeaturePageCard
              icon={<Settings className="w-5 h-5" />}
              title={t.nav.profileSettings}
              route="/profile"
              description={t.help.profileDescription}
              features={[
                t.help.profileFeature1,
                t.help.profileFeature2,
                t.help.profileFeature3
              ]}
            />
          </Section>

          {/* Technische Details voor Docenten */}
          <Section title={t.help.technicalTitle} description={t.help.technicalDescription}>
            <TechCard
              title={t.help.tech1Title}
              items={[
                t.help.tech1Item1,
                t.help.tech1Item2,
                t.help.tech1Item3,
                t.help.tech1Item4
              ]}
            />
            <TechCard
              title={t.help.tech2Title}
              items={[
                t.help.tech2Item1,
                t.help.tech2Item2,
                t.help.tech2Item3
              ]}
            />
            <TechCard
              title={t.help.tech3Title}
              items={[
                t.help.tech3Item1,
                t.help.tech3Item2,
                t.help.tech3Item3
              ]}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 animate-fade-in-up">
      <h2 className="text-base font-medium text-[var(--text-primary)] mb-2">{title}</h2>
      <p className="text-[var(--text-secondary)] text-sm mb-4">{description}</p>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-[var(--surface)] rounded-[4px] p-4 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="text-[var(--primary)] flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">{title}</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function FeaturePageCard({ icon, title, route, description, features }: { 
  icon: React.ReactNode; 
  title: string; 
  route: string; 
  description: string; 
  features: string[];
}) {
  return (
    <div className="bg-[var(--surface)] rounded-[4px] p-4 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-[var(--primary)] flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">{title}</h3>
            <span className="text-xs text-[var(--text-muted)] font-mono">{route}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">{description}</p>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                <span className="text-[var(--primary)] mt-1">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TechCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-[var(--surface)] rounded-[4px] p-4 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up">
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
            <span className="text-[var(--accent)] mt-1 font-mono">→</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}



