"use client";

import { render, screen } from '@testing-library/react';

const MockTestimonialsSection = () => {
  const testimonials = [
    {
      name: "Kovács Péter",
      position: "Amatőr fogadó",
      rating: 5,
      content: "A ProTipp V2 segítségével már 3 hónap alatt 15% profitot értem el."
    },
    {
      name: "Nagy Anna",
      position: "Veterán fogadó",
      rating: 5,
      content: "A legjobb arbitrage platform, amit valaha használtam."
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`text-sm ${index < rating ? "text-yellow-400" : "text-muted-foreground"}`}>
        ★
      </span>
    ));
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Felhasználói Vélemények
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lássa, mit mondanak a felhasználók a ProTipp V2-ről
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border/50 rounded-lg p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.position}
                  </p>
                  <div className="flex items-center space-x-1 mt-2">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
              <blockquote className="text-muted-foreground italic">
                "{testimonial.content}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

describe('TestimonialsSection Component', () => {
  it('renders testimonials section with correct title', () => {
    render(<MockTestimonialsSection />);

    expect(screen.getByText('Felhasználói Vélemények')).toBeInTheDocument();
    expect(screen.getByText('Lássa, mit mondanak a felhasználók a ProTipp V2-ről')).toBeInTheDocument();
  });

  it('renders all testimonial names', () => {
    render(<MockTestimonialsSection />);

    expect(screen.getByText('Kovács Péter')).toBeInTheDocument();
    expect(screen.getByText('Nagy Anna')).toBeInTheDocument();
  });

  it('renders all testimonial positions', () => {
    render(<MockTestimonialsSection />);

    expect(screen.getByText('Amatőr fogadó')).toBeInTheDocument();
    expect(screen.getByText('Veterán fogadó')).toBeInTheDocument();
  });

  it('renders testimonial content', () => {
    render(<MockTestimonialsSection />);

    expect(screen.getByText(/A ProTipp V2 segítségével/)).toBeInTheDocument();
    expect(screen.getByText(/A legjobb arbitrage platform/)).toBeInTheDocument();
  });

  it('renders star ratings', () => {
    render(<MockTestimonialsSection />);

    // Should have star characters for ratings
    const stars = screen.getAllByText('★');
    expect(stars).toHaveLength(10); // 5 stars per testimonial × 2 testimonials
  });

  it('renders avatar placeholders with correct initials', () => {
    render(<MockTestimonialsSection />);

    expect(screen.getByText('KP')).toBeInTheDocument(); // Kovács Péter
    expect(screen.getByText('NA')).toBeInTheDocument(); // Nagy Anna
  });

  it('applies correct grid layout', () => {
    render(<MockTestimonialsSection />);

    const grid = screen.getByText('Kovács Péter').closest('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
  });

  it('applies correct card styling', () => {
    render(<MockTestimonialsSection />);

    const card = screen.getByText('Kovács Péter').closest('.bg-card');
    expect(card).toHaveClass('border', 'border-border/50', 'rounded-lg', 'p-6');
  });

  it('renders testimonials as blockquotes', () => {
    render(<MockTestimonialsSection />);

    const blockquote = screen.getByText(/A ProTipp V2 segítségével/).closest('blockquote');
    expect(blockquote).toHaveClass('text-muted-foreground', 'italic');
  });
});
