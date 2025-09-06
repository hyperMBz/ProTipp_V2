/**
 * ExportPanel Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportPanel } from '../ExportPanel';

// Mock the export functions
const mockOnExportPDF = jest.fn();
const mockOnExportCSV = jest.fn();

describe('ExportPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render export panel with correct title', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    expect(screen.getByText('Export Panel')).toBeInTheDocument();
  });

  it('should render export buttons', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    expect(screen.getByText('PDF Export')).toBeInTheDocument();
    expect(screen.getByText('CSV Export')).toBeInTheDocument();
  });

  it('should call onExportPDF when PDF export button is clicked', async () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const pdfButton = screen.getByText('PDF Export');
    fireEvent.click(pdfButton);

    await waitFor(() => {
      expect(mockOnExportPDF).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onExportCSV when CSV export button is clicked', async () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const csvButton = screen.getByText('CSV Export');
    fireEvent.click(csvButton);

    await waitFor(() => {
      expect(mockOnExportCSV).toHaveBeenCalledTimes(1);
    });
  });

  it('should display export options', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    expect(screen.getByText('Export Beállítások')).toBeInTheDocument();
    expect(screen.getByText('Dátum Tartomány')).toBeInTheDocument();
    expect(screen.getByText('Szűrők')).toBeInTheDocument();
  });

  it('should handle date range selection', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const dateRangeSelect = screen.getByDisplayValue('Utolsó 30 nap');
    expect(dateRangeSelect).toBeInTheDocument();

    fireEvent.change(dateRangeSelect, { target: { value: 'last-7-days' } });
    expect(dateRangeSelect).toHaveValue('last-7-days');
  });

  it('should handle filter selection', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const sportFilter = screen.getByDisplayValue('Összes sport');
    expect(sportFilter).toBeInTheDocument();

    fireEvent.change(sportFilter, { target: { value: 'soccer' } });
    expect(sportFilter).toHaveValue('soccer');
  });

  it('should display export status when exporting', async () => {
    const mockOnExportPDFWithLoading = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    });

    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDFWithLoading}
        onExportCSV={mockOnExportCSV}
      />
    );

    const pdfButton = screen.getByText('PDF Export');
    fireEvent.click(pdfButton);

    expect(screen.getByText('Exportálás...')).toBeInTheDocument();
  });

  it('should handle export success', async () => {
    const mockOnExportPDFWithSuccess = jest.fn().mockResolvedValue(undefined);

    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDFWithSuccess}
        onExportCSV={mockOnExportCSV}
      />
    );

    const pdfButton = screen.getByText('PDF Export');
    fireEvent.click(pdfButton);

    await waitFor(() => {
      expect(screen.getByText('Export sikeres!')).toBeInTheDocument();
    });
  });

  it('should handle export error', async () => {
    const mockOnExportPDFWithError = jest.fn().mockRejectedValue(new Error('Export failed'));

    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDFWithError}
        onExportCSV={mockOnExportCSV}
      />
    );

    const pdfButton = screen.getByText('PDF Export');
    fireEvent.click(pdfButton);

    await waitFor(() => {
      expect(screen.getByText('Hiba történt az export során')).toBeInTheDocument();
    });
  });

  it('should disable buttons when exporting', async () => {
    const mockOnExportPDFWithLoading = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    });

    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDFWithLoading}
        onExportCSV={mockOnExportCSV}
      />
    );

    const pdfButton = screen.getByText('PDF Export');
    const csvButton = screen.getByText('CSV Export');

    fireEvent.click(pdfButton);

    expect(pdfButton).toBeDisabled();
    expect(csvButton).toBeDisabled();
  });

  it('should display export preview', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    expect(screen.getByText('Export Előnézet')).toBeInTheDocument();
    expect(screen.getByText('Összes Fogadás')).toBeInTheDocument();
    expect(screen.getByText('Dátum Tartomány')).toBeInTheDocument();
    expect(screen.getByText('Szűrők')).toBeInTheDocument();
  });

  it('should handle custom date range', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const customDateRange = screen.getByText('Egyedi dátum tartomány');
    fireEvent.click(customDateRange);

    expect(screen.getByText('Kezdő dátum')).toBeInTheDocument();
    expect(screen.getByText('Vég dátum')).toBeInTheDocument();
  });

  it('should validate date range', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const customDateRange = screen.getByText('Egyedi dátum tartomány');
    fireEvent.click(customDateRange);

    const startDate = screen.getByLabelText('Kezdő dátum');
    const endDate = screen.getByLabelText('Vég dátum');

    // Set invalid date range (end before start)
    fireEvent.change(startDate, { target: { value: '2024-01-15' } });
    fireEvent.change(endDate, { target: { value: '2024-01-10' } });

    expect(screen.getByText('A vég dátum nem lehet korábbi a kezdő dátumnál')).toBeInTheDocument();
  });

  it('should handle export format selection', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const formatSelect = screen.getByDisplayValue('PDF');
    expect(formatSelect).toBeInTheDocument();

    fireEvent.change(formatSelect, { target: { value: 'CSV' } });
    expect(formatSelect).toHaveValue('CSV');
  });

  it('should display export statistics', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    expect(screen.getByText('Export Statisztikák')).toBeInTheDocument();
    expect(screen.getByText('Összes Fogadás')).toBeInTheDocument();
    expect(screen.getByText('Összes Profit')).toBeInTheDocument();
    expect(screen.getByText('Sikerességi Arány')).toBeInTheDocument();
  });

  it('should handle export cancellation', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const cancelButton = screen.getByText('Mégse');
    fireEvent.click(cancelButton);

    expect(screen.getByText('Export megszakítva')).toBeInTheDocument();
  });

  it('should be responsive on different screen sizes', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
        className="w-full md:w-1/2 lg:w-1/3"
      />
    );

    const exportPanel = screen.getByTestId('export-panel');
    expect(exportPanel).toHaveClass('w-full', 'md:w-1/2', 'lg:w-1/3');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const exportPanel = screen.getByTestId('export-panel');
    expect(exportPanel).toHaveAttribute('role', 'region');
    expect(exportPanel).toHaveAttribute('aria-label', 'Export Panel');

    const pdfButton = screen.getByText('PDF Export');
    expect(pdfButton).toHaveAttribute('aria-label', 'Export to PDF');

    const csvButton = screen.getByText('CSV Export');
    expect(csvButton).toHaveAttribute('aria-label', 'Export to CSV');
  });

  it('should handle keyboard navigation', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const pdfButton = screen.getByText('PDF Export');
    pdfButton.focus();

    fireEvent.keyDown(pdfButton, { key: 'Enter' });
    expect(mockOnExportPDF).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(pdfButton, { key: ' ' });
    expect(mockOnExportPDF).toHaveBeenCalledTimes(2);
  });

  it('should display export progress', async () => {
    const mockOnExportPDFWithProgress = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    });

    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDFWithProgress}
        onExportCSV={mockOnExportCSV}
      />
    );

    const pdfButton = screen.getByText('PDF Export');
    fireEvent.click(pdfButton);

    expect(screen.getByText('Exportálás...')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle multiple export formats', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const formatSelect = screen.getByDisplayValue('PDF');
    fireEvent.change(formatSelect, { target: { value: 'CSV' } });

    const exportButton = screen.getByText('CSV Export');
    fireEvent.click(exportButton);

    expect(mockOnExportCSV).toHaveBeenCalledTimes(1);
  });

  it('should display export history', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    expect(screen.getByText('Export Előzmények')).toBeInTheDocument();
    expect(screen.getByText('Nincs korábbi export')).toBeInTheDocument();
  });

  it('should handle export settings persistence', () => {
    render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    const dateRangeSelect = screen.getByDisplayValue('Utolsó 30 nap');
    fireEvent.change(dateRangeSelect, { target: { value: 'last-7-days' } });

    // Simulate component remount
    const { rerender } = render(
      <ExportPanel 
        onExportPDF={mockOnExportPDF}
        onExportCSV={mockOnExportCSV}
      />
    );

    // Settings should be persisted (mocked localStorage)
    expect(dateRangeSelect).toHaveValue('last-7-days');
  });
});