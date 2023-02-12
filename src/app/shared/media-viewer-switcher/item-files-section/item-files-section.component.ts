import { Component, Input, OnInit, QueryList, ViewChildren, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Item } from '../../../core/shared/item.model';
import { BehaviorSubject } from 'rxjs';
import { Bitstream } from '../../../core/shared/bitstream.model';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { RemoteData } from '../../../core/data/remote-data';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { hasValue } from 'src/app/shared/empty.util';
import { ViewerSwitcherService } from '../viewerSwitcherService/viewer-switcher-service.service';

@Component({
  selector: 'ds-item-files-section',
  templateUrl: './item-files-section.component.html',
  styleUrls: ['./item-files-section.component.scss']
})
export class ItemFilesSectionComponent implements OnInit {
  @Input() item: Item;
  @ViewChild('filesListContainer', { static: false }) filesListContainer: ElementRef;
  @ViewChildren('filesIds') filesIds: QueryList<any>;

  bitstreams$: BehaviorSubject<Bitstream[]>;
  filesList: any = [];
  isLoading: boolean;
  selectedFile: number;
  totalElements: number;
  totalPages: number;

  currentPage = 1;
  isLastPage: boolean;
  pageSize = 10;

  scrollPosition: number;

  isManuscript = false;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected notificationsService: NotificationsService,
    protected translateService: TranslateService,
    private viewerService: ViewerSwitcherService
  ) {
  }

  ngOnInit(): void {
    this.onLoadMoreFiles();
  }

  onLoadMoreFiles(): void {
    this.isLoading = true;
    if (this.bitstreams$ === undefined) {
      this.bitstreams$ = new BehaviorSubject([]);
    }
    this.bitstreamDataService.findAllByItemAndBundleName(this.item, 'ORIGINAL', {
      currentPage: this.currentPage,
      elementsPerPage: 9999
    }).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((bitstreamsRD: RemoteData<PaginatedList<Bitstream>>) => {
      if (bitstreamsRD.errorMessage) {
        this.notificationsService.error(this.translateService.get('file-section.error.header'), `${bitstreamsRD.statusCode} ${bitstreamsRD.errorMessage}`);
      } else if (hasValue(bitstreamsRD.payload)) {
        const current: Bitstream[] = this.bitstreams$.getValue();
        this.bitstreams$.next([...current, ...bitstreamsRD.payload.page]);
        this.totalElements = bitstreamsRD.payload.totalElements;
        this.totalPages = bitstreamsRD.payload.totalPages;
        this.isLoading = false;
      }
    });
  }

  selectedFileClickEvent($event: number) {
    this.selectedFile = $event;
  }

  emitMediaViewerSwitcher() {
    const currentElement = this.filesIds.toArray().find(file => file.fileIndex === this.selectedFile);
    this.viewerService.setFileFormat(currentElement.fileFormat);
    this.viewerService.setFileURL(
      currentElement.fileFormat === 'application/pdf' ?
        encodeURIComponent(currentElement.fileURL)
        : currentElement.fileURL);
    this.viewerService.setFileName(currentElement.bitstream?.name);
    currentElement.scrollToView();
  }

  getNextFile() {
    if (!this.selectedFile && this.selectedFile !== 0) {
      this.selectedFile = 0;
    } else {
      this.selectedFile++;
    }
    this.emitMediaViewerSwitcher();
  }

  getPrevFile() {
    this.selectedFile--;
    this.emitMediaViewerSwitcher();
  }

  // setManuScriptType() {
  //   this.viewerService.setManuScriptType(true);
  // }

  trackByIdx(i) {
    return i;
  }
}
