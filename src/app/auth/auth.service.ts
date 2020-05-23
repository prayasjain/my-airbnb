import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { BehaviorSubject, from } from "rxjs";
import { User } from "./user.model";
import { map, tap } from "rxjs/operators";
import { Plugins } from "@capacitor/core";

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null);
  private logoutTimer: any;

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return !!user.token;
        }
        return false;
      })
    );
  }

  get userId() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.id;
        }
        return null;
      })
    );
  }

  get token() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.token;
        }
        return null;
      })
    );
  }

  constructor(private http: HttpClient) {}

  autoLogin() {
    return from(Plugins.Storage.get({ key: "authData" })).pipe(
      map((storedData) => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          userId: string;
          token: string;
          tokenExpirationDate: string;
          email: string;
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationTime
        );
        return user;
      }),
      tap((user) => {
        if (user) {
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map((user) => {
        return !!user;
      })
    );
  }

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.googleMapsApiKey}`,
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(
        tap((userData) => {
          this.setUserData(userData);
        })
      );
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(
      new Date().getTime() + +userData.expiresIn * 1000
    );
    const user =  new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
    this._user.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(
      userData.localId,
      userData.idToken,
      expirationTime.toISOString(),
      userData.email
    );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.googleMapsApiKey}`,
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(
        tap((userData) => {
          this.setUserData(userData);
        })
      );
  }

  logout() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    this._user.next(null);
    Plugins.Storage.remove({ key: "authData" });
  }

  private autoLogout(duration: number) {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string
  ) {
    const data = JSON.stringify({
      userId: userId,
      token: token,
      tokenExpirationDate: tokenExpirationDate,
      email: email,
    });
    Plugins.Storage.set({ key: "authData", value: data });
  }

  ngOnDestroy() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
  }
}
