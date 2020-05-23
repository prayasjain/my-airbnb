import { Injectable } from "@angular/core";
import { Booking } from "./booking.model";
import { BehaviorSubject, throwError } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { take, tap, delay, switchMap, map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({ providedIn: "root" })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings() {
    return this._bookings.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    let newBooking: Booking;
    let fetchedId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error("No User ID Found!");
        }
        fetchedId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {
        newBooking = new Booking(
          Math.random().toString(),
          placeId,
          fetchedId,
          placeTitle,
          placeImage,
          firstName,
          lastName,
          guestNumber,
          dateFrom,
          dateTo
        );

        return this.http.post<{ name: string }>(
          `https://ionic-pairbnb-56d99.firebaseio.com/bookings.json?auth=${token}`,
          {
            ...newBooking,
            id: null,
          }
        );
      }),
      switchMap((resData) => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap((places) => {
        newBooking.id = generatedId;
        this._bookings.next(places.concat(newBooking));
      })
    );
  }

  cancelBooking(bookingId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.delete(
          `https://ionic-pairbnb-56d99.firebaseio.com/bookings/${bookingId}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        //used to pass a new observable
        return this.bookings;
      }),
      take(1), //take 1 gets the latest snapshot and doesnt look for future
      tap((bookings) => {
        this._bookings.next(bookings.filter((b) => b.id !== bookingId));
      })
    );
  }

  fetchBookings() {
    let fetchedId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error("User ID not found");
        }
        fetchedId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: BookingData }>(
          `https://ionic-pairbnb-56d99.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${fetchedId}"&auth=${token}`
        );
      }),
      map((resData) => {
        const bookings = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            bookings.push(
              new Booking(
                key,
                resData[key].placeId,
                resData[key].userId,
                resData[key].placeTitle,
                resData[key].placeImage,
                resData[key].firstName,
                resData[key].lastName,
                resData[key].guestNumber,
                new Date(resData[key].bookedFrom),
                new Date(resData[key].bookedTo)
              )
            );
          }
        }
        return bookings;
      }),
      tap((bookings) => {
        this._bookings.next(bookings);
      })
    );
  }
}
