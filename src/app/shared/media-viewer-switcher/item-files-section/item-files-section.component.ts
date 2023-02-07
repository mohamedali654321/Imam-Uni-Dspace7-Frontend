import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
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
  @ViewChildren('filesIds') filesIds: QueryList<any>;

  bitstreams$: BehaviorSubject<Bitstream[]>;
  isLoading: boolean;
  selectedFile: number;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected notificationsService: NotificationsService,
    protected translateService: TranslateService,
    private viewerService: ViewerSwitcherService
  ) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.bitstreams$ = new BehaviorSubject([]);
    this.bitstreamDataService.findAllByItemAndBundleName(this.item, 'ORIGINAL', {
      currentPage: 1,
      elementsPerPage: 500
    }).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((bitstreamsRD: RemoteData<PaginatedList<Bitstream>>) => {
      if (bitstreamsRD.errorMessage) {
        this.notificationsService.error(this.translateService.get('file-section.error.header'), `${bitstreamsRD.statusCode} ${bitstreamsRD.errorMessage}`);
      } else if (hasValue(bitstreamsRD.payload)) {
        const current: Bitstream[] = this.bitstreams$.getValue();
        this.bitstreams$.next([...current, ...bitstreamsRD.payload.page]);
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
  }

  getNextFile() {
    console.log('filesIds', this.filesIds.toArray());
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
}
