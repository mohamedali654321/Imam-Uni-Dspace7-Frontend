import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BitstreamDataService } from '../../../../core/data/bitstream-data.service';
import { catchError, map, take } from 'rxjs/operators';
import { Bitstream } from '../../../../core/shared/bitstream.model';
import { Item } from '../../../../core/shared/item.model';
import { RemoteData } from '../../../../core/data/remote-data';
import { hasValue } from '../../../../shared/empty.util';
import { PaginatedList } from '../../../../core/data/paginated-list.model';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { getFirstCompletedRemoteData } from '../../../../core/shared/operators';
import { SharedVariableService } from 'src/app/core/services/share-variable.service';
import * as Cookies from 'js-cookie';
import { FileService } from 'src/app/core/shared/file.service';
import { AccessStatusDataService } from 'src/app/core/data/access-status-data.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AccessStatusObject } from 'src/app/shared/object-list/access-status-badge/access-status.model';
import { URLCombiner } from 'src/app/core/url-combiner/url-combiner';
/**
 * This component renders the file section of the item
 * inside a 'ds-metadata-field-wrapper' component.
 */
@Component({
  selector: 'ds-item-page-file-section',
  templateUrl: './file-section.component.html'
})
export class FileSectionComponent implements OnInit {

  @Input() item: Item;

  label = 'item.page.files';

  separator = '<br/>';

  bitstreams$: BehaviorSubject<Bitstream[]>;

  currentPage: number;

  isLoading: boolean;

  link: string;

  isLastPage: boolean;

  pageSize = 5;

  isShow = false;

  accessStatus$: Observable<string>;

  isAuthenticated$: Observable<boolean>;

  token: string;



  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected notificationsService: NotificationsService,
    protected translateService: TranslateService,
    protected sharedVariable: SharedVariableService,
    public fileService: FileService,
    protected accessStatusDataService: AccessStatusDataService,
    public authService: AuthService
  ) {
  }

  ngOnInit(): void {

    this.getNextPage();
    this.authService.getShortlivedToken().subscribe(token=>{this.token = token;});

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

  /**
   * This method will retrieve the next page of Bitstreams from the external BitstreamDataService call.
   * It'll retrieve the currentPage from the class variables and it'll add the next page of bitstreams with the
   * already existing one.
   * If the currentPage variable is undefined, we'll set it to 1 and retrieve the first page of Bitstreams
   */
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
        this.notificationsService.error(this.translateService.get('file-section.error.header'), `${bitstreamsRD.statusCode} ${bitstreamsRD.errorMessage}`);
      } else if (hasValue(bitstreamsRD.payload)) {
        const current: Bitstream[] = this.bitstreams$.getValue();
        this.bitstreams$.next([...current, ...bitstreamsRD.payload.page]);
        this.isLoading = false;
        this.isLastPage = this.currentPage === bitstreamsRD.payload.totalPages;
      }
    });
  }

   getFileExtension(filename) {
    return /[^.]+$/.exec(filename).toString();
}

  getUrl(url: any){

this.sharedVariable.updateMessage(url);

// this.fileService.retrieveFileDownloadLink(url).subscribe(value=>{this.sharedVariable.updateRestrictedMessage(value);});
}

 getrestrictedUrl(url: any){
  // this.authService.getShortlivedToken().subscribe(token =>{ this.sharedVariable.updateRestrictedMessage(`${url}?authentication-token=${token}`.toString());});
  this.sharedVariable.updateRestrictedMessage(url);
//  this.fileService.retrieveFileDownloadLink(url).subscribe(value=>{this.sharedVariable.updateRestrictedMessage(value);});

  }



}
