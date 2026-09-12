import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Baby, CalendarDays, CheckCircle2, ChevronDown, Eye, Globe2, IdCard, ImagePlus, MapPinned, PhoneCall, TriangleAlert, Upload, UserRoundPen, X } from "lucide-react";
import { getMappedServicePrice } from "../lib/appData.js";
import { apiRequest } from "../lib/api.js";
import { formatDate, formatDateOnly, formatIssueDate, formatMoney, formatNinGroups, getPassportPhotoSrc } from "../lib/appUtils.js";
import { Field, LoadingInline, MessageBanner } from "../components/common/CommonComponents.jsx";

const verificationHubCards = [
  {
    title: "NIN Verification",
    copy: "Verify National Identification Number details",
    icon: "/assets/dashboard/nin-icon.png",
    iconAlt: "NIN icon",
    buttonIcon: <ArrowRight size={14} />,
    path: "/select_nin_template",
    priceKey: "verification",
  },
  {
    title: "Phone Verification",
    copy: "Confirm mobile phone ownership and details",
    icon: "/assets/dashboard/phone-icon.png",
    iconAlt: "Phone icon",
    buttonIcon: <ArrowRight size={14} />,
    path: "/verify_phone",
    priceKey: "phoneVerification",
  },
];

const modificationHubCards = [
  {
    title: "NIN Modification",
    copy: "Open NIN modification options for name, phone number, and date of birth updates.",
    icon: IdCard,
    path: "/modification/nin",
    actionLabel: "Open",
  },
  {
    title: "Birth Modification",
    copy: "Birth modification services will appear here as the request types are finalized.",
    icon: Baby,
    actionLabel: "Coming Soon",
  },
];

const ninModificationTypeOptions = [
  { value: "name", label: "NAME MODIFICATION", icon: UserRoundPen },
  { value: "phone", label: "PHONE NUMBER MODIFICATION", icon: PhoneCall },
  { value: "dob", label: "DOB MODIFICATION", icon: CalendarDays },
  { value: "address", label: "ADDRESS MODIFICATION", icon: MapPinned },
];

const birthAttestationTypeOptions = [
  { value: "permanent", label: "PERMANENT BIRTH ATTESTATION", icon: Baby },
  { value: "temporary", label: "TEMPORARY BIRTH ATTESTATION", icon: CalendarDays },
];

const birthAttestationFieldConfigs = [
  { key: "nin", label: "NIN ID", type: "text", placeholder: "12345678901" },
  { key: "email", label: "EMAIL ADDRESS", type: "email", placeholder: "Enter email address" },
  { key: "firstName", label: "FIRST NAME", type: "text", placeholder: "Enter first name" },
  { key: "middleName", label: "MIDDLE NAME", type: "text", placeholder: "Enter middle name" },
  { key: "surname", label: "SURNAME", type: "text", placeholder: "Enter surname" },
  { key: "dateOfBirth", label: "DATE OF BIRTH", type: "date", placeholder: "" },
  {
    key: "gender",
    label: "GENDER",
    type: "select",
    options: [
      { value: "", label: "Select gender" },
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
      { value: "Other", label: "Other" },
    ],
  },
  { key: "countryOfBirth", label: "COUNTRY OF BIRTH", type: "text", placeholder: "Enter country of birth" },
  { key: "stateOfOrigin", label: "STATE OF ORIGIN", type: "text", placeholder: "Enter state of origin" },
  { key: "lgaOfOrigin", label: "LGA OF ORIGIN", type: "text", placeholder: "Enter LGA of origin" },
  { key: "homeTownVillage", label: "HOME TOWN / VILLAGE", type: "text", placeholder: "Enter hometown or village" },
  {
    key: "residenceStateLga",
    label: "CURRENT STATE AND LGA OF RESIDENCE",
    type: "text",
    placeholder: "Enter current state and LGA of residence",
    full: true,
  },
  {
    key: "residentialAddress",
    label: "CURRENT RESIDENTIAL ADDRESS",
    type: "textarea",
    placeholder: "Enter current residential address",
    rows: 3,
    full: true,
  },
  { key: "occupation", label: "OCCUPATION / PROFESSION", type: "text", placeholder: "Enter occupation or profession" },
  {
    key: "fatherName",
    label: "FATHER'S SURNAME & FIRSTNAME",
    type: "text",
    placeholder: "Enter father's surname and firstname",
  },
  {
    key: "fatherAddress",
    label: "FATHER'S CURRENT ADDRESS",
    type: "textarea",
    placeholder: "Enter father's current address",
    rows: 3,
    full: true,
  },
  {
    key: "motherName",
    label: "MOTHER'S SURNAME AND FIRSTNAME",
    type: "text",
    placeholder: "Enter mother's surname and firstname",
  },
  {
    key: "motherAddress",
    label: "MOTHER'S CURRENT ADDRESS",
    type: "textarea",
    placeholder: "Enter mother's current address",
    rows: 3,
    full: true,
  },
];

const diasporaChildBirthFieldConfigs = [
  { key: "parentNinId", label: "PARENT NIN ID: FATHER / MOTHER / GUARDIAN", type: "text", placeholder: "12345678901" },
  {
    key: "ninOwner",
    label: "INDICATE WHO THE NIN ID BELONG TO",
    type: "select",
    options: [
      { value: "", label: "Select option" },
      { value: "Father", label: "Father" },
      { value: "Mother", label: "Mother" },
      { value: "Guardian", label: "Guardian" },
    ],
  },
  ...birthAttestationFieldConfigs.filter((field) => field.key !== "nin"),
];

const serviceHistoryColumns = ["S/N", "Type", "Reference", "Amount", "Status", "Action"];
const passportUploadAccept = "image/png, image/jpeg";
const passportUploadMaxBytes = 100 * 1024;
const passportTargetWidth = 600;
const passportTargetHeight = 771;
const passportAspectRatio = passportTargetWidth / passportTargetHeight;
const passportAnalysisMaxSide = 900;

let faceApiScriptLoadPromise = null;
let passportModelLoadPromise = null;

