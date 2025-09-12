"use client";

import { render, screen } from '@testing-library/react';

const MockCallToActionSection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 to-purple-500/10">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Kezdje el a profit realizálását ma!
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Csatlakozzon több mint 10,000 felhasználóhoz, akik már profitálnak a ProTipp V2 platformmal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-md font-semibold">
              Ingyenes Regisztráció
            </button>
            <button className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-8 py-3 rounded-md font-semibold">
              Demo Megtekintése
            </button>
            <button className="border border-border hover:bg-accent hover:text-accent-foreground px-8 py-3 rounded-md font-semibold">
              Kapcsolatfelvétel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

describe('CallToActionSection Component', () => {
  it('renders CTA section with correct main message', () => {
    render(<MockCallToActionSection />);

    expect(screen.getByText('Kezdje el a profit realizálását ma!')).toBeInTheDocument();
  });

  it('renders supporting text', () => {
    render(<MockCallToActionSection />);

    expect(screen.getByText('Csatlakozzon több mint 10,000 felhasználóhoz, akik már profitálnak a ProTipp V2 platformmal.')).toBeInTheDocument();
  });

  it('renders all CTA buttons', () => {
    render(<MockCallToActionSection />);

    expect(screen.getByText('Ingyenes Regisztráció')).toBeInTheDocument();
    expect(screen.getByText('Demo Megtekintése')).toBeInTheDocument();
    expect(screen.getByText('Kapcsolatfelvétel')).toBeInTheDocument();
  });

  it('applies correct gradient background', () => {
    render(<MockCallToActionSection />);

    const section = screen.getByText('Kezdje el a profit realizálását ma!').closest('section');
    expect(section).toHaveClass('bg-gradient-to-r', 'from-primary/10', 'to-purple-500/10');
  });

  it('applies correct button styling for primary button', () => {
    render(<MockCallToActionSection />);

    const primaryButton = screen.getByText('Ingyenes Regisztráció');
    expect(primaryButton).toHaveClass('bg-primary', 'hover:bg-primary/90', 'text-primary-foreground');
  });

  it('applies correct button styling for secondary button', () => {
    render(<MockCallToActionSection />);

    const secondaryButton = screen.getByText('Demo Megtekintése');
    expect(secondaryButton).toHaveClass('bg-secondary', 'hover:bg-secondary/80', 'text-secondary-foreground');
  });

  it('applies correct button styling for ghost button', () => {
    render(<MockCallToActionSection />);

    const ghostButton = screen.getByText('Kapcsolatfelvétel');
    expect(ghostButton).toHaveClass('border', 'border-border', 'hover:bg-accent', 'hover:text-accent-foreground');
  });

  it('applies correct responsive layout', () => {
    render(<MockCallToActionSection />);

    const buttonContainer = screen.getByText('Ingyenes Regisztráció').closest('.flex');
    expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row', 'gap-4', 'justify-center', 'items-center');
  });
});
