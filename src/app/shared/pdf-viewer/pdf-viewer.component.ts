import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription, Observable, of as observableOf} from 'rxjs';
import { BitstreamDataService } from 'src/app/core/data/bitstream-data.service';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { LocaleService } from 'src/app/core/locale/locale.service';
import { SharedVariableService } from 'src/app/core/services/share-variable.service';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import { Item } from 'src/app/core/shared/item.model';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { hasValue } from 'src/app/shared/empty.util';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { catchError, map } from 'rxjs/operators';
import { AccessStatusObject } from '../object-list/access-status-badge/access-status.model';
import { AccessStatusDataService } from 'src/app/core/data/access-status-data.service';
import * as Cookies from 'js-cookie';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'ds-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent implements OnInit {

  isShow = true;

  @Input() item: Item;
  @Input() srcFile: string;

  label = 'item.page.files';

  separator = '<br/>';

  src:  string;

  srcRestricted:  string;


  accessStatus$: Observable<string>;

  sourceURL: string;

  public subscription: Subscription;
  bitstreams$: BehaviorSubject<Bitstream[]>;

  currentPage: number;

  isLoading: boolean;

  isLastPage: boolean;

  locale: string;

  isAuthenticated$: Observable<boolean>;


  pageSize = 5;
  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected notificationsService: NotificationsService,
    protected translateService: TranslateService,
    protected localeService: LocaleService,
    public sharedVariable: SharedVariableService,
    private accessStatusDataService: AccessStatusDataService,
    private authService: AuthService


  ) {

  }


  ngOnInit(): void {
    this.getNextPage();
    this.locale = this.localeService.getCurrentLanguageCode();
     this.sharedVariable.getMessage().subscribe(value=>{this.src = value;});
     this.sharedVariable.getRestrictedMessage().subscribe(value=>{this.srcRestricted = value;});
   this.isAuthenticated$ = this.authService.isAuthenticated();

if (this.item.accessStatus == null) {
  // In case the access status has not been loaded, do it individually.
  this.item.accessStatus = this.accessStatusDataService.findAccessStatusFor(this.item);
}
this.accessStatus$ = this.item.accessStatus.pipe(
  map((accessStatusRD) => {
    if (accessStatusRD.statusCode !== 401 && hasValue(accessStatusRD.payload)) {
      return accessStatusRD.payload;
    } else {
      return [];
    }
  }),
  map((accessStatus: AccessStatusObject) => hasValue(accessStatus.status) ? accessStatus.status : 'unknown'),

);


  }




  // show(): void{
  //    this.isShow = !this.isShow;
  // }

  getFileExtension(filename) {
    return /[^.]+$/.exec(filename).toString();
}

  getNextPage(): void {
    this.isLoading = true;
    if (this.currentPage === undefined) {
      this.currentPage = 1;
      this.bitstreams$ = new BehaviorSubject([]);
    } else {
      this.currentPage++;
    }
    this.bitstreamDataService.findAllByItemAndBundleName(this.item, 'ORIGINAL', {
      currentPage: this.currentPage,
      elementsPerPage: this.pageSize
    }).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((bitstreamsRD: RemoteData<PaginatedList<Bitstream>>) => {
      if (bitstreamsRD.errorMessage) {
        this.notificationsService.error(this.translateService.get('file-link.error.header'), `${bitstreamsRD.statusCode} ${bitstreamsRD.errorMessage}`);
      } else if (hasValue(bitstreamsRD.payload)) {
        const current: Bitstream[] = this.bitstreams$.getValue();
        this.bitstreams$.next([...current, ...bitstreamsRD.payload.page]);
        this.isLoading = false;
        this.isLastPage = this.currentPage === bitstreamsRD.payload.totalPages;
      }
    });
  }

  // public ngOnDestroy(): void {
  //   this.subscription.unsubscribe(); // onDestroy cancels the subscribe request
  // }

  decodeURL(url): any{
   return  encodeURIComponent(url)
   .replace(
     /[!'()*]/g,
     (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
   );
  }
}
