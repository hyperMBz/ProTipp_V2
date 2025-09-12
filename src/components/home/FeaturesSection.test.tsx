"use client";

import { render, screen } from '@testing-library/react';

const MockFeaturesSection = () => {
  const features = [
    {
      icon: () => <div>Icon1</div>,
      title: "Arbitrage Lehetőségek",
      description: "Valós idejű arbitrage lehetőségek automatikus detektálással",
      features: [
        "Real-time odds frissítések",
        "Automatikus profit számítás",
        "Szűrés sport és profit szerint"
      ]
    },
    {
      icon: () => <div>Icon2</div>,
      title: "Profit Kalkulátor",
      description: "Pontos profit számítás tét elosztással",
      features: [
        "Tét elosztás optimalizálás",
        "ROI számítás",
        "Kockázat elemzés"
      ]
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Fő Funkciók
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fedezze fel a ProTipp V2 platform teljes funkcionalitását
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg"
            >
              <div className="text-center">
                <div className="h-12 w-12 text-primary mb-4 mx-auto">
                  <feature.icon />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2 text-left">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

describe('FeaturesSection Component', () => {
  it('renders features section with correct title', () => {
    render(<MockFeaturesSection />);

    expect(screen.getByText('Fő Funkciók')).toBeInTheDocument();
    expect(screen.getByText('Fedezze fel a ProTipp V2 platform teljes funkcionalitását')).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(<MockFeaturesSection />);

    expect(screen.getByText('Arbitrage Lehetőségek')).toBeInTheDocument();
    expect(screen.getByText('Profit Kalkulátor')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<MockFeaturesSection />);

    expect(screen.getByText('Valós idejű arbitrage lehetőségek automatikus detektálással')).toBeInTheDocument();
    expect(screen.getByText('Pontos profit számítás tét elosztással')).toBeInTheDocument();
  });

  it('renders feature lists', () => {
    render(<MockFeaturesSection />);

    expect(screen.getByText('Real-time odds frissítések')).toBeInTheDocument();
    expect(screen.getByText('Tét elosztás optimalizálás')).toBeInTheDocument();
  });

  it('applies correct grid layout classes', () => {
    render(<MockFeaturesSection />);

    const grid = screen.getByText('Arbitrage Lehetőségek').closest('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
  });

  it('applies correct card styling', () => {
    render(<MockFeaturesSection />);

    const card = screen.getByText('Arbitrage Lehetőségek').closest('.bg-card');
    expect(card).toHaveClass('border', 'border-border/50', 'rounded-lg', 'p-6');
  });
});
