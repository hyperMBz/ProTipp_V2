"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Download,
  FileText,
  Table,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportOptions {
  format: 'pdf' | 'csv';
  includeSummary: boolean;
  includeMetrics: boolean;
  includeCharts: boolean;
  includeTrends: boolean;
  includeSportPerformance: boolean;
  includeBookmakerPerformance: boolean;
}

interface ExportPanelProps {
  onExport: (options: ExportOptions) => Promise<void>;
  isExporting?: boolean;
  exportError?: string | null;
  className?: string;
}

export function ExportPanel({ 
  onExport, 
  isExporting = false, 
  exportError = null,
  className 
}: ExportPanelProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeSummary: true,
    includeMetrics: true,
    includeCharts: true,
    includeTrends: true,
    includeSportPerformance: true,
    includeBookmakerPerformance: true
  });

  const handleFormatChange = (format: 'pdf' | 'csv') => {
    setExportOptions(prev => ({ ...prev, format }));
  };

  const handleOptionChange = (option: keyof Omit<ExportOptions, 'format'>, checked: boolean) => {
    setExportOptions(prev => ({ ...prev, [option]: checked }));
  };

  const handleExport = async () => {
    await onExport(exportOptions);
  };

  const hasAnyOptionSelected = Object.values(exportOptions).some(value => 
    typeof value === 'boolean' ? value : true
  );

  return (
    <Card className={cn("gradient-bg border-primary/20", className)}>
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Adatok Exportálása
        </CardTitle>
        <CardDescription>
          Exportálj analytics adatokat PDF vagy CSV formátumban.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Export Formátum</Label>
          <RadioGroup
            value={exportOptions.format}
            onValueChange={handleFormatChange}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center space-x-2">
                <Table className="h-4 w-4" />
                <span>CSV</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Exportálható Adatok</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="summary"
                checked={exportOptions.includeSummary}
                onCheckedChange={(checked) => handleOptionChange('includeSummary', checked as boolean)}
              />
              <Label htmlFor="summary" className="text-sm">Összefoglaló adatok</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metrics"
                checked={exportOptions.includeMetrics}
                onCheckedChange={(checked) => handleOptionChange('includeMetrics', checked as boolean)}
              />
              <Label htmlFor="metrics" className="text-sm">Teljesítmény metrikák</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="charts"
                checked={exportOptions.includeCharts}
                onCheckedChange={(checked) => handleOptionChange('includeCharts', checked as boolean)}
              />
              <Label htmlFor="charts" className="text-sm">Profit/Loss grafikon</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="trends"
                checked={exportOptions.includeTrends}
                onCheckedChange={(checked) => handleOptionChange('includeTrends', checked as boolean)}
              />
              <Label htmlFor="trends" className="text-sm">Fogadási trendek</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sport"
                checked={exportOptions.includeSportPerformance}
                onCheckedChange={(checked) => handleOptionChange('includeSportPerformance', checked as boolean)}
              />
              <Label htmlFor="sport" className="text-sm">Sport teljesítmény</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bookmaker"
                checked={exportOptions.includeBookmakerPerformance}
                onCheckedChange={(checked) => handleOptionChange('includeBookmakerPerformance', checked as boolean)}
              />
              <Label htmlFor="bookmaker" className="text-sm">Fogadóiroda teljesítmény</Label>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            {isExporting && (
              <Badge variant="outline" className="text-primary">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Exportálás...
              </Badge>
            )}
            {exportError && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Hiba
              </Badge>
            )}
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting || !hasAnyOptionSelected}
            className="bg-primary hover:bg-primary/90"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Exportálás...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportálás
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {exportError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">
              Hiba az export során: {exportError}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}