function createHistoryReference(prefix) {
  return `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
}

function getHistoryPreviewRows(entry) {
  return [
    ["Reference", entry.reference],
    ["Type", entry.type],
    ["Amount", formatMoney(entry.amount)],
    ["Status", entry.status],
    ["Submitted", formatDate(entry.submittedAt)],
    ...Object.entries(entry.details || {}).map(([key, value]) => [
      key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()),
      value && typeof value === "object" && value.name ? value.name : value || "-",
    ]),
  ];
}

function ServiceHistoryTable({ title, emptyLabel, entries, onPreview }) {
  return (
    <section className="panel">
      <h2 className="template-page-title">{title} | history</h2>
      {!entries.length ? (
        <p>{emptyLabel}</p>
      ) : (
        <div className="table-wrap">
          <table className="txn-table">
            <thead>
              <tr>
                {serviceHistoryColumns.map((column) => <th key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id}>
                  <td data-label="S/N">{index + 1}</td>
                  <td data-label="Type">{entry.type}</td>
                  <td data-label="Reference">{entry.reference}</td>
                  <td data-label="Amount">{formatMoney(entry.amount)}</td>
                  <td data-label="Status">{entry.status}</td>
                  <td data-label="Action">
                    <button type="button" className="verify-modal-button verify-modal-button--secondary" onClick={() => onPreview(entry)}>
                      <Eye size={16} />
                      <span>Preview</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function getSubmittedPreviewRows(entry) {
  if (Array.isArray(entry.detailRows) && entry.detailRows.length) {
    return entry.detailRows
      .filter((item) => item?.label && item?.value !== "" && item?.value !== null && item?.value !== undefined)
      .map((item) => [item.label, item.value]);
  }

  return Object.entries(entry.details || {})
    .filter(([, value]) => value !== "" && value !== null && value !== undefined)
    .map(([key, value]) => [
      key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()),
      value && typeof value === "object" && value.name ? value.name : value,
    ]);
}

function ServiceHistoryPreviewModal({ open, entry, onClose }) {
  if (!open || !entry) return null;

  const submittedRows = getSubmittedPreviewRows(entry);

  return (
    <div className="verify-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="verify-modal" role="dialog" aria-modal="true" aria-labelledby="service-history-preview-title" onClick={(event) => event.stopPropagation()}>
        <span className="verify-modal-status verify-modal-status--success">Submitted details</span>
        <h2 id="service-history-preview-title">{entry.type}</h2>
        <p className="verify-modal-copy">Preview of the details submitted for this request.</p>
        <div className="verify-modal-summary">
          <div>
            <span>Reference</span>
            <strong>{entry.reference}</strong>
          </div>
          <div>
            <span>Amount</span>
            <strong>{formatMoney(entry.amount)}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{entry.status}</strong>
          </div>
          <div>
            <span>Submitted</span>
            <strong>{formatDate(entry.submittedAt)}</strong>
          </div>
        </div>
        <div className="verify-result-grid verify-result-grid--compact">
          {submittedRows.map(([label, value]) => (
            <div key={label} className="verify-result-item">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
          {!submittedRows.length ? (
            <div className="verify-result-item verify-result-item--full">
              <span>Submitted Details</span>
              <strong>No submitted details available.</strong>
            </div>
          ) : null}
        </div>
        <div className="verify-modal-actions">
          <button type="button" className="verify-modal-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceHubPage({ cards, navigate, defaultActionLabel = "Verify Now" }) {
  return (
    <section className="verification-hub-shell">
      <div className="verification-hub-grid">
        {cards.map((service) => {
          const Icon = typeof service.icon === "string" ? null : service.icon;
          const isActive = Boolean(service.path);

          return (
            <article key={service.title} className="verification-hub-card">
              <div className="verification-hub-card-head">
                <h3>{service.title}</h3>
                <span className={`verification-hub-card-icon ${Icon ? "verification-hub-card-icon--glyph" : ""}`}>
                  {Icon ? <Icon size={18} /> : <img src={service.icon} alt={service.iconAlt} />}
                </span>
              </div>
              <p>{service.copy}</p>
              <button
                type="button"
                className={`verification-hub-card-button ${isActive ? "" : "verification-hub-card-button--disabled"}`}
                onClick={isActive ? () => navigate(service.path) : undefined}
                disabled={!isActive}
              >
                <span className="verification-hub-card-button-icon">{service.buttonIcon || <ArrowRight size={14} />}</span>
                <span>{service.actionLabel || defaultActionLabel}</span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function VerificationHubPage({ navigate, servicePricing = {} }) {
  const cards = verificationHubCards.map((card) => ({
    ...card,
    copy: `${card.copy}${servicePricing[card.priceKey]?.price ? ` Starting from ${servicePricing[card.priceKey].price}.` : ""}`,
  }));

  return <ServiceHubPage cards={cards} navigate={navigate} />;
}

export function ModificationHubPage({ navigate, servicePricing = {} }) {
  const cards = modificationHubCards.map((card) => (
    card.title === "NIN Modification"
      ? {
        ...card,
        copy: `${card.copy}${servicePricing.ninModification?.price ? ` Starting from ${servicePricing.ninModification.price}.` : ""}`,
      }
      : card
  ));

  return <ServiceHubPage cards={cards} navigate={navigate} defaultActionLabel="Open" />;
}

function renderFileName(file) {
  return file?.name ? file.name : "No picture selected yet.";
}

function formatUploadSize(bytes = 0) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isSupportedPassportFile(file) {
  if (!file) return false;
  return ["image/png", "image/jpeg", "image/jpg"].includes(file.type) || /\.(png|jpe?g)$/i.test(file.name || "");
}

function resolvePublicAssetUrl(relativePath) {
  const normalizedBaseUrl = String(import.meta.env.BASE_URL || "/").endsWith("/")
    ? String(import.meta.env.BASE_URL || "/")
    : `${String(import.meta.env.BASE_URL || "/")}/`;
  const normalizedPath = relativePath.replace(/^\/+/, "");

  if (typeof window === "undefined") {
    return `${normalizedBaseUrl}${normalizedPath}`;
  }

  return new URL(normalizedPath, new URL(normalizedBaseUrl, window.location.origin)).toString();
}

function loadPassportFaceApiScript() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Passport validation can only run in the browser."));
  }

  if (window.faceapi) return Promise.resolve();
  if (faceApiScriptLoadPromise) return faceApiScriptLoadPromise;

  faceApiScriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = resolvePublicAssetUrl("vendor/face-api/face-api.min.js");
    script.async = true;
    script.dataset.passportValidationRuntime = "true";
    script.onload = () => {
      if (window.faceapi) {
        resolve();
        return;
      }
      faceApiScriptLoadPromise = null;
      reject(new Error("Passport validation model could not initialize."));
    };
    script.onerror = () => {
      faceApiScriptLoadPromise = null;
      reject(new Error("Unable to load passport validation model."));
    };
    document.head.appendChild(script);
  });

  return faceApiScriptLoadPromise;
}

async function getPassportFaceApi() {
  await loadPassportFaceApiScript();
  if (!window.faceapi) {
    throw new Error("Passport validation model is unavailable.");
  }
  return window.faceapi;
}

function loadPassportValidationModels() {
  if (passportModelLoadPromise) return passportModelLoadPromise;

  passportModelLoadPromise = getPassportFaceApi()
    .then((faceapi) => Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(resolvePublicAssetUrl("models")),
    ]))
    .then(() => undefined)
    .catch((error) => {
      passportModelLoadPromise = null;
      throw error;
    });

  return passportModelLoadPromise;
}

function buildPassportFileName(fileName = "passport") {
  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "passport";

  return `${baseName}-passport.jpg`;
}

function getPassportCropMetrics(image, cropSettings) {
  const naturalWidth = image.naturalWidth || image.width || 1;
  const naturalHeight = image.naturalHeight || image.height || 1;
  const imageRatio = naturalWidth / naturalHeight;
  const baseWidth = imageRatio > passportAspectRatio ? naturalHeight * passportAspectRatio : naturalWidth;
  const baseHeight = imageRatio > passportAspectRatio ? naturalHeight : naturalWidth / passportAspectRatio;
  const zoom = clampNumber(Number(cropSettings.zoom) || 1, 1, 3);
  const width = baseWidth / zoom;
  const height = baseHeight / zoom;
  const maxX = Math.max(0, naturalWidth - width);
  const maxY = Math.max(0, naturalHeight - height);
  const x = maxX * (clampNumber(Number(cropSettings.x) || 50, 0, 100) / 100);
  const y = maxY * (clampNumber(Number(cropSettings.y) || 50, 0, 100) / 100);

  return { x, y, width, height, maxX, maxY };
}

function drawPassportCrop(canvas, image, cropSettings) {
  canvas.width = passportTargetWidth;
  canvas.height = passportTargetHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported in this browser.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const naturalWidth = image.naturalWidth || image.width || 1;
  const naturalHeight = image.naturalHeight || image.height || 1;
  const imageRatio = naturalWidth / naturalHeight;
  const zoom = clampNumber(Number(cropSettings.zoom) || 1, 1, 3);

  if (imageRatio >= passportAspectRatio && zoom === 1) {
    const drawWidth = passportTargetWidth;
    const drawHeight = passportTargetWidth / imageRatio;
    const drawY = (passportTargetHeight - drawHeight) / 2;
    context.drawImage(image, 0, 0, naturalWidth, naturalHeight, 0, drawY, drawWidth, drawHeight);
    return;
  }

  const { x, y, width, height } = getPassportCropMetrics(image, cropSettings);
  context.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Unable to prepare the cropped passport image."));
      },
      "image/jpeg",
      quality,
    );
  });
}

function loadImageFromUrl(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load the selected passport image."));
    image.src = src;
  });
}

function createPassportAnalysisCanvas(image) {
  const naturalWidth = image.naturalWidth || image.width || 1;
  const naturalHeight = image.naturalHeight || image.height || 1;
  const scale = Math.min(1, passportAnalysisMaxSide / naturalWidth, passportAnalysisMaxSide / naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported in this browser.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return {
    canvas,
    scaleX: canvas.width / naturalWidth,
    scaleY: canvas.height / naturalHeight,
  };
}

function checkPassportImageQuality(canvas, image) {
  const issues = [];
  const context = canvas.getContext("2d");
  if (!context) return ["Unable to analyze image quality."];

  const naturalWidth = image.naturalWidth || image.width || 0;
  const naturalHeight = image.naturalHeight || image.height || 0;
  if (naturalWidth < 600 || naturalHeight < 600) {
    issues.push("Image resolution is too low. Upload a clearer passport photograph.");
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  let mean = 0;
  let count = 0;

  for (let index = 0; index < imageData.data.length; index += 4) {
    mean += imageData.data[index];
    count += 1;
  }

  mean /= count || 1;

  let variance = 0;
  for (let index = 0; index < imageData.data.length; index += 4) {
    variance += (imageData.data[index] - mean) ** 2;
  }

  variance /= count || 1;
  if (variance < 85) {
    issues.push("Image appears too blurry. Upload a sharper passport photograph.");
  }

  return issues;
}

function checkPassportBackground(canvas) {
  const context = canvas.getContext("2d");
  if (!context) return ["Unable to analyze passport background."];
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  const sampleStep = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) / 180));
  const zones = [
    { x: 0, y: 0, width: canvas.width * 0.22, height: canvas.height * 0.22 },
    { x: canvas.width * 0.78, y: 0, width: canvas.width * 0.22, height: canvas.height * 0.22 },
    { x: 0, y: canvas.height * 0.22, width: canvas.width * 0.12, height: canvas.height * 0.46 },
    { x: canvas.width * 0.88, y: canvas.height * 0.22, width: canvas.width * 0.12, height: canvas.height * 0.46 },
  ];
  let darkPixels = 0;
  let total = 0;

  zones.forEach((zone) => {
    const startX = clampNumber(Math.floor(zone.x), 0, canvas.width - 1);
    const endX = clampNumber(Math.ceil(zone.x + zone.width), 0, canvas.width);
    const startY = clampNumber(Math.floor(zone.y), 0, canvas.height - 1);
    const endY = clampNumber(Math.ceil(zone.y + zone.height), 0, canvas.height);

    for (let y = startY; y < endY; y += sampleStep) {
      for (let x = startX; x < endX; x += sampleStep) {
        const index = (y * imageData.width + x) * 4;
        const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
        if (brightness < 115) darkPixels += 1;
        total += 1;
      }
    }
  });

  const ratio = darkPixels / (total || 1);
  return ratio > 0.42 ? ["Background is too dark or non-uniform for a passport photograph."] : [];
}

function averageColorFromZones(imageData, zones, sampleStep) {
  const { data, width, height } = imageData;
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  zones.forEach((zone) => {
    const startX = clampNumber(Math.floor(zone.x), 0, width - 1);
    const endX = clampNumber(Math.ceil(zone.x + zone.width), 0, width);
    const startY = clampNumber(Math.floor(zone.y), 0, height - 1);
    const endY = clampNumber(Math.ceil(zone.y + zone.height), 0, height);

    for (let y = startY; y < endY; y += sampleStep) {
      for (let x = startX; x < endX; x += sampleStep) {
        const index = (y * width + x) * 4;
        red += data[index];
        green += data[index + 1];
        blue += data[index + 2];
        count += 1;
      }
    }
  });

  return {
    red: red / (count || 1),
    green: green / (count || 1),
    blue: blue / (count || 1),
  };
}

function colorDistance(first, second) {
  return Math.sqrt(
    (first.red - second.red) ** 2
    + (first.green - second.green) ** 2
    + (first.blue - second.blue) ** 2,
  );
}

function foregroundRatioInZone(imageData, zone, backgroundColor, sampleStep) {
  const { data, width, height } = imageData;
  const startX = clampNumber(Math.floor(zone.x), 0, width - 1);
  const endX = clampNumber(Math.ceil(zone.x + zone.width), 0, width);
  const startY = clampNumber(Math.floor(zone.y), 0, height - 1);
  const endY = clampNumber(Math.ceil(zone.y + zone.height), 0, height);
  let foreground = 0;
  let total = 0;

  for (let y = startY; y < endY; y += sampleStep) {
    for (let x = startX; x < endX; x += sampleStep) {
      const index = (y * width + x) * 4;
      const color = { red: data[index], green: data[index + 1], blue: data[index + 2] };
      const brightness = (color.red + color.green + color.blue) / 3;
      if (colorDistance(color, backgroundColor) > 42 || brightness < 95) {
        foreground += 1;
      }
      total += 1;
    }
  }

  return foreground / (total || 1);
}

function checkPassportShoulders(canvas, detectionBox, scaleX, scaleY) {
  const context = canvas.getContext("2d");
  if (!context) return false;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const box = {
    x: detectionBox.x * scaleX,
    y: detectionBox.y * scaleY,
    width: detectionBox.width * scaleX,
    height: detectionBox.height * scaleY,
  };
  const centerX = box.x + box.width / 2;
  const sampleStep = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) / 180));
  const backgroundZones = [
    { x: 0, y: 0, width: canvas.width * 0.18, height: canvas.height * 0.18 },
    { x: canvas.width * 0.82, y: 0, width: canvas.width * 0.18, height: canvas.height * 0.18 },
  ];
  const backgroundColor = averageColorFromZones(imageData, backgroundZones, sampleStep);
  const shoulderTop = clampNumber(box.y + box.height * 0.72, canvas.height * 0.42, canvas.height * 0.78);
  const shoulderBottom = canvas.height * 0.94;
  const shoulderHeight = Math.max(1, shoulderBottom - shoulderTop);
  const leftZone = {
    x: centerX - box.width * 1.5,
    y: shoulderTop,
    width: box.width * 1.05,
    height: shoulderHeight,
  };
  const rightZone = {
    x: centerX + box.width * 0.45,
    y: shoulderTop,
    width: box.width * 1.05,
    height: shoulderHeight,
  };
  const leftRatio = foregroundRatioInZone(imageData, leftZone, backgroundColor, sampleStep);
  const rightRatio = foregroundRatioInZone(imageData, rightZone, backgroundColor, sampleStep);

  return leftRatio > 0.012 && rightRatio > 0.012;
}

function getFaceDetectorOptions(faceapi) {
  try {
    return new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 });
  } catch {
    return new faceapi.TinyFaceDetectorOptions();
  }
}

async function validatePassportImage(image) {
  await loadPassportValidationModels();
  const faceapi = await getPassportFaceApi();
  const analysis = createPassportAnalysisCanvas(image);
  const naturalWidth = image.naturalWidth || image.width || 1;
  const naturalHeight = image.naturalHeight || image.height || 1;
  const detections = await faceapi.detectAllFaces(image, getFaceDetectorOptions(faceapi));

  const issues = [];

  if (!detections.length) {
    return { pass: false, issues: ["No face detected. Upload a passport photograph with the person's face visible."] };
  }

  if (detections.length > 1) {
    issues.push("Multiple faces detected. Use a passport photograph of one person only.");
  }

  const face = detections[0];
  const box = (face.detection || face).box;
  const faceCenterX = box.x + box.width / 2;
  const faceCenterY = box.y + box.height / 2;
  const topGapRatio = Math.max(0, box.y) / naturalHeight;
  const bottomGapRatio = Math.max(0, naturalHeight - (box.y + box.height)) / naturalHeight;
  const faceHeightRatio = box.height / naturalHeight;
  const faceWidthRatio = box.width / naturalWidth;

  if (Math.abs(faceCenterX - naturalWidth / 2) > naturalWidth * 0.16) {
    issues.push("Face must be centered horizontally in the passport photograph.");
  }

  if (faceCenterY < naturalHeight * 0.18 || faceCenterY > naturalHeight * 0.56) {
    issues.push("Face should sit in the upper-middle of the passport photograph.");
  }

  if (topGapRatio < 0.015) {
    issues.push("Leave a little visible space above the person's head.");
  }

  if (topGapRatio > 0.36) {
    issues.push("There is too much empty space above the head. Move the person slightly higher in the crop.");
  }

  if (bottomGapRatio < 0.18 || box.y + box.height > naturalHeight * 0.84) {
    issues.push("Full shoulders must be visible below the face.");
  }

  if (faceHeightRatio > 0.66 || faceWidthRatio > 0.68) {
    issues.push("Photo is too tightly cropped. Include the full head, neck, and full shoulders.");
  }

  if (faceHeightRatio < 0.10 || faceWidthRatio < 0.08) {
    issues.push("Face is too small. Crop a little closer.");
  }

  if (!checkPassportShoulders(analysis.canvas, box, analysis.scaleX, analysis.scaleY)) {
    issues.push("Full shoulder area must be visible on both sides of the passport photograph.");
  }

  return {
    pass: issues.length === 0,
    issues,
    detection: face,
  };
}

async function createCroppedPassportFile(image, cropSettings, fileName) {
  const canvas = document.createElement("canvas");
  drawPassportCrop(canvas, image, cropSettings);

  let selectedBlob = null;
  for (let quality = 0.92; quality >= 0.42; quality -= 0.08) {
    selectedBlob = await canvasToBlob(canvas, quality);
    if (selectedBlob.size <= passportUploadMaxBytes) break;
  }

  if (selectedBlob && selectedBlob.size > passportUploadMaxBytes) {
    const compactCanvas = document.createElement("canvas");
    compactCanvas.width = 480;
    compactCanvas.height = Math.round(compactCanvas.width / passportAspectRatio);
    const context = compactCanvas.getContext("2d");
    if (context) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, compactCanvas.width, compactCanvas.height);
      context.drawImage(canvas, 0, 0, compactCanvas.width, compactCanvas.height);
      for (let quality = 0.82; quality >= 0.34; quality -= 0.08) {
        selectedBlob = await canvasToBlob(compactCanvas, quality);
        if (selectedBlob.size <= passportUploadMaxBytes) break;
      }
    }
  }

  return new File([selectedBlob], buildPassportFileName(fileName), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function PassportCropModal({ source, onCancel, onComplete }) {
  const [cropSettings, setCropSettings] = useState({ zoom: 1, x: 50, y: 50 });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [validationIssues, setValidationIssues] = useState([]);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const redrawPreview = useCallback(() => {
    if (!canvasRef.current || !source?.image) return;
    drawPassportCrop(canvasRef.current, source.image, cropSettings);
  }, [cropSettings, source]);

  useEffect(() => {
    redrawPreview();
  }, [redrawPreview]);

  const updateCropSetting = (key, value) => {
    setCropSettings((current) => ({ ...current, [key]: Number(value) }));
  };

  const startDrag = (event) => {
    if (!canvasRef.current || !source?.image) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const metrics = getPassportCropMetrics(source.image, cropSettings);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      cropX: metrics.x,
      cropY: metrics.y,
      cropWidth: metrics.width,
      cropHeight: metrics.height,
      maxX: metrics.maxX,
      maxY: metrics.maxY,
      rect: canvasRef.current.getBoundingClientRect(),
    };
  };

  const moveDrag = (event) => {
    if (!dragRef.current) return;
    const drag = dragRef.current;
    const nextX = clampNumber(drag.cropX - (event.clientX - drag.startX) * (drag.cropWidth / drag.rect.width), 0, drag.maxX);
    const nextY = clampNumber(drag.cropY - (event.clientY - drag.startY) * (drag.cropHeight / drag.rect.height), 0, drag.maxY);
    setCropSettings((current) => ({
      ...current,
      x: drag.maxX ? (nextX / drag.maxX) * 100 : 50,
      y: drag.maxY ? (nextY / drag.maxY) * 100 : 50,
    }));
  };

  const endDrag = (event) => {
    if (dragRef.current) {
      event.currentTarget.releasePointerCapture?.(dragRef.current.pointerId);
    }
    dragRef.current = null;
  };

  const confirmCrop = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError("");
    setValidationIssues([]);

    try {
      const file = await createCroppedPassportFile(source.image, cropSettings, source.fileName);
      const croppedUrl = URL.createObjectURL(file);
      try {
        const croppedImage = await loadImageFromUrl(croppedUrl);
        const validation = await validatePassportImage(croppedImage);
        if (!validation.pass) {
          setError("Adjust the crop until the face is centered and the shoulders are visible.");
          setValidationIssues(validation.issues);
          return;
        }
      } finally {
        URL.revokeObjectURL(croppedUrl);
      }
      onComplete(file);
    } catch (cropError) {
      setError(cropError.message || "Unable to prepare or validate the passport photo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="passport-crop-backdrop" role="presentation" onClick={onCancel}>
      <div className="passport-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="passport-crop-title" onClick={(event) => event.stopPropagation()}>
        <div className="passport-crop-header">
          <div>
            <h2 id="passport-crop-title">Adjust Your Photo</h2>
            <p>Drag to fit the passport photo within the box.</p>
          </div>
          <button type="button" className="passport-icon-button" onClick={onCancel} aria-label="Close passport crop">
            <X size={18} />
          </button>
        </div>
        <div className="passport-crop-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="passport-crop-canvas"
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        </div>
        <div className="passport-crop-controls">
          <label>
            <span>Zoom</span>
            <input type="range" min="1" max="3" step="0.01" value={cropSettings.zoom} onChange={(event) => updateCropSetting("zoom", event.target.value)} />
          </label>
          <label>
            <span>Horizontal</span>
            <input type="range" min="0" max="100" step="1" value={cropSettings.x} onChange={(event) => updateCropSetting("x", event.target.value)} />
          </label>
          <label>
            <span>Vertical</span>
            <input type="range" min="0" max="100" step="1" value={cropSettings.y} onChange={(event) => updateCropSetting("y", event.target.value)} />
          </label>
        </div>
        {error ? <p className="passport-upload-error">{error}</p> : null}
        {validationIssues.length ? (
          <ul className="passport-upload-issues">
            {validationIssues.map((issue) => <li key={issue}>{issue}</li>)}
          </ul>
        ) : null}
        <div className="passport-crop-actions">
          <button type="button" className="verify-modal-button verify-modal-button--secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
          <button type="button" className="verify-modal-button" onClick={confirmCrop} disabled={isSaving}>
            {isSaving ? <LoadingInline label="Analyzing..." /> : "Confirm Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PassportUploadField({ label = "PASSPORT UPLOAD", value, onChange }) {
  const inputId = useId();
  const [error, setError] = useState("");
  const [analysisIssues, setAnalysisIssues] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cropSource, setCropSource] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const cropUrlRef = useRef("");

  const releaseCropUrl = useCallback(() => {
    if (cropUrlRef.current) {
      URL.revokeObjectURL(cropUrlRef.current);
      cropUrlRef.current = "";
    }
  }, []);

  useEffect(() => {
    if (!(value instanceof File)) {
      setPreviewUrl("");
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(value);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [value]);

  useEffect(() => releaseCropUrl, [releaseCropUrl]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    setError("");
    setAnalysisIssues([]);

    if (!file) return;
    if (!isSupportedPassportFile(file)) {
      setError("Upload a PNG or JPEG passport photo.");
      return;
    }

    onChange(null);
    releaseCropUrl();
    const objectUrl = URL.createObjectURL(file);
    cropUrlRef.current = objectUrl;
    const image = new Image();
    image.onload = async () => {
      setIsAnalyzing(true);
      try {
        const validation = await validatePassportImage(image);
        if (!validation.pass) {
          setError("Selected image is not a passport-standard photograph.");
          setAnalysisIssues(validation.issues);
          releaseCropUrl();
          return;
        }

        setCropSource({
          image,
          imageUrl: objectUrl,
          fileName: file.name,
        });
      } catch (validationError) {
        releaseCropUrl();
        setError(validationError.message || "Unable to analyze the selected passport photograph.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    image.onerror = () => {
      releaseCropUrl();
      setError("Unable to load the selected passport image.");
    };
    image.src = objectUrl;
  };

  const closeCropper = () => {
    setCropSource(null);
    releaseCropUrl();
  };

  const completeCrop = (file) => {
    onChange(file);
    setCropSource(null);
    releaseCropUrl();
  };

  return (
    <div className="passport-upload-field">
      <span className="passport-upload-label">{label}</span>
      <label className="passport-upload-panel" htmlFor={inputId}>
        <input id={inputId} className="passport-upload-input" type="file" accept={passportUploadAccept} onChange={handleFileSelect} />
        <span className="passport-upload-icon">
          <Upload size={24} />
        </span>
        <span className="passport-upload-copy">
          <strong>Upload Passport Photo</strong>
          <small>Upload a PNG or JPEG passport photo for manual crop.</small>
        </span>
        <span className="passport-upload-action">
          <ImagePlus size={17} />
          Choose image
        </span>
      </label>
      {isAnalyzing ? (
        <p className="passport-upload-status">
          <LoadingInline label="Analyzing passport photograph..." size={14} />
        </p>
      ) : null}
      {error ? <p className="passport-upload-error">{error}</p> : null}
      {analysisIssues.length ? (
        <ul className="passport-upload-issues">
          {analysisIssues.map((issue) => <li key={issue}>{issue}</li>)}
        </ul>
      ) : null}
      {value instanceof File && previewUrl ? (
        <div className="passport-upload-result">
          <div className="passport-upload-preview">
            <img src={previewUrl} alt="Accepted passport" />
          </div>
          <div>
            <p>
              <CheckCircle2 size={17} />
              Passport photo validated
            </p>
            <small>{renderFileName(value)} {formatUploadSize(value.size) ? `(${formatUploadSize(value.size)})` : ""}</small>
          </div>
        </div>
      ) : null}
      {cropSource ? <PassportCropModal source={cropSource} onCancel={closeCropper} onComplete={completeCrop} /> : null}
    </div>
  );
}

function mapServiceRequestHistoryEntry(request) {
  return {
    id: request.id,
    type: request.type,
    reference: request.reference,
    amount: Number(request.amount || 0),
    status: request.status,
    submittedAt: request.submittedAt,
    details: request.details || {},
    detailRows: request.detailRows || [],
    passportUrl: request.passportUrl || request.pictureUrl || "",
  };
}

function appendFormValue(formData, key, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  formData.append(key, value);
}

function buildServiceRequestFormData(fields) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value instanceof File) {
      appendFormValue(formData, key, value);
      return;
    }

    appendFormValue(formData, key, value);
  });

  return formData;
}

function ServicePriceSelect({ label, value, placeholder, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const selectRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value) || null;
  const selectOption = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };
  const updateMenuPosition = () => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!open) return undefined;

    updateMenuPosition();

    const handlePointerDown = (event) => {
      const target = event.target;
      if (selectRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  const menu = open && menuPosition && typeof document !== "undefined" ? createPortal(
    <div
      ref={menuRef}
      className="service-price-select-menu service-price-select-menu--portal"
      role="listbox"
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        width: `${menuPosition.width}px`,
      }}
    >
      <button
        type="button"
        className="service-price-select-option service-price-select-option--placeholder"
        onClick={() => selectOption("")}
        role="option"
        aria-selected={!value}
      >
        {placeholder}
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`service-price-select-option ${option.value === value ? "service-price-select-option--active" : ""}`}
          onClick={() => selectOption(option.value)}
          role="option"
          aria-selected={option.value === value}
        >
          <span>{option.label}</span>
          <span className="service-price-select-separator">-</span>
          <strong>{option.amountLabel}</strong>
        </button>
      ))}
    </div>,
    document.body,
  ) : null;

  return (
    <div className={`field service-price-select-field ${open ? "service-price-select-field--open" : ""}`}>
      <span>{label}</span>
      <div className="service-price-select" ref={selectRef}>
        <button
          ref={buttonRef}
          type="button"
          className={`service-price-select-button ${selectedOption ? "" : "service-price-select-button--placeholder"}`}
          onClick={() => {
            updateMenuPosition();
            setOpen((current) => !current);
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="service-price-select-value">
            {selectedOption ? (
              <>
                <span>{selectedOption.label}</span>
                <span className="service-price-select-separator">-</span>
                <strong>{selectedOption.amountLabel}</strong>
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown size={18} className={`service-price-select-chevron ${open ? "service-price-select-chevron--open" : ""}`} />
        </button>
      </div>
      {menu}
    </div>
  );
}

async function fetchServiceRequestHistory({ token, category }) {
  const payload = await apiRequest("/service-requests", {
    token,
    params: { category, limit: 50 },
  });

  return (payload.requests || []).map(mapServiceRequestHistoryEntry);
}

function createBirthAttestationFormState() {
  return {
    nin: "",
    email: "",
    firstName: "",
    middleName: "",
    surname: "",
    dateOfBirth: "",
    gender: "",
    countryOfBirth: "",
    stateOfOrigin: "",
    lgaOfOrigin: "",
    homeTownVillage: "",
    residenceStateLga: "",
    residentialAddress: "",
    occupation: "",
    fatherName: "",
    fatherAddress: "",
    motherName: "",
    motherAddress: "",
    picture: null,
  };
}

function createDiasporaChildBirthFormState() {
  return {
    parentNinId: "",
    ninOwner: "",
    email: "",
    firstName: "",
    middleName: "",
    surname: "",
    dateOfBirth: "",
    gender: "",
    countryOfBirth: "",
    stateOfOrigin: "",
    lgaOfOrigin: "",
    homeTownVillage: "",
    residenceStateLga: "",
    residentialAddress: "",
    occupation: "",
    fatherName: "",
    fatherAddress: "",
    motherName: "",
    motherAddress: "",
  };
}

function renderBirthAttestationField(config, formState, updateFieldValue) {
  const wrapperClassName = `field ${config.full ? "modification-form-field--full" : ""}`.trim();

  if (config.type === "select") {
    return (
      <label key={config.key} className={wrapperClassName}>
        <span>{config.label}</span>
        <select value={formState[config.key]} onChange={(event) => updateFieldValue(config.key, event.target.value)}>
          {config.options.map((option) => (
            <option key={`${config.key}-${option.value || option.label}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (config.type === "textarea") {
    return (
      <label key={config.key} className={wrapperClassName}>
        <span>{config.label}</span>
        <textarea
          rows={config.rows || 3}
          placeholder={config.placeholder}
          value={formState[config.key]}
          onChange={(event) => updateFieldValue(config.key, event.target.value)}
        />
      </label>
    );
  }

  if (config.type === "file") {
    return (
      <div key={config.key} className={wrapperClassName}>
        <PassportUploadField
          label={config.label}
          value={formState[config.key]}
          onChange={(file) => updateFieldValue(config.key, file)}
        />
      </div>
    );
  }

  return (
    <Field
      key={config.key}
      label={config.label}
      type={config.type}
      placeholder={config.placeholder}
      value={formState[config.key]}
      onChange={(value) => updateFieldValue(config.key, value)}
    />
  );
}

