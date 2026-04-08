import React, { useState } from 'react';
import { CareerGraph } from './components/CareerGraph';
import { SkillGapDrawer } from './components/SkillGapDrawer';
import { INITIAL_USER, Position, MOCK_POSITIONS, MOCK_SKILLS, MOCK_NOTIFICATIONS, Notification, MOCK_USERS, Employee } from './types';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  User, 
  Search, 
  Bell, 
  Settings,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  Filter,
  X,
  CheckCircle2,
  Info,
  Star,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Cpu,
  Plus,
  Trash2,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

type Tab = 'dashboard' | 'roadmap' | 'skills' | 'search';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(INITIAL_USER);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [toasts, setToasts] = useState<{id: string, message: string, type: 'success' | 'info'}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'favorites'>('all');

  const toggleFavorite = (employeeId: string) => {
    setUser(prev => {
      const isFavorite = prev.goals.includes(employeeId); // Reusing goals or adding a new field?
      // Actually, let's use a dedicated field if possible, but I added isFavorite to Employee type in types.ts.
      // However, the 'user' state is the current user. I should probably track favorites in the current user's state.
      // Let's add 'favorites' array to Employee interface in types.ts if not there, or use goals.
      // Wait, I added 'isFavorite' to Employee. But that's for the MOCK_USERS.
      // The current user should have a list of favorite user IDs.
      return prev;
    });
  };

  // Let's update MOCK_USERS locally or in state if we want persistence in the session.
  const [allUsers, setAllUsers] = useState(MOCK_USERS);

  const handleToggleFavorite = (targetUserId: string) => {
    setAllUsers(prev => prev.map(u => 
      u.id === targetUserId ? { ...u, isFavorite: !u.isFavorite } : u
    ));
    const targetUser = allUsers.find(u => u.id === targetUserId);
    addToast(targetUser?.isFavorite ? 'Вилучено з обраних' : 'Додано до обраних');
  };

  // Skills CRUD state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'hard' | 'soft'>('hard');
  const [newSkillLevel, setNewSkillLevel] = useState(50);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    
    if (editingSkillId) {
      setUser(prev => ({
        ...prev,
        skills: prev.skills.map(s => 
          s.id === editingSkillId 
            ? { ...s, name: newSkillName, category: newSkillCategory, level: newSkillLevel } 
            : s
        )
      }));
      setEditingSkillId(null);
      addToast('Навичку оновлено');
    } else {
      const skillId = `skill-${Date.now()}`;
      const newSkill = {
        id: skillId,
        name: newSkillName,
        category: newSkillCategory,
        level: newSkillLevel,
      };
      setUser(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill],
        personalSkillIds: [...prev.personalSkillIds, skillId]
      }));
      addToast('Навичку додано успішно');
    }
    
    setNewSkillName('');
    setNewSkillLevel(50);
    setIsAddingSkill(false);
  };

  const handleEditSkill = (skill: any) => {
    setNewSkillName(skill.name);
    setNewSkillCategory(skill.category);
    setNewSkillLevel(skill.level);
    setEditingSkillId(skill.id);
    setIsAddingSkill(true);
  };

  const handleDeleteSkill = (id: string) => {
    setUser(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id)
    }));
    addToast('Навичку видалено');
  };

  const addToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleNodeClick = (position: Position) => {
    setSelectedPosition(position);
    setIsDrawerOpen(true);
  };

  const handleAddGoal = (posId: string) => {
    if (!user.goals.includes(posId)) {
      setUser(prev => ({ ...prev, goals: [...prev.goals, posId] }));
      addToast('Додано до збережених позицій!');
    }
  };

  const handleApply = (posId: string) => {
    if (!user.appliedPositions.includes(posId)) {
      setUser(prev => ({ ...prev, appliedPositions: [...prev.appliedPositions, posId] }));
      addToast('Заявку успішно подано!', 'success');
    } else {
      addToast('Ви вже подали заявку на цю позицію', 'info');
    }
  };

  const handleViewUser = (userName: string) => {
    setSearchQuery(userName);
    setSearchFilter('all');
    setActiveTab('search');
    setIsDrawerOpen(false);
    setIsMobileMenuOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const currentPosition = MOCK_POSITIONS.find(p => p.id === user.currentPositionId);

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      MOCK_POSITIONS.find(p => p.id === u.currentPositionId)?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (searchFilter === 'favorites') {
      return matchesSearch && u.isFavorite;
    }
    return matchesSearch;
  });

  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);

  return (
    <div className="flex h-screen bg-surface text-on-surface font-sans overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Refined Colors */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 flex flex-col bg-surface-container-low z-50 transition-transform duration-300 lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center gap-4 bg-surface-container-low">
          <div className="w-10 h-10 hero-gradient rounded-xl flex items-center justify-center shadow-ambient">
            <MapIcon className="text-on-primary" size={20} />
          </div>
          <h1 className="font-headline font-bold text-xl tracking-tight text-on-surface">Navigator</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Дашборд" 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
          />
          <NavItem 
            icon={<MapIcon size={18} />} 
            label="Кар'єрний шлях" 
            active={activeTab === 'roadmap'} 
            onClick={() => { setActiveTab('roadmap'); setIsMobileMenuOpen(false); }}
          />
          <NavItem 
            icon={<User size={18} />} 
            label="Мої навички" 
            active={activeTab === 'skills'} 
            onClick={() => { setActiveTab('skills'); setIsMobileMenuOpen(false); }}
          />
          <NavItem 
            icon={<Search size={18} />} 
            label="Пошук талантів" 
            active={activeTab === 'search'} 
            onClick={() => { setActiveTab('search'); setIsMobileMenuOpen(false); }}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-surface min-w-0">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-surface-container rounded-xl lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1">Розробка</span>
              <h2 className="font-headline font-bold text-xl md:text-2xl text-on-surface capitalize">
                {activeTab === 'dashboard' ? 'Дашборд' : 
                 activeTab === 'roadmap' ? "Кар'єрний шлях" : 
                 activeTab === 'skills' ? 'Мої навички' : 'Пошук талантів'}
              </h2>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-6 md:px-10 pb-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto space-y-8 md:space-y-12 pt-6"
              >
                {/* Dashboard Header */}
                <ProfileHeader employee={user} position={currentPosition!} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-10">
                    {/* Applied Vacancies */}
                    <div className="bg-surface-container-low rounded-[2rem] p-8">
                      <h3 className="font-headline font-bold uppercase text-xs mb-8 flex items-center gap-3 text-on-surface">
                        <CheckCircle className="text-secondary" size={18} />
                        Подані вакансії
                      </h3>
                      <div className="space-y-4">
                        {user.appliedPositions.length > 0 ? (
                          user.appliedPositions.map(posId => {
                            const pos = MOCK_POSITIONS.find(p => p.id === posId);
                            return (
                              <div key={posId} className="flex items-center justify-between p-5 bg-surface-container-lowest rounded-2xl shadow-ambient">
                                <div>
                                  <p className="text-sm font-bold text-on-surface">{pos?.title}</p>
                                  <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-[0.05em] mt-1">{pos?.unit} Unit</p>
                                </div>
                                <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-xl">Подано</span>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-on-surface-variant text-center py-6 italic">Заявок ще немає</p>
                        )}
                      </div>
                    </div>

                    {/* Saved Positions */}
                    <div className="bg-surface-container-low rounded-[2rem] p-8">
                      <h3 className="font-headline font-bold uppercase text-xs mb-8 flex items-center gap-3 text-on-surface">
                        <Star className="text-primary" size={18} />
                        Збережені позиції
                      </h3>
                      <div className="space-y-4">
                        {user.goals.length > 0 ? (
                          user.goals.map(posId => {
                            const pos = MOCK_POSITIONS.find(p => p.id === posId);
                            return (
                              <div key={posId} className="flex items-center justify-between p-5 bg-surface-container-lowest rounded-2xl shadow-ambient">
                                <div>
                                  <p className="text-sm font-bold text-on-surface">{pos?.title}</p>
                                  <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-[0.05em] mt-1">{pos?.unit} Unit</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    setActiveTab('roadmap');
                                    handleNodeClick(pos!);
                                  }}
                                  className="text-[11px] font-bold text-primary hover:underline uppercase tracking-[0.05em]"
                                >
                                  Переглянути шлях
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-on-surface-variant text-center py-6 italic">Немає збережених позицій</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Development Plan */}
                  <div className="bg-surface-container-low rounded-[2rem] p-8">
                    <h3 className="font-headline font-bold uppercase text-xs mb-8 flex items-center gap-3 text-on-surface">
                      <Calendar className="text-tertiary" size={18} />
                      Мій план розвитку (ІПР)
                    </h3>
                    <div className="space-y-5">
                      {user.developmentPlan.map(task => (
                        <div key={task.id} className="p-6 bg-surface-container-lowest rounded-2xl shadow-ambient flex gap-5">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                            task.status === 'completed' ? "bg-secondary-container text-secondary" : 
                            task.status === 'in-progress' ? "bg-primary-container/20 text-primary" : "bg-surface-container text-on-surface-variant"
                          )}>
                            {task.status === 'completed' ? <CheckCircle2 size={24} /> : 
                             task.status === 'in-progress' ? <Clock size={24} /> : <Calendar size={24} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-bold text-on-surface">{task.title}</p>
                              <span className={cn(
                                "text-[9px] font-bold uppercase px-2 py-1 rounded-lg",
                                task.status === 'completed' ? "bg-secondary text-on-secondary" : 
                                task.status === 'in-progress' ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
                              )}>
                                {task.status === 'completed' ? 'Завершено' : task.status === 'in-progress' ? 'У процесі' : 'Треба зробити'}
                              </span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant mt-2 font-bold uppercase tracking-[0.05em]">Термін: {task.dueDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'roadmap' && (
              <motion.div 
                key="roadmap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full relative rounded-[3rem] overflow-hidden bg-surface-container-low"
              >
                <CareerGraph employee={user} onNodeClick={handleNodeClick} />
                
                <div className="absolute bottom-10 left-10 z-10">
                  <AnimatePresence>
                    {showLegend ? (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-surface-container-lowest p-6 shadow-ambient rounded-3xl relative ghost-border"
                      >
                        <button 
                          onClick={() => setShowLegend(false)}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-surface-container-lowest rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface shadow-ambient"
                        >
                          <X size={14} />
                        </button>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-4">Легенда</h4>
                        <div className="space-y-3">
                          <LegendItem color="bg-primary" label="Поточна позиція" />
                          <LegendItem color="bg-secondary" label="Відкрита вакансія" />
                          <LegendItem color="bg-primary/20 ring-1 ring-primary/50" label="Кар'єрна ціль" />
                          <LegendItem color="bg-outline-variant/50" label="Потенційний шлях" />
                        </div>
                      </motion.div>
                    ) : (
                      <button 
                        onClick={() => setShowLegend(true)}
                        className="bg-surface-container-lowest p-4 shadow-ambient rounded-2xl text-on-surface-variant hover:text-on-surface transition-all ghost-border"
                      >
                        <Info size={20} />
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div 
                key="skills"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto space-y-8 md:space-y-12 pt-6"
              >
                {/* Role Header */}
                <div className="bg-surface-container-low rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col gap-6 shadow-ambient border border-outline-variant/10">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="p-4 md:p-5 bg-primary/5 rounded-2xl md:rounded-3xl text-primary">
                      <Briefcase size={24} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                      <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-1 block">Поточна роль</span>
                      <h2 className="font-headline font-bold text-xl md:text-3xl text-on-surface">{currentPosition?.title}</h2>
                    </div>
                  </div>
                  <div className="pt-4 md:pt-6 border-t border-outline-variant/10">
                    <p className="text-on-surface-variant leading-relaxed text-xs md:text-sm">
                      {currentPosition?.detailedDescription}
                    </p>
                  </div>
                </div>

                {/* Job Skills Section */}
                <div className="space-y-6">
                  <h3 className="font-headline font-bold text-base md:text-lg text-on-surface flex items-center gap-3">
                    <Award size={20} className="text-primary" />
                    Навички для посади
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 border border-outline-variant/10">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-6">Hard Skills</h4>
                      <div className="space-y-6">
                        {user.skills.filter(s => s.category === 'hard' && !user.personalSkillIds.includes(s.id)).map(skill => (
                          <SkillBar key={skill.id} name={skill.name} level={skill.level} color="hero-gradient" />
                        ))}
                      </div>
                    </div>
                    <div className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 border border-outline-variant/10">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-6">Soft Skills</h4>
                      <div className="space-y-6">
                        {user.skills.filter(s => s.category === 'soft' && !user.personalSkillIds.includes(s.id)).map(skill => (
                          <SkillBar key={skill.id} name={skill.name} level={skill.level} color="bg-secondary" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Skills Section */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline font-bold text-base md:text-lg text-on-surface flex items-center gap-3">
                      <User size={20} className="text-secondary" />
                      Персональні навички
                    </h3>
                    <button 
                      onClick={() => setIsAddingSkill(true)}
                      className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary text-on-primary rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                    >
                      <Plus size={14} className="md:w-4 md:h-4" /> Додати
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 border border-outline-variant/10">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-6">Hard Skills</h4>
                      <div className="space-y-6">
                        {user.skills.filter(s => s.category === 'hard' && user.personalSkillIds.includes(s.id)).map(skill => (
                          <div key={skill.id} className="flex items-center gap-4">
                            <div className="flex-1">
                              <SkillBar name={skill.name} level={skill.level} color="hero-gradient" />
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleEditSkill(skill)}
                                className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                              >
                                <Settings size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 border border-outline-variant/10">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-6">Soft Skills</h4>
                      <div className="space-y-6">
                        {user.skills.filter(s => s.category === 'soft' && user.personalSkillIds.includes(s.id)).map(skill => (
                          <div key={skill.id} className="flex items-center gap-4">
                            <div className="flex-1">
                              <SkillBar name={skill.name} level={skill.level} color="bg-secondary" />
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleEditSkill(skill)}
                                className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                              >
                                <Settings size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificates & Languages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  <div className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 border border-outline-variant/10">
                    <h3 className="font-headline font-bold text-sm uppercase tracking-[0.05em] flex items-center gap-3 mb-6 md:mb-8">
                      <BookOpen size={18} className="text-tertiary" />
                      Сертифікати
                    </h3>
                    <div className="space-y-4">
                      {user.certificates.map((cert, idx) => (
                        <div key={idx} className="p-4 bg-surface-container-lowest rounded-2xl shadow-ambient flex items-center justify-between group">
                          <span className="text-sm font-medium text-on-surface">{cert}</span>
                          <button 
                            onClick={() => setUser(prev => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== idx) }))}
                            className="p-2 text-on-surface-variant hover:text-error md:opacity-0 md:group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const cert = prompt('Введіть назву сертифіката:');
                          if (cert) {
                            setUser(prev => ({ ...prev, certificates: [...prev.certificates, cert] }));
                            addToast('Сертифікат додано');
                          }
                        }}
                        className="w-full py-3 border-2 border-dashed border-outline-variant rounded-2xl text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant hover:border-primary hover:text-primary transition-all"
                      >
                        + Додати сертифікат
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 border border-outline-variant/10">
                    <h3 className="font-headline font-bold text-sm uppercase tracking-[0.05em] flex items-center gap-3 mb-6 md:mb-8">
                      <Users size={18} className="text-primary" />
                      Мови
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(user.languageLevels).map(([lang, level]) => (
                        <div key={lang} className="p-4 bg-surface-container-lowest rounded-2xl shadow-ambient flex items-center justify-between">
                          <span className="text-sm font-bold text-on-surface">{lang}</span>
                          <span className="text-xs font-bold bg-primary-container text-primary px-3 py-1 rounded-lg">{level}</span>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const lang = prompt('Введіть мову:');
                          const level = prompt('Введіть рівень (напр. B2):');
                          if (lang && level) {
                            setUser(prev => ({ 
                              ...prev, 
                              languageLevels: { ...prev.languageLevels, [lang]: level } 
                            }));
                            addToast('Мову додано');
                          }
                        }}
                        className="w-full py-3 border-2 border-dashed border-outline-variant rounded-2xl text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant hover:border-primary hover:text-primary transition-all"
                      >
                        + Додати мову
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div 
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto space-y-8 md:space-y-12 pt-6"
              >
                <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                      <input 
                        type="text" 
                        placeholder="Пошук за навичкою, ім'ям або посадою..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 md:py-5 bg-surface-container-low rounded-2xl md:rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface text-sm"
                      />
                    </div>
                    <div className="flex bg-surface-container-low p-1.5 rounded-2xl md:rounded-3xl overflow-x-auto no-scrollbar">
                      <button 
                        onClick={() => setSearchFilter('all')}
                        className={cn(
                          "px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-bold uppercase tracking-[0.1em] transition-all whitespace-nowrap",
                          searchFilter === 'all' ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                        )}
                      >
                        Всі
                      </button>
                      <button 
                        onClick={() => setSearchFilter('favorites')}
                        className={cn(
                          "px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-bold uppercase tracking-[0.1em] transition-all flex items-center gap-2 whitespace-nowrap",
                          searchFilter === 'favorites' ? "bg-surface-container-lowest text-secondary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                        )}
                      >
                        <Star size={14} fill={searchFilter === 'favorites' ? "currentColor" : "none"} />
                        Контакти
                      </button>
                    </div>
                    <button className="px-6 md:px-8 py-4 md:py-5 bg-surface-container-low rounded-2xl md:rounded-3xl font-bold uppercase text-[10px] md:text-[11px] tracking-[0.1em] flex items-center justify-center gap-3 hover:bg-surface-container transition-colors text-on-surface">
                      <Filter size={18} /> Фільтри
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredUsers.map(u => (
                    <div 
                      key={u.id} 
                      onClick={() => setSelectedUser(u)}
                      className="bg-surface-container-low rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-ambient hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-8">
                        <img 
                          src={u.avatar} 
                          alt={u.name} 
                          className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl object-cover shadow-ambient"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors text-base md:text-lg truncate">{u.name}</h4>
                          <p className="text-[9px] md:text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.1em] mt-1 truncate">
                            {MOCK_POSITIONS.find(p => p.id === u.currentPositionId)?.title}
                          </p>
                          <p className="text-[9px] md:text-[10px] text-primary font-bold mt-1 truncate">{u.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4 md:space-y-5">
                        <div className="flex justify-between items-center text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                          <span>Основні навички</span>
                          <span className="text-primary">Підтверджено</span>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-2.5">
                          {u.skills.slice(0, 3).map(skill => (
                            <span key={skill.id} className="text-[10px] md:text-[11px] font-bold bg-surface-container-lowest text-on-surface px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl shadow-ambient">
                              {skill.name}
                            </span>
                          ))}
                          {u.skills.length > 3 && (
                            <span className="text-[10px] md:text-[11px] font-bold text-on-surface-variant px-1 py-1">
                              +{u.skills.length - 3} більше
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-outline-variant/10 flex justify-between items-center">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="flex items-center gap-1.5 md:gap-2 text-secondary">
                            <Star size={14} fill="currentColor" />
                            <span className="text-xs md:text-sm font-headline font-bold">{u.performance}</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(u.id);
                            }}
                            className={cn(
                              "p-2 rounded-lg md:rounded-xl transition-all",
                              u.isFavorite ? "bg-secondary/10 text-secondary" : "bg-surface-container text-on-surface-variant hover:text-secondary"
                            )}
                          >
                            <Star size={16} fill={u.isFavorite ? "currentColor" : "none"} />
                          </button>
                        </div>
                        <button 
                          onClick={() => setSelectedUser(u)}
                          className="text-[10px] md:text-[11px] font-bold text-primary uppercase tracking-[0.1em] hover:underline"
                        >
                          Показати профіль
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Modal */}
        <AnimatePresence>
          {selectedUser && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedUser(null)}
                className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[60]"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-0 left-0 w-full h-full md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:h-auto md:max-h-[90vh] md:max-w-4xl bg-surface md:rounded-[3rem] shadow-ambient z-[70] overflow-y-auto scrollbar-hide"
              >
                <div className="p-6 md:p-10">
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                    <h3 className="font-headline font-bold text-lg md:text-xl text-on-surface">Профіль таланту</h3>
                    <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-surface-container rounded-xl transition-all">
                      <X size={24} />
                    </button>
                  </div>
                  <ProfileHeader 
                    employee={selectedUser} 
                    position={MOCK_POSITIONS.find(p => p.id === selectedUser.currentPositionId)!} 
                  />
                  
                  <div className="mt-6 md:mt-8 bg-surface-container-low rounded-2xl md:rounded-3xl p-6 md:p-8 border border-outline-variant/10">
                    <h4 className="font-headline font-bold text-sm uppercase tracking-[0.05em] flex items-center gap-3 mb-4 text-on-surface">
                      <Briefcase size={18} className="text-primary" />
                      Опис посади
                    </h4>
                    <p className="text-on-surface-variant leading-relaxed text-xs md:text-sm">
                      {MOCK_POSITIONS.find(p => p.id === selectedUser.currentPositionId)?.detailedDescription}
                    </p>
                  </div>

                  <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Hard Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.skills.filter(s => s.category === 'hard').map(s => (
                          <span key={s.id} className="px-3 py-1.5 bg-surface-container-low rounded-xl text-[10px] md:text-[11px] font-bold text-on-surface border border-outline-variant/10">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Soft Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.skills.filter(s => s.category === 'soft').map(s => (
                          <span key={s.id} className="px-3 py-1.5 bg-surface-container-low rounded-xl text-[10px] md:text-[11px] font-bold text-on-surface border border-outline-variant/10">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 md:mt-10 flex justify-end">
                    <button 
                      onClick={() => setSelectedUser(null)}
                      className="w-full md:w-auto px-8 py-4 bg-surface-container-high text-on-surface rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-surface-container-highest transition-all"
                    >
                      Закрити
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <SkillGapDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          position={selectedPosition}
          employee={user}
          onAddGoal={handleAddGoal}
          onApply={handleApply}
          onViewUser={handleViewUser}
        />

        {/* Add Skill Modal */}
        <AnimatePresence>
          {isAddingSkill && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddingSkill(false)}
                className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[80]"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-surface rounded-[2.5rem] shadow-ambient z-[90] overflow-hidden border border-outline-variant/10"
              >
                <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline font-bold text-lg md:text-xl text-on-surface">
                      {editingSkillId ? 'Редагувати навичку' : 'Додати навичку'}
                    </h3>
                    <button 
                      onClick={() => {
                        setIsAddingSkill(false);
                        setEditingSkillId(null);
                        setNewSkillName('');
                        setNewSkillLevel(50);
                      }} 
                      className="p-2 hover:bg-surface-container rounded-xl transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant ml-1">Назва навички</label>
                      <input 
                        type="text" 
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="Наприклад: GraphQL, Public Speaking..."
                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant ml-1">Категорія</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setNewSkillCategory('hard')}
                          className={`py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${newSkillCategory === 'hard' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
                        >
                          Hard
                        </button>
                        <button 
                          onClick={() => setNewSkillCategory('soft')}
                          className={`py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${newSkillCategory === 'soft' ? 'bg-secondary text-on-secondary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
                        >
                          Soft
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant ml-1">Рівень володіння</label>
                        <span className="text-sm font-bold text-primary">{newSkillLevel}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={newSkillLevel}
                        onChange={(e) => setNewSkillLevel(parseInt(e.target.value))}
                        className="w-full h-2 bg-surface-container-low rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={handleAddSkill}
                      className="w-full py-4 md:py-5 hero-gradient text-on-primary rounded-2xl font-headline font-bold text-sm uppercase tracking-[0.1em] transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                      {editingSkillId ? 'Зберегти зміни' : 'Додати навичку'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Toasts */}
        <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-3">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div 
                key={toast.id}
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className={cn(
                  "px-6 py-4 rounded-2xl shadow-ambient flex items-center gap-4 min-w-[280px] ghost-border",
                  toast.type === 'success' ? "bg-secondary text-on-secondary" : "bg-primary text-on-primary"
                )}
              >
                {toast.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
                <span className="text-sm font-bold">{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-[11px] font-bold uppercase tracking-[0.1em]",
        active 
          ? "bg-surface-container-lowest text-primary shadow-ambient" 
          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ProfileHeader({ employee, position }: { employee: Employee; position: Position }) {
  return (
    <div className="bg-surface-container-low rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 shadow-ambient">
      <div className="relative">
        <img 
          src={employee.avatar} 
          alt={employee.name} 
          className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] object-cover shadow-ambient"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 hero-gradient text-on-primary p-2 md:p-3 rounded-xl md:rounded-2xl shadow-ambient">
          <Award size={20} className="md:w-6 md:h-6" />
        </div>
      </div>
      <div className="flex-1 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 md:gap-0">
          <div className="text-center md:text-left">
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-1 md:mb-2 block">IT Талант</span>
            <h2 className="font-headline font-bold text-2xl md:text-4xl text-on-surface">{employee.name}</h2>
            <p className="text-on-surface-variant font-bold uppercase tracking-[0.05em] text-xs md:text-sm mt-1 md:mt-2">
              {position.title} • {position.unit} Unit
            </p>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-center gap-2 text-secondary justify-center md:justify-end">
              <Star size={20} className="md:w-6 md:h-6" fill="currentColor" />
              <span className="text-3xl md:text-4xl font-headline font-bold">{employee.annualRating}</span>
            </div>
            <p className="text-[9px] md:text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.1em] mt-1">Річна оцінка</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
          <div className="px-4 md:px-5 py-3 bg-surface-container-lowest rounded-xl md:rounded-2xl shadow-ambient">
            <p className="text-[8px] md:text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.1em] mb-1">Стаж на посаді</p>
            <p className="text-[10px] md:text-xs font-bold text-on-surface">{employee.tenure}</p>
          </div>
          <div className="px-4 md:px-5 py-3 bg-surface-container-lowest rounded-xl md:rounded-2xl shadow-ambient">
            <p className="text-[8px] md:text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.1em] mb-1">Виконання ІПР</p>
            <p className="text-[10px] md:text-xs font-bold text-on-surface">{employee.idpCompletion}%</p>
          </div>
          <div className="px-4 md:px-5 py-3 bg-surface-container-lowest rounded-xl md:rounded-2xl shadow-ambient">
            <p className="text-[8px] md:text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.1em] mb-1">Рівень мов</p>
            <p className="text-[10px] md:text-xs font-bold text-on-surface truncate">
              {Object.entries(employee.languageLevels).map(([lang, level]) => `${lang}: ${level}`).join(', ')}
            </p>
          </div>
          <div className="px-4 md:px-5 py-3 bg-surface-container-lowest rounded-xl md:rounded-2xl shadow-ambient">
            <p className="text-[8px] md:text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.1em] mb-1">Готовність до промо</p>
            <p className="text-[10px] md:text-xs font-bold text-primary">{employee.readiness}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, sub }: { icon: React.ReactNode, title: string, value: string, sub: string }) {
  return (
    <div className="bg-surface-container-low p-8 rounded-[2.5rem] shadow-ambient hover:shadow-lg transition-all">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-surface-container-lowest rounded-2xl shadow-ambient">{icon}</div>
        <span className="text-[11px] font-bold uppercase text-on-surface-variant tracking-[0.15em]">{title}</span>
      </div>
      <div className="text-4xl font-headline font-bold text-on-surface mb-2">{value}</div>
      <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.05em]">{sub}</div>
    </div>
  );
}

function ActivityItem({ date, text }: { date: string, text: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="text-[10px] font-bold text-on-surface-variant uppercase w-24 pt-1 tracking-[0.1em]">{date}</div>
      <div className="flex-1 text-sm font-medium text-on-surface leading-relaxed">{text}</div>
    </div>
  );
}

function RecommendationItem({ title, type }: { title: string, type: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer p-3 -mx-3 hover:bg-surface-container-low rounded-2xl transition-colors">
      <div>
        <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{title}</p>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em] mt-1">{type}</p>
      </div>
      <ChevronRight size={18} className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
    </div>
  );
}

interface SkillBarProps {
  name: string;
  level: number;
  color?: string;
}

const SkillBar: React.FC<SkillBarProps> = ({ name, level, color = "hero-gradient" }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase text-on-surface tracking-[0.05em]">{name}</span>
        <span className="text-[11px] font-bold text-on-surface-variant">{level}%</span>
      </div>
      <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000 progress-glow", color)} style={{ width: `${level}%` }} />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn("w-3 h-3 rounded-full", color)}></div>
      <span className="text-[11px] font-bold uppercase text-on-surface-variant tracking-[0.05em]">{label}</span>
    </div>
  );
}
