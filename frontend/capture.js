import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const outputDir = 'f:/ProjectStandUp/docs/images';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function getBrowserExecutable() {
  const possiblePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const mockUser = {
  id: 'USR-101',
  name: 'Alex Morgan',
  email: 'man@escanav.com',
  role: 'MANAGER',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
  department: 'Engineering',
  hasCompletedTour: true
};

const mockDev = {
  id: 'USR-102',
  name: 'Rahul Sharma',
  email: 'rahul@escanav.com',
  role: 'DEVELOPER',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  department: 'Frontend Dev',
  hasCompletedTour: true
};

const mockTester = {
  id: 'USR-103',
  name: 'Priya Verma',
  email: 'priya@escanav.com',
  role: 'TESTER',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  department: 'QA & Testing',
  hasCompletedTour: true
};

const viewsToCapture = [
  { view: 'dashboard', role: 'MANAGER', user: mockUser, filename: '01_manager_dashboard.png' },
  { view: 'developer_workspace', role: 'DEVELOPER', user: mockDev, filename: '02_developer_workspace.png' },
  { view: 'tester_workspace', role: 'TESTER', user: mockTester, filename: '03_tester_workspace.png' },
  { view: 'kanban', role: 'MANAGER', user: mockUser, filename: '04_kanban_board.png' },
  { view: 'table', role: 'MANAGER', user: mockUser, filename: '05_table_view.png' },
  { view: 'backlog', role: 'MANAGER', user: mockUser, filename: '06_backlog_view.png' },
  { view: 'sprints', role: 'MANAGER', user: mockUser, filename: '07_sprint_management.png' },
  { view: 'issues', role: 'MANAGER', user: mockUser, filename: '08_issue_tracking.png' },
  { view: 'team', role: 'MANAGER', user: mockUser, filename: '09_team_members.png' },
  { view: 'chat', role: 'MANAGER', user: mockUser, filename: '10_team_chat.png' },
  { view: 'health', role: 'MANAGER', user: mockUser, filename: '11_health_analytics.png' },
  { view: 'settings', role: 'MANAGER', user: mockUser, filename: '12_settings_view.png' }
];

async function captureScreenshots() {
  const exePath = getBrowserExecutable();
  console.log('Using browser executable:', exePath || 'Default Puppeteer Chrome');

  const launchOpts = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };
  if (exePath) launchOpts.executablePath = exePath;

  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  const BASE_URL = 'http://localhost:3001';

  for (const item of viewsToCapture) {
    console.log(`Capturing ${item.view} (${item.filename})...`);
    
    // Navigate to page first
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    // Inject session state
    await page.evaluate((u, r, v) => {
      localStorage.setItem('standupflow_auth', 'true');
      localStorage.setItem('standupflow_user', JSON.stringify(u));
      localStorage.setItem('standupflow_role', r);
      localStorage.setItem('standupflow_view', v);
    }, item.user, item.role, item.view);

    // Reload page to render view
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const savePath = path.join(outputDir, item.filename);
    await page.screenshot({ path: savePath, fullPage: false });
    console.log(`Successfully saved: ${item.filename}`);
  }

  await browser.close();
  console.log('All real application screenshots captured successfully!');
}

captureScreenshots().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
