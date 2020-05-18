import { Component, OnInit, OnDestroy } from "@angular/core";
import { Place } from "../../place.model";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { PlacesService } from "../../places.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-offer-bookings",
  templateUrl: "./offer-bookings.page.html",
  styleUrls: ["./offer-bookings.page.scss"],
})
export class OfferBookingsPage implements OnInit, OnDestroy {
  place: Place;
  placeSub: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      if (!paramMap.has("placeId")) {
        this.navCtrl.navigateBack("/places/tabs/offers");
        return;
      }

      this.placeSub = this.placesService
        .getPlace(paramMap.get("placeId"))
        .subscribe((place) => {
          this.place = place;
        });
    });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
