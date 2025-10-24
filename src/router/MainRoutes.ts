const MainRoutes = {
  path: '/app',
  meta: { requiresAuth: true },
  redirect: '/app/dashboard/default',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    { name: 'LandingPage', path: '/app', component: () => import('@/views/dashboards/default/DefaultDashboard.vue') },
    { name: 'Default', path: '/app/dashboard/default', component: () => import('@/views/dashboards/default/DefaultDashboard.vue') },
    { name: 'CreateProject', path: '/app/projects/create', component: () => import('@/views/projects/CreateProjectProtected.vue') },
    { name: 'ProjectView', path: '/app/projects', component: () => import('@/views/projects/ProjectView.vue') },
    { name: 'ProjectDetails', path: '/app/projects/:id', component: () => import('@/views/projects/ProjectDetails.vue') },
    { name: 'ProjectWorkspace', path: '/app/projects/:id/workspace', component: () => import('@/views/projects/ProjectWorkspace.vue') },
    { name: 'FundEscrow', path: '/app/projects/:id/fund-escrow', component: () => import('@/views/projects/FundEscrow.vue') },
    { name: 'Starter', path: '/app/starter', component: () => import('@/views/StarterPage.vue') },
    { name: 'Tabler Icons', path: '/app/icons/tabler', component: () => import('@/views/utilities/icons/TablerIcons.vue') },
    { name: 'Material Icons', path: '/app/icons/material', component: () => import('@/views/utilities/icons/MaterialIcons.vue') },
    { name: 'Typography', path: '/app/utils/typography', component: () => import('@/views/utilities/typography/TypographyPage.vue') },
    { name: 'Shadows', path: '/app/utils/shadows', component: () => import('@/views/utilities/shadows/ShadowPage.vue') },
    { name: 'Colors', path: '/app/utils/colors', component: () => import('@/views/utilities/colors/ColorPage.vue') },
    { name: 'TaskCalendar', path: '/app/tasks/calendar', component: () => import('@/views/pages/tasks/taskCalender.vue') },
    { name: 'KanbanBoard', path: '/app/kanban', component: () => import('@/views/pages/kanban/KanbanBoard.vue') },
    { name: 'Analytics', path: '/app/analytics', component: () => import('@/views/pages/analytics/index.vue') },
    { name: 'Payments', path: '/app/payments', component: () => import('@/views/pages/payments/index.vue') },
    { name: 'Settings', path: '/app/settings', component: () => import('@/views/pages/settings/index.vue') },
    { name: 'Messages', path: '/app/messages', component: () => import('@/views/pages/communications/messages/index.vue') },
    { name: 'TeamChat', path: '/app/team-chat', component: () => import('@/views/pages/communications/teamChat/index.vue') }
  ]
};

export default MainRoutes;
