import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/ui/dashboard-layout';
import {
  Button,
  EmptyState,
  ErrorState,
  FormField,
  Input,
  SkeletonRow,
} from '@/components/ui/primitives';
import { useLanguage } from '@/hooks/use-language';
import api from '@/utils/api';
import { formatDateTime } from '@/utils/date';

/**
 * Reseller API keys. A customer the admin has given API access (CMS Users page →
 * "api_enabled") creates keys here for their own store to call /api/v1. The full
 * key is returned by the backend exactly once, so it is shown once, with a copy
 * button, and never again — the list only carries its prefix.
 *
 * The same page sets the reseller's one order-status webhook. Its signing secret
 * follows the same shown-once rule (on create and on rotate).
 */

interface ApiKeyRow {
  id: number;
  name: string;
  prefix: string;
  allowed_ips: string[] | null;
  last_used_at: string | null;
  created_at: string;
}

interface WebhookSummary {
  url: string;
  last_delivery_at: string | null;
  last_delivery_status: number | null;
  last_delivery_error: string | null;
}

interface ApiKeysResponse {
  api_enabled: boolean;
  kyc_approved: boolean;
  keys: ApiKeyRow[];
  webhook: WebhookSummary | null;
}

// The docs are served by the backend at /api-docs, one level above the /api base.
const DOCS_URL = `${(process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/?$/, '')}/api-docs`;

function errorMessage(err: unknown, fallback: string): string {
  const data = (
    err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
  )?.response?.data;
  const fieldError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
  return fieldError || data?.message || fallback;
}

function CopyableSecret({
  value,
  ar,
  note,
  onDismiss,
}: {
  value: string;
  ar: boolean;
  note: string;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-app-red/30 bg-app-red/5 p-4">
      <p className="text-sm font-semibold">{note}</p>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <code
          dir="ltr"
          className="flex-1 break-all rounded-lg bg-white dark:bg-[#1a1a1a] border border-app-red/20 px-3 py-2 text-sm"
        >
          {value}
        </code>
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? (
            <CheckIcon className="w-4 h-4" />
          ) : (
            <ClipboardDocumentIcon className="w-4 h-4" />
          )}
          {copied ? (ar ? 'تم النسخ' : 'Copied') : ar ? 'نسخ' : 'Copy'}
        </Button>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs underline w-fit text-neutral-500"
      >
        {ar ? 'لقد حفظته' : "I've saved it"}
      </button>
    </div>
  );
}

