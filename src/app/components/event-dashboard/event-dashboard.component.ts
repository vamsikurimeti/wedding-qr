import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { QrListComponent } from '../qr-list/qr-list.component';
import { GalleryComponent } from '../gallery/gallery.component';
import { ApprovalListComponent } from '../approval-list/approval-list.component';
import { EventService } from '../../services/event.service';
import { MediaService } from '../../services/media.service';
import { PricingService } from '../../services/pricing.service';
import { Event, QRCode } from '../../models/event.model';
import { Media } from '../../models/media.model';
import { PricingPlan } from '../../models/pricing.model';

@Component({
  selector: 'app-event-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LayoutComponent, QrListComponent, GalleryComponent, ApprovalListComponent],
  templateUrl: './event-dashboard.component.html',
  styleUrl: './event-dashboard.component.scss'
})
export class EventDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private eventService = inject(EventService);
  private mediaService = inject(MediaService);
  private pricingService = inject(PricingService);
  private fb = inject(FormBuilder);

  eventId: string = '';
  event: Event | null = null;
  qrCodes: QRCode[] = [];
  media: Media[] = [];
  pendingApprovals: Media[] = [];
  isLoading: boolean = false;
  activeTab: 'details' | 'qr' | 'gallery' | 'approvals' = 'details';
  isCreateMode: boolean = false;
  eventForm!: FormGroup;
  pricingPlans: PricingPlan[] = [];
  isSubmitting: boolean = false;

  ngOnInit() {
    // Initialize form
    this.eventForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      pricingPlanId: ['', [Validators.required]],
      expiresAt: ['']
    });

    // Check if we're in create mode (route is /events/create)
    const url = this.route.snapshot.url;
    this.isCreateMode = url.length > 1 && url[url.length - 1].path === 'create';
    
    if (this.isCreateMode) {
      // In create mode, load pricing plans
      this.loadPricingPlans();
      return;
    }

    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    if (this.eventId) {
      this.loadEvent();
      this.loadQRCodes();
      this.loadMedia();
      this.loadPendingApprovals();
    }
  }

  loadPricingPlans() {
    this.pricingService.getPricingPlans().subscribe({
      next: (plans) => {
        this.pricingPlans = plans.filter(p => p.isActive);
      },
      error: (error) => {
        console.error('Error loading pricing plans:', error);
      }
    });
  }

  onSubmit() {
    if (this.eventForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.eventForm.value;
    
    // Create event data with pricingPlanId (not part of Event interface but required by backend)
    const eventData: any = {
      name: formValue.name,
      description: formValue.description,
      pricingPlanId: formValue.pricingPlanId,
      expiresAt: formValue.expiresAt ? new Date(formValue.expiresAt).toISOString() : undefined
    };

    this.eventService.createEvent(eventData).subscribe({
      next: (event) => {
        this.isSubmitting = false;
        this.router.navigate(['/events', event.id]);
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.isSubmitting = false;
        alert('Failed to create event. Please try again.');
      }
    });
  }

  loadEvent() {
    this.isLoading = true;
    this.eventService.getEvent(this.eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.isLoading = false;
      }
    });
  }

  loadQRCodes() {
    this.eventService.getQRCodes(this.eventId).subscribe({
      next: (qrCodes) => {
        this.qrCodes = qrCodes;
      },
      error: (error) => {
        console.error('Error loading QR codes:', error);
      }
    });
  }

  loadMedia() {
    this.mediaService.getApprovedMedia(this.eventId).subscribe({
      next: (media) => {
        this.media = media;
      },
      error: (error) => {
        console.error('Error loading media:', error);
      }
    });
  }

  loadPendingApprovals() {
    this.mediaService.getMediaByEvent(this.eventId).subscribe({
      next: (allMedia) => {
        this.pendingApprovals = allMedia.filter(m => !m.isApproved);
      },
      error: (error) => {
        console.error('Error loading pending approvals:', error);
      }
    });
  }

  deleteQRCode(qrCodeId: string) {
    if (confirm('Are you sure you want to delete this QR code?')) {
      this.eventService.deleteQRCode(this.eventId, qrCodeId).subscribe({
        next: () => this.loadQRCodes(),
        error: (error) => console.error('Error deleting QR code:', error)
      });
    }
  }

  approveMedia(mediaId: string) {
    this.mediaService.approveMedia(mediaId).subscribe({
      next: () => {
        this.loadMedia();
        this.loadPendingApprovals();
      },
      error: (error) => console.error('Error approving media:', error)
    });
  }

  rejectMedia(mediaId: string) {
    if (confirm('Are you sure you want to reject this media?')) {
      this.mediaService.rejectMedia(mediaId).subscribe({
        next: () => this.loadPendingApprovals(),
        error: (error) => console.error('Error rejecting media:', error)
      });
    }
  }

  setActiveTab(tab: 'details' | 'qr' | 'gallery' | 'approvals') {
    this.activeTab = tab;
  }
}
