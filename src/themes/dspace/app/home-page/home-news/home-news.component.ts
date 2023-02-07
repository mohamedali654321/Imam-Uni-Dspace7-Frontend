import { Component, Input } from '@angular/core';
import { HomeNewsComponent as BaseComponent } from '../../../../../app/home-page/home-news/home-news.component';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/app.reducer'; //kware-edit
import { select, Store } from '@ngrx/store'; //kware-edit
import { isAuthenticated } from 'src/app/core/auth/selectors'; //kware-edit
import { ThemedCreateItemParentSelectorComponent } from 'src/app/shared/dso-selector/modal-wrappers/create-item-parent-selector/themed-create-item-parent-selector.component';
import { ThemedEditItemSelectorComponent } from 'src/app/shared/dso-selector/modal-wrappers/edit-item-selector/themed-edit-item-selector.component';
@Component({
  selector: 'ds-home-news',
  styleUrls: ['./home-news.component.scss'],
  templateUrl: './home-news.component.html'
})

/**
 * Component to render the news section on the home page
 */
export class HomeNewsComponent extends BaseComponent {

  @Input() showScopeSelector = true; //kware-
  auth: boolean;
  isAuthorized$: Observable<boolean>;  //kware-edit
ngOnInit(): void {
  this.isAuthorized$ = this.store.pipe(select(isAuthenticated)); //kware-edit
 this.isAuthorized$.subscribe(auth=>this.auth = auth);
 console.log(this.auth);
}
  showCreateItemModal(){
    if (this.auth){
      this.modalService.open(ThemedCreateItemParentSelectorComponent);
    } else {
      this.router.navigate(['/login']);

       if (this.auth){
      this.modalService.open(ThemedCreateItemParentSelectorComponent);
    }
    }


  }

  showEditItemModal(){
    if (this.auth){
      this.modalService.open(ThemedEditItemSelectorComponent);
    } else {
      this.router.navigate(['/login']);

       if (this.auth){
      this.modalService.open(ThemedEditItemSelectorComponent);
    }
    }


   }
}

