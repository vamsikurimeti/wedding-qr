import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { Media } from '../../models/media.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  @Input() media: Media[] = [];
  @Input() allowDownload: boolean = true;
  @Input() qrCodeId?: string;
  @Input() token?: string;

  private mediaService = inject(MediaService);

  displayMedia: Media[] = [];
  isLoading: boolean = false;
  selectedMedia: Media | null = null;

  ngOnInit() {
    if (this.qrCodeId) {
      this.loadMedia();
    } else {
      this.displayMedia = this.media;
    }
  }

  loadMedia() {
    if (!this.qrCodeId) return;

    this.isLoading = true;
    this.mediaService.getMediaByQRCode(this.qrCodeId).subscribe({
      next: (media) => {
        // Filter to show only approved media for guests
        this.displayMedia = media.filter(m => m.isApproved);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading media:', error);
        this.isLoading = false;
      }
    });
  }

  openMedia(media: Media) {
    this.selectedMedia = media;
  }

  closeMedia() {
    this.selectedMedia = null;
  }

  downloadMedia(media: Media) {
    if (this.allowDownload) {
      this.mediaService.downloadMedia(media.fileUrl);
    }
  }

  getMediaType(media: Media): 'image' | 'video' {
    return media.fileType;
  }
}
