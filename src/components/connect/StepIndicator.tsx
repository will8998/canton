'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  title: string;
}

export default function StepIndicator({ currentStep, totalSteps, title }: StepIndicatorProps) {
  const styles = {
    container: {
      display: 'inline-flex',
      alignItems: 'center',
      border: '1px solid #e5e7eb',
      borderRadius: '9999px',
      padding: '0.5rem 1.5rem',
      position: 'relative' as 'relative'
    },
    stepText: {
      fontSize: '1rem',
      fontWeight: 'medium'
    },
    dotContainer: {
      position: 'absolute' as 'absolute',
      left: '1rem',
      width: '1.5rem',
      height: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    stepDot: {
      width: '1.5rem',
      height: '1.5rem',
      borderRadius: '50%',
      backgroundColor: '#4CAF50',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid transparent',
      boxSizing: 'border-box' as 'border-box'
    },
    emptyDot: {
      width: '1.5rem',
      height: '1.5rem',
      borderRadius: '50%',
      border: '2px dashed #111827',
      boxSizing: 'border-box' as 'border-box'
    },
    checkmark: {
      color: 'white',
      fontSize: '0.75rem'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.dotContainer}>
        {currentStep === 1 ? (
          <div style={styles.emptyDot}></div>
        ) : (
          <div style={styles.stepDot}>
            <span style={styles.checkmark}>✓</span>
          </div>
        )}
      </div>
      <span style={styles.stepText}>Step {currentStep} of {totalSteps}: {title}</span>
    </div>
  );
} 