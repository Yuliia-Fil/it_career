export interface Skill {
  id: string;
  name: string;
  category: 'hard' | 'soft';
  level: number; // 0-100
}

export interface Requirement {
  skillId: string;
  minLevel: number;
  importance: 'must-have' | 'nice-to-have';
}

export interface Position {
  id: string;
  title: string;
  department: string;
  unit: string;
  description: string;
  detailedDescription: string; // What the person specifically does
  requirements: Requirement[];
  isVacant?: boolean;
  salaryRange?: string;
  employeeCount: number; // Number of people in this role
  currentEmployees: string[]; // List of names
  parentId?: string; // For hierarchy
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  date: string;
  read: boolean;
}

export interface DevelopmentTask {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  currentPositionId: string;
  skills: Skill[];
  personalSkillIds: string[]; // IDs of skills added by the user
  certificates: string[];
  performance: number; // 0-5
  avatar?: string;
  goals: string[]; // Array of position IDs (Saved)
  appliedPositions: string[]; // Array of position IDs
  developmentPlan: DevelopmentTask[];
  // New fields for Dashboard Header
  tenure: string; // Time in current position
  annualRating: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  idpCompletion: number; // %
  languageLevels: Record<string, string>; // e.g., { 'English': 'B2', 'German': 'A1' }
  readiness: number; // % readiness for next position
  isFavorite?: boolean;
}

export interface SkillData {
  name: string;
  category: 'hard' | 'soft';
}

export const SKILL_REGISTRY: Record<string, SkillData> = {
  'react': { name: 'React.js', category: 'hard' },
  'typescript': { name: 'TypeScript', category: 'hard' },
  'node': { name: 'Node.js', category: 'hard' },
  'sql': { name: 'SQL', category: 'hard' },
  'k8s': { name: 'Kubernetes', category: 'hard' },
  'docker': { name: 'Docker', category: 'hard' },
  'aws': { name: 'AWS', category: 'hard' },
  'java': { name: 'Java', category: 'hard' },
  'spring': { name: 'Spring Boot', category: 'hard' },
  'python': { name: 'Python', category: 'hard' },
  'go': { name: 'Go', category: 'hard' },
  'figma': { name: 'Figma', category: 'hard' },
  'soft-comm': { name: 'Комунікація', category: 'soft' },
  'soft-lead': { name: 'Лідерство', category: 'soft' },
  'soft-time': { name: 'Тайм-менеджмент', category: 'soft' },
  'public-speaking': { name: 'Публічні виступи', category: 'soft' },
};

export const MOCK_SKILLS: Record<string, string> = Object.entries(SKILL_REGISTRY).reduce((acc, [id, data]) => {
  acc[id] = data.name;
  return acc;
}, {} as Record<string, string>);

