import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {FbAuthResponse, User} from "../../../shared/interfaces";
import {catchError, Observable, Subject, tap, throwError} from "rxjs";
import {environment} from "../../../../environments/environment";

@Injectable({providedIn: 'root'})
export class AuthService{
  public error$: Subject<string> = new Subject<string>();
constructor(private http: HttpClient){}
  get token(): string | null{
    // @ts-ignore
    const expDate = new Date(localStorage.getItem('fb-token-exp'))
  if (new Date() > expDate){
    this.logout();
    return null;
  }
    return localStorage.getItem('fb-token');
  }

  login(user: User): Observable<FbAuthResponse | null>{
    user.returnSecureToken = true;
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
      .pipe(
        tap(this.setToken),
        // @ts-ignore
        catchError(this.handleError.bind(this))
      )
  }

  logout(){
    this.setToken(null);
  }

  isAuthenticated(): boolean{
    return !!this.token;
  }
  private handleError(error: HttpErrorResponse){
    const {message}= error.error.error;
    switch (message) {
      case 'INVALID_ID_EMAIL':
        this.error$.next('This email is wrong!');
        break;
      case 'INVALID_PASSWORD':
        this.error$.next('This password is wrong!');
        break
      case 'EMAIL_NOT_FOUND':
        this.error$.next('This email is not registered!')
        break
    }
  }

  public setToken(response: any | null){
    if (response){
    const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000);
    localStorage.setItem('fb-token', response.idToken);
    localStorage.setItem('fb-token-exp', expDate.toString())
    } else {
      localStorage.clear();
    }

    }

  // const firebaseConfig = {
  //   apiKey: "AIzaSyA-BPhy8AzefqVPyd4p43VOowyBlimHIs0",
  //   authDomain: "blog-angular-587fd.firebaseapp.com",
  //   projectId: "blog-angular-587fd",
  //   storageBucket: "blog-angular-587fd.appspot.com",
  //   messagingSenderId: "587449434891",
  //   appId: "1:587449434891:web:618a4941af48907b60d80e"
  // };
}
