import React from 'react';
import './StepIndicator.css';

export interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: Set<number>;
  className?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  steps, 
  currentStep, 
  completedSteps = new Set(), 
  className = '' 
}) => {
  const getStepState = (index: number) => {
    if (completedSteps.has(index)) return 'completed';
    if (currentStep === index) return 'active';
    return 'inactive';
  };

  return (
    <div className={`stepper ${className}`}>
      {steps.map((step, index) => (
        <div
          key={step.label}
          className={`step ${getStepState(index)}`}
        >
          <div className="step-icon">
            {completedSteps.has(index) ? '✓' : index + 1}
          </div>
          <div className="step-content">
            <div className="step-label">{step.label}</div>
            {step.description && (
              <div className="step-description">{step.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;