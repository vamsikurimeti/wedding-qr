import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Media } from '../../models/media.model';

@Component({
  selector: 'app-approval-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './approval-list.component.html',
  styleUrl: './approval-list.component.scss'
})
export class ApprovalListComponent {
  @Input() pendingMedia: Media[] = [];
  @Output() approved = new EventEmitter<string>();
  @Output() rejected = new EventEmitter<string>();

  approve(mediaId: string) {
    this.approved.emit(mediaId);
  }

  reject(mediaId: string) {
    this.rejected.emit(mediaId);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
