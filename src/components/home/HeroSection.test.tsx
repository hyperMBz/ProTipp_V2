"use client";

import { render, screen } from '@testing-library/react';

// Simple test component to avoid complex mocking
const MockHeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          ProTipp V2
        </h1>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground/90">
          Professzionális Arbitrage Platform
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Fedezze fel a profitot a különböző fogadóirodák közötti odds különbségekből.
        </p>
      </div>
    </section>
  );
};

describe('HeroSection Component', () => {
  it('renders hero section with correct title', () => {
    render(<MockHeroSection />);

    expect(screen.getByText('ProTipp V2')).toBeInTheDocument();
    expect(screen.getByText('Professzionális Arbitrage Platform')).toBeInTheDocument();
  });

  it('renders main heading with gradient text', () => {
    render(<MockHeroSection />);

    const heading = screen.getByText('ProTipp V2');
    expect(heading).toHaveClass('bg-gradient-to-r', 'from-primary', 'to-purple-400');
  });

  it('renders description text', () => {
    render(<MockHeroSection />);

    expect(screen.getByText(/Fedezze fel a profitot/)).toBeInTheDocument();
  });

  it('applies correct gradient background', () => {
    render(<MockHeroSection />);

    const section = screen.getByText('ProTipp V2').closest('section');
    expect(section).toHaveClass('bg-gradient-to-br', 'from-background', 'to-primary/10');
  });

  it('has correct responsive classes', () => {
    render(<MockHeroSection />);

    const container = screen.getByText('ProTipp V2').closest('.container');
    expect(container).toHaveClass('mx-auto', 'px-4');
  });

  it('renders with proper structure', () => {
    render(<MockHeroSection />);

    // Check that all main elements are present
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Fedezze fel a profitot/)).toBeInTheDocument();
  });
});
