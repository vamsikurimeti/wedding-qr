import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCode } from '../../models/event.model';

@Component({
  selector: 'app-qr-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-list.component.html',
  styleUrl: './qr-list.component.scss'
})
export class QrListComponent {
  @Input() qrCodes: QRCode[] = [];
  @Input() eventId: string = '';
  @Output() qrDeleted = new EventEmitter<string>();

  getQRCodeUrl(qrCode: QRCode): string {
    // Generate QR code URL - in production, this would use a QR code generation service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/guest?token=' + qrCode.token)}`;
  }

  copyToken(token: string) {
    navigator.clipboard.writeText(token).then(() => {
      alert('Token copied to clipboard!');
    });
  }

  downloadQRCode(qrCode: QRCode) {
    const link = document.createElement('a');
    link.href = this.getQRCodeUrl(qrCode);
    link.download = `${qrCode.name}-qr.png`;
    link.click();
  }
}
