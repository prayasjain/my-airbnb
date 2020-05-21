import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController,
} from "@ionic/angular";
import { PlacesService } from "../../places.service";
import { Place } from "../../place.model";
import { CreateBookingComponent } from "../../../bookings/create-booking/create-booking.component";
import { Subscription } from "rxjs";
import { BookingService } from "src/app/bookings/booking.service";
import { AuthService } from 'src/app/auth/auth.service';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';

@Component({
  selector: "app-place-detail",
  templateUrl: "./place-detail.page.html",
  styleUrls: ["./place-detail.page.scss"],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable: boolean = false;
  placeSub: Subscription;
  isLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private placesService: PlacesService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      if (!paramMap.has("placeId")) {
        this.navCtrl.navigateBack("/places/tabs/offers");
        return;
      }
      this.isLoading = true;
      this.placeSub = this.placesService
        .getPlace(paramMap.get("placeId"))
        .subscribe((place) => {
          this.place = place;
          this.isBookable = place.userId !== this.authService.userId;
          this.isLoading = false;
        }, error => {
          this.alertCtrl.create({
            header: "An error Occcured",
            message: "Invalid Discover Place",
            buttons: [{text: 'Okay', handler: () => {
              this.router.navigate(['/places/tabs/discover']);
            }}],
          })
          .then(alertEl=> alertEl.present());
        });
    });
  }

  onBookPlace() {
    //this.router.navigateByUrl('/places/tabs/discover');
    //this.navCtrl.navigateBack('/places/tabs/discover');

    this.actionSheetCtrl
      .create({
        header: "Choose an action",
        buttons: [
          {
            text: "Select Date",
            handler: () => {
              this.openBookingModal("select");
            },
          },
          {
            text: "Random Date",
            handler: () => {
              this.openBookingModal("random");
            },
          },
          {
            text: "Cancel",
            role: "cancel", // color the button red with 'destructive' can be 'cancel', which wont color red
          },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }

  openBookingModal(mode: "select" | "random") {
    console.log(mode);
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, selectedMode: mode },
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((resultData) => {
        if (resultData.role === "confirm") {
          this.loadingCtrl.create({
            message: "Booking your place"
          }).then(loadingEl => {
            loadingEl.present();
            const data = resultData.data.bookingData;
          this.bookingService.addBooking(
            this.place.id,
            this.place.title,
            this.place.imageUrl,
            data.firstName,
            data.lastName,
            data.guestNumber,
            data.startDate,
            data.endDate
          ).subscribe(()=> {
            loadingEl.dismiss()
          });
          });
        }
      });
  }

  onShowFullMap() {
    this.modalCtrl.create({component: MapModalComponent, componentProps: {
      center: {lat: this.place.location.lat, lng: this.place.location.lng},
      selectable: false,
      closeButtonText: 'Close',
      title: this.place.location.address
    }})
    .then(modalEl => {
      modalEl.present();
    })
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
