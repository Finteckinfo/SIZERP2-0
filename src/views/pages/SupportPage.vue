<template>
  <div class="support-page">
    <section class="support-hero">
      <p class="support-eyebrow">How can we help?</p>
      <h1>Dedicated SizLand Support Hub</h1>
      <p class="support-subtitle">
        Track tickets, browse curated tips, and reach our Web3 support team 24/7.
        This mock layout showcases how a future production support center could feel.
      </p>
      <div class="support-hero-actions">
        <v-btn color="primary" size="large" class="cta" @click="scrollTo('channels')">
          <v-icon class="mr-2">mdi-chat-processing-outline</v-icon>
          Start Live Chat
        </v-btn>
        <v-btn color="secondary" variant="outlined" size="large" class="cta" @click="scrollTo('faq')">
          <v-icon class="mr-2">mdi-frequently-asked-questions</v-icon>
          View FAQs
        </v-btn>
      </div>
      <div class="support-stats">
        <div v-for="stat in supportStats" :key="stat.label" class="support-stat">
          <div class="value">{{ stat.value }}</div>
          <div class="label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <section class="support-section" id="channels">
      <div class="section-heading">
        <h2>Popular Support Channels</h2>
        <p class="section-subtitle">Each option is wired to a mock data source so you can visualize the UX.</p>
      </div>
      <div class="grid channels-grid">
        <article v-for="channel in supportChannels" :key="channel.title" class="channel-card">
          <v-icon class="channel-icon">{{ channel.icon }}</v-icon>
          <h3>{{ channel.title }}</h3>
          <p>{{ channel.description }}</p>
          <ul class="channel-meta">
            <li><v-icon size="18" class="mr-1">mdi-clock-outline</v-icon>{{ channel.availability }}</li>
            <li><v-icon size="18" class="mr-1">mdi-sparkles</v-icon>{{ channel.sla }}</li>
          </ul>
          <v-btn :color="channel.ctaColor" size="small" variant="tonal">{{ channel.cta }}</v-btn>
        </article>
      </div>
    </section>

    <section class="support-section wide">
      <div class="section-heading with-actions">
        <div>
          <h2>Recent Tickets (Sample Data)</h2>
          <p class="section-subtitle">Use this block as reference for a future activity feed.</p>
        </div>
        <v-btn variant="text" color="primary">
          View Dashboard
          <v-icon class="ml-1">mdi-arrow-top-right</v-icon>
        </v-btn>
      </div>
      <v-table class="tickets-table">
        <thead>
          <tr>
            <th>Requester</th>
            <th>Subject</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in recentTickets" :key="ticket.id">
            <td>
              <div class="ticket-user">
                <div class="avatar">{{ ticket.initials }}</div>
                <div>
                  <div class="name">{{ ticket.name }}</div>
                  <div class="email">{{ ticket.email }}</div>
                </div>
              </div>
            </td>
            <td>{{ ticket.subject }}</td>
            <td>
              <v-chip :color="ticket.priorityColor" size="small" variant="flat" class="text-white">
                {{ ticket.priority }}
              </v-chip>
            </td>
            <td>
              <span class="status-pill" :class="ticket.statusClass">{{ ticket.status }}</span>
            </td>
            <td>{{ ticket.updated }}</td>
          </tr>
        </tbody>
      </v-table>
    </section>

    <section class="support-section" id="faq">
      <div class="section-heading">
        <h2>Knowledge Base & FAQs</h2>
        <p class="section-subtitle">Combine short answers with deep-dive articles and videos.</p>
      </div>
      <div class="grid faq-grid">
        <article v-for="faq in faqItems" :key="faq.question" class="faq-card">
          <p class="faq-category">{{ faq.category }}</p>
          <h3>{{ faq.question }}</h3>
          <p>{{ faq.answer }}</p>
          <v-btn color="primary" variant="text" class="mt-2">
            Read Article
            <v-icon class="ml-1">mdi-arrow-right</v-icon>
          </v-btn>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const scrollTo = (id: string) => {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const supportStats = [
  { label: 'Avg. initial response', value: '2m 18s' },
  { label: 'Tickets resolved (mock)', value: '1,247' },
  { label: 'Web3 payouts secured', value: '486' }
];

const supportChannels = [
  {
    icon: 'mdi-chat-processing-outline',
    title: 'Live Concierge',
    description: 'Talk to an operator about escrow releases, arbitration, or onboarding.',
    availability: '24/7 • Dedicated Web3 agents',
    sla: '~4 min median response',
    cta: 'Open Chat',
    ctaColor: 'primary'
  },
  {
    icon: 'mdi-wallet-outline',
    title: 'Wallet Desk',
    description: 'Mock flow for wallet linking issues and SIZ coin settlements.',
    availability: 'Mon–Sun 8am–11pm UTC',
    sla: 'Under 30 min resolution',
    cta: 'Schedule Call',
    ctaColor: 'secondary'
  },
  {
    icon: 'mdi-clipboard-text-outline',
    title: 'Project Escalations',
    description: 'Snapshot of how cross-team escalations can appear with context cards.',
    availability: 'Priority lanes for enterprise',
    sla: 'Dedicated PM follow-up',
    cta: 'Escalate Now',
    ctaColor: 'success'
  }
];

const recentTickets = [
  {
    id: 'TCK-2018',
    initials: 'JL',
    name: 'Jamal Lewis',
    email: 'jamal@sizteam.io',
    subject: 'Release next milestone escrow',
    priority: 'High',
    priorityColor: '#f97316',
    status: 'Awaiting Sign-off',
    statusClass: 'status-warning',
    updated: '2 minutes ago'
  },
  {
    id: 'TCK-2017',
    initials: 'AV',
    name: 'Ava Villar',
    email: 'ava@remotedev.xyz',
    subject: 'Node payout mismatch',
    priority: 'Critical',
    priorityColor: '#dc2626',
    status: 'Investigating',
    statusClass: 'status-danger',
    updated: '14 minutes ago'
  },
  {
    id: 'TCK-2016',
    initials: 'MK',
    name: 'Mika Kato',
    email: 'mika@sizcollective.com',
    subject: 'Need access to Kanban insights',
    priority: 'Medium',
    priorityColor: '#0ea5e9',
    status: 'Resolved',
    statusClass: 'status-success',
    updated: '32 minutes ago'
  }
];

const faqItems = [
  {
    category: 'Wallet & Security',
    question: 'How do I escrow SIZ coin for a new project?',
    answer: 'Use Wallet Desk to create a secure vault, auto-generate split rules, and nominate arbiters.'
  },
  {
    category: 'Team Operations',
    question: 'What happens when a contributor misses a sprint?',
    answer: 'SizLand automates partial holds and routes arbitration to your selected PM council.'
  },
  {
    category: 'Payments & Billing',
    question: 'Can I blend fiat and SIZ disbursements?',
    answer: 'Yes—hybrid payouts are simulated here. Final page can plug into your DeFi rails.'
  }
];

</script>

<style scoped lang="scss">
.support-page {
  min-height: 100vh;
  padding: 4rem 1.5rem 5rem;
  background: radial-gradient(circle at top, rgba(97, 95, 255, 0.12), transparent 60%), #050b1a;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.support-hero {
  text-align: center;
  max-width: 940px;
  margin: 0 auto;
}

.support-eyebrow {
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.support-hero h1 {
  font-size: clamp(2.8rem, 4vw, 3.6rem);
  margin-bottom: 1rem;
}

.support-subtitle {
  color: #cbd5f5;
  font-size: 1.18rem;
  line-height: 1.7;
}

.support-hero-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.support-stats {
  margin-top: 2.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.support-stat {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem;
}

.support-stat .value {
  font-size: 1.75rem;
  font-weight: 700;
}

.support-stat .label {
  color: #cbd5f5;
  font-size: 0.95rem;
  margin-top: 0.35rem;
}

.support-section {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 2.75rem;
}

.support-section.wide {
  overflow-x: auto;
}

.section-heading {
  margin-bottom: 2rem;
}

.with-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.section-heading h2 {
  margin: 0;
  font-size: 2rem;
}

.section-subtitle {
  color: #cbd5f5;
  margin-top: 0.35rem;
}

.grid {
  display: grid;
  gap: 1.5rem;
}

.channels-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.channel-card {
  padding: 1.75rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 280px;
}

.channel-icon {
  font-size: 2.4rem;
  color: var(--erp-accent-indigo, #615fff);
}

.channel-meta {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #a5b4fc;
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.tickets-table {
  border-radius: 18px;
  overflow: hidden;
  background: rgba(5, 12, 24, 0.5);
}

.tickets-table thead {
  background: rgba(255, 255, 255, 0.03);
}

.tickets-table th,
.tickets-table td {
  padding: 1rem 1.25rem !important;
}

.ticket-user {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.ticket-user .avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(97, 95, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.ticket-user .email {
  color: #94a3b8;
  font-size: 0.85rem;
}

.status-pill {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-success {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.status-warning {
  background: rgba(251, 189, 35, 0.2);
  color: #facc15;
}

.status-danger {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
}

.faq-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.faq-card {
  padding: 1.75rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  min-height: 240px;
}

.faq-category {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.75rem;
  color: #a5b4fc;
}

@media (max-width: 768px) {
  .support-section {
    padding: 2rem;
  }

  .tickets-table th,
  .tickets-table td {
    padding: 0.75rem !important;
  }

  .support-page {
    padding: 2.5rem 1rem 4rem;
  }
}
</style>

