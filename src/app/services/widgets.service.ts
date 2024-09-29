import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WidgetsService {

  constructor(private http: HttpClient) {}

  // Function to get widgets by the user's class
  getWidgetsByClass(userClass: string): Observable<any> {
    const url = `http://databasepokladna.euweb.cz/get_widgets.php?class=${(userClass)}`;
    console.log('Fetching widgets from URL:', url); // Log the full URL
    return this.http.get<any>(url);
  }
  

  // Function to handle loading of widgets and navigating to the appropriate page
  async loadWidgetsForClass(userClass: string) {
    try {
      const response = await this.getWidgetsByClass(userClass).toPromise();
      if (response && response.widgets) {
        // Navigate or process widgets if data is found
        console.log('Widgets loaded successfully:', response.widgets);
        // Perform navigation or any necessary action after widgets load
      } else {
        console.error('No widgets found for the specified class.');
      }
    } catch (error) {
      console.error('Error loading widgets:', error);
    }
  }
}
