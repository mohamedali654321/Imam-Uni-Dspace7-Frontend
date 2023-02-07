import { Component, Input } from '@angular/core';

@Component({
  selector: 'ds-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent {

  @Input() src: string;

  viewerOptions: any = {
    navbar: true,
    inline: false,
    title: false,
    initialCoverage: 1,
    minWidth: 800,
    minHeight: 600,
    movable: false,
    toolbar: {
      zoomIn: 4,
      zoomOut: 4,
      oneToOne: 4,
      reset: 4,
      prev: 4,
      play: {
        show: 4,
        size: 'large',
      },
      next: 4,
      rotateLeft: 4,
      rotateRight: 4,
      flipHorizontal: 4,
      flipVertical: 4,
    }
  };


  public onViewerReady(event: Event) {
    console.log('Viewer ready', event);
  }

}
