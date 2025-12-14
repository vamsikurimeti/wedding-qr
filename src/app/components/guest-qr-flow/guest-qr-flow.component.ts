import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GalleryComponent } from '../gallery/gallery.component';
import { MediaUploadComponent } from '../media-upload/media-upload.component';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { QRCode, QRRules } from '../../models/event.model';

@Component({
  selector: 'app-guest-qr-flow',
  standalone: true,
  imports: [CommonModule, GalleryComponent, MediaUploadComponent],
  templateUrl: './guest-qr-flow.component.html',
  styleUrl: './guest-qr-flow.component.scss'
})
export class GuestQrFlowComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  token: string = '';
  qrCode: QRCode | null = null;
  rules: QRRules | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  activeView: 'gallery' | 'upload' | 'both' = 'gallery';
  currentTab: 'gallery' | 'upload' = 'gallery';

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (this.token) {
      this.loadQRCode();
    } else {
      this.errorMessage = 'Invalid QR code token';
    }
  }

  loadQRCode() {
    this.isLoading = true;
    this.eventService.getQRCodeByToken(this.token).subscribe({
      next: (qrCode) => {
        this.qrCode = qrCode;
        this.rules = qrCode.rules;
        this.determineView();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Invalid or expired QR code';
        this.isLoading = false;
      }
    });
  }

  determineView() {
    if (!this.rules) return;

    const canView = this.rules.anyoneCanViewGallery;
    const canUpload = this.rules.anyoneCanUpload;

    if (canView && canUpload) {
      this.activeView = 'both';
      this.currentTab = 'gallery';
    } else if (canView) {
      this.activeView = 'gallery';
    } else if (canUpload) {
      this.activeView = 'upload';
    } else {
      this.errorMessage = 'This QR code has no active features';
    }
  }

  switchToUpload() {
    if (this.activeView === 'both') {
      this.currentTab = 'upload';
    } else {
      this.activeView = 'upload';
    }
  }

  switchToGallery() {
    if (this.activeView === 'both') {
      this.currentTab = 'gallery';
    } else {
      this.activeView = 'gallery';
    }
  }
}
