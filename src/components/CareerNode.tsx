import React from 'react';
import { Handle, Position as FlowPosition } from 'reactflow';
import { cn } from '@/src/lib/utils';
import { Briefcase, Info, Bell, Target, Users, Cpu, User as UserIcon } from 'lucide-react';
import { SKILL_REGISTRY } from '@/src/types';

export const CareerNode = ({ data }: any) => {
  const { title, isCurrent, isVacant, isGoal, matchPercentage, isHeader, employeeCount, onToggleCollapse, isCollapsed, hasChildren, position } = data;

  if (isHeader) {
    return (
      <div className="px-6 py-3 bg-inverse-surface text-inverse-on-surface font-headline font-bold uppercase text-[10px] tracking-[0.05em] rounded-xl shadow-ambient">
        {title}
        <Handle type="source" position={FlowPosition.Bottom} className="opacity-0" />
      </div>
    );
  }

  const requirements = position?.requirements || [];
  const hardSkills = requirements
    .filter((req: any) => SKILL_REGISTRY[req.skillId]?.category === 'hard')
    .slice(0, 2);
  const softSkills = requirements
    .filter((req: any) => SKILL_REGISTRY[req.skillId]?.category === 'soft')
    .slice(0, 2);

  return (
    <div
      className={cn(
        "px-5 py-4 transition-all duration-300 w-[330px] rounded-xl shadow-ambient relative",
        isCurrent 
          ? "bg-primary text-on-primary" 
          : "bg-surface-container-low text-on-surface border border-outline-variant/10",
        isVacant && "ring-2 ring-secondary ring-offset-2",
        isGoal && !isCurrent && "bg-surface-container-lowest border border-primary/20"
      )}
    >
      <Handle type="target" position={FlowPosition.Top} className="w-2 h-2 bg-outline-variant/30 border-none rounded-full" />
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-[0.05em]",
            isCurrent ? "text-on-primary/70" : "text-on-surface-variant"
          )}>
            {isCurrent ? "Поточна роль" : isVacant ? "Вакансія" : isGoal ? "Кар'єрна ціль" : "Позиція"}
          </span>
          <div className="flex gap-2 items-center">
            {employeeCount !== undefined && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full",
                isCurrent ? "bg-on-primary/10" : "bg-surface-container"
              )}>
                <Users size={10} className={isCurrent ? "text-on-primary" : "text-on-surface-variant"} />
                <span className={cn("text-[10px] font-bold", isCurrent ? "text-on-primary" : "text-on-surface-variant")}>
                  {employeeCount}
                </span>
              </div>
            )}
            {isGoal && <Target size={12} className={isCurrent ? "text-on-primary" : "text-primary"} />}
            {isVacant && <Bell size={12} className={isCurrent ? "text-on-primary" : "text-secondary"} />}
          </div>
        </div>
        
        <div>
          <h3 className={cn(
            "font-headline font-bold text-sm uppercase leading-tight",
            isCurrent ? "text-on-primary" : "text-on-surface"
          )}>
            {title}
          </h3>
        </div>

        {/* Skills Summary */}
        <div className="space-y-2 pt-1">
          {hardSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hardSkills.map((req: any) => (
                <span key={req.skillId} className={cn(
                  "text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider",
                  isCurrent ? "bg-on-primary/20 text-on-primary" : "bg-primary/10 text-primary"
                )}>
                  {SKILL_REGISTRY[req.skillId]?.name}
                </span>
              ))}
            </div>
          )}
          {softSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {softSkills.map((req: any) => (
                <span key={req.skillId} className={cn(
                  "text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider",
                  isCurrent ? "bg-on-primary/20 text-on-primary" : "bg-secondary/10 text-secondary"
                )}>
                  {SKILL_REGISTRY[req.skillId]?.name}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {matchPercentage !== undefined && !isCurrent && (
          <div className="mt-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-[0.05em]">Відповідність</span>
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                matchPercentage > 80 ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant"
              )}>
                {matchPercentage}%
              </span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-700 progress-glow",
                  matchPercentage > 80 ? "bg-secondary" : "bg-primary"
                )}
                style={{ width: `${matchPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {hasChildren && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className={cn(
            "absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-ambient transition-all z-10",
            isCurrent ? "bg-on-primary text-primary" : "bg-surface-container-highest text-on-surface"
          )}
        >
          {isCollapsed ? <span className="text-xs font-bold">+</span> : <span className="text-xs font-bold">-</span>}
        </button>
      )}

      <Handle type="source" position={FlowPosition.Bottom} className="w-2 h-2 bg-outline-variant/30 border-none rounded-full" />
    </div>
  );
};
