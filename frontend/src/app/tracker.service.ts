
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TrackerService {
    // If you tunnel/host elsewhere, change this:
    private base = 'http://0.0.0.0:3010';

    constructor(private http: HttpClient, private snack: MatSnackBar) { }

    async open(tag?: string) {
        await firstValueFrom(this.http.post(`${this.base}/track/open`, { tag }));
    }

    async action(action: string, details?: any, tag?: string) {
        await firstValueFrom(this.http.post(`${this.base}/track/action`, { action, details, tag }));
    }

    toast(message: string) {
        this.snack.open(message, 'OK', { duration: 2500, horizontalPosition: 'center', verticalPosition: 'top' });
    }
}
