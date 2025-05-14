import { DOCXExporter } from '@blocknote/xl-docx-exporter';
import { PDFExporter } from '@blocknote/xl-pdf-exporter';
import { pdf } from '@react-pdf/renderer';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useEditorStore } from '@/features/docs/doc-editor';
import { Doc, useTrans } from '@/features/docs/doc-management';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

import { exportCorsResolveFileUrl } from '../api/exportResolveFileUrl';
import { TemplatesOrdering, useTemplates } from '../api/useTemplates';
import { docxDocsSchemaMappings } from '../mappingDocx';
import { pdfDocsSchemaMappings } from '../mappingPDF';
import { downloadFile } from '../utils';

enum DocDownloadFormat {
  PDF = 'pdf',
  DOCX = 'docx',
}

interface ModalExportProps {
  onClose: () => void;
  doc: Doc;
  open: boolean;
}

export const ModalExport = ({ onClose, doc, open }: ModalExportProps) => {
  const { t } = useTranslation();
  const { data: templates } = useTemplates({
    ordering: TemplatesOrdering.BY_CREATED_ON_DESC,
  });
  const { toast } = useToast();
  const { editor } = useEditorStore();
  const [templateSelected, setTemplateSelected] = useState<string>('');
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
      value: '',
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

    const title = (doc.title || untitledDocument)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '-');

    const html = templateSelected;
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('Download')}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            {t('Download your document in a .docx or .pdf format.')}
          </p>
          
          <div className="grid gap-4">
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

            <Select
              value={format}
              onValueChange={(value) => setFormat(value as DocDownloadFormat)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Select format')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DocDownloadFormat.DOCX}>{t('Docx')}</SelectItem>
                <SelectItem value={DocDownloadFormat.PDF}>{t('PDF')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={() => void onSubmit()}
            disabled={isExporting}
          >
            {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('Download')}
          </Button>
        </DialogFooter>

        {isExporting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
