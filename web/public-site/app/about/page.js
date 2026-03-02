import Link from 'next/link';
import { OrganizationSchema } from '../../components/StructuredData';

export const metadata = {
  title: 'About Glad Labs - AI Co-Founder Systems & Autonomous Agents',
  description:
    'Glad Labs builds production-ready AI orchestration systems and autonomous agent fleets. We combine cutting-edge LLM routing, self-critiquing pipelines, and enterprise-grade persistence to power intelligent automation at scale.',
  keywords: [
    'AI orchestration',
    'autonomous agents',
    'AI co-founder',
    'LLM routing',
    'content intelligence',
    'multi-provider LLM',
    'AI agents',
    'intelligent automation',
    'FastAPI',
    'enterprise AI',
  ],
  openGraph: {
    title: 'About Glad Labs',
    description:
      'Building the future of AI orchestration. Autonomous agents, intelligent routing, and production-ready systems for enterprise automation.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <>
      <OrganizationSchema />
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                About Glad Labs
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-4 leading-relaxed font-semibold">
              AI Co-Founder Systems for Enterprise Automation
            </p>
            <p className="text-lg text-slate-400 leading-relaxed">
              We build production-ready AI orchestration platforms that deploy
              autonomous agent fleets to automate complex workflows, generate
              intelligent insights, and scale human expertise.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              {/* Mission Content */}
              <div className="order-2 md:order-1">
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Our Mission
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  We believe the future of enterprise automation belongs to
                  AI-driven orchestration platforms that combine autonomous
                  intelligence with human oversight. Most companies struggle
                  with fragmented AI tooling, vendor lock-in, and unpredictable
                  costs.
                </p>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  Glad Labs solves this by providing{' '}
                  <strong>production-ready agent orchestration systems</strong>{' '}
                  that seamlessly integrate multiple LLM providers, eliminate
                  vendor dependency through intelligent routing, and deliver
                  measurable business outcomes—all while maintaining cost
                  efficiency and compliance.
                </p>
                <p className="text-slate-400 text-base">
                  Our mission: empower enterprises to deploy AI capabilities at
                  scale without the complexity, cost, and risk that typically
                  comes with multi-provider AI systems.
                </p>
              </div>

              {/* Mission Visual */}
              <div className="order-1 md:order-2">
                <div className="relative h-80 rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-800/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10" />
                  <div className="relative text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-cyan-400 font-semibold">
                      AI-Powered Innovation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Values Section */}
            <div className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-2xl border border-slate-700/50 p-8 md:p-12 mb-20">
              <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Our Core Values
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Production-Ready */}
                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-colors">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Production-Ready
                  </h3>
                  <p className="text-slate-400">
                    We don't experiment in production. Every system we build is
                    battle-tested, fully documented, and deployable with
                    confidence. Enterprise-grade reliability, no compromises.
                  </p>
                </div>

                {/* Cost Efficiency */}
                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-colors">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Cost Efficiency
                  </h3>
                  <p className="text-slate-400">
                    Intelligent multi-provider routing means you pay for what
                    you need—optimizing between local Ollama, affordable models,
                    and premium APIs based on task requirements, not arbitrary
                    vendor decisions.
                  </p>
                </div>

                {/* No Vendor Lock-in */}
                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-colors">
                  <div className="text-4xl mb-4">🔓</div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Freedom & Flexibility
                  </h3>
                  <p className="text-slate-400">
                    Open-source foundation with AGPL-3.0 licensing. Switch
                    providers, customize agents, or self-host without
                    negotiating with vendors. Your AI infrastructure, your
                    control.
                  </p>
                </div>
              </div>
            </div>

            {/* What We Do Section */}
            <div className="mb-20">
              <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Our Platform Capabilities
              </h2>

              <div className="space-y-8">
                {/* Autonomous Agent Orchestration */}
                <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-800/70">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
                        <span className="text-xl">🤖</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        Autonomous Agent Fleet Orchestration
                      </h3>
                      <p className="text-slate-300 text-lg">
                        Specialized agent types working together: Content agents
                        for intelligent content generation with self-critique
                        loops, Financial agents for cost tracking and ROI
                        analysis, Market Insight agents for trend analysis and
                        competitive intelligence, and Compliance agents for
                        legal and regulatory review. Agents communicate
                        asynchronously, maintain shared context, and solve
                        complex multi-step problems autonomously.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Self-Critiquing Content Pipeline */}
                <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-800/70">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
                        <span className="text-xl">📝</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        Self-Critiquing Content Pipeline
                      </h3>
                      <p className="text-slate-300 text-lg">
                        Six-stage intelligent content generation: Research
                        (background gathering), Creative (draft generation with
                        brand voice), QA (technical critique without rewriting),
                        Refinement (agent-driven improvement), Visual
                        Integration (media selection and optimization), and
                        Publishing (CMS integration and SEO optimization). Each
                        piece is quality-gated and optimized for engagement,
                        searchability, and brand consistency.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Intelligent Multi-Provider Routing */}
                <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-800/70">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
                        <span className="text-xl">⚡</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        Intelligent Multi-Provider LLM Routing
                      </h3>
                      <p className="text-slate-300 text-lg">
                        Automatic provider fallback chain: Ollama (local,
                        cost-free), Anthropic Claude (configurable), OpenAI
                        GPT-4, and Gemini. The router selects the optimal model
                        based on task complexity, latency requirements, and cost
                        efficiency. No vendor lock-in—switch providers without
                        code changes. Configurable cost tiers from ultra-cheap
                        to premium multi-model ensembles.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enterprise Data Persistence */}
                <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-800/70">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
                        <span className="text-xl">🔐</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        Enterprise Data Persistence & Compliance
                      </h3>
                      <p className="text-slate-300 text-lg">
                        PostgreSQL-backed infrastructure ensures complete audit
                        trails, GDPR compliance, and queryable persistence of
                        all agent actions, memories, and results. Financial
                        tracking, analytics dashboards, and compliance reporting
                        built in. All data remains under your control—no
                        external logging or monitoring without explicit
                        configuration.
                      </p>
                    </div>
                  </div>
                </div>

                {/* REST API */}
                <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-800/70">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
                        <span className="text-xl">🔗</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        Comprehensive REST API & WebSocket Support
                      </h3>
                      <p className="text-slate-300 text-lg">
                        18+ route modules exposing full platform capabilities:
                        task management, agent coordination, model routing,
                        real-time chat, workflow history, analytics, webhooks,
                        and CMS integration. WebSocket support for real-time
                        agent communication and updates. Complete OpenAPI
                        documentation for easy integration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack Section */}
            <div className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-2xl border border-slate-700/50 p-8 md:p-12 mb-20">
              <h2 className="text-3xl font-bold mb-8 text-white">
                Our Technology Stack
              </h2>
              <p className="text-slate-300 mb-8">
                Production-grade infrastructure across AI orchestration,
                multi-provider routing, and full-stack web delivery.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">
                    AI Orchestration & Backend
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>
                      ✓ FastAPI (Python) - Async API with 18+ route modules
                    </li>
                    <li>
                      ✓ PostgreSQL - Enterprise persistence & audit trails
                    </li>
                    <li>✓ Ollama - Local LLM inference (zero-cost)</li>
                    <li>✓ OpenAI & Anthropic APIs - Premium models</li>
                    <li>✓ Google Gemini - Multi-provider router fallback</li>
                    <li>✓ MCP Integration - Model Context Protocol</li>
                    <li>✓ Uvicorn - Production ASGI server</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">
                    Frontend & Client Interfaces
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>✓ Next.js 15 - Next-generation React framework</li>
                    <li>✓ React 18 - Component-based UI architecture</li>
                    <li>✓ Tailwind CSS - Utility-first styling system</li>
                    <li>✓ Material-UI - Admin dashboard components</li>
                    <li>✓ TypeScript - End-to-end type safety</li>
                    <li>✓ WebSocket Support - Real-time updates</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">
                    Deployment & Infrastructure
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>✓ Vercel - Global CDN & edge functions</li>
                    <li>✓ Railway - Backend containerization</li>
                    <li>✓ Docker - Containerized deployments</li>
                    <li>✓ GitHub Actions - CI/CD automation</li>
                    <li>✓ Giscus - Community comments (GitHub)</li>
                    <li>✓ Sentry - Error tracking & monitoring</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-700/50">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">
                  Core Architectural Components
                </h3>
                <div className="grid md:grid-cols-2 gap-6 text-slate-300">
                  <div>
                    <p className="font-semibold text-white mb-2">
                      Three-Service Architecture
                    </p>
                    <p className="text-sm">
                      Monorepo with integrated FastAPI backend, Next.js public
                      site, and React admin dashboard—deployed independently for
                      scalability.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-2">
                      Cost-Optimized Routing
                    </p>
                    <p className="text-sm">
                      Intelligent fallback chain automatically selecting models
                      by cost tier, capability, and availability without manual
                      intervention.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-2">
                      Compliance & Security
                    </p>
                    <p className="text-sm">
                      AGPL-3.0 open-source, GDPR-compliant, with Content
                      Security Policy, OAuth integration, and complete audit
                      logging.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-2">
                      Testable & Observable
                    </p>
                    <p className="text-sm">
                      200+ unit tests, comprehensive logging, analytics
                      dashboards, and structured health checks across all
                      services.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6 text-white">
                Ready to Scale Your AI Operations?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Explore how Glad Labs orchestrates autonomous agents, optimizes
                LLM costs, and delivers enterprise-ready AI at scale.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/posts"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                >
                  Read Our Blog
                </Link>
                <Link
                  href="/"
                  className="px-8 py-4 border border-cyan-500/50 text-cyan-400 font-semibold rounded-xl hover:bg-cyan-500/10 transition-all duration-300"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
