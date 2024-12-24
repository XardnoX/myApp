import { Component, OnInit } from '@angular/core';
import { FirestoreService } from './services/firestore.service';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  users: any[] = [];

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    // Fetch users
    this.firestoreService.getUsers().subscribe((data) => {
      this.users = data;
      console.log('Users:', this.users);
    });

  }
}