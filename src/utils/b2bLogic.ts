export interface ProductItem {
  id: number;
  title: string;
  category: 'Yellow Mustard' | 'Groundnut Seeds' | 'Sesame Seeds & Oil' | 'De-Oiled Cakes';
  image: string;
  form: string;
  targetBuyers: string;
  description: string;
}

export interface QuoteFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  productCategory: string;
  notes: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Pure object-fit: cover math for drawing a source video/image frame onto a target canvas.
 */
export function computeCoverDimensions(
  canvasWidth: number,
  canvasHeight: number,
  sourceWidth: number,
  sourceHeight: number
): { drawWidth: number; drawHeight: number; offsetX: number; offsetY: number } {
  if (canvasWidth <= 0 || canvasHeight <= 0 || sourceWidth <= 0 || sourceHeight <= 0) {
    return { drawWidth: 0, drawHeight: 0, offsetX: 0, offsetY: 0 };
  }
  const scale = Math.max(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const offsetX = (canvasWidth - drawWidth) / 2;
  const offsetY = (canvasHeight - drawHeight) / 2;
  return { drawWidth, drawHeight, offsetX, offsetY };
}

/**
 * Maps a normalized scroll progress [0..1] to a discrete frame index [0..totalFrames-1].
 */
export function getScrollFrameIndex(progress: number, totalFrames: number = 120): number {
  if (totalFrames <= 1) return 0;
  const clamped = Math.max(0, Math.min(1, progress));
  return Math.min(totalFrames - 1, Math.floor(clamped * (totalFrames - 1)));
}

/**
 * Determines which scroll story overlay (1, 2, or 3) is active based on progress [0..1]:
 * - Overlay 1: 0% - 35%
 * - Overlay 2: 35% - 70%
 * - Overlay 3: 70% - 100%
 */
export function getActiveOverlayStage(progress: number): 1 | 2 | 3 {
  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped < 0.35) return 1;
  if (clamped < 0.70) return 2;
  return 3;
}

/**
 * Filters B2B product catalog items by selected category.
 */
export function filterCatalogProducts(products: ProductItem[], category: string): ProductItem[] {
  if (!category || category === 'All') {
    return products;
  }
  return products.filter((item) => item.category === category);
}

/**
 * Appends or toggles a procurement checklist requirement inside the inquiry notes text.
 */
export function toggleChecklistItemInNotes(
  currentNotes: string,
  itemLabel: string,
  isChecked: boolean
): string {
  const prefix = `[Checklist: ${itemLabel}]`;
  const lines = currentNotes
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const exists = lines.includes(prefix);
  if (isChecked && !exists) {
    lines.push(prefix);
  } else if (!isChecked && exists) {
    const idx = lines.indexOf(prefix);
    if (idx !== -1) lines.splice(idx, 1);
  }
  return lines.join('\n');
}

/**
 * Validates the B2B Request a Quote form fields.
 */
export function validateQuoteForm(data: QuoteFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.companyName || data.companyName.trim().length < 2) {
    errors.companyName = 'Company name is required for B2B inquiry.';
  }
  if (!data.contactName || data.contactName.trim().length < 2) {
    errors.contactName = 'Contact person name is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = 'Valid corporate or business email address is required.';
  }
  const phoneClean = (data.phone || '').replace(/[\s\-()]/g, '');
  if (!phoneClean || phoneClean.length < 7 || !/^\+?[0-9]+$/.test(phoneClean)) {
    errors.phone = 'Valid contact phone number is required.';
  }
  if (!data.productCategory || data.productCategory.trim().length === 0) {
    errors.productCategory = 'Please select a product category.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Builds the direct WhatsApp follow-up URL for +91 90572 92529 with inquiry summary.
 */
export function buildWhatsAppFollowUpUrl(data: QuoteFormData): string {
  const baseUrl = 'https://wa.me/919057292529';
  const lines = [
    `Hello Prime Fresh Oil Mills,`,
    `We have submitted a B2B Bulk Quote Inquiry:`,
    `• Company: ${data.companyName.trim()}`,
    `• Contact: ${data.contactName.trim()}`,
    `• Product: ${data.productCategory.trim()}`,
  ];
  if (data.notes && data.notes.trim()) {
    lines.push(`• Requirements: ${data.notes.trim()}`);
  }
  return `${baseUrl}?text=${encodeURIComponent(lines.join('\n'))}`;
}
