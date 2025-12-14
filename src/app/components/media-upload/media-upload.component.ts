import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { QRCode, QRRules } from '../../models/event.model';
import { MediaUploadProgress } from '../../models/media.model';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './media-upload.component.html',
  styleUrl: './media-upload.component.scss'
})
export class MediaUploadComponent {
  @Input() qrCode!: QRCode;
  @Input() rules!: QRRules;
  @Input() token!: string;
  @Output() uploadComplete = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private mediaService = inject(MediaService);

  uploadForm: FormGroup;
  selectedFiles: File[] = [];
  uploadProgress: MediaUploadProgress[] = [];
  isUploading: boolean = false;

  constructor() {
    this.uploadForm = this.fb.group({
      name: [''],
      phone: ['']
    });
  }

  ngOnInit() {
    // Set validators based on rules
    if (this.rules.nameRequired) {
      this.uploadForm.get('name')?.setValidators([Validators.required]);
    }

    if (this.rules.phoneRequired === 'mandatory') {
      this.uploadForm.get('phone')?.setValidators([Validators.required]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  async uploadFiles() {
    if (this.selectedFiles.length === 0 || this.uploadForm.invalid) {
      return;
    }

    this.isUploading = true;
    this.uploadProgress = [];

    const metadata = {
      name: this.uploadForm.value.name || undefined,
      phone: this.uploadForm.value.phone || undefined,
      token: this.token
    };

    for (const file of this.selectedFiles) {
      this.mediaService.uploadMedia(
        this.qrCode.eventId,
        this.qrCode.id,
        file,
        metadata
      ).subscribe({
        next: (progress) => {
          const existingIndex = this.uploadProgress.findIndex(p => p.fileName === progress.fileName);
          if (existingIndex >= 0) {
            this.uploadProgress[existingIndex] = progress;
          } else {
            this.uploadProgress.push(progress);
          }
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.isUploading = false;
        },
        complete: () => {
          // Check if all uploads are complete
          const allComplete = this.uploadProgress.every(p => p.status === 'success' || p.status === 'error');
          if (allComplete && this.uploadProgress.length === this.selectedFiles.length) {
            this.isUploading = false;
            if (this.uploadProgress.every(p => p.status === 'success')) {
              this.uploadComplete.emit();
              this.resetForm();
            }
          }
        }
      });
    }
  }

  resetForm() {
    this.selectedFiles = [];
    this.uploadForm.reset();
    this.uploadProgress = [];
  }

  getProgress(fileName: string): number {
    const progress = this.uploadProgress.find(p => p.fileName === fileName);
    return progress?.progress || 0;
  }

  getUploadStatus(fileName: string): string {
    const progress = this.uploadProgress.find(p => p.fileName === fileName);
    return progress?.status || 'pending';
  }
}
