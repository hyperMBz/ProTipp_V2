"use client";

import { render, screen } from '@testing-library/react';

const MockStatsSection = () => {
  const stats = [
    {
      icon: () => <div>Icon1</div>,
      value: "10,000+",
      label: "Aktív Felhasználók",
      description: "Regisztrált felhasználók száma"
    },
    {
      icon: () => <div>Icon2</div>,
      value: "50,000+",
      label: "Arbitrage Lehetőségek",
      description: "Naponta detektált lehetőségek"
    },
    {
      icon: () => <div>Icon3</div>,
      value: "8.5%",
      label: "Átlagos Profit",
      description: "Felhasználók átlagos profitja"
    },
    {
      icon: () => <div>Icon4</div>,
      value: "25+",
      label: "Sportágak",
      description: "Elérhető sportágak száma"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Platform Statisztikák
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Impresszív számok, amelyek bizonyítják a platform hatékonyságát
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card border border-border/50 rounded-lg p-6 text-center"
            >
              <div className="h-12 w-12 mx-auto mb-4 text-primary">
                <stat.icon />
              </div>
              <div className="text-3xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold mb-2">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

describe('StatsSection Component', () => {
  it('renders stats section with correct title', () => {
    render(<MockStatsSection />);

    expect(screen.getByText('Platform Statisztikák')).toBeInTheDocument();
    expect(screen.getByText('Impresszív számok, amelyek bizonyítják a platform hatékonyságát')).toBeInTheDocument();
  });

  it('renders all statistics', () => {
    render(<MockStatsSection />);

    expect(screen.getByText('10,000+')).toBeInTheDocument();
    expect(screen.getByText('50,000+')).toBeInTheDocument();
    expect(screen.getByText('8.5%')).toBeInTheDocument();
    expect(screen.getByText('25+')).toBeInTheDocument();
  });

  it('renders all statistic labels', () => {
    render(<MockStatsSection />);

    expect(screen.getByText('Aktív Felhasználók')).toBeInTheDocument();
    expect(screen.getByText('Arbitrage Lehetőségek')).toBeInTheDocument();
    expect(screen.getByText('Átlagos Profit')).toBeInTheDocument();
    expect(screen.getByText('Sportágak')).toBeInTheDocument();
  });

  it('renders statistic descriptions', () => {
    render(<MockStatsSection />);

    expect(screen.getByText('Regisztrált felhasználók száma')).toBeInTheDocument();
    expect(screen.getByText('Naponta detektált lehetőségek')).toBeInTheDocument();
  });

  it('applies correct grid layout for mobile', () => {
    render(<MockStatsSection />);

    const grid = screen.getByText('10,000+').closest('.grid');
    expect(grid).toHaveClass('grid-cols-2', 'lg:grid-cols-4', 'gap-6');
  });

  it('applies correct card styling', () => {
    render(<MockStatsSection />);

    const card = screen.getByText('10,000+').closest('.bg-card');
    expect(card).toHaveClass('border', 'border-border/50', 'rounded-lg', 'p-6', 'text-center');
  });

  it('applies correct typography classes', () => {
    render(<MockStatsSection />);

    const value = screen.getByText('10,000+');
    expect(value).toHaveClass('text-3xl', 'font-bold', 'mb-2');
  });
});
