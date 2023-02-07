import { Component, } from '@angular/core';
import { AppState } from 'src/app/app.reducer'; //kware-edit
import { select, Store } from '@ngrx/store'; //kware-edit
import { isAuthenticated } from 'src/app/core/auth/selectors'; //kware-edit
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'ds-home-news',
  styleUrls: ['./home-news.component.scss'],
  templateUrl: './home-news.component.html'
})

/**
 * Component to render the news section on the home page
 */
export class HomeNewsComponent {
  constructor(public store: Store<AppState>,public modalService: NgbModal,public router: Router){
  }
}