export default function ApiKeysPage() {
  const { locale } = useLanguage();
  const ar = locale === 'ar';
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [ips, setIps] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [webhookNotice, setWebhookNotice] = useState<string | null>(null);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<ApiKeysResponse>({
    queryKey: ['api-keys'],
    queryFn: async () => (await api.get('/user/api-keys')).data,
    networkMode: 'always',
    retry: false,
  });

  const create = useMutation({
    mutationFn: async () => {
      const allowed_ips = ips
        .split(/[\s,]+/)
        .map(ip => ip.trim())
        .filter(Boolean);
      return (await api.post('/user/api-keys', { name: name.trim(), allowed_ips })).data as {
        key: string;
      };
    },
    onSuccess: res => {
      setNewKey(res.key);
      setCopied(false);
      setName('');
      setIps('');
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: err =>
      setFormError(errorMessage(err, ar ? 'تعذّر إنشاء المفتاح.' : 'Could not create the key.')),
  });

  const revoke = useMutation({
    mutationFn: async (id: number) => api.delete(`/user/api-keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  // Edited value, else what is saved.
  const urlValue = webhookUrl ?? data?.webhook?.url ?? '';

  const onWebhookDone = (res: { secret?: string | null; message?: string }) => {
    if (res.secret) setNewSecret(res.secret);
    setWebhookUrl(null);
    setWebhookError(null);
    setWebhookNotice(res.message ?? null);
    queryClient.invalidateQueries({ queryKey: ['api-keys'] });
  };

  const saveWebhook = useMutation({
    mutationFn: async () => (await api.put('/user/api-webhook', { url: urlValue.trim() })).data,
    onSuccess: onWebhookDone,
    onError: err =>
      setWebhookError(errorMessage(err, ar ? 'تعذّر حفظ الرابط.' : 'Could not save the webhook.')),
  });

  const rotateSecret = useMutation({
    mutationFn: async () => (await api.post('/user/api-webhook/rotate-secret')).data,
    onSuccess: onWebhookDone,
    onError: err =>
      setWebhookError(
        errorMessage(err, ar ? 'تعذّر تغيير المفتاح السري.' : 'Could not rotate the secret.')
      ),
  });

  const testWebhook = useMutation({
    mutationFn: async () => (await api.post('/user/api-webhook/test')).data,
    onSuccess: onWebhookDone,
    onError: err => {
      setWebhookNotice(null);
      setWebhookError(
        errorMessage(err, ar ? 'لم يتم تسليم حدث الاختبار.' : 'The test event was not delivered.')
      );
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const removeWebhook = useMutation({
    mutationFn: async () => (await api.delete('/user/api-webhook')).data,
    onSuccess: res => {
      setNewSecret(null);
      onWebhookDone(res);
    },
  });

  const onRemoveWebhook = () => {
    const question = ar
      ? 'حذف الـ Webhook؟ لن يتلقى متجرك تحديثات الطلبات بعد الآن.'
      : 'Remove the webhook? Your store will stop receiving order updates.';
    if (window.confirm(question)) removeWebhook.mutate();
  };

  const onRotateSecret = () => {
    const question = ar
      ? 'إنشاء مفتاح سري جديد؟ سيتوقف المفتاح الحالي عن العمل فوراً.'
      : 'Generate a new signing secret? The current one stops verifying immediately.';
    if (window.confirm(question)) rotateSecret.mutate();
  };

  const copyKey = async () => {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const onRevoke = (key: ApiKeyRow) => {
    const question = ar
      ? `إلغاء المفتاح "${key.name}"؟ أي متجر يستخدمه سيتوقف عن العمل فوراً.`
      : `Revoke "${key.name}"? Any store using it stops working immediately.`;
    if (window.confirm(question)) revoke.mutate(key.id);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-app-red">{ar ? 'مفاتيح API' : 'API keys'}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl">
            {ar
              ? 'اربط متجرك بـ BechaalanyConnect واشترِ المنتجات مباشرة عبر واجهة API. تُدفع الطلبات من رصيدك وبأسعار فئتك.'
              : 'Connect your own store to BechaalanyConnect and buy products directly through our API. Orders are paid from your credits balance, at your pricing tier.'}
          </p>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-app-red underline w-fit"
          >
            {ar ? 'قراءة توثيق API' : 'Read the API documentation'}
          </a>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-3">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}

        {isError && (
          <ErrorState
            message={ar ? 'تعذّر تحميل المفاتيح.' : 'Could not load your API keys.'}
            onRetry={() => refetch()}
          />
        )}

        {data && !data.api_enabled && (
          <EmptyState
            title={ar ? 'الوصول إلى API غير مفعّل' : 'API access is not enabled'}
            description={
              ar
                ? 'تواصل معنا لتفعيل الوصول إلى API لحسابك.'
                : 'Contact us to enable API access for your account.'
            }
          />
        )}

        {data?.api_enabled && (
          <>
            {!data.kyc_approved && (
              <p className="text-sm rounded-xl border border-app-red/30 bg-app-red/5 px-4 py-3">
                {ar
                  ? 'يمكنك إنشاء مفاتيح الآن، لكن الطلبات عبر API تتطلب توثيق حسابك أولاً.'
                  : 'You can create keys now, but API orders need your account verification to be approved first.'}
              </p>
            )}

            {newKey && (
              <div className="flex flex-col gap-2 rounded-2xl border border-app-red/30 bg-app-red/5 p-4">
                <p className="text-sm font-semibold">
                  {ar
                    ? 'انسخ مفتاحك الآن — لن يظهر مرة أخرى.'
                    : 'Copy your key now — it will not be shown again.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <code
                    dir="ltr"
                    className="flex-1 break-all rounded-lg bg-white dark:bg-[#1a1a1a] border border-app-red/20 px-3 py-2 text-sm"
                  >
                    {newKey}
                  </code>
                  <Button type="button" variant="outline" size="sm" onClick={copyKey}>
                    {copied ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    )}
                    {copied ? (ar ? 'تم النسخ' : 'Copied') : ar ? 'نسخ' : 'Copy'}
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => setNewKey(null)}
                  className="text-xs underline w-fit text-neutral-500"
                >
                  {ar ? 'لقد حفظته' : "I've saved it"}
                </button>
              </div>
            )}

            <form
              className="flex flex-col gap-4 rounded-2xl border border-app-red/10 p-4"
              onSubmit={e => {
                e.preventDefault();
                if (!name.trim()) {
                  setFormError(ar ? 'أدخل اسماً للمفتاح.' : 'Give the key a name.');
                  return;
                }
                create.mutate();
              }}
            >
              <h2 className="text-lg font-semibold">
                {ar ? 'إنشاء مفتاح جديد' : 'Create a new key'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={ar ? 'الاسم' : 'Name'}
                  hint={ar ? 'مثلاً: متجري' : 'e.g. My shop (live)'}
                  error={formError ?? undefined}
                >
                  <Input value={name} maxLength={100} onChange={e => setName(e.target.value)} />
                </FormField>
                <FormField
                  label={ar ? 'عناوين IP المسموح بها (اختياري)' : 'Allowed IP addresses (optional)'}
                  hint={
                    ar
                      ? 'افصل بينها بفاصلة. اتركه فارغاً للسماح بأي عنوان.'
                      : 'Comma separated. Leave empty to allow any address.'
                  }
                >
                  <Input
                    dir="ltr"
                    value={ips}
                    onChange={e => setIps(e.target.value)}
                    placeholder="203.0.113.10"
                  />
                </FormField>
              </div>
              <Button type="submit" loading={create.isPending} className="w-fit">
                {ar ? 'إنشاء المفتاح' : 'Create key'}
              </Button>
            </form>

            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">{ar ? 'مفاتيحك' : 'Your keys'}</h2>
              {data.keys.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  {ar ? 'لا توجد مفاتيح بعد.' : 'No keys yet.'}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.keys.map(key => (
                    <li
                      key={key.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between rounded-xl border border-app-red/10 px-4 py-3"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-semibold truncate">{key.name}</span>
                        <span dir="ltr" className="text-xs text-neutral-500 font-mono">
                          {key.prefix}…
                        </span>
                        <span className="text-xs text-neutral-500">
                          {ar ? 'آخر استخدام: ' : 'Last used: '}
                          {key.last_used_at
                            ? formatDateTime(key.last_used_at, locale)
                            : ar
                              ? 'أبداً'
                              : 'never'}
                          {key.allowed_ips?.length ? ` · IP: ${key.allowed_ips.join(', ')}` : ''}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => onRevoke(key)}
                        loading={revoke.isPending && revoke.variables === key.id}
                      >
                        {ar ? 'إلغاء' : 'Revoke'}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              className="flex flex-col gap-4 rounded-2xl border border-app-red/10 p-4"
              onSubmit={e => {
                e.preventDefault();
                if (!urlValue.trim()) {
                  setWebhookError(ar ? 'أدخل رابط https.' : 'Enter an https URL.');
                  return;
                }
                saveWebhook.mutate();
              }}
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">
                  {ar ? 'Webhook حالة الطلب' : 'Order status webhook'}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl">
                  {ar
                    ? 'نرسل طلب POST موقّعاً إلى هذا الرابط عندما يكتمل طلب عبر API أو يُرفض، فلا حاجة للاستعلام المتكرر. راجع التوثيق للتحقق من التوقيع.'
                    : 'We POST a signed event to this URL when an API order is completed or rejected, so your store does not have to poll. See the documentation for how to verify the signature.'}
                </p>
              </div>

              {newSecret && (
                <CopyableSecret
                  value={newSecret}
                  ar={ar}
                  note={
                    ar
                      ? 'انسخ المفتاح السري للتوقيع الآن — لن يظهر مرة أخرى.'
                      : 'Copy your signing secret now — it will not be shown again.'
                  }
                  onDismiss={() => setNewSecret(null)}
                />
              )}

              <FormField
                label={ar ? 'رابط الـ Webhook' : 'Webhook URL'}
                hint={ar ? 'https فقط، وعنوان عام.' : 'https only, on a public address.'}
                error={webhookError ?? undefined}
              >
                <Input
                  dir="ltr"
                  type="url"
                  value={urlValue}
                  maxLength={2048}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://your-store.example/webhooks/bechaalany"
                />
              </FormField>

              {webhookNotice && !webhookError && (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{webhookNotice}</p>
              )}

              {data.webhook && (
                <p className="text-xs text-neutral-500">
                  {ar ? 'آخر تسليم: ' : 'Last delivery: '}
                  {data.webhook.last_delivery_at
                    ? formatDateTime(data.webhook.last_delivery_at, locale)
                    : ar
                      ? 'لا شيء بعد'
                      : 'none yet'}
                  {data.webhook.last_delivery_status
                    ? ` · HTTP ${data.webhook.last_delivery_status}`
                    : ''}
                  {data.webhook.last_delivery_error ? ` · ${data.webhook.last_delivery_error}` : ''}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" loading={saveWebhook.isPending} className="w-fit">
                  {data.webhook
                    ? ar
                      ? 'حفظ الرابط'
                      : 'Save URL'
                    : ar
                      ? 'إضافة Webhook'
                      : 'Add webhook'}
                </Button>
                {data.webhook && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => testWebhook.mutate()}
                      loading={testWebhook.isPending}
                    >
                      {ar ? 'إرسال حدث اختبار' : 'Send test event'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onRotateSecret}
                      loading={rotateSecret.isPending}
                    >
                      {ar ? 'مفتاح سري جديد' : 'Rotate secret'}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={onRemoveWebhook}
                      loading={removeWebhook.isPending}
                    >
                      {ar ? 'حذف' : 'Remove'}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
