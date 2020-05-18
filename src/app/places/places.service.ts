import { Injectable } from "@angular/core";
import { Place } from "./place.model";
import { AuthService } from "../auth/auth.service";
import { BehaviorSubject, Observable } from "rxjs";
import { take, map, tap, delay } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      "p1",
      "Place 1",
      "Place 1 Desc",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Panor%C3%A1mica_Oto%C3%B1o_Alc%C3%A1zar_de_Segovia.jpg/220px-Panor%C3%A1mica_Oto%C3%B1o_Alc%C3%A1zar_de_Segovia.jpg",
      145.99,
      new Date("2019-01-16"),
      new Date("2019-05-1"),
      "abc"
    ),
    new Place(
      "p2",
      "Place 2",
      "Place 2 Desc",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Bodiam-castle-10My8-1197.jpg/300px-Bodiam-castle-10My8-1197.jpg",
      145.99,
      new Date("2020-01-16"),
      new Date("2021-01-16"),
      "abc"
    ),
    new Place(
      "p3",
      "Place 3",
      "Place 3 Desc",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Windsor_Castle_at_Sunset_-_Nov_2006.jpg/220px-Windsor_Castle_at_Sunset_-_Nov_2006.jpg",
      145.99,
      new Date("2019-01-25"),
      new Date("2019-07-19"),
      "abc"
    ),
  ]);

  get places() {
    return this._places.asObservable();
  }
  constructor(private authService: AuthService) {}

  getPlace(id: string) {
    return this.places.pipe(
      take(1),
      map((places) => {
        return places.find((p) => p.id === id);
      })
    );
    return;
  }

  addPlace(
    title: string,
    desc: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      desc,
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Windsor_Castle_at_Sunset_-_Nov_2006.jpg/220px-Windsor_Castle_at_Sunset_-_Nov_2006.jpg",
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this._places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, desc: string) {
    return this.places.pipe(
      take(1),
      delay(1000), 
      tap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          desc,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        this._places.next(updatedPlaces);
      })
    ); //take 1 gets the latest snapshot and doesnt look for future
  }
}
