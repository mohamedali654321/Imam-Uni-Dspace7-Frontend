/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { LocaleService } from '../../core/locale/locale.service';
import { ViewerSwitcherService } from './viewerSwitcherService/viewer-switcher-service.service';

@Component({
  selector: 'ds-media-viewer-switcher',
  templateUrl: './media-viewer-switcher.component.html',
  styleUrls: ['./media-viewer-switcher.component.scss']
})
export class MediaViewerSwitcherComponent implements OnInit, OnDestroy {
  @ViewChild('pdfJsViewer') pdfJsViewer: any;
  localeCode = '';
  fileURL = '';
  fileFormat = '';
  fileName = '';

  constructor(
    private viewerSwitcher: ViewerSwitcherService,
    private localeService: LocaleService
  ) { }

  msFilesFormats = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.ms-powerpoint',
    'application/vnd.ms-excel'
  ];

  ngOnInit() {
    this.localeCode = this.localeService.getCurrentLanguageCode();
    this.viewerSwitcher.currentFileURL.subscribe(url => {
      if (url !== this.fileURL) {
        this.fileURL = url;
        if (this.pdfJsViewer) {
          this.pdfJsViewer.pdfSrc = url;
          this.pdfJsViewer.refresh();
        }
      }
    });
    this.viewerSwitcher.currentFileFormat.subscribe(format => this.fileFormat = format);
    this.viewerSwitcher.currentFileName.subscribe(name => this.fileName = name);
  }

  ngOnDestroy(): void {
    this.viewerSwitcher.setFileURL('');
    this.viewerSwitcher.setFileFormat('');
  }

  async modifyPdf() {
    console.log('test printing.........');
    const existingPdfBytes = await fetch(this.fileURL).then(res => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    pages.forEach(page => {
      const { width, height } = page.getSize();
      page.drawText('All rights reserved to KnowledgeWare Technologies', {
        x: 0,
        y: height / 2 + 300,
        size: 35,
        font: helveticaFont,
        color: rgb(0.95, 0.1, 0.1),
        rotate: degrees(-45),
      });
      // page.drawImage('../../../assets/images/dspace-logo.png', {
      //   x: 0,
      //   y: height / 2 + 300,
      //   size: 35,
      //   font: helveticaFont,
      //   color: rgb(0.95, 0.1, 0.1),
      //   rotate: degrees(-45),
      // });
    });


    const pdfBytes = await pdfDoc.save();

    this.saveByteArray('test.pdf', pdfBytes);
  }

  saveByteArray(reportName: string, byte: any) {
    let blob = new Blob([byte], { type: 'application/pdf' });
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    let fileName = reportName;
    link.download = fileName;
    link.click();
  }

  downloadFile() {
    let link = document.createElement('a');
    link.href = this.fileURL;
    let fileName = 'test.jpg';
    link.download = fileName;
    link.click();
  }

  closeViewer(): void {
    this.viewerSwitcher.setFileURL('');
    this.viewerSwitcher.setFileFormat('');
  }
}
