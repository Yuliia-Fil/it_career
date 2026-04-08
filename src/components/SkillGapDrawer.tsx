import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Target, Loader2, Briefcase, Users } from 'lucide-react';
import { Position, Employee, MOCK_SKILLS, SKILL_REGISTRY } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { Cpu, User as UserIcon } from 'lucide-react';

interface SkillGapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
  employee: Employee;
  onAddGoal: (posId: string) => void;
  onApply: (posId: string) => void;
  onViewUser: (userName: string) => void;
}

export const SkillGapDrawer = ({ isOpen, onClose, position, employee, onAddGoal, onApply, onViewUser }: SkillGapDrawerProps) => {
  const [isApplying, setIsApplying] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  if (!position) return null;

  const isGoal = employee.goals.includes(position.id);

  const gapAnalysis = position.requirements.map(req => {
    const userSkill = employee.skills.find(s => s.id === req.skillId);
    const currentLevel = userSkill?.level || 0;
    const isMet = currentLevel >= req.minLevel;
    const diff = req.minLevel - currentLevel;
    const skillData = SKILL_REGISTRY[req.skillId];

    return {
      skillId: req.skillId,
      skillName: skillData?.name || req.skillId,
      category: skillData?.category || 'hard',
      required: req.minLevel,
      current: currentLevel,
      isMet,
      diff,
      importance: req.importance
    };
  });

  const totalMet = gapAnalysis.filter(g => g.isMet).length;
  const matchScore = Math.round((totalMet / gapAnalysis.length) * 100);

  const hardSkills = gapAnalysis.filter(g => g.category === 'hard');
  const softSkills = gapAnalysis.filter(g => g.category === 'soft');

  const handleApply = async () => {
    setIsApplying(true);
    await new Promise(r => setTimeout(r, 1500));
    onApply(position.id);
    setIsApplying(false);
  };

  const handleAddGoal = async () => {
    setIsAddingGoal(true);
    await new Promise(r => setTimeout(r, 800));
    onAddGoal(position.id);
    setIsAddingGoal(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-surface shadow-ambient z-50 overflow-y-auto"
          >
            <div className="p-6 sm:p-10 space-y-8 sm:space-y-10">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2 block">Кар'єрна еволюція</span>
                  <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface leading-tight">{position.title}</h2>
                  <p className="text-on-surface-variant font-bold uppercase tracking-[0.05em] text-[10px] sm:text-xs mt-2">{position.unit} Unit</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 sm:p-3 hover:bg-surface-container-low rounded-2xl transition-all text-on-surface-variant hover:text-on-surface"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-surface-container-low rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em] mb-1">Сила відповідності</p>
                    <p className="text-3xl sm:text-4xl font-headline font-bold text-on-surface">{matchScore}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em] mb-1">Статус</p>
                    <span className={cn(
                      "text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl",
                      isGoal ? "bg-primary text-on-primary" : "bg-secondary-container text-on-secondary-container"
                    )}>
                      {isGoal ? "Кар'єрна ціль" : 'Потенційний шлях'}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-surface-container-lowest h-3 rounded-full overflow-hidden">
                  <div
                    className="hero-gradient h-full transition-all duration-1000 progress-glow"
                    style={{ width: `${matchScore}%` }}
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-4">
                <h3 className="font-headline font-bold text-sm uppercase tracking-[0.05em] text-on-surface flex items-center gap-3">
                  <Briefcase size={18} className="text-primary" />
                  Опис позиції
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {position.detailedDescription}
                </p>
              </div>

              {/* Current Employees */}
              <div className="space-y-4">
                <h3 className="font-headline font-bold text-sm uppercase tracking-[0.05em] text-on-surface flex items-center gap-3">
                  <Users size={18} className="text-secondary" />
                  Співробітники на цій посаді ({position.currentEmployees.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {position.currentEmployees.map((emp, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => onViewUser(emp)}
                      className="px-3 py-1.5 bg-surface-container-low rounded-xl text-[11px] font-bold text-on-surface shadow-sm hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      {emp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-10">
                <h3 className="font-headline font-bold text-sm uppercase tracking-[0.05em] text-on-surface flex items-center gap-3">
                  <Target size={18} className="text-primary" />
                  Аналіз необхідних навичок
                </h3>
                
                {/* Hard Skills */}
                {hardSkills.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant flex items-center gap-2">
                      <Cpu size={14} /> Hard Skills
                    </h4>
                    <div className="space-y-6">
                      {hardSkills.map((gap, idx) => (
                        <SkillGapItem key={idx} gap={gap} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {softSkills.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant flex items-center gap-2">
                      <UserIcon size={14} /> Soft Skills
                    </h4>
                    <div className="space-y-6">
                      {softSkills.map((gap, idx) => (
                        <SkillGapItem key={idx} gap={gap} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 space-y-4">
                {!isGoal && (
                  <button
                    onClick={handleAddGoal}
                    disabled={isAddingGoal}
                    className="w-full py-5 hero-gradient text-on-primary rounded-3xl font-headline font-bold text-sm uppercase tracking-[0.1em] transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isAddingGoal ? <Loader2 size={18} className="animate-spin" /> : "Додати до кар'єрних цілей"}
                  </button>
                )}
                {position.isVacant && (
                  <button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="w-full py-5 bg-surface-container-high text-on-surface rounded-3xl font-headline font-bold text-sm uppercase tracking-[0.1em] transition-all hover:bg-surface-container-highest active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isApplying ? <Loader2 size={18} className="animate-spin" /> : "Подати заявку на вакансію"}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-5 text-on-surface-variant font-bold text-xs uppercase tracking-[0.1em] hover:text-on-surface transition-colors"
                >
                  Закрити
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const SkillGapItem: React.FC<{ gap: any }> = ({ gap }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface uppercase tracking-[0.05em]">{gap.skillName}</span>
          {gap.isMet && <CheckCircle2 size={14} className="text-secondary" />}
        </div>
        <span className="text-[10px] font-bold text-on-surface-variant">
          {gap.current}% / <span className="text-on-surface">{gap.required}%</span>
        </span>
      </div>
      <div className="relative h-2.5 bg-surface-container-low rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute top-0 left-0 h-full transition-all duration-1000 progress-glow",
            gap.isMet ? "bg-secondary" : "bg-primary"
          )}
          style={{ width: `${gap.current}%` }}
        />
        <div
          className="absolute top-0 h-full border-r-2 border-on-surface/20 z-10"
          style={{ left: `${gap.required}%` }}
        />
      </div>
    </div>
  );
}
