import React from 'react';

type OrderStatus = 'accepted' | 'rejected' | 'pending';

interface OrderStatusTimelineProps {
  status: OrderStatus;
  placedAt: string;
  locale?: string;
}

const GREEN = '#5FD568';
const RED = '#E73828';
const ORANGE = '#FB923C';
const IDLE = '#D9D9D9';

const CheckIcon = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M7 13.5L11 17L17 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M8 8L16 16M16 8L8 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Placed → Under review → Delivered (or Rejected).
 *
 * Manual review of every order stays, so this exists to make the wait legible rather
 * than silent — the middle node is the only one that stays visually "active" while an
 * admin has not yet acted, since that is genuinely the state the customer is in.
 */
export default function OrderStatusTimeline({ status, placedAt, locale = 'en' }: OrderStatusTimelineProps) {
  const t = (en: string, ar: string) => (locale === 'ar' ? ar : en);

  const steps: { label: string; state: 'done' | 'active' | 'upcoming' | 'rejected'; color: string }[] = [
    { label: t('Placed', 'تم الطلب'), state: 'done', color: GREEN },
    status === 'pending'
      ? { label: t('Under review', 'قيد المراجعة'), state: 'active', color: ORANGE }
      : { label: t('Reviewed', 'تمت المراجعة'), state: 'done', color: GREEN },
    status === 'rejected'
      ? { label: t('Rejected', 'مرفوض'), state: 'rejected', color: RED }
      : status === 'accepted'
        ? { label: t('Delivered', 'تم التسليم'), state: 'done', color: GREEN }
        : { label: t('Delivered', 'تم التسليم'), state: 'upcoming', color: IDLE },
  ];

  return (
    <div className="flex items-start w-full max-w-lg" dir="ltr">
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center gap-2" style={{ minWidth: 72 }}>
            <div
              className={`relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.state === 'upcoming' ? 'bg-white dark:bg-[#2a2a2a] border-2 border-[#D9D9D9] dark:border-[#4a4a4a]' : ''
              }`}
              style={step.state === 'upcoming' ? undefined : { background: step.color }}
            >
              {step.state === 'done' && <CheckIcon color="#fff" />}
              {step.state === 'rejected' && <XIcon color="#fff" />}
              {step.state === 'active' && (
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              )}
            </div>
            <span
              className={`text-xs font-medium text-center leading-tight ${
                step.state === 'upcoming' ? 'text-[#8E8E8E]' : 'text-[#070707] dark:text-white'
              }`}
            >
              {step.label}
            </span>
            {i === 0 && (
              <span className="text-[10px] text-[#8E8E8E] dark:text-[#a0a0a0] text-center">{placedAt}</span>
            )}
          </div>
          {i < steps.length - 1 && (
            <div
              className="flex-1 h-[2px] mt-4 rounded-full"
              style={{ background: steps[i + 1].state === 'upcoming' ? IDLE : steps[i + 1].color }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
