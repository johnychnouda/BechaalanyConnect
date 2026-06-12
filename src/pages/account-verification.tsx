import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  FiCamera,
  FiUpload,
  FiRefreshCw,
  FiX,
  FiSend,
  FiShield,
  FiCreditCard,
  FiUser,
  FiArrowRight,
} from "react-icons/fi";
import PageLayout from "@/components/ui/page-layout";
import PendingApprovalModal from "@/components/ui/pending-approval-modal";
import { useAuth } from "@/context/AuthContext";
import { submitKyc } from "@/services/api.service";
import { getErrorMessage } from "@/utils/getErrorMessage";

type SlotKey = "id_front" | "id_back" | "selfie";

interface SlotState {
  blob: Blob | null;
  preview: string | null;
}

const primaryBtn =
  "inline-flex items-center justify-center gap-2 bg-[#E73828] text-white rounded-full font-bold px-4 py-2.5 hover:bg-white hover:text-[#E73828] border border-[#E73828] transition-colors duration-200 disabled:opacity-60";
const outlineBtn =
  "inline-flex items-center justify-center gap-2 border border-[#E73828] text-[#E73828] rounded-full font-semibold px-4 py-2.5 hover:bg-[#E73828] hover:text-white transition-colors duration-200";
const neutralBtn =
  "inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-600 rounded-full font-semibold px-4 py-2.5 hover:bg-gray-100 transition-colors duration-200";

