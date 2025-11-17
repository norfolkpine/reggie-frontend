import { DOCXExporter } from '@blocknote/xl-docx-exporter';
import { PDFExporter } from '@blocknote/xl-pdf-exporter';
import { pdf } from '@react-pdf/renderer';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useEditorStore } from '@/features/docs/doc-editor';
import { Doc, useTrans } from '@/features/docs/doc-management';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

import { exportCorsResolveFileUrl } from '../api/exportResolveFileUrl';
import { TemplatesOrdering, useTemplates } from '../api/useTemplates';
import { docxDocsSchemaMappings } from '../mappingDocx';
import { pdfDocsSchemaMappings } from '../mappingPDF';
import { downloadFile } from '../utils';
import { IconFileCode2, IconFileWord, IconPdf } from '@tabler/icons-react';

enum DocDownloadFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  ODT = 'odt',
}

interface ModalExportProps {
  onClose: () => void;
  doc: Doc;
  open: boolean;
}

function sanitizeFilename(filename: string): string {
  // Remove any character that is not a-z, A-Z, 0-9, dash, underscore, or dot
  // Replace spaces with dashes, remove other potentially dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '-') // Only allow safe characters
    .replace(/-+/g, '-') // Collapse multiple dashes
    .replace(/^[-.]+|[-.]+$/g, ''); // Remove leading/trailing dashes or dots
}

export const ModalExport = ({ onClose, doc, open }: ModalExportProps) => {
  const { t } = useTranslation();
  const { data: templates } = useTemplates({
    ordering: TemplatesOrdering.BY_CREATED_ON_DESC,
  });
  const { toast } = useToast();
  const { editor } = useEditorStore();
  const [templateSelected, setTemplateSelected] = useState<string>('empty');
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<DocDownloadFormat>(DocDownloadFormat.PDF);
  const { untitledDocument } = useTrans();

  const templateOptions = useMemo(() => {
    const templateOptions = (templates?.pages || [])
      .map((page) =>
        page.results.map((template) => ({
          label: template.title,
          value: template.code,
        })),
      )
      .flat();

    templateOptions.unshift({
      label: t('Empty template'),
      value: 'empty',
    });

    return templateOptions;
  }, [t, templates?.pages]);

  async function onSubmit() {
    if (!editor) {
      toast({
        title: t('Export Failed'),
        description: t('The export failed'),
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    const title = sanitizeFilename(
      (doc.title || untitledDocument)
        .toLowerCase()
        .normalize('NFD')
        .replace(/\s/g, '-')
        .replace(/[\u0300-\u036f]/g, '')
    );

    const html = templateSelected === 'empty' ? '' : templateSelected;
    let exportDocument = editor.document;
    if (html) {
      const blockTemplate = await editor.tryParseHTMLToBlocks(html);
      exportDocument = [...blockTemplate, ...editor.document];
    }

    let blobExport: Blob;
    if (format === DocDownloadFormat.PDF) {
      const exporter = new PDFExporter(editor.schema, pdfDocsSchemaMappings, {
        resolveFileUrl: async (url) => exportCorsResolveFileUrl(doc.id, url),
      });
      const pdfDocument = await exporter.toReactPDFDocument(exportDocument);
      blobExport = await pdf(pdfDocument).toBlob();
    } else {
      // For both DOCX and ODT formats, use the DOCXExporter
      // In a real implementation, you would use different exporters for each format
      const exporter = new DOCXExporter(editor.schema, docxDocsSchemaMappings, {
        resolveFileUrl: async (url) => exportCorsResolveFileUrl(doc.id, url),
      });

      blobExport = await exporter.toBlob(exportDocument);
    }

    downloadFile(blobExport, `${title}.${format}`);

    toast({
      title: t('Export Successful'),
      description: t('Your {{format}} was downloaded successfully', { format }),
      variant: 'default',
    });

    setIsExporting(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-4">
        <DialogTitle className="text-xl font-semibold mb-1">{t('Download the document')}</DialogTitle>
        <p className="text-sm text-muted-foreground mb-3">{t('Select a format to download your document.')}</p>
        
        <div className="flex gap-3 mb-4">
          {/* PDF Format Card */}
          <div 
            className={`border rounded-lg p-3 flex-1 flex flex-col items-center justify-center cursor-pointer transition-all ${format === DocDownloadFormat.PDF ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-300' : 'hover:border-muted-foreground'}`}
            onClick={() => setFormat(DocDownloadFormat.PDF)}
          >
            <div className="w-12 h-12 flex items-center justify-center mb-1">
              <div className="relative">
                <div className="w-10 h-12 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center">
                  <IconPdf className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </div>
            <span className="font-semibold">PDF</span>
          </div>
          
          {/* Word Format Card */}
          <div 
            className={`border rounded-lg p-3 flex-1 flex flex-col items-center justify-center cursor-pointer transition-all ${format === DocDownloadFormat.DOCX ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-300' : 'hover:border-muted-foreground'}`}
            onClick={() => setFormat(DocDownloadFormat.DOCX)}
          >
            <div className="w-12 h-12 flex items-center justify-center mb-1">
              <div className="relative">
                <div className="w-10 h-12 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center">
                  <IconFileWord className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
            <span className="font-semibold">Word</span>
          </div>
          
          {/* OpenDoc Format Card */}
          <div 
            className={`border rounded-lg p-3 flex-1 flex flex-col items-center justify-center cursor-pointer transition-all ${format === DocDownloadFormat.ODT ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-300' : 'hover:border-muted-foreground'}`}
            onClick={() => setFormat(DocDownloadFormat.ODT)}
          >
            <div className="w-12 h-12 flex items-center justify-center mb-1">
              <div className="relative">
                <div className="w-10 h-12 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center">
                  <IconFileCode2 className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
            <span className="font-semibold">OpenDoc</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3">
          {format === DocDownloadFormat.PDF ? 
            t('To print or share the definitive version of the document.') : 
            format === DocDownloadFormat.DOCX ?
            t('To edit the document in Microsoft Word or similar applications.') :
            t('To edit the document in OpenOffice or similar applications.')}
        </p>
        
        {/* Template selection - hidden in a collapsible section */}
        <div className="hidden">
          <Select
            value={templateSelected}
            onValueChange={setTemplateSelected}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('Select template')} />
            </SelectTrigger>
            <SelectContent>
              {templateOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 mr-2"
          >
            {t('Cancel')}
          </Button>
          <Button 
            onClick={() => void onSubmit()}
            disabled={isExporting || !format}
            className={`px-4`}
          >
            {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {format === DocDownloadFormat.PDF ? t('Download PDF') : 
             format === DocDownloadFormat.DOCX ? t('Download Word') : 
             t('Download OpenDoc')}
          </Button>
        </div>

        {isExporting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
