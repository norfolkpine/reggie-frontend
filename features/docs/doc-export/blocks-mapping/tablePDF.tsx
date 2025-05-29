// @ts-nocheck
import { TD, TH, TR, Table } from '@ag-media/react-pdf-table';
import { View } from '@react-pdf/renderer';

import { DocsExporterPDF } from '../types';

export const blockMappingTablePDF: DocsExporterPDF['mappings']['blockMapping']['table'] =
  (block, exporter) => {
    return (
      <Table>
        {block.content.rows.map((row, index) => {
          if (index === 0) {
            return (
              <TH key={index}>
                {row.cells.map((cell, index) => {
                  if (!Array.isArray(cell)) {
                    return <TD key={index}>{exporter.transformInlineContent([])}</TD>;
                  }
                  return (
                    <TD key={index}>{exporter.transformInlineContent(cell)}</TD>
                  );
                })}
              </TH>
            );
          }
          return (
            <TR key={index}>
              {row.cells.map((cell, index) => {
                if (!Array.isArray(cell)) {
                  return (
                    <TD key={index}>
                      <View>{exporter.transformInlineContent([])}</View>
                    </TD>
                  );
                }
                return (
                  <TD key={index}>
                    <View>{exporter.transformInlineContent(cell)}</View>
                  </TD>
                );
              })}
            </TR>
          );
        })}
      </Table>
    );
  };