export function NinModificationPage({ navigate, user, templatePricing, token, onRefreshPortalData = async () => {} }) {
  const [selectedType, setSelectedType] = useState("");
  const [message, setMessage] = useState(null);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [previewEntry, setPreviewEntry] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forms, setForms] = useState({
    name: {
      nin: "",
      firstName: "",
      middleName: "",
      surname: "",
      picture: null,
    },
    phone: {
      nin: "",
      oldPhoneNumber: "",
      newPhoneNumber: "",
      picture: null,
    },
    dob: {
      nin: "",
      email: "",
      firstName: "",
      middleName: "",
      surname: "",
      dateOfBirth: "",
      gender: "",
      stateOfOrigin: "",
      lgaOfOrigin: "",
      homeTownVillage: "",
      residenceStateLga: "",
      residentialAddress: "",
      occupation: "",
      fatherName: "",
      fatherAddress: "",
      motherName: "",
      motherAddress: "",
    },
    address: {
      nin: "",
      email: "",
      firstName: "",
      surname: "",
      oldAddress: "",
      newAddress: "",
      picture: null,
    },
  });

  const activeType = useMemo(
    () => ninModificationTypeOptions.find((option) => option.value === selectedType) || null,
    [selectedType],
  );
  const ActiveTypeIcon = activeType?.icon || null;
  const activePrice = selectedType
    ? selectedType === "name"
      ? getMappedServicePrice(templatePricing, "ninModificationName")
      : selectedType === "phone"
        ? getMappedServicePrice(templatePricing, "ninModificationPhone")
        : selectedType === "dob"
          ? getMappedServicePrice(templatePricing, "ninModificationDob")
          : getMappedServicePrice(templatePricing, "ninModificationAddress")
    : null;

  const updateFormValue = (formKey, field, value) => {
    setForms((current) => ({
      ...current,
      [formKey]: {
        ...current[formKey],
        [field]: value,
      },
    }));
  };

  const activeForm = selectedType ? forms[selectedType] : null;
  const modificationTypeOptionRows = ninModificationTypeOptions.map((option) => {
    const optionPrice = option.value === "name"
      ? getMappedServicePrice(templatePricing, "ninModificationName")
      : option.value === "phone"
        ? getMappedServicePrice(templatePricing, "ninModificationPhone")
        : option.value === "dob"
          ? getMappedServicePrice(templatePricing, "ninModificationDob")
          : getMappedServicePrice(templatePricing, "ninModificationAddress");

    return {
      ...option,
      amountLabel: optionPrice.price,
    };
  });

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    setHistoryLoading(true);

    fetchServiceRequestHistory({ token, category: "ninModifications" })
      .then((entries) => {
        if (active) {
          setHistoryEntries(entries);
        }
      })
      .catch((error) => {
        if (active) {
          setMessage({ tone: "error", text: error.message || "Unable to load modification history right now." });
        }
      })
      .finally(() => {
        if (active) {
          setHistoryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const resetActiveForm = () => {
    if (!selectedType) return;

    setForms((current) => ({
      ...current,
      [selectedType]: selectedType === "name"
        ? { nin: "", firstName: "", middleName: "", surname: "", picture: null }
        : selectedType === "phone"
          ? { nin: "", oldPhoneNumber: "", newPhoneNumber: "", picture: null }
          : selectedType === "dob"
            ? {
              nin: "",
              email: "",
              firstName: "",
              middleName: "",
              surname: "",
              dateOfBirth: "",
              gender: "",
              stateOfOrigin: "",
              lgaOfOrigin: "",
              homeTownVillage: "",
              residenceStateLga: "",
              residentialAddress: "",
              occupation: "",
              fatherName: "",
              fatherAddress: "",
              motherName: "",
              motherAddress: "",
            }
            : { nin: "", email: "", firstName: "", surname: "", oldAddress: "", newAddress: "", picture: null },
    }));
  };

  return (
    <>
      <section className="verify-route-shell">
        <div className="verify-route-panel verify-route-panel--narrow">
          <div className="verify-wallet-strip">
            Wallet Balance: <strong>{formatMoney(user?.walletBalance || 0)}</strong>
          </div>
          <h1 className="verify-route-title verify-route-title--compact">NIN Modification</h1>
          <p className="verify-route-copy verify-route-copy--compact">
            Choose a modification type and the required form fields will display automatically for the selected request.
          </p>
          {activePrice ? (
            <div className="info-strip">
              Service Charge: <strong>{activePrice.price}</strong>
            </div>
          ) : null}
          <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
          <form
            className="verify-form-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!activeType || !activeForm || submitting) return;

              setSubmitting(true);
              setMessage(null);

              try {
                const payload = await apiRequest("/service-requests", {
                  method: "POST",
                  token,
                  body: buildServiceRequestFormData({
                    category: "ninModifications",
                    type: selectedType,
                    ...activeForm,
                  }),
                });

                setHistoryEntries((current) => [mapServiceRequestHistoryEntry(payload.request), ...current]);
                resetActiveForm();
                await onRefreshPortalData();
                setMessage({
                  tone: "success",
                  text: payload.message || `${activeType.label} submitted successfully.`,
                });
              } catch (error) {
                setMessage({
                  tone: "error",
                  text: error.message || `Unable to submit ${activeType.label.toLowerCase()} right now.`,
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <ServicePriceSelect
              label="Choose Modification Type:"
              value={selectedType}
              placeholder="Select Modification"
              options={modificationTypeOptionRows}
              onChange={(nextValue) => {
                setSelectedType(nextValue);
                setMessage(null);
              }}
            />

            {activeType ? (
              <div className="modification-form-section">
                <div className="modification-form-heading">
                  <span className="modification-form-heading-icon">
                    <ActiveTypeIcon size={17} />
                  </span>
                  <strong>{activeType.label}</strong>
                </div>

                {selectedType === "name" ? (
                  <div className="modification-form-grid">
                    <Field label="NIN ID" type="text" placeholder="12345678901" value={activeForm.nin} onChange={(value) => updateFormValue("name", "nin", value)} />
                    <Field label="NEW FIRSTNAME" type="text" placeholder="Enter new firstname" value={activeForm.firstName} onChange={(value) => updateFormValue("name", "firstName", value)} />
                    <Field label="NEW MIDDLENAME (OPTIONAL)" type="text" placeholder="Enter new middlename" value={activeForm.middleName} onChange={(value) => updateFormValue("name", "middleName", value)} />
                    <Field label="NEW SURNAME/LASTNAME" type="text" placeholder="Enter new surname or lastname" value={activeForm.surname} onChange={(value) => updateFormValue("name", "surname", value)} />
                    <div className="field modification-form-field--full">
                      <PassportUploadField value={activeForm.picture} onChange={(file) => updateFormValue("name", "picture", file)} />
                    </div>
                  </div>
                ) : null}

              {selectedType === "phone" ? (
                <div className="modification-form-grid">
                  <Field label="NIN ID" type="text" placeholder="12345678901" value={activeForm.nin} onChange={(value) => updateFormValue("phone", "nin", value)} />
                  <Field
                    label="OLD PHONE NUMBER (OPTIONAL)"
                    type="tel"
                    placeholder="Enter old phone number"
                    value={activeForm.oldPhoneNumber}
                    onChange={(value) => updateFormValue("phone", "oldPhoneNumber", value)}
                  />
                  <Field
                    label="NEW PHONE NUMBER"
                    type="tel"
                    placeholder="Enter new phone number"
                    value={activeForm.newPhoneNumber}
                    onChange={(value) => updateFormValue("phone", "newPhoneNumber", value)}
                  />
                  <div className="field modification-form-field--full">
                    <PassportUploadField value={activeForm.picture} onChange={(file) => updateFormValue("phone", "picture", file)} />
                  </div>
                </div>
              ) : null}

              {selectedType === "dob" ? (
                <div className="modification-form-grid">
                  <Field label="NIN ID" type="text" placeholder="12345678901" value={activeForm.nin} onChange={(value) => updateFormValue("dob", "nin", value)} />
                  <Field label="EMAIL" type="email" placeholder="Enter email address" value={activeForm.email} onChange={(value) => updateFormValue("dob", "email", value)} />
                  <Field label="FIRST NAME" type="text" placeholder="Enter first name" value={activeForm.firstName} onChange={(value) => updateFormValue("dob", "firstName", value)} />
                  <Field label="MIDDLE NAME" type="text" placeholder="Enter middle name" value={activeForm.middleName} onChange={(value) => updateFormValue("dob", "middleName", value)} />
                  <Field label="SURNAME" type="text" placeholder="Enter surname" value={activeForm.surname} onChange={(value) => updateFormValue("dob", "surname", value)} />
                  <Field label="DATE OF BIRTH" type="date" placeholder="" value={activeForm.dateOfBirth} onChange={(value) => updateFormValue("dob", "dateOfBirth", value)} />
                  <label className="field">
                    <span>GENDER</span>
                    <select value={activeForm.gender} onChange={(event) => updateFormValue("dob", "gender", event.target.value)}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <Field label="STATE OF ORIGIN" type="text" placeholder="Enter state of origin" value={activeForm.stateOfOrigin} onChange={(value) => updateFormValue("dob", "stateOfOrigin", value)} />
                  <Field label="LGA OF ORIGIN" type="text" placeholder="Enter LGA of origin" value={activeForm.lgaOfOrigin} onChange={(value) => updateFormValue("dob", "lgaOfOrigin", value)} />
                  <Field label="HOME TOWN / VILLAGE" type="text" placeholder="Enter hometown or village" value={activeForm.homeTownVillage} onChange={(value) => updateFormValue("dob", "homeTownVillage", value)} />
                  <Field
                    label="CURRENT STATE AND LGA OF RESIDENCE"
                    type="text"
                    placeholder="Enter current state and LGA of residence"
                    value={activeForm.residenceStateLga}
                    onChange={(value) => updateFormValue("dob", "residenceStateLga", value)}
                  />
                  <label className="field modification-form-field--full">
                    <span>CURRENT RESIDENTIAL ADDRESS</span>
                    <textarea
                      rows={3}
                      placeholder="Enter current residential address"
                      value={activeForm.residentialAddress}
                      onChange={(event) => updateFormValue("dob", "residentialAddress", event.target.value)}
                    />
                  </label>
                  <Field
                    label="OCCUPATION / PROFESSION"
                    type="text"
                    placeholder="Enter occupation or profession"
                    value={activeForm.occupation}
                    onChange={(value) => updateFormValue("dob", "occupation", value)}
                  />
                  <Field
                    label="FATHER'S SURNAME & FIRSTNAME"
                    type="text"
                    placeholder="Enter father's surname and firstname"
                    value={activeForm.fatherName}
                    onChange={(value) => updateFormValue("dob", "fatherName", value)}
                  />
                  <label className="field modification-form-field--full">
                    <span>FATHER'S CURRENT ADDRESS</span>
                    <textarea
                      rows={3}
                      placeholder="Enter father's current address"
                      value={activeForm.fatherAddress}
                      onChange={(event) => updateFormValue("dob", "fatherAddress", event.target.value)}
                    />
                  </label>
                  <Field
                    label="MOTHER'S SURNAME AND FIRSTNAME"
                    type="text"
                    placeholder="Enter mother's surname and firstname"
                    value={activeForm.motherName}
                    onChange={(value) => updateFormValue("dob", "motherName", value)}
                  />
                  <label className="field modification-form-field--full">
                    <span>MOTHER'S CURRENT ADDRESS</span>
                    <textarea
                      rows={3}
                      placeholder="Enter mother's current address"
                      value={activeForm.motherAddress}
                      onChange={(event) => updateFormValue("dob", "motherAddress", event.target.value)}
                    />
                  </label>
                </div>
              ) : null}

              {selectedType === "address" ? (
                <div className="modification-form-grid">
                  <Field label="NIN ID" type="text" placeholder="12345678901" value={activeForm.nin} onChange={(value) => updateFormValue("address", "nin", value)} />
                  <Field label="EMAIL" type="email" placeholder="Enter email address" value={activeForm.email} onChange={(value) => updateFormValue("address", "email", value)} />
                  <Field label="FIRST NAME" type="text" placeholder="Enter first name" value={activeForm.firstName} onChange={(value) => updateFormValue("address", "firstName", value)} />
                  <Field label="SURNAME" type="text" placeholder="Enter surname" value={activeForm.surname} onChange={(value) => updateFormValue("address", "surname", value)} />
                  <label className="field modification-form-field--full">
                    <span>OLD ADDRESS</span>
                    <textarea
                      rows={3}
                      placeholder="Enter old address"
                      value={activeForm.oldAddress}
                      onChange={(event) => updateFormValue("address", "oldAddress", event.target.value)}
                    />
                  </label>
                  <label className="field modification-form-field--full">
                    <span>NEW ADDRESS</span>
                    <textarea
                      rows={3}
                      placeholder="Enter new address"
                      value={activeForm.newAddress}
                      onChange={(event) => updateFormValue("address", "newAddress", event.target.value)}
                    />
                  </label>
                  <div className="field modification-form-field--full">
                    <PassportUploadField value={activeForm.picture} onChange={(file) => updateFormValue("address", "picture", file)} />
                  </div>
                </div>
              ) : null}
              </div>
            ) : null}

            {activeType ? (
              <div className="modification-form-actions">
                <button type="submit" className="verify-submit-button">
                  <span className="verify-submit-icon">OK</span>
                  <span>{submitting ? <LoadingInline label="Submitting..." /> : "Submit Modification"}</span>
                </button>
                <button type="button" className="verify-modal-button verify-modal-button--secondary" onClick={() => navigate("/modification")}>
                  Back to Modification
                </button>
              </div>
            ) : null}
          </form>
        </div>
      </section>
      {historyLoading ? <LoadingInline label="Loading modification history..." /> : null}
      <ServiceHistoryTable title="NIN Modification" emptyLabel="No Modification history." entries={historyEntries} onPreview={setPreviewEntry} />
      <ServiceHistoryPreviewModal open={Boolean(previewEntry)} entry={previewEntry} onClose={() => setPreviewEntry(null)} />
    </>
  );
}

export function BirthAttestationPage({ navigate, user, templatePricing, token, onRefreshPortalData = async () => {} }) {
  const [selectedType, setSelectedType] = useState("");
  const [message, setMessage] = useState(null);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [previewEntry, setPreviewEntry] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forms, setForms] = useState({
    permanent: createBirthAttestationFormState(),
    temporary: createBirthAttestationFormState(),
  });

  const activeType = useMemo(
    () => birthAttestationTypeOptions.find((option) => option.value === selectedType) || null,
    [selectedType],
  );
  const ActiveTypeIcon = activeType?.icon || null;
  const activeForm = selectedType ? forms[selectedType] : null;
  const activePrice = selectedType
    ? selectedType === "permanent"
      ? getMappedServicePrice(templatePricing, "birthAttestationPermanent")
      : getMappedServicePrice(templatePricing, "birthAttestationTemporary")
    : null;
  const activeFieldConfigs = selectedType === "permanent"
    ? [...birthAttestationFieldConfigs, { key: "picture", label: "PASSPORT UPLOAD", type: "file", accept: "image/*", full: true }]
    : selectedType === "temporary"
      ? birthAttestationFieldConfigs
      : [];
  const birthTypeOptionRows = birthAttestationTypeOptions.map((option) => ({
    ...option,
    amountLabel: option.value === "permanent"
      ? getMappedServicePrice(templatePricing, "birthAttestationPermanent").price
      : getMappedServicePrice(templatePricing, "birthAttestationTemporary").price,
  }));

  const updateActiveFormValue = (field, value) => {
    if (!selectedType) return;

    setForms((current) => ({
      ...current,
      [selectedType]: {
        ...current[selectedType],
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    setHistoryLoading(true);

    fetchServiceRequestHistory({ token, category: "birthAttestations" })
      .then((entries) => {
        if (active) {
          setHistoryEntries(entries);
        }
      })
      .catch((error) => {
        if (active) {
          setMessage({ tone: "error", text: error.message || "Unable to load birth attestation history right now." });
        }
      })
      .finally(() => {
        if (active) {
          setHistoryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <>
      <section className="verify-route-shell">
        <div className="verify-route-panel verify-route-panel--narrow">
        <div className="verify-wallet-strip">
          Wallet Balance: <strong>{formatMoney(user?.walletBalance || 0)}</strong>
        </div>
        <h1 className="verify-route-title verify-route-title--compact">Birth Attestation</h1>
        <p className="verify-route-copy verify-route-copy--compact">
          Choose an attestation type and the matching form will display automatically for the selected request.
        </p>
        {activePrice ? (
          <div className="info-strip">
            Service Charge: <strong>{activePrice.price}</strong>
          </div>
        ) : null}
        <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
        <form
          className="verify-form-stack"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!activeType || !activeForm || submitting) return;

            setSubmitting(true);
            setMessage(null);

            try {
              const payload = await apiRequest("/service-requests", {
                method: "POST",
                token,
                body: buildServiceRequestFormData({
                  category: "birthAttestations",
                  type: selectedType,
                  ...activeForm,
                }),
              });

              setHistoryEntries((current) => [mapServiceRequestHistoryEntry(payload.request), ...current]);
              setForms((current) => ({
                ...current,
                [selectedType]: createBirthAttestationFormState(),
              }));
              await onRefreshPortalData();
              setMessage({
                tone: "success",
                text: payload.message || `${activeType.label} submitted successfully.`,
              });
            } catch (error) {
              setMessage({
                tone: "error",
                text: error.message || `Unable to submit ${activeType.label.toLowerCase()} right now.`,
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <ServicePriceSelect
            label="Choose Birth Attestation Type:"
            value={selectedType}
            placeholder="Select Birth Attestation"
            options={birthTypeOptionRows}
            onChange={(nextValue) => {
              setSelectedType(nextValue);
              setMessage(null);
            }}
          />

          {activeType ? (
            <div className="modification-form-section">
              <div className="modification-form-heading">
                <span className="modification-form-heading-icon">
                  <ActiveTypeIcon size={17} />
                </span>
                <strong>{activeType.label}</strong>
              </div>

              <div className="modification-form-grid">
                {activeFieldConfigs.map((config) => renderBirthAttestationField(config, activeForm, updateActiveFormValue))}
              </div>
            </div>
          ) : null}

          {activeType ? (
            <div className="modification-form-actions">
              <button type="submit" className="verify-submit-button">
                <span className="verify-submit-icon">OK</span>
                <span>{submitting ? <LoadingInline label="Submitting..." /> : "Submit Attestation"}</span>
              </button>
              <button type="button" className="verify-modal-button verify-modal-button--secondary" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          ) : null}
        </form>
        </div>
      </section>
      {historyLoading ? <LoadingInline label="Loading birth attestation history..." /> : null}
      <ServiceHistoryTable title="Birth Attestation" emptyLabel="No Birth Attestation history." entries={historyEntries} onPreview={setPreviewEntry} />
      <ServiceHistoryPreviewModal open={Boolean(previewEntry)} entry={previewEntry} onClose={() => setPreviewEntry(null)} />
    </>
  );
}

export function DiasporaChildBirthNotificationPage({ navigate, user, templatePricing, token, onRefreshPortalData = async () => {} }) {
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState(createDiasporaChildBirthFormState);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [previewEntry, setPreviewEntry] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const servicePrice = getMappedServicePrice(templatePricing, "diasporaChildBirth");

  const updateFieldValue = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    setHistoryLoading(true);

    fetchServiceRequestHistory({ token, category: "diasporaBirth" })
      .then((entries) => {
        if (active) {
          setHistoryEntries(entries);
        }
      })
      .catch((error) => {
        if (active) {
          setMessage({ tone: "error", text: error.message || "Unable to load diaspora birth history right now." });
        }
      })
      .finally(() => {
        if (active) {
          setHistoryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <>
      <section className="verify-route-shell">
        <div className="verify-route-panel verify-route-panel--narrow">
        <div className="verify-wallet-strip">
          Wallet Balance: <strong>{formatMoney(user?.walletBalance || 0)}</strong>
        </div>
        <h1 className="verify-route-title verify-route-title--compact">Diaspora Child Birth Notification</h1>
        <p className="verify-route-copy verify-route-copy--compact">
          Complete the notification form below for diaspora child birth processing linked to a parent or guardian NIN.
        </p>
        <div className="info-strip">
          Service Charge: <strong>{servicePrice.price}</strong>
        </div>
        <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
        <form
          className="verify-form-stack"
          onSubmit={async (event) => {
            event.preventDefault();
            if (submitting) return;

            setSubmitting(true);
            setMessage(null);

            try {
              const payload = await apiRequest("/service-requests", {
                method: "POST",
                token,
                body: buildServiceRequestFormData({
                  category: "diasporaBirth",
                  type: "diaspora",
                  ...form,
                }),
              });

              setHistoryEntries((current) => [mapServiceRequestHistoryEntry(payload.request), ...current]);
              setForm(createDiasporaChildBirthFormState());
              await onRefreshPortalData();
              setMessage({
                tone: "success",
                text: payload.message || "Diaspora child birth notification submitted successfully.",
              });
            } catch (error) {
              setMessage({
                tone: "error",
                text: error.message || "Unable to submit diaspora child birth notification right now.",
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="modification-form-section">
            <div className="modification-form-heading">
              <span className="modification-form-heading-icon">
                <Globe2 size={17} />
              </span>
              <strong>DIASPORA CHILD BIRTH NOTIFICATION</strong>
            </div>

            <div className="modification-form-grid">
              {diasporaChildBirthFieldConfigs.map((config) => renderBirthAttestationField(config, form, updateFieldValue))}
            </div>
          </div>

          <div className="modification-form-actions">
            <button type="submit" className="verify-submit-button">
              <span className="verify-submit-icon">OK</span>
              <span>{submitting ? <LoadingInline label="Submitting..." /> : "Submit Notification"}</span>
            </button>
            <button type="button" className="verify-modal-button verify-modal-button--secondary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </form>
        </div>
      </section>
      {historyLoading ? <LoadingInline label="Loading diaspora birth history..." /> : null}
      <ServiceHistoryTable title="Diaspora Child Birth Notification" emptyLabel="No Diaspora Birth history." entries={historyEntries} onPreview={setPreviewEntry} />
      <ServiceHistoryPreviewModal open={Boolean(previewEntry)} entry={previewEntry} onClose={() => setPreviewEntry(null)} />
    </>
  );
}

export function IpeResolutionTrackingPage({ navigate, user, templatePricing, token, onRefreshPortalData = async () => {} }) {
  const [message, setMessage] = useState(null);
  const [trackingId, setTrackingId] = useState("");
  const [historyEntries, setHistoryEntries] = useState([]);
  const [previewEntry, setPreviewEntry] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const servicePrice = getMappedServicePrice(templatePricing, "resolutionTracking");

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    setHistoryLoading(true);

    fetchServiceRequestHistory({ token, category: "resolutions" })
      .then((entries) => {
        if (active) {
          setHistoryEntries(entries);
        }
      })
      .catch((error) => {
        if (active) {
          setMessage({ tone: "error", text: error.message || "Unable to load resolution history right now." });
        }
      })
      .finally(() => {
        if (active) {
          setHistoryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <>
      <section className="verify-route-shell">
        <div className="verify-route-panel verify-route-panel--narrow">
        <div className="verify-wallet-strip">
          Wallet Balance: <strong>{formatMoney(user?.walletBalance || 0)}</strong>
        </div>
        <h1 className="verify-route-title verify-route-title--compact">IPE / Error 50 / Resolution</h1>
        <p className="verify-route-copy verify-route-copy--compact">
          Submit your tracking ID below to begin the IPE, Error 50, or resolution request process.
        </p>
        <div className="info-strip">
          Service Charge: <strong>{servicePrice.price}</strong>
        </div>
        <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
        <form
          className="verify-form-stack"
          onSubmit={async (event) => {
            event.preventDefault();
            if (submitting) return;

            setSubmitting(true);
            setMessage(null);

            try {
              const payload = await apiRequest("/service-requests", {
                method: "POST",
                token,
                body: buildServiceRequestFormData({
                  category: "resolutions",
                  type: "tracking",
                  trackingId,
                }),
              });

              setHistoryEntries((current) => [mapServiceRequestHistoryEntry(payload.request), ...current]);
              setTrackingId("");
              await onRefreshPortalData();
              setMessage({
                tone: "success",
                text: payload.message || "Tracking ID submitted successfully.",
              });
            } catch (error) {
              setMessage({
                tone: "error",
                text: error.message || "Unable to submit this tracking ID right now.",
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="modification-form-section">
            <div className="modification-form-heading">
              <span className="modification-form-heading-icon">
                <TriangleAlert size={17} />
              </span>
              <strong>SUBMIT TRACKING ID</strong>
            </div>

            <div className="modification-form-grid">
              <Field
                label="TRACKING ID"
                type="text"
                placeholder="Enter tracking ID"
                value={trackingId}
                onChange={(value) => {
                  setTrackingId(value);
                  setMessage(null);
                }}
              />
            </div>
          </div>

          <div className="modification-form-actions">
            <button type="submit" className="verify-submit-button">
              <span className="verify-submit-icon">OK</span>
              <span>{submitting ? <LoadingInline label="Submitting..." /> : "Submit Tracking ID"}</span>
            </button>
            <button type="button" className="verify-modal-button verify-modal-button--secondary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </form>
        </div>
      </section>
      {historyLoading ? <LoadingInline label="Loading resolution history..." /> : null}
      <ServiceHistoryTable title="IPE / Error 50 / Resolution" emptyLabel="No Resolution history." entries={historyEntries} onPreview={setPreviewEntry} />
      <ServiceHistoryPreviewModal open={Boolean(previewEntry)} entry={previewEntry} onClose={() => setPreviewEntry(null)} />
    </>
  );
}

export function TemplatePage({ navigate, selectedTemplate, onSelectTemplate, user, templateOptions = [] }) {
  return (
    <section className="template-route-shell">
      <div className="template-route-panel">
        <div className="template-wallet-strip">
          Wallet Balance: <strong>{formatMoney(user?.walletBalance || 0)}</strong>
        </div>

        <div className="template-route-intro">
          <h1 className="template-route-title">NIN Verification</h1>
          <p className="template-route-copy">Verify NIN details and identity information with our secure verification system</p>

          <div className="template-feature-card">
            <span className="template-feature-icon">
              <IdCard size={22} />
            </span>
            <strong>NIN Verification</strong>
            <small>National Identity Number Verification</small>
          </div>
        </div>

        <h2 className="template-page-title">Choose Your Template Style</h2>
        <div className="template-grid">
          {templateOptions.map((template) => (
            <article
              key={template.id}
              className={`template-card template-card--select ${selectedTemplate === template.id ? "template-card--active" : ""}`}
              role="button"
              tabIndex={0}
              aria-pressed={selectedTemplate === template.id}
              onClick={() => {
                onSelectTemplate(template.id);
                navigate("/verify");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectTemplate(template.id);
                  navigate("/verify");
                }
              }}
            >
              <div className="template-image-frame">
                <img className="template-image" src={template.image} alt={template.alt} />
              </div>
              <h3 className="template-title">{template.title}</h3>
              <strong className="template-price">{template.price}</strong>
              <ul className="template-list">
                {template.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function InsufficientFundsModal({ open, balance, amount, onClose, onAddMoney }) {
  if (!open) return null;

  return (
    <div className="verify-modal-backdrop" role="presentation">
      <div className="verify-modal" role="dialog" aria-modal="true" aria-labelledby="insufficient-funds-title">
        <span className="verify-modal-status">Rejected / Declined / Failed</span>
        <h2 id="insufficient-funds-title">Insufficient funds</h2>
        <p className="verify-modal-copy">Your wallet balance is too low for this verification request.</p>
        <div className="verify-modal-summary">
          <div>
            <span>Wallet balance</span>
            <strong>{formatMoney(balance)}</strong>
          </div>
          <div>
            <span>Required amount</span>
            <strong>{formatMoney(amount)}</strong>
          </div>
        </div>
        <div className="verify-modal-actions">
          <button type="button" className="verify-modal-button verify-modal-button--secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="verify-modal-button" onClick={onAddMoney}>
            Add Money
          </button>
        </div>
      </div>
    </div>
  );
}

function VerifyResultModal({ open, record, templateTitle, amount, downloading, onClose, onDownload }) {
  if (!open || !record) return null;

  return (
    <div className="verify-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="verify-modal verify-modal--wide" role="dialog" aria-modal="true" aria-labelledby="verify-result-title" onClick={(event) => event.stopPropagation()}>
        <span className="verify-modal-status verify-modal-status--success">Verification matched</span>
        <h2 id="verify-result-title">NIN details found</h2>
        <p className="verify-modal-copy">Review the matched live data below, then download the {templateTitle.toLowerCase()} slip.</p>
        <div className="verify-modal-compact">
          <div className="verify-modal-passport">
            <img src={getPassportPhotoSrc(record)} alt="Passport" />
          </div>
          <div className="verify-modal-main">
            <div className="verify-modal-summary verify-modal-summary--compact">
              <div><span>Template</span><strong>{templateTitle}</strong></div>
              <div><span>Charge</span><strong>{formatMoney(amount)}</strong></div>
            </div>
            <div className="verify-result-grid verify-result-grid--compact">
              <div className="verify-result-item"><span>NIN</span><strong>{formatNinGroups(record.nin)}</strong></div>
              <div className="verify-result-item"><span>Tracking ID</span><strong>{record.trackingId}</strong></div>
              <div className="verify-result-item"><span>Surname</span><strong>{record.surname}</strong></div>
              <div className="verify-result-item"><span>First Name</span><strong>{record.firstName}</strong></div>
              <div className="verify-result-item"><span>Middle Name</span><strong>{record.middleName || "-"}</strong></div>
              <div className="verify-result-item"><span>Date of Birth</span><strong>{formatDateOnly(record.dateOfBirth)}</strong></div>
              <div className="verify-result-item"><span>Gender</span><strong>{record.gender}</strong></div>
              <div className="verify-result-item"><span>Issue Date</span><strong>{formatIssueDate(record.issueDate)}</strong></div>
              <div className="verify-result-item verify-result-item--full"><span>Address</span><strong>{record.addressLines.filter(Boolean).join(", ")}</strong></div>
            </div>
          </div>
        </div>
        <div className="verify-modal-actions">
          <button type="button" className="verify-modal-button verify-modal-button--secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="verify-modal-button" onClick={onDownload} disabled={downloading}>
            {downloading ? <LoadingInline label="Preparing..." /> : "Download NIN Slip"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatBvnDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "short" });

  return `${day}-${month}-${date.getFullYear()}`;
}

function getBvnAddressText(record) {
  if (!record) return "-";

  if (record.address) return record.address;

  const addressLines = Array.isArray(record.addressLines) ? record.addressLines.filter(Boolean) : [];
  return addressLines.length ? addressLines.join(", ") : "-";
}

function BvnResultSheet({ record }) {
  if (!record) return null;

  const rows = [
    { label: "BVN", value: record.bvn },
    { label: "First Name", value: record.firstName },
    { label: "Last Name", value: record.lastName },
    { label: "Middle Name", value: record.middleName || "-" },
    { label: "Phone Number", value: record.phoneNumber || "-" },
    { label: "Date of Birth", value: formatBvnDate(record.dateOfBirth) },
    { label: "Gender", value: record.gender || "-" },
    { label: "Address", value: getBvnAddressText(record) },
  ];

  return (
    <div className="bvn-result-sheet">
      <div className="bvn-result-sheet-header">
        <h3>Bank Verification Number</h3>
        <p>The Bank Verification Number has successfully been verified.</p>
      </div>

      <div className="bvn-result-sheet-body">
        <div className="bvn-result-photo">
          <img src={getPassportPhotoSrc(record)} alt="BVN passport" />
        </div>

        <div className="bvn-result-table" role="table" aria-label="BVN verification details">
          {rows.map((row) => (
            <div key={row.label} className={`bvn-result-row ${row.label === "Address" ? "bvn-result-row--address" : ""}`} role="row">
              <div className="bvn-result-label" role="cell">{row.label}</div>
              <div className="bvn-result-value" role="cell">{row.value || "-"}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="bvn-result-note">NOTE: This document is for verification purposes only.</p>
    </div>
  );
}

function BvnVerifyResultModal({ open, record, templateTitle, amount, downloading, onClose, onDownload }) {
  if (!open || !record) return null;

  return (
    <div className="verify-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="verify-modal verify-modal--bvn" role="dialog" aria-modal="true" aria-labelledby="bvn-result-title" onClick={(event) => event.stopPropagation()}>
        <span className="verify-modal-status verify-modal-status--success">Verification matched</span>
        <h2 id="bvn-result-title">BVN details found</h2>
        <p className="verify-modal-copy">Review the matched live data below, then download the BVN verification slip.</p>
        <div className="verify-modal-summary verify-modal-summary--compact">
          <div><span>Template</span><strong>{templateTitle}</strong></div>
          <div><span>Charge</span><strong>{formatMoney(amount)}</strong></div>
        </div>
        <BvnResultSheet record={record} />
        <div className="verify-modal-actions">
          <button type="button" className="verify-modal-button verify-modal-button--secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="verify-modal-button" onClick={onDownload} disabled={downloading}>
            {downloading ? <LoadingInline label="Preparing..." /> : "Download BVN Slip"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PhoneVerifyResultModal({ open, record, templateTitle, amount, onClose }) {
  if (!open || !record) return null;

  const rows = [
    { label: "Phone Number", value: record.phoneNumber },
    { label: "Status", value: record.status || "Verified" },
    { label: "Full Name", value: record.fullName },
    { label: "First Name", value: record.firstName },
    { label: "Last Name", value: record.lastName },
    { label: "Middle Name", value: record.middleName || "-" },
    { label: "Date of Birth", value: formatBvnDate(record.dateOfBirth) },
    { label: "Gender", value: record.gender || "-" },
    { label: "Carrier", value: record.carrier || "-" },
    { label: "Line Type", value: record.lineType || "-" },
    { label: "Reference", value: record.reference || "-" },
    { label: "Address", value: record.address || "-" },
  ];

  return (
    <div className="verify-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="verify-modal verify-modal--wide" role="dialog" aria-modal="true" aria-labelledby="phone-result-title" onClick={(event) => event.stopPropagation()}>
        <span className="verify-modal-status verify-modal-status--success">Verification matched</span>
        <h2 id="phone-result-title">Phone details found</h2>
        <p className="verify-modal-copy">Review the matched live phone data below.</p>
        <div className="verify-modal-summary verify-modal-summary--compact">
          <div><span>Template</span><strong>{templateTitle}</strong></div>
          <div><span>Charge</span><strong>{formatMoney(amount)}</strong></div>
        </div>
        <div className="verify-result-grid verify-result-grid--compact">
          {rows.map((row) => (
            <div key={row.label} className={`verify-result-item ${row.label === "Address" ? "verify-result-item--full" : ""}`}>
              <span>{row.label}</span>
              <strong>{row.value || "-"}</strong>
            </div>
          ))}
        </div>
        <div className="verify-modal-actions">
          <button type="button" className="verify-modal-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function VerifyPage({
  user,
  selectedTemplate,
  templateOptions = [],
  onVerifyNin,
  saving,
  message,
  insufficientFunds,
  onCloseInsufficientFunds,
  onAddMoney,
  navigate,
  verificationResult,
  onCloseVerificationResult,
  onDownloadVerificationResult,
}) {
  const [form, setForm] = useState({ nin: "", agreed: false });

  const activeTemplate = templateOptions.find((template) => template.id === selectedTemplate)
    || templateOptions[0]
    || { title: "Selected Template", price: formatMoney(0), amount: 0 };

  return (
    <section className="verify-route-shell">
      <div className="verify-route-panel">
        <div className="verify-wallet-strip">
          Wallet Balance: <strong>{formatMoney(user?.walletBalance || 0)}</strong>
        </div>
        <h1 className="verify-route-title">Enter NIN Details</h1>
        <p className="verify-route-copy">
          Provide your NIN and confirm verification <strong>({activeTemplate.title} {activeTemplate.price})</strong>
        </p>
        <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
        <form
          className="verify-form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            onVerifyNin({ nin: form.nin });
          }}
        >
          <Field label="11-digit NIN Number" type="text" placeholder="12345678901" value={form.nin} onChange={(value) => setForm((current) => ({ ...current, nin: value }))} />
          <label className="verify-checkbox-line">
            <input type="checkbox" checked={form.agreed} onChange={(event) => setForm((current) => ({ ...current, agreed: event.target.checked }))} />
            <span>
              I agree to the <a href="#">Terms and Conditions</a>
            </span>
          </label>
          <button type="submit" className="verify-submit-button" disabled={saving || !form.agreed}>
            {saving ? (
              <LoadingInline label="Verifying..." />
            ) : (
              <>
                <span className="verify-submit-icon">OK</span>
                <span>Verify NIN</span>
              </>
            )}
          </button>
        </form>
      </div>
      <InsufficientFundsModal
        open={insufficientFunds.open}
        balance={insufficientFunds.balance}
        amount={insufficientFunds.amount}
        onClose={onCloseInsufficientFunds}
        onAddMoney={() => {
          onCloseInsufficientFunds();
          navigate("/wallet-funding");
          onAddMoney?.();
        }}
      />
      <VerifyResultModal
        open={verificationResult.open}
        record={verificationResult.record}
        templateTitle={activeTemplate.title}
        amount={activeTemplate.amount}
        downloading={saving}
        onClose={onCloseVerificationResult}
        onDownload={onDownloadVerificationResult}
      />
    </section>
  );
}

export function BvnVerificationPage({
  user,
  activeTemplate,
  onVerifyBvn,
  saving,
  message,
  insufficientFunds,
  onCloseInsufficientFunds,
  onAddMoney,
  navigate,
  verificationResult,
  onCloseVerificationResult,
  onDownloadVerificationResult,
}) {
  const [form, setForm] = useState({ bvn: user?.bvn || "", agreed: false });

  useEffect(() => {
    setForm((current) => {
      if (current.bvn) {
        return current;
      }

      return { ...current, bvn: user?.bvn || "" };
    });
  }, [user?.bvn]);

  const resolvedTemplate = activeTemplate || {
    title: "Premium",
    displayTitle: "BVN Premium",
    amount: 170,
    price: formatMoney(170),
  };

  return (
    <section className="verify-route-shell">
      <div className="verify-route-panel">
        <div className="verify-wallet-strip">
          Wallet Balance: <strong>{formatMoney(user?.walletBalance || 0)}</strong>
        </div>
        <h1 className="verify-route-title">Enter BVN Details</h1>
        <p className="verify-route-copy">
          Provide your BVN and confirm verification <strong>({resolvedTemplate.displayTitle || resolvedTemplate.title} {formatMoney(resolvedTemplate.amount)})</strong>
        </p>
        <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
        <form
          className="verify-form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            onVerifyBvn({ bvn: form.bvn });
          }}
        >
          <Field label="11-digit BVN Number" type="text" placeholder="Enter your BVN" value={form.bvn} onChange={(value) => setForm((current) => ({ ...current, bvn: value }))} />
          <label className="verify-checkbox-line">
            <input type="checkbox" checked={form.agreed} onChange={(event) => setForm((current) => ({ ...current, agreed: event.target.checked }))} />
            <span>
              I agree to the <a href="#">Terms and Conditions</a>
            </span>
          </label>
          <button type="submit" className="verify-submit-button" disabled={saving || !form.agreed}>
            {saving ? <LoadingInline label="Verifying..." /> : "Verify BVN"}
          </button>
        </form>
      </div>
      <InsufficientFundsModal
        open={insufficientFunds.open}
        balance={insufficientFunds.balance}
        amount={resolvedTemplate.amount}
        onClose={onCloseInsufficientFunds}
        onAddMoney={() => {
          onCloseInsufficientFunds();
          navigate("/wallet-funding");
          onAddMoney?.();
        }}
      />
      <BvnVerifyResultModal
        open={verificationResult.open}
        record={verificationResult.record}
        templateTitle={resolvedTemplate.displayTitle || resolvedTemplate.title}
        amount={resolvedTemplate.amount}
        downloading={saving}
        onClose={onCloseVerificationResult}
        onDownload={onDownloadVerificationResult}
      />
    </section>
  );
}

export function PhoneVerificationTemplatePage({
  navigate,
  selectedPhoneTemplate,
  onSelectPhoneTemplate,
  user,
  phoneTemplateOptions = [],
}) {
  return (
    <section className="template-route-shell">
      <div className="template-route-panel phone-template-panel">
        <div className="template-wallet-strip">
          Wallet Balance: <strong>{formatMoney(user?.walletBalance || 0)}</strong>
        </div>

        <div className="phone-template-intro">
          <h1 className="phone-template-title">Phone Number Verification</h1>
          <p className="phone-template-copy">Verify phone number details and ownership</p>

          <div className="template-feature-card phone-template-feature-card">
            <span className="template-feature-icon">
              <PhoneCall size={22} />
            </span>
            <strong>Phone Verification</strong>
            <small>Verify phone number details and ownership</small>
          </div>
        </div>

        <h2 className="template-page-title phone-template-page-title">Select Layout Style</h2>
        <div className="phone-template-grid">
          {phoneTemplateOptions.map((template) => (
            <article
              key={template.id}
              className={`phone-template-card ${selectedPhoneTemplate === template.id ? "phone-template-card--active" : ""}`}
              onClick={() => onSelectPhoneTemplate(template.id)}
            >
              <div className="phone-template-image-frame">
                <img className="phone-template-image" src={template.image} alt={template.alt} />
              </div>
              <h3 className="phone-template-card-title">{template.title}</h3>
              <strong className="phone-template-card-price">{template.price}</strong>
            </article>
          ))}
        </div>

        <button type="button" className="phone-template-continue" onClick={() => navigate("/verify_phone_details")} disabled={!selectedPhoneTemplate}>
          Continue
        </button>
      </div>
    </section>
  );
}

export function PhoneVerificationDetailsPage({
  user,
  selectedPhoneTemplate,
  phoneTemplateOptions = [],
  onVerifyPhone,
  saving,
  message,
  insufficientFunds,
  onCloseInsufficientFunds,
  onAddMoney,
  navigate,
  verificationResult,
  onCloseVerificationResult,
}) {
  const [form, setForm] = useState({ phone: user?.phone || "", agreed: false });

  useEffect(() => {
    setForm((current) => {
      if (current.phone) {
        return current;
      }

      return { ...current, phone: user?.phone || "" };
    });
  }, [user?.phone]);

  const activeTemplate = phoneTemplateOptions.find((template) => template.id === selectedPhoneTemplate)
    || phoneTemplateOptions[0]
    || { title: "Selected Template", price: formatMoney(0), amount: 0 };

  return (
    <section className="verify-route-shell">
      <div className="verify-route-panel">
        <div className="verify-wallet-strip">
          Wallet Balance: <strong>{formatMoney(user?.walletBalance || 0)}</strong>
        </div>
        <h1 className="verify-route-title">Enter Phone Details</h1>
        <p className="verify-route-copy">
          Provide your phone number and confirm verification <strong>({activeTemplate.title} {activeTemplate.price})</strong>
        </p>
        <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
        <form
          className="verify-form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            onVerifyPhone({ phone: form.phone });
          }}
        >
          <Field label="Phone Number" type="text" placeholder="Enter your phone number" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
          <label className="verify-checkbox-line">
            <input type="checkbox" checked={form.agreed} onChange={(event) => setForm((current) => ({ ...current, agreed: event.target.checked }))} />
            <span>
              I agree to the <a href="#">Terms and Conditions</a>
            </span>
          </label>
          <button type="submit" className="verify-submit-button" disabled={saving || !form.agreed}>
            {saving ? (
              <LoadingInline label="Verifying..." />
            ) : (
              <>
                <span className="verify-submit-icon">OK</span>
                <span>Verify Phone</span>
              </>
            )}
          </button>
        </form>
      </div>
      <InsufficientFundsModal
        open={insufficientFunds.open}
        balance={insufficientFunds.balance}
        amount={activeTemplate.amount}
        onClose={onCloseInsufficientFunds}
        onAddMoney={() => {
          onCloseInsufficientFunds();
          navigate("/wallet-funding");
          onAddMoney?.();
        }}
      />
      <PhoneVerifyResultModal
        open={verificationResult.open}
        record={verificationResult.record}
        templateTitle={activeTemplate.title}
        amount={activeTemplate.amount}
        onClose={onCloseVerificationResult}
      />
    </section>
  );
}

