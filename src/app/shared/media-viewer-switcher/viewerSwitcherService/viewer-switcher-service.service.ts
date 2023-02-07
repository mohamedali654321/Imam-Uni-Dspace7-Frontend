import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewerSwitcherService implements OnDestroy {
  private fileURL = new BehaviorSubject('');
  private fileFormat = new BehaviorSubject('');
  private fileName = new BehaviorSubject('');


  currentFileURL = this.fileURL.asObservable();
  currentFileFormat = this.fileFormat.asObservable();
  currentFileName = this.fileName.asObservable();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() { }
  ngOnDestroy(): void {
    return null;
    // this.currentFileURL.;
  }

  setFileURL(url: string) {
    this.fileURL.next(url);
  }

  setFileFormat(format: string) {
    this.fileFormat.next(format);
  }

  setFileName(name: string) {
    this.fileName.next(name);
  }
}
