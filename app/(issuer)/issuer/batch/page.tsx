'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, type SelectOption } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

const schemaOptions: SelectOption[] = [
  { value: 'university-degree', label: 'University Degree' },
  { value: 'employee-id', label: 'Employee ID' },
  { value: 'course-completion', label: 'Course Completion' },
  { value: 'professional-cert', label: 'Professional Certificate' },
];

interface ParsedRow {
  name: string;
  email: string;
  data: Record<string, string>;
  valid: boolean;
  error?: string;
}

export default function BatchIssuePage() {
  const router = useRouter();
  const [selectedSchema, setSelectedSchema] = React.useState('');
  const [batchName, setBatchName] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<ParsedRow[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsUploading(true);

    // Simulate parsing CSV
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock parsed data
    const mockData: ParsedRow[] = [
      { name: 'Alice Johnson', email: 'alice@example.com', data: { degree: 'Bachelor of Science', major: 'Computer Science', graduationDate: '2024-05-15' }, valid: true },
      { name: 'Bob Smith', email: 'bob@example.com', data: { degree: 'Master of Science', major: 'Data Science', graduationDate: '2024-05-15' }, valid: true },
      { name: 'Carol Davis', email: 'carol@example.com', data: { degree: 'Bachelor of Arts', major: 'Psychology', graduationDate: '2024-05-15' }, valid: true },
      { name: 'David Wilson', email: 'invalid-email', data: { degree: 'Bachelor of Science', major: 'Physics', graduationDate: '2024-05-15' }, valid: false, error: 'Invalid email format' },
      { name: 'Eve Brown', email: 'eve@example.com', data: { degree: 'PhD', major: 'Mathematics', graduationDate: '2024-05-15' }, valid: true },
    ];

    setParsedData(mockData);
    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = parsedData.filter(r => r.valid).length;
  const invalidCount = parsedData.filter(r => !r.valid).length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success('Batch issued successfully!', {
      description: `${validCount} credentials have been issued.`,
    });
    
    router.push('/issuer/credentials');
  };

  const downloadTemplate = () => {
    const csv = 'name,email,degree,major,graduation_date\nJohn Doe,john@example.com,Bachelor of Science,Computer Science,2024-05-15';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'credential_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Batch Issue"
        description="Issue multiple credentials at once by uploading a CSV file."
      />

      {/* Step 1: Schema Selection */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              1
            </div>
            <h3 className="font-semibold">Select Credential Type</h3>
          </div>
          <div className="pl-11 space-y-4">
            <div className="space-y-2">
              <Label>Credential Schema</Label>
              <Select
                value={selectedSchema}
                onValueChange={setSelectedSchema}
                options={schemaOptions}
                placeholder="Select a schema"
              />
            </div>
            <div className="space-y-2">
              <Label>Batch Name</Label>
              <Input
                placeholder="e.g., Spring 2024 Graduates"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: File Upload */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <h3 className="font-semibold">Upload CSV File</h3>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
          
          <div className="pl-11">
            {!file ? (
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium mb-1">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground">
                  or click to browse from your computer
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isUploading && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Parsing CSV...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Preview */}
      {parsedData.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <h3 className="font-semibold">Preview & Validate</h3>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {validCount} Valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {invalidCount} Invalid
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="pl-11">
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Degree</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Major</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((row, idx) => (
                        <tr key={idx} className="border-b border-border last:border-0">
                          <td className="px-4 py-3">
                            {row.valid ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <span className="text-xs text-destructive">{row.error}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">{row.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{row.email}</td>
                          <td className="px-4 py-3 text-sm">{row.data.degree}</td>
                          <td className="px-4 py-3 text-sm">{row.data.major}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={validCount === 0 || !selectedSchema || !batchName || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Issuing {validCount} credentials...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Issue {validCount} Credentials
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
