"use client";

import { render, screen } from '@testing-library/react';

const MockHowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      icon: () => <div>Icon1</div>,
      title: "Regisztráció",
      description: "Hozzon létre ingyenes fiókot 2 perc alatt",
      details: "Egyszerű regisztrációs folyamat email címmel és jelszóval."
    },
    {
      number: "2",
      icon: () => <div>Icon2</div>,
      title: "Arbitrage Keresés",
      description: "Fedezze fel a legjobb arbitrage lehetőségeket",
      details: "Valós idejű odds összehasonlítás több fogadóiroda között."
    },
    {
      number: "3",
      icon: () => <div>Icon3</div>,
      title: "Profit Realizálás",
      description: "Helyezze el fogadásait és realizálja a profitot",
      details: "Pontos tét elosztás kalkulációval."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Hogyan Működik?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Három egyszerű lépésben kezdje el a profit realizálását
          </p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 text-center px-4">
              <div className="h-16 w-16 text-primary mx-auto mb-4 flex items-center justify-center">
                <step.icon />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {step.description}
              </p>
              <p className="text-sm text-muted-foreground">
                {step.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

describe('HowItWorksSection Component', () => {
  it('renders section with correct title', () => {
    render(<MockHowItWorksSection />);

    expect(screen.getByText('Hogyan Működik?')).toBeInTheDocument();
    expect(screen.getByText('Három egyszerű lépésben kezdje el a profit realizálását')).toBeInTheDocument();
  });

  it('renders all three steps', () => {
    render(<MockHowItWorksSection />);

    expect(screen.getByText('Regisztráció')).toBeInTheDocument();
    expect(screen.getByText('Arbitrage Keresés')).toBeInTheDocument();
    expect(screen.getByText('Profit Realizálás')).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    render(<MockHowItWorksSection />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders step descriptions', () => {
    render(<MockHowItWorksSection />);

    expect(screen.getByText('Hozzon létre ingyenes fiókot 2 perc alatt')).toBeInTheDocument();
    expect(screen.getByText('Fedezze fel a legjobb arbitrage lehetőségeket')).toBeInTheDocument();
    expect(screen.getByText('Helyezze el fogadásait és realizálja a profitot')).toBeInTheDocument();
  });

  it('renders step details', () => {
    render(<MockHowItWorksSection />);

    expect(screen.getByText('Egyszerű regisztrációs folyamat email címmel és jelszóval.')).toBeInTheDocument();
    expect(screen.getByText('Valós idejű odds összehasonlítás több fogadóiroda között.')).toBeInTheDocument();
    expect(screen.getByText('Pontos tét elosztás kalkulációval.')).toBeInTheDocument();
  });

  it('applies correct responsive layout', () => {
    render(<MockHowItWorksSection />);

    const container = screen.getByText('Regisztráció').closest('.flex');
    expect(container).toHaveClass('flex-col', 'lg:flex-row', 'justify-between', 'items-start', 'gap-8');
  });

  it('applies correct step styling', () => {
    render(<MockHowItWorksSection />);

    const step = screen.getByText('Regisztráció').closest('.flex-1');
    expect(step).toHaveClass('text-center', 'px-4');
  });

  it('has correct id for navigation', () => {
    render(<MockHowItWorksSection />);

    const section = screen.getByText('Hogyan Működik?').closest('section');
    expect(section).toHaveAttribute('id', 'how-it-works');
  });
});
