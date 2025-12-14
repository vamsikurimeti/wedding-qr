import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { QRRules } from '../../models/event.model';

@Component({
  selector: 'app-qr-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './qr-creation.component.html',
  styleUrl: './qr-creation.component.scss'
})
export class QRCreationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);

  eventId: string = '';
  qrForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor() {
    this.qrForm = this.fb.group({
      name: ['', [Validators.required]],
      anyoneCanViewGallery: [true],
      anyoneCanUpload: [true],
      uploadRequiresApproval: [false],
      nameRequired: [true],
      phoneRequired: ['optional'],
      downloadAllowed: [true]
    });
  }

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('eventId') || '';
    if (!this.eventId) {
      this.router.navigate(['/events']);
    }
  }

  onSubmit() {
    if (this.qrForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const rules: QRRules = {
      anyoneCanViewGallery: this.qrForm.value.anyoneCanViewGallery,
      anyoneCanUpload: this.qrForm.value.anyoneCanUpload,
      uploadRequiresApproval: this.qrForm.value.uploadRequiresApproval,
      nameRequired: this.qrForm.value.nameRequired,
      phoneRequired: this.qrForm.value.phoneRequired,
      downloadAllowed: this.qrForm.value.downloadAllowed
    };

    this.eventService.createQRCode(this.eventId, this.qrForm.value.name, rules).subscribe({
      next: () => {
        this.router.navigate(['/events', this.eventId]);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to create QR code';
        this.isLoading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/events', this.eventId]);
  }
}