export default function AccountVerificationPage() {
  const router = useRouter();
  const { locale } = router;
  const isArabic = locale === "ar";
  const { user, isAuthenticated, loading, refreshUserData } = useAuth();

  const [slots, setSlots] = useState<Record<SlotKey, SlotState>>({
    id_front: { blob: null, preview: null },
    id_back: { blob: null, preview: null },
    selfie: { blob: null, preview: null },
  });
  const [activeCamera, setActiveCamera] = useState<SlotKey | null>(null);
  const [cameraError, setCameraError] = useState<SlotKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPendingModal, setShowPendingModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const t = (en: string, ar: string) => (isArabic ? ar : en);

  // Redirect users who don't belong here
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user) {
      router.replace("/auth/signin?callbackUrl=/account-verification");
      return;
    }
    if (user.verification_status === "approved") {
      router.replace("/");
    }
  }, [loading, isAuthenticated, user, router]);

  const setSlot = (key: SlotKey, blob: Blob | null) => {
    setSlots((prev) => {
      if (prev[key].preview) URL.revokeObjectURL(prev[key].preview as string);
      return {
        ...prev,
        [key]: { blob, preview: blob ? URL.createObjectURL(blob) : null },
      };
    });
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActiveCamera(null);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = async (target: SlotKey) => {
    setCameraError(null);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: target === "selfie" ? "user" : "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setActiveCamera(target);
      // Wait for the video element to render before attaching the stream
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setCameraError(target);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const target = activeCamera;
    if (!video || !target) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setSlot(target, blob);
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  };

  const handleUpload = (key: SlotKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (activeCamera === key) stopCamera();
    setSlot(key, file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!slots.id_front.blob || !slots.id_back.blob || !slots.selfie.blob) {
      setError(t(
        "Please provide your ID (front and back) and a selfie.",
        "يرجى تقديم بطاقة الهوية (الأمام والخلف) وصورة شخصية."
      ));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("id_front", slots.id_front.blob, "id_front.jpg");
      formData.append("id_back", slots.id_back.blob, "id_back.jpg");
      formData.append("selfie", slots.selfie.blob, "selfie.jpg");

      await submitKyc(locale || "en", formData);
      await refreshUserData(true);
      setShowPendingModal(true);
    } catch (err) {
      setError(getErrorMessage(err, t(
        "Failed to submit documents. Please try again.",
        "فشل إرسال المستندات. يرجى المحاولة مرة أخرى."
      )));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  // Documents already submitted — show the "under review" state
  if (user.verification_status === "pending" && !showPendingModal) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-6 sm:p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E73828]/10 text-[#E73828]">
              <FiShield className="h-7 w-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#E73828] mb-3">
              {t("ACCOUNT UNDER REVIEW", "الحساب قيد المراجعة")}
            </h2>
            <p className="text-black text-sm sm:text-base mb-6">
              {t(
                "Your verification documents have been submitted and are being reviewed. You will receive an email once your account is approved.",
                "تم إرسال مستندات التحقق الخاصة بك وهي قيد المراجعة. ستتلقى بريداً إلكترونياً فور الموافقة على حسابك."
              )}
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className={`${primaryBtn} w-full py-3`}
            >
              {t("BROWSE PRODUCTS", "تصفح المنتجات")}
              <FiArrowRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const captureSlot = (key: SlotKey, label: string) => {
    const isSelfie = key === "selfie";
    const isCameraOn = activeCamera === key;
    const { preview } = slots[key];
    const hasImage = !!slots[key].blob;
    const LabelIcon = isSelfie ? FiUser : FiCreditCard;

    const takeLabel = hasImage
      ? isSelfie
        ? t("Retake Selfie", "إعادة التقاط الصورة")
        : t("Retake Photo", "إعادة التقاط الصورة")
      : isSelfie
        ? t("Take a Selfie", "التقاط صورة شخصية")
        : t("Take Photo", "التقاط صورة");

    const uploadLabel = hasImage
      ? t("Change Photo", "تغيير الصورة")
      : t("Upload Photo", "تحميل الصورة");

    return (
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-black font-semibold">
          <LabelIcon className="h-4 w-4 text-[#E73828]" />
          {label}
        </label>

        {isCameraOn && (
          <div className="flex flex-col gap-2">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full max-h-[60vh] rounded-xl border border-gray-200 bg-black object-cover${isSelfie ? " -scale-x-100" : ""}`}
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={captureImage} className={`${primaryBtn} flex-1`}>
                <FiCamera className="h-5 w-5" />
                {t("Capture", "التقاط")}
              </button>
              <button type="button" onClick={stopCamera} className={`${neutralBtn} flex-1`}>
                <FiX className="h-5 w-5" />
                {t("Cancel", "إلغاء")}
              </button>
            </div>
          </div>
        )}

        {!isCameraOn && preview && (
          <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden border border-gray-200">
            <Image src={preview} alt={label} fill className="object-cover" unoptimized />
          </div>
        )}

        {!isCameraOn && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="button" onClick={() => startCamera(key)} className={`${outlineBtn} flex-1`}>
              {hasImage ? <FiRefreshCw className="h-5 w-5" /> : <FiCamera className="h-5 w-5" />}
              {takeLabel}
            </button>
            {!isSelfie && (
              <label className={`${outlineBtn} flex-1 cursor-pointer`}>
                <FiUpload className="h-5 w-5" />
                {uploadLabel}
                <input type="file" accept="image/*" onChange={handleUpload(key)} className="hidden" />
              </label>
            )}
          </div>
        )}

        {cameraError === key && (
          <p className="text-xs text-red-600 mt-1">
            {t(
              "Camera unavailable or permission denied. You can upload a photo instead.",
              "الكاميرا غير متاحة أو تم رفض الإذن. يمكنك تحميل صورة بدلاً من ذلك."
            )}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md sm:max-w-lg lg:max-w-xl w-full space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#E73828]/10 text-[#E73828]">
                <FiShield className="h-7 w-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E73828] mb-1 tracking-tight">
                {t("VERIFY YOUR IDENTITY", "تحقق من هويتك")}
              </h2>
              <p className="text-black text-sm sm:text-base">
                {t(
                  "To keep our platform safe, please provide photos of your ID and a selfie. You can take each photo with your camera or upload it. An admin will review your documents before you can start using the platform.",
                  "للحفاظ على أمان منصتنا، يرجى تقديم صور بطاقة الهوية وصورة شخصية. يمكنك التقاط كل صورة بالكاميرا أو تحميلها. ستقوم الإدارة بمراجعة مستنداتك قبل أن تتمكن من استخدام المنصة."
                )}
              </p>
              {user.verification_status === "rejected" && (
                <p className="mt-3 text-red-600 text-sm font-semibold">
                  {t(
                    "Your previous documents were rejected. Please submit new, clear photos.",
                    "تم رفض مستنداتك السابقة. يرجى إرسال صور جديدة وواضحة."
                  )}
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-8">
              {error && (
                <div className="w-full mb-4 text-center text-red-600 text-xs sm:text-sm font-semibold">
                  {error}
                </div>
              )}

              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {captureSlot("id_front", t("ID Card — Front", "بطاقة الهوية — الأمام"))}
                  {captureSlot("id_back", t("ID Card — Back", "بطاقة الهوية — الخلف"))}
                </div>
                {captureSlot("selfie", t("Selfie", "صورة شخصية"))}

                {submitting ? (
                  <div className="w-full flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E73828]"></div>
                  </div>
                ) : (
                  <button type="submit" className={`${primaryBtn} w-full py-3 text-base`}>
                    <FiSend className="h-5 w-5 rtl:-scale-x-100" />
                    {t("SUBMIT FOR REVIEW", "إرسال للمراجعة")}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </PageLayout>

      <PendingApprovalModal
        isOpen={showPendingModal}
        onClose={() => {
          setShowPendingModal(false);
          router.push("/");
        }}
        onOkay={() => {
          setShowPendingModal(false);
          router.push("/");
        }}
        locale={locale || "en"}
      />
    </>
  );
}
