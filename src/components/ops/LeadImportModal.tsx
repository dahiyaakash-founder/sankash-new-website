import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Download, CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet } from "lucide-react";
import {
  parseFile, autoMapHeaders, validateRows, detectDuplicates, executeImport, downloadTemplate, downloadErrorReport,
  TEMPLATE_HEADERS, VALID_AUDIENCES, VALID_SOURCES, VALID_STATUSES, VALID_PRIORITIES,
  type ParsedSheet, type TemplateHeader, type ValidatedRow, type DuplicateAction, type ImportDefaults, type ImportResult,
} from "@/lib/lead-import-service";
import type { TeamMember } from "@/lib/leads-service";

type Step = "upload" | "mapping" | "preview" | "importing" | "done";

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  teamMembers: TeamMember[];
  onImportComplete: () => void;
}

export default function LeadImportModal({ open, onClose, userId, teamMembers, onImportComplete }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<string, TemplateHeader | "">>({});
  const [validated, setValidated] = useState<ValidatedRow[]>([]);
  const [duplicateAction, setDuplicateAction] = useState<DuplicateAction>("skip");
  const [batchName, setBatchName] = useState("");
  const [defaults, setDefaults] = useState<ImportDefaults>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const teamEmailMap = Object.fromEntries(
    teamMembers
      .filter(m => m.email)
      .map(m => [m.email!.toLowerCase(), m.user_id])
  );

  const reset = () => {
    setStep("upload"); setParsed(null); setMapping({}); setValidated([]);
    setDuplicateAction("skip"); setBatchName(""); setDefaults({});
    setResult(null); setError(""); setLoading(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setLoading(true);
    try {
      const sheet = await parseFile(file);
      setParsed(sheet);
      const auto = autoMapHeaders(sheet.headers);
      setMapping(auto);
      setStep("mapping");
    } catch (e: any) {
      setError(e.message || "Failed to parse file");
    }
    setLoading(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleValidate = async () => {
    if (!parsed) return;
    setLoading(true);
    const rows = validateRows(parsed.rows, mapping, defaults, teamEmailMap);
    const withDups = await detectDuplicates(rows);
    setValidated(withDups);
    setStep("preview");
    setLoading(false);
  };

  const handleImport = async () => {
    setStep("importing");
    setLoading(true);
    try {
      const res = await executeImport(validated, duplicateAction, parsed!.fileName, batchName, userId);
      setResult(res);
      setStep("done");
      onImportComplete();
    } catch (e: any) {
      setError(e.message || "Import failed");
      setStep("preview");
    }
    setLoading(false);
  };

  const validCount = validated.filter(r => r.valid).length;
  const invalidCount = validated.filter(r => !r.valid).length;
  const dupCount = validated.filter(r => r.duplicateOf).length;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet size={18} /> Import Leads
          </DialogTitle>
        </DialogHeader>

        {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

        {/* STEP: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById("import-file-input")?.click()}
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : (
                <>
                  <Upload size={28} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Drop CSV or XLSX file here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                </>
              )}
              <input
                id="import-file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => downloadTemplate("xlsx")} className="gap-1.5 text-xs">
                <Download size={14} /> Download Template (XLSX)
              </Button>
              <Button variant="ghost" size="sm" onClick={() => downloadTemplate("csv")} className="text-xs">
                Download CSV Template
              </Button>
            </div>
          </div>
        )}

        {/* STEP: Mapping */}
        {step === "mapping" && parsed && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found <strong>{parsed.rows.length}</strong> rows with <strong>{parsed.headers.length}</strong> columns in <em>{parsed.fileName}</em>
            </p>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Column Mapping</p>
              {parsed.headers.map((h) => (
                <div key={h} className="flex items-center gap-3">
                  <span className="text-xs font-mono w-[140px] truncate shrink-0" title={h}>{h}</span>
                  <span className="text-muted-foreground text-xs">→</span>
                  <Select
                    value={mapping[h] || "__skip__"}
                    onValueChange={(v) => setMapping(prev => ({ ...prev, [h]: v === "__skip__" ? "" : v as TemplateHeader }))}
                  >
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__skip__">— Skip —</SelectItem>
                      {TEMPLATE_HEADERS.map((th) => (
                        <SelectItem key={th} value={th}>{th}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Defaults */}
            <div className="space-y-2 border-t pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Default Values (for blank cells)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Default Audience</Label>
                  <Select value={defaults.audience || "__none__"} onValueChange={v => setDefaults(d => ({ ...d, audience: v === "__none__" ? undefined : v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {VALID_AUDIENCES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Default Source</Label>
                  <Select value={defaults.source_type || "__none__"} onValueChange={v => setDefaults(d => ({ ...d, source_type: v === "__none__" ? undefined : v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">excel_import</SelectItem>
                      {VALID_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Default Priority</Label>
                  <Select value={defaults.priority || "__none__"} onValueChange={v => setDefaults(d => ({ ...d, priority: v === "__none__" ? undefined : v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">medium</SelectItem>
                      {VALID_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Default Status</Label>
                  <Select value={defaults.status || "__none__"} onValueChange={v => setDefaults(d => ({ ...d, status: v === "__none__" ? undefined : v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">new</SelectItem>
                      {VALID_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Batch Name (optional)</Label>
                <Input className="h-8 text-xs" placeholder="e.g. March Expo Leads" value={batchName} onChange={e => setBatchName(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={reset}>Back</Button>
              <Button size="sm" onClick={handleValidate} disabled={loading} className="gap-1.5">
                {loading && <Loader2 size={14} className="animate-spin" />}
                Validate & Preview
              </Button>
            </div>
          </div>
        )}

        {/* STEP: Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full">
                <CheckCircle2 size={12} /> {validCount} valid
              </span>
              {invalidCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full">
                  <XCircle size={12} /> {invalidCount} invalid
                </span>
              )}
              {dupCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full">
                  <AlertTriangle size={12} /> {dupCount} duplicates
                </span>
              )}
            </div>

            {/* Preview table */}
            <div className="border rounded-lg overflow-x-auto max-h-[200px]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-2 py-1.5 text-left">Row</th>
                    <th className="px-2 py-1.5 text-left">Name</th>
                    <th className="px-2 py-1.5 text-left">Mobile</th>
                    <th className="px-2 py-1.5 text-left">Email</th>
                    <th className="px-2 py-1.5 text-left">Status</th>
                    <th className="px-2 py-1.5 text-left">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {validated.slice(0, 50).map((r) => (
                    <tr key={r.rowIndex} className={`border-b ${!r.valid ? "bg-red-50/50" : r.duplicateOf ? "bg-yellow-50/50" : ""}`}>
                      <td className="px-2 py-1">{r.rowIndex}</td>
                      <td className="px-2 py-1">{r.data.full_name || "—"}</td>
                      <td className="px-2 py-1 font-mono">{r.data.mobile || "—"}</td>
                      <td className="px-2 py-1">{r.data.email || "—"}</td>
                      <td className="px-2 py-1">
                        {!r.valid ? <span className="text-red-600">Invalid</span> :
                          r.duplicateOf ? <span className="text-yellow-600">Duplicate</span> :
                          <span className="text-green-600">Ready</span>}
                      </td>
                      <td className="px-2 py-1 max-w-[200px] truncate text-muted-foreground" title={[...r.errors, ...r.warnings].join("; ")}>
                        {[...r.errors, ...r.warnings].join("; ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Duplicate action */}
            {dupCount > 0 && (
              <div>
                <Label className="text-xs font-medium">How to handle {dupCount} duplicates?</Label>
                <Select value={duplicateAction} onValueChange={v => setDuplicateAction(v as DuplicateAction)}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip duplicate rows</SelectItem>
                    <SelectItem value="import_new">Import all as new leads</SelectItem>
                    <SelectItem value="update">Update existing leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("mapping")}>Back</Button>
              <Button size="sm" onClick={handleImport} disabled={validCount === 0} className="gap-1.5">
                Import {validCount} Lead{validCount !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        )}

        {/* STEP: Importing */}
        {step === "importing" && (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-muted-foreground">Importing leads…</p>
          </div>
        )}

        {/* STEP: Done */}
        {step === "done" && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={20} />
              <span className="font-semibold">Import Complete</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted/50 p-2 rounded">Total rows: <strong>{result.totalRows}</strong></div>
              <div className="bg-muted/50 p-2 rounded">Valid: <strong>{result.validRows}</strong></div>
              <div className="bg-green-50 p-2 rounded text-green-700">Imported: <strong>{result.importedRows}</strong></div>
              <div className="bg-blue-50 p-2 rounded text-blue-700">Updated: <strong>{result.updatedRows}</strong></div>
              <div className="bg-yellow-50 p-2 rounded text-yellow-700">Skipped: <strong>{result.skippedRows}</strong></div>
              <div className="bg-red-50 p-2 rounded text-red-700">Failed: <strong>{result.failedRows}</strong></div>
            </div>
            {result.failedRows > 0 && (
              <Button variant="outline" size="sm" onClick={() => downloadErrorReport(result.failedDetails)} className="gap-1.5 text-xs">
                <Download size={14} /> Download Error Report
              </Button>
            )}
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