export const MOCK_POSITIONS: Position[] = [
  {
    id: 'dev-sr-react',
    title: 'Senior Frontend Developer',
    department: 'Розробка',
    unit: 'Frontend',
    description: 'Провідний фронтенд-розробник, відповідальний за архітектуру та менторство.',
    detailedDescription: 'Визначення технологічного стеку проектів, розробка високонавантажених архітектурних рішень, менторство Middle та Junior розробників, взаємодія з бізнес-стейкхолдерами для уточнення вимог.',
    requirements: [
      { skillId: 'react', minLevel: 90, importance: 'must-have' },
      { skillId: 'typescript', minLevel: 85, importance: 'must-have' },
      { skillId: 'soft-lead', minLevel: 70, importance: 'must-have' },
      { skillId: 'k8s', minLevel: 50, importance: 'nice-to-have' },
    ],
    isVacant: true,
    employeeCount: 3,
    currentEmployees: ['Алекс Рівера', 'Оскар Мартінес'],
  },
  {
    id: 'dev-mid-react',
    title: 'Middle Frontend Developer',
    department: 'Розробка',
    unit: 'Frontend',
    description: 'Досвідчений фронтенд-розробник, що створює складні функції.',
    detailedDescription: 'Проектування та реалізація складних клієнтських модулів, оптимізація продуктивності додатків, проведення Code Review для молодших колег, участь у плануванні архітектури проектів.',
    requirements: [
      { skillId: 'react', minLevel: 70, importance: 'must-have' },
      { skillId: 'typescript', minLevel: 60, importance: 'must-have' },
      { skillId: 'soft-comm', minLevel: 60, importance: 'must-have' },
      { skillId: 'docker', minLevel: 40, importance: 'nice-to-have' },
    ],
    employeeCount: 8,
    currentEmployees: ['Юлія Філь', 'Дуайт Шрут', 'Анжела Мартін'],
    parentId: 'dev-sr-react',
  },
  {
    id: 'dev-mid-react-specialized',
    title: 'Middle Frontend Developer (Performance)',
    department: 'Розробка',
    unit: 'Frontend',
    description: 'Спеціаліст з оптимізації продуктивності.',
    detailedDescription: 'Глибокий аналіз продуктивності додатків, впровадження складних стратегій кешування, робота з Web Workers та оптимізація рендерингу.',
    requirements: [
      { skillId: 'react', minLevel: 75, importance: 'must-have' },
      { skillId: 'typescript', minLevel: 70, importance: 'must-have' },
      { skillId: 'soft-comm', minLevel: 50, importance: 'must-have' },
    ],
    employeeCount: 2,
    currentEmployees: ['Стенлі Хадсон'],
    parentId: 'dev-sr-react',
  },
  {
    id: 'dev-jr-react',
    title: 'Junior Frontend Developer',
    department: 'Розробка',
    unit: 'Frontend',
    description: 'Початкова роль у фронтенд-розробці, фокус на UI-компонентах.',
    detailedDescription: 'Розробка та підтримка простих інтерфейсів користувача, написання юніт-тестів для компонентів, виправлення багів у існуючому коді під наглядом ментора.',
    requirements: [
      { skillId: 'react', minLevel: 40, importance: 'must-have' },
      { skillId: 'typescript', minLevel: 30, importance: 'must-have' },
      { skillId: 'soft-comm', minLevel: 50, importance: 'must-have' },
    ],
    employeeCount: 12,
    currentEmployees: ['Майкл Скотт', 'Джим Халперт', 'Пем Бізлі'],
    parentId: 'dev-mid-react',
  },
  {
    id: 'dev-jr-react-intern',
    title: 'Frontend Intern',
    department: 'Розробка',
    unit: 'Frontend',
    description: 'Стажер у фронтенд-команді.',
    detailedDescription: 'Навчання основам розробки, допомога у написанні документації, виконання дрібних завдань з верстки.',
    requirements: [
      { skillId: 'react', minLevel: 20, importance: 'must-have' },
    ],
    employeeCount: 5,
    currentEmployees: ['Раян Говард'],
    parentId: 'dev-mid-react-specialized',
  },
  {
    id: 'dev-mid-node',
    title: 'Middle Backend Developer',
    department: 'Розробка',
    unit: 'Backend',
    description: 'Бекенд-розробник, що спеціалізується на сервісах Node.js.',
    detailedDescription: 'Розробка масштабованих API на Node.js, проектування схем баз даних, інтеграція з хмарними сервісами, забезпечення безпеки та цілісності даних.',
    requirements: [
      { skillId: 'node', minLevel: 70, importance: 'must-have' },
      { skillId: 'sql', minLevel: 60, importance: 'must-have' },
      { skillId: 'docker', minLevel: 50, importance: 'must-have' },
    ],
    employeeCount: 6,
    currentEmployees: ['Сара Чен', 'Кевін Мелоун'],
  },
  {
    id: 'devops-eng',
    title: 'DevOps Engineer',
    department: 'Розробка',
    unit: 'Інфраструктура',
    description: 'Спеціаліст з інфраструктури.',
    detailedDescription: 'Налаштування CI/CD процесів, управління кластерами Kubernetes, моніторинг стану систем, автоматизація розгортання додатків у хмарних середовищах.',
    requirements: [
      { skillId: 'k8s', minLevel: 80, importance: 'must-have' },
      { skillId: 'aws', minLevel: 70, importance: 'must-have' },
      { skillId: 'docker', minLevel: 80, importance: 'must-have' },
    ],
    employeeCount: 4,
    currentEmployees: ['Келлі Капур'],
    parentId: 'dev-mid-node',
  },
];

