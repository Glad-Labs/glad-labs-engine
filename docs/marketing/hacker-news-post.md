Show HN: I built a self-operating AI content business in a weekend for $30/month

I'm a geotechnical engineer by day. Last weekend I sat down with Claude Code and built a fully autonomous content pipeline that generates, reviews, publishes, and monitors AI-written blog posts — all running on my PC's RTX 5090 and a $5/month Railway backend.

What it does:

- Content pipeline: Research → Draft (Ollama local) → QA scoring → Anti-hallucination validator → Cross-model review (Claude critiques Ollama's work) → SEO metadata → Publish
- Self-healing: Hourly health checks, auto-restarts, Grafana alerts to my phone
- Multi-model QA: Different LLMs check each other's work (different training data = different blind spots)
- Real-time monitoring: GPU utilization, electricity costs ($0.29/kWh RI Energy rates), quality scores — all on Grafana dashboards I check from my phone
- Notifications: Every post that publishes sends me a Telegram message and posts to Discord
- 64 blog posts live at gladlabs.io with internal linking, SEO keywords, and affiliate links

The stack:

- FastAPI backend on Railway ($5/mo)
- Next.js frontend on Vercel (free)
- PostgreSQL on Railway (included)
- Ollama + glm-4.7-5090 on local RTX 5090 (~$9/mo electricity)
- Grafana Cloud (free tier)
- Claude Code for development and self-healing cron jobs

Total monthly cost: ~$30

What I learned:

1. The UI was the wrong problem. I spent 6 months building dashboards. In one weekend of "just make it work from my phone" I got further than those 6 months combined.
2. Multi-model QA is the real unlock. Having Claude review Ollama's drafts catches hallucinations that self-review misses entirely.
3. Anti-hallucination needs hard rules, not just prompts. Programmatic pattern matching (fake names, invented statistics) catches what LLM-based QA doesn't.
4. Electricity tracking matters. Your "free" local GPU costs real money. At $0.29/kWh my 5090 costs ~$9/month running 24/7.
5. The best architecture is the one that lets you sleep. Self-healing > perfect code.

The pipeline ran overnight with zero intervention. 9 consecutive health checks passed. The system generated content, published it, sent me notifications, and I woke up to a working business.

Code is at github.com/Glad-Labs/glad-labs-codebase (will be opening parts of it soon).

Live site: gladlabs.io

Happy to answer questions about the architecture, costs, or how to build something similar.
