import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WidgetsService {
  private apiUrl = 'http://databasepokladna.euweb.cz/get_widgets.php'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  // Fetch widgets by class
  getWidgetsByClass(userClass: string): Observable<any> {
    const url = `${this.apiUrl}?class=${userClass}`;
    console.log('Fetching widgets from URL:', url);
    return this.http.get<any>(url); // Use HTTP GET to fetch data
  }

  // Function to load widgets and handle response
  async loadWidgetsForClass(userClass: string): Promise<void> {
    try {
      const response = await this.getWidgetsByClass(userClass).toPromise();
      if (response && response.widgets) {
        console.log('Widgets loaded successfully:', response.widgets);
        // Handle navigation or further processing here
      } else {
        console.error('No widgets found for the specified class.');
      }
    } catch (error) {
      console.error('Error loading widgets:', error);
    }
  }
}
