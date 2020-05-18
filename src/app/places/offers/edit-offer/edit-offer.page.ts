import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PlacesService } from "../../places.service";
import { NavController, LoadingController } from "@ionic/angular";
import { Place } from "../../place.model";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
  selector: "app-edit-offer",
  templateUrl: "./edit-offer.page.html",
  styleUrls: ["./edit-offer.page.scss"],
})
export class EditOfferPage implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  place: Place;
  placeSub: Subscription;
  form: FormGroup;

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
      this.form = new FormGroup({
        //setting the controls
        title: new FormControl(this.place.title, {
          updateOn: "blur",
          validators: [Validators.required],
        }),
        description: new FormControl(this.place.description, {
          updateOn: "blur",
          validators: [Validators.required, Validators.maxLength(180)],
        }),
      });
    });
  }

  onEditOffer() {
    if (this.form.invalid) {
      return;
    }
    this.loadingCtrl.create({
      message: "Updating Place..."
    }).then(loadingEl => {
      loadingEl.present();
      this.placesService.updatePlace(
        this.place.id,
        this.form.value.title,
        this.form.value.description
      ).subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/places/tabs/offers']);
      });
    });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
