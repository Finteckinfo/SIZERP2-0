import {
  CircleIcon,
  WindmillIcon,
  TypographyIcon,
  ShadowIcon,
  PaletteIcon,
  KeyIcon,
  BugIcon,
  DashboardIcon,
  BrandChromeIcon,
  HelpIcon,
  MessageIcon,
  ChartBarIcon,
  CalendarIcon,
  UsersIcon,
  FileTextIcon,
  SettingsIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  BuildingIcon,
  ClipboardIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  { header: 'Dashboard' },
  {
    title: 'Dashboard',
    icon: DashboardIcon,
    to: '/dashboard/default'
  },
  {divider: true},
  { header: 'Pages' },
  {
    title: 'Project',
    icon: KeyIcon,
    to: '/projects',
    children: [
      {
        title: 'Create Project',
        icon: CircleIcon,
        to: '/projects/create'
      },
      {
        title: 'My Projects',
        icon: CircleIcon,
        to: '/projects'
      }
    ]
  },
  { divider: true },
  { header: 'Communication' },
  {
    title: 'Messages',
    icon: MessageIcon,
    to: ''
  },
  {
    title: 'Team Chat',
    icon: UsersIcon,
    to: ''
  },
  { divider: true },
  { header: 'Analytics & Reports' },
  {
    title: 'Analytics',
    icon: ChartBarIcon,
    to: ''
  },
  {
    title: 'Reports',
    icon: FileTextIcon,
    to: ''
  },
  {
    title: 'Performance Metrics',
    icon: ChartBarIcon,
    to: ''
  },
  { divider: true },
  { header: 'Task Management' },
  {
    title: 'Task Calendar',
    icon: CalendarIcon,
    to: ''
  },
  {
    title: 'Project Tasks',
    icon: ClipboardIcon,
    to: ''
  },
  {
    title: 'Kanban Board',
    icon: BrandChromeIcon,
    to: ''
  },
  { divider: true },
  { header: 'Business Operations' },
  {
    title: 'CRM',
    icon: UsersIcon,
    to: ''
  },
  {
    title: 'Inventory',
    icon: ShoppingCartIcon,
    to: ''
  },
  {
    title: 'Finance',
    icon: CreditCardIcon,
    to: ''
  },
  {
    title: 'HR Management',
    icon: BuildingIcon,
    to: ''
  },
  { divider: true },
  { divider: true },
  {
    title: 'Sample Page',
    icon: BrandChromeIcon,
    to: '/starter'
  },
  { divider: true },
  { header: 'System' },
  {
    title: 'Settings',
    icon: SettingsIcon,
    to: ''
  },
  {
    title: 'Help & Support',
    icon: HelpIcon,
    to: ''
  }
];

export default sidebarItem;
