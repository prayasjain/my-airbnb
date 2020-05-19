import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PlacesService } from "../../places.service";
import {
  NavController,
  LoadingController,
  AlertController,
} from "@ionic/angular";
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
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  place: Place;
  placeId: string;
  placeSub: Subscription;
  form: FormGroup;
  isLoading = false;

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      console.log("here");
      if (!paramMap.has("placeId")) {
        this.navCtrl.navigateBack("/places/tabs/offers");
        return;
      }
      this.placeId = paramMap.get("placeId");
      console.log(this.placeId);
      this.isLoading = true;
      this.placeSub = this.placesService
        .getPlace(paramMap.get("placeId"))
        .subscribe(
          (place) => {
            this.place = place;
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
            this.isLoading = false;
          },
          (error) => {
            this.alertCtrl.create({
              header: "An error Occcured",
              message: "Invalid Place",
              buttons: [{text: 'Okay', handler: () => {
                this.router.navigate(['/places/tabs/offers']);
              }}],
            })
            .then(alertEl=> alertEl.present());
          }
        );
    });
  }

  onEditOffer() {
    if (this.form.invalid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: "Updating Place...",
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.placesService
          .updatePlace(
            this.place.id,
            this.form.value.title,
            this.form.value.description
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(["/places/tabs/offers"]);
          });
      });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
