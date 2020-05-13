import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  constructor(private authService : AuthService, private router: Router,
    private loadingCtrl: LoadingController) { }

    isLoginMode: boolean = true;
  ngOnInit() {
  }

  onLogin() {
    this.authService.login();
    this.loadingCtrl.create({keyboardClose: true, message: 'Logging In'})
    .then(loadingEl => {
      loadingEl.present();
      setTimeout(()=> {
      loadingEl.dismiss();
      this.router.navigateByUrl('/places/tabs/discover');
    }, 1500);
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    console.log(email, password);
    if (this.isLoginMode) {
      // send req to login server
    } else {
      // send req to signup server
    }
  }

  onSwitchAuthMode() {
    this.isLoginMode = !this.isLoginMode; 
  }
}
