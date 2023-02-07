import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { get } from 'lodash';
import { Bitstream } from '../../../core/shared/bitstream.model';
import { Item } from '../../../core/shared/item.model';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FileService } from '../../../core/shared/file.service';
import { HttpClient } from '@angular/common/http';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { isNotEmpty } from '../../empty.util';
import { hasValue } from 'src/app/shared/empty.util';
import { ViewerSwitcherService } from '../viewerSwitcherService/viewer-switcher-service.service';
import { getBitstreamDownloadRoute, getBitstreamRequestACopyRoute } from 'src/app/app-routing-paths';
import { combineLatest as observableCombineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ds-item-file',
  templateUrl: './item-file.component.html',
  styleUrls: ['./item-file.component.scss']
})
export class ItemFileComponent implements OnInit {
  @Input() bitstream: Bitstream;
  @Input() item: Item;
  @Output() selectedFile = new EventEmitter<string>();

  bitstreamPath$: Observable<{
    routerLink: string,
    queryParams: any,
  }>;

  canDownload$: Observable<boolean>;
  canRequestACopy$: Observable<boolean>;

  fileURL = '';
  fileFormat = '';

  constructor(
    private authorizationService: AuthorizationDataService,
    public fileService: FileService,
    private httpClient: HttpClient,
    private viewerService: ViewerSwitcherService
  ) {
  }

  ngOnInit() {
    this.canDownload$ = this.authorizationService.isAuthorized(FeatureID.CanDownload, isNotEmpty(this.bitstream) ? this.bitstream.self : undefined);
    this.canRequestACopy$ = this.authorizationService.isAuthorized(FeatureID.CanRequestACopy, isNotEmpty(this.bitstream) ? this.bitstream.self : undefined);
    this.bitstreamPath$ = observableCombineLatest([this.canDownload$, this.canRequestACopy$]).pipe(
      map(([canDownload, canRequestACopy]) => this.getBitstreamPath(canDownload, canRequestACopy))
    );

    const bitstream$href = this.fileService.retrieveFileDownloadLink(this.bitstream?._links?.content?.href);
    bitstream$href.subscribe(url => this.fileURL = url);
    this.httpClient.get(this.bitstream?._links?.format?.href).subscribe(res => this.fileFormat = get(res, ['mimetype']));
  }

  emitMediaViewerSwitcher() {
    this.viewerService.setFileFormat(this.fileFormat);
    this.viewerService.setFileURL(this.decodeURL(this.fileURL));
    this.viewerService.setFileName(this.bitstream?.name);
    this.selectedFile.emit(this.bitstream.id);
  }

  decodeURL(url: string): any {
    if (this.fileFormat === 'application/pdf') {
      return encodeURIComponent(url)
        .replace(
          /[!'()*]/g,
          (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
        );
    }
    return url;
  }

  getIconByFileFormat() {
    switch (true) {
      case this.fileFormat.startsWith('image'):
        return this.fileURL;
      case this.fileFormat === 'application/pdf':
        return 'assets/images/pdf.png';
      case (this.fileFormat ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        || this.fileFormat === 'application/vnd.ms-powerpoint'):
        return 'assets/images/ppt-logo.png';
      case this.fileFormat ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        || this.fileFormat === 'application/msword':
        return 'assets/images/word-logo.png';
      case this.fileFormat.startsWith('video'):
        return 'assets/images/video-img.png';
      case (this.fileFormat ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        || this.fileFormat === 'application/vnd.ms-excel'):
        return 'assets/images/excel.png';
      default:
        return 'assets/images/no_thum.jpg';
    }
  }

  getBitstreamPath(canDownload: boolean, canRequestACopy: boolean) {
    if (!canDownload && canRequestACopy && hasValue(this.item)) {
      return getBitstreamRequestACopyRoute(this.item, this.bitstream);
    }
    return this.getBitstreamDownloadPath();
  }

  getBitstreamDownloadPath() {
    return {
      routerLink: getBitstreamDownloadRoute(this.bitstream),
      queryParams: {}
    };
  }
}
