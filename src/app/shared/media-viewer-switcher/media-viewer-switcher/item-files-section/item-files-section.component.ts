import { Component, Input, OnInit } from '@angular/core';
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

@Component({
  selector: 'ds-item-files-section',
  templateUrl: './item-files-section.component.html',
  styleUrls: ['./item-files-section.component.scss']
})
export class ItemFilesSectionComponent implements OnInit {
  @Input() item: Item;

  bitstreams$: BehaviorSubject<Bitstream[]>;
  isLoading: boolean;
  selectedFile = '';
  currentIndex =  0 ; //kware-edit

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected notificationsService: NotificationsService,
    protected translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.bitstreams$ = new BehaviorSubject([]);
    this.bitstreamDataService.findAllByItemAndBundleName(this.item, 'ORIGINAL', {
      currentPage: 1,
      elementsPerPage: 100
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

  setSelectedFile($event: string) {
    this.selectedFile = $event;
  }
//kware-edit
  selectedIndex(index: number) {
    this.currentIndex = index;
  }
//kware-edit
  nextFile() {
    this.currentIndex++;
  }

 //kware-edit
  prevFile() {
    this.currentIndex--;
  }
}
