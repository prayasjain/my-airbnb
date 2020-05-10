import { Injectable } from "@angular/core";
import { Place } from "./place.model";

@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private _places: Place[] = [
    new Place(
      "p1",
      "Place 1",
      "Place 1 Desc",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Panor%C3%A1mica_Oto%C3%B1o_Alc%C3%A1zar_de_Segovia.jpg/220px-Panor%C3%A1mica_Oto%C3%B1o_Alc%C3%A1zar_de_Segovia.jpg",
      145.99
    ),
    new Place(
      "p2",
      "Place 2",
      "Place 2 Desc",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Bodiam-castle-10My8-1197.jpg/300px-Bodiam-castle-10My8-1197.jpg",
      145.99
    ),
    new Place(
      "p3",
      "Place 3",
      "Place 3 Desc",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Windsor_Castle_at_Sunset_-_Nov_2006.jpg/220px-Windsor_Castle_at_Sunset_-_Nov_2006.jpg",
      145.99
    ),
  ];

  places = [...this._places];
  constructor() {}

  getPlace(id: string) {
    return {...this._places.find(p => p.id === id)};
  }
}
