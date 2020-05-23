import { Component, OnInit } from "@angular/core";
import { AuthService, AuthResponseData } from "./auth.service";
import { Router } from "@angular/router";
import { LoadingController, AlertController } from "@ionic/angular";
import { NgForm } from "@angular/forms";
import { Observable } from "rxjs";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"],
})
export class AuthPage implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  isLoginMode: boolean = true;
  ngOnInit() {}

  authenticate(email: string, password: string) {
    this.loadingCtrl
      .create({ keyboardClose: true, message: "Logging In" })
      .then((loadingEl) => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData> = this.isLoginMode
          ? this.authService.login(email, password)
          : this.authService.signup(email, password);
        authObs.subscribe(
          (resData) => {
            loadingEl.dismiss();
            this.router.navigateByUrl("/places/tabs/discover");
          },
          (errResponse) => {
            loadingEl.dismiss();
            const code = errResponse.error.error.message;
            let message = "Could not authenticate, please try later";
            if (code === "EMAIL_EXISTS") {
              message = "Email Already exists";
            } else if (code === "EMAIL_NOT_FOUND") {
              message = "Email Not found";
            } else if (code === "INVALID_PASSWORD") {
              message = "Password is incorrect";
            }
            this.showAlert(message);
          }
        );
      });
  }

  showAlert(message: string) {
    this.alertCtrl
      .create({
        header: "Authentication Failed",
        message: message,
        buttons: ["Okay"],
      })
      .then((alerEl) => alerEl.present());
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.authenticate(email, password);
    form.reset();
  }

  onSwitchAuthMode() {
    this.isLoginMode = !this.isLoginMode;
  }
}
