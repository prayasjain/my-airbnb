import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy{

  loadedPlaces: Place[];
  relevantPlaces: Place[];
  placesSub: Subscription;
  filter: string = 'all';
  constructor(private placesService: PlacesService,
    private menuCtrl: MenuController, private authService: AuthService) { }

  
  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.onFilterUpdate(this.filter);
    });
  }

  onOpenMenu() {
    this.menuCtrl.toggle('mainMenu');
  }

  onFilterUpdate(filter: string) {
    if (filter === 'all') {
      this.relevantPlaces = this.loadedPlaces;
    } else {
      this.relevantPlaces = this.loadedPlaces.filter(place => {
        return this.authService.userId !== place.userId;
      });
    }
    this.filter = filter;
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