export const INITIAL_USER: Employee = {
  id: 'user-1',
  name: 'Юлія Філь',
  email: 'filyulia.YF@gmail.com',
  currentPositionId: 'dev-mid-react',
  performance: 4.8,
  avatar: 'https://picsum.photos/seed/yulia/200/200',
  goals: [],
  appliedPositions: [],
  developmentPlan: [
    { id: 't1', title: 'Пройти курс Advanced TypeScript', status: 'in-progress', dueDate: '2026-05-15' },
    { id: 't2', title: 'Менторство Junior розробника', status: 'todo', dueDate: '2026-06-01' },
    { id: 't3', title: 'Оптимізація Frontend Build Pipeline', status: 'todo', dueDate: '2026-07-10' },
  ],
  skills: [
    { id: 'react', name: 'React.js', category: 'hard', level: 75 },
    { id: 'typescript', name: 'TypeScript', category: 'hard', level: 65 },
    { id: 'soft-comm', name: 'Комунікація', category: 'soft', level: 80 },
    { id: 'docker', name: 'Docker', category: 'hard', level: 45 },
    { id: 'sql', name: 'SQL', category: 'hard', level: 30 },
    { id: 'figma', name: 'Figma', category: 'hard', level: 60 },
    { id: 'public-speaking', name: 'Публічні виступи', category: 'soft', level: 40 },
  ],
  personalSkillIds: ['figma', 'public-speaking'],
  certificates: ['AWS Certified Cloud Practitioner', 'Meta Front-End Developer Professional Certificate'],
  tenure: '2 роки 4 місяці',
  annualRating: 'A+',
  idpCompletion: 65,
  languageLevels: { 'Англійська': 'B2', 'Німецька': 'A1' },
  readiness: 75,
};

export const MOCK_USERS: Employee[] = [
  INITIAL_USER,
  {
    id: 'user-2',
    name: 'Алекс Рівера',
    email: 'alex.r@company.com',
    currentPositionId: 'dev-sr-react',
    performance: 4.9,
    avatar: 'https://picsum.photos/seed/alex/200/200',
    goals: [],
    appliedPositions: [],
    developmentPlan: [],
    skills: [
      { id: 'react', name: 'React.js', category: 'hard', level: 95 },
      { id: 'typescript', name: 'TypeScript', category: 'hard', level: 90 },
      { id: 'soft-lead', name: 'Лідерство', category: 'soft', level: 85 },
    ],
    personalSkillIds: [],
    certificates: [],
    tenure: '4 роки',
    annualRating: 'A+',
    idpCompletion: 90,
    languageLevels: { 'Англійська': 'C1' },
    readiness: 100,
  },
  {
    id: 'user-3',
    name: 'Сара Чен',
    email: 'sarah.c@company.com',
    currentPositionId: 'dev-mid-node',
    performance: 4.7,
    avatar: 'https://picsum.photos/seed/sarah/200/200',
    goals: [],
    appliedPositions: [],
    developmentPlan: [],
    skills: [
      { id: 'node', name: 'Node.js', category: 'hard', level: 85 },
      { id: 'sql', name: 'SQL', category: 'hard', level: 80 },
      { id: 'docker', name: 'Docker', category: 'hard', level: 70 },
    ],
    personalSkillIds: [],
    certificates: [],
    tenure: '1 рік 8 місяців',
    annualRating: 'A',
    idpCompletion: 50,
    languageLevels: { 'Англійська': 'B2', 'Китайська': 'C2' },
    readiness: 40,
  },
  {
    id: 'user-4',
    name: 'Майкл Скотт',
    email: 'michael.s@company.com',
    currentPositionId: 'dev-jr-react',
    performance: 4.2,
    avatar: 'https://picsum.photos/seed/michael/200/200',
    goals: [],
    appliedPositions: [],
    developmentPlan: [],
    skills: [
      { id: 'react', name: 'React.js', category: 'hard', level: 50 },
      { id: 'soft-comm', name: 'Комунікація', category: 'soft', level: 95 },
    ],
    personalSkillIds: [],
    certificates: [],
    tenure: '6 місяців',
    annualRating: 'B+',
    idpCompletion: 30,
    languageLevels: { 'Англійська': 'B1' },
    readiness: 20,
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Нова вакансія',
    message: 'Позиція Senior Frontend Developer тепер відкрита у вашому департаменті.',
    type: 'info',
    date: '2 години тому',
    read: false
  },
  {
    id: '2',
    title: 'Навичка підтверджена',
    message: 'Ваша навичка TypeScript була підтверджена Lead розробником.',
    type: 'success',
    date: 'Вчора',
    read: true
  }
];

