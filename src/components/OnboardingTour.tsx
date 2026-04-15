import React from 'react';

interface OnboardingTourProps {
  onClose: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onClose }) => {
  const steps = [
    {
      title: "Operational Telemetry",
      description: "Real-time performance metrics tracking throughput, labor utilization, and system-wide efficiency. Watch for margin leakage indicators.",
      position: "top-1/4 left-1/2 -translate-x-1/2"
    },
    {
      title: "Station Stress Monitor",
      description: "Visualizes the load on every kitchen station. When a station exceeds 85% capacity, it enters a critical state, triggering the autonomous architect.",
      position: "top-1/2 left-1/2 -translate-x-1/2"
    },
    {
      title: "Autonomous Actions",
      description: "The AI's log of real-time interventions, including skill-based labor reallocation and margin-aware task routing.",
      position: "bottom-1/4 left-1/2 -translate-x-1/2"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-500">
      <div className="relative w-full max-w-2xl p-12 bg-grilli-surface border border-grilli-gold/30 rounded-lg shadow-2xl">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-serif font-bold text-grilli-gold italic">Command Center Orientation</h2>
          
          <div className="grid gap-8 text-left">
            {steps.map((step, i) => (
              <div key={i} className="space-y-2 border-l-2 border-grilli-gold/20 pl-6 py-2">
                <h3 className="text-xl font-serif font-bold text-grilli-text italic">{step.title}</h3>
                <p className="text-sm text-grilli-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gold-gradient text-grilli-black font-bold uppercase tracking-widest text-xs rounded hover:opacity-90 transition-opacity"
          >
            Acknowledge & Enter
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
