import React from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/primitives/Button';

interface ConfirmPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  locale?: string;
  productName: string;
  variationName: string;
  /** The recipient value exactly as it will be sent — a User ID or phone
   *  number the customer typed by hand. Echoing it back is the one place a
   *  typo can still be caught before credits are spent on it. */
  recipientLabel?: string;
  recipientValue?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  currentBalance: number;
}

/**
 * Buying used to spend credits on one click, against a hand-typed phone
 * number or user ID, with nothing shown back to the customer to check before
 * the charge went through. A typo in the recipient field was unrecoverable.
 * This is the review step: everything that's about to be sent, plus the
 * resulting balance, with an explicit Confirm.
 */
export default function ConfirmPurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  locale = 'en',
  productName,
  variationName,
  recipientLabel,
  recipientValue,
  quantity,
  unitPrice,
  total,
  currentBalance,
}: ConfirmPurchaseModalProps) {
  const isArabic = locale === 'ar';
  const resultingBalance = currentBalance - total;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isArabic ? 'تأكيد الشراء' : 'Confirm your order'}
      closeLabel={isArabic ? 'إغلاق' : 'Close'}
      className="max-w-[420px]"
    >
      <div className="w-full flex flex-col gap-3 text-sm">
        <Row label={isArabic ? 'المنتج' : 'Product'} value={productName} />
        <Row label={isArabic ? 'الفئة' : 'Variation'} value={variationName} />
        {recipientValue && (
          <Row
            label={recipientLabel ?? (isArabic ? 'المستلم' : 'Recipient')}
            value={recipientValue}
            emphasize
          />
        )}
        <Row label={isArabic ? 'الكمية' : 'Quantity'} value={String(quantity)} />
        <Row label={isArabic ? 'سعر الوحدة' : 'Unit price'} value={`$${unitPrice.toFixed(2)}`} />

        <div className="border-t border-app-black/10 dark:border-white/10 my-1" />

        <Row
          label={isArabic ? 'الإجمالي' : 'Total'}
          value={`$${total.toFixed(2)}`}
          bold
        />
        <Row
          label={isArabic ? 'الرصيد بعد الشراء' : 'Balance after purchase'}
          value={`$${resultingBalance.toFixed(2)}`}
        />
      </div>

      {recipientValue && (
        <p className="w-full text-xs text-neutral-400 dark:text-gray-400 mt-3 text-center">
          {isArabic
            ? 'يرجى التأكد من صحة المستلم أعلاه — لا يمكن التراجع عن الطلب بعد الإرسال.'
            : "Double-check the recipient above — this can't be undone once submitted."}
        </p>
      )}

      <div className="w-full flex flex-col gap-2 mt-4">
        <Button type="button" onClick={onConfirm} loading={loading} fullWidth size="lg">
          {isArabic ? 'تأكيد وشراء' : 'Confirm purchase'}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading} fullWidth>
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </Modal>
  );
}

function Row({ label, value, bold, emphasize }: { label: string; value: string; bold?: boolean; emphasize?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-3">
      <span className="text-neutral-400 dark:text-gray-400">{label}</span>
      <span
        className={
          emphasize
            ? 'font-semibold text-app-red text-right break-all'
            : bold
            ? 'font-bold text-app-black dark:text-white'
            : 'text-app-black dark:text-white text-right break-all'
        }
      >
        {value}
      </span>
    </div>
  );
}
