import QRCode from "qrcode";
import { DUMMY_PASSPORT_IMAGE } from "./appData.js";
import { formatDateOnly, formatIssueDate, formatNinGroups } from "./appUtils.js";

function getPassportPhotoSrc(record) {
  return record?.passportPhoto || DUMMY_PASSPORT_IMAGE;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load template asset: ${src}`));
    image.src = src;
  });
}

function createPdfBlobFromJpegPages(pages) {
  const resolvedPages = pages.map(({ dataUrl, width, height }) => {
    const base64 = dataUrl.split(",")[1];
    const imageBinary = window.atob(base64);
    const imageBytes = new Uint8Array(imageBinary.length);
    for (let index = 0; index < imageBinary.length; index += 1) imageBytes[index] = imageBinary.charCodeAt(index);
    return { imageBytes, width, height };
  });

  const encoder = new TextEncoder();
  const pdfChunks = [];
  let offset = 0;
  const pushText = (value) => {
    const bytes = encoder.encode(value);
    pdfChunks.push(bytes);
    offset += bytes.length;
  };
  const pushBytes = (value) => {
    pdfChunks.push(value);
    offset += value.length;
  };

  pushText("%PDF-1.3\n");
  const objectOffsets = [];
  const addObject = (id, bodyBuilder) => {
    objectOffsets[id] = offset;
    pushText(`${id} 0 obj\n`);
    bodyBuilder();
    pushText("\nendobj\n");
  };

  const pagesRootId = 2;
  const pageCount = resolvedPages.length;
  const firstPageId = 3;
  const firstImageId = firstPageId + pageCount * 2;
  const pageIds = resolvedPages.map((_, index) => firstPageId + index * 2);
  const contentIds = resolvedPages.map((_, index) => firstPageId + index * 2 + 1);
  const imageIds = resolvedPages.map((_, index) => firstImageId + index);

  addObject(1, () => pushText(`<< /Type /Catalog /Pages ${pagesRootId} 0 R >>`));
  addObject(pagesRootId, () => pushText(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageCount} >>`));

  resolvedPages.forEach((page, index) => {
    const pageId = pageIds[index];
    const contentId = contentIds[index];
    const imageId = imageIds[index];

    addObject(pageId, () => {
      pushText(`<< /Type /Page /Parent ${pagesRootId} 0 R /MediaBox [0 0 ${page.width} ${page.height}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    });

    addObject(contentId, () => {
      const contentStream = `q\n${page.width} 0 0 ${page.height} 0 0 cm\n/Im0 Do\nQ\n`;
      const contentBytes = encoder.encode(contentStream);
      pushText(`<< /Length ${contentBytes.length} >>\nstream\n`);
      pushBytes(contentBytes);
      pushText("endstream");
    });

    addObject(imageId, () => {
      pushText(`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.imageBytes.length} >>\nstream\n`);
      pushBytes(page.imageBytes);
      pushText("\nendstream");
    });
  });

  const xrefOffset = offset;
  pushText(`xref\n0 ${objectOffsets.length}\n`);
  pushText("0000000000 65535 f \n");
  for (let id = 1; id < objectOffsets.length; id += 1) {
    pushText(`${String(objectOffsets[id]).padStart(10, "0")} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size ${objectOffsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob(pdfChunks, { type: "application/pdf" });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function drawFittedText(ctx, text, options) {
  const { x, y, maxWidth, fontSize, fontFamily = "Arial", fontWeight = "700", color = "#111", align = "left", baseline = "top", minFontSize = 14, letterSpacing = 0 } = options;
  let resolvedSize = fontSize;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillStyle = color;
  const measureWidth = (value) => {
    const baseWidth = ctx.measureText(value).width;
    if (!letterSpacing || value.length <= 1) return baseWidth;
    return baseWidth + letterSpacing * (value.length - 1);
  };
  do {
    ctx.font = `${fontWeight} ${resolvedSize}px ${fontFamily}`;
    if (!maxWidth || measureWidth(text) <= maxWidth || resolvedSize <= minFontSize) break;
    resolvedSize -= 1;
  } while (resolvedSize >= minFontSize);
  if (!letterSpacing || text.length <= 1) {
    ctx.fillText(text, x, y);
    return;
  }
  const totalWidth = measureWidth(text);
  let drawX = x;
  if (align === "center") drawX -= totalWidth / 2;
  else if (align === "right" || align === "end") drawX -= totalWidth;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    ctx.fillText(char, drawX, y);
    drawX += ctx.measureText(char).width + letterSpacing;
  }
}

function drawCoverImage(ctx, image, box) {
  const { x, y, width, height, radius = 0 } = box;
  const imageRatio = image.width / image.height;
  const boxRatio = width / height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;
  if (imageRatio > boxRatio) {
    sourceWidth = image.height * boxRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / boxRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }
  ctx.save();
  if (radius > 0) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.clip();
  }
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  ctx.restore();
}

function drawRotatedText(ctx, text, options) {
  const { x, y, angle, fontSize, fontFamily = "Arial", fontWeight = "700", color = "#111", align = "left", baseline = "top", opacity = 1, letterSpacing = 0 } = options;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.globalAlpha = opacity;
  drawFittedText(ctx, text, { x: 0, y: 0, fontSize, fontFamily, fontWeight, color, align, baseline, letterSpacing });
  ctx.restore();
}

function buildNinQrPayload(record) {
  const fullName = [record?.firstName, record?.middleName, record?.surname].filter(Boolean).join(" ").trim();
  const dateOfBirth = /^\d{4}-\d{2}-\d{2}$/.test(String(record?.dateOfBirth || "")) ? record.dateOfBirth : formatDateOnly(record?.dateOfBirth);
  return `FullName: ${fullName}, NIN: ${record?.nin || ""}, DOB: ${dateOfBirth}`;
}

export async function generateNinSlipPdf({ template, record }) {
  const background = await loadImage(template.pdfBaseImage);
  const passportPhoto = await loadImage(getPassportPhotoSrc(record));
  const qrImage =
    template.id === "premium"
      ? await loadImage(
          await QRCode.toDataURL(buildNinQrPayload(record), {
            errorCorrectionLevel: "M",
            margin: 1,
            width: 720,
            color: { dark: "#101010", light: "#FFFFFF" },
          }),
        )
      : null;
  const premiumBackImage = template.id === "premium" ? await loadImage("/assets/nin_preminum_back.png") : null;
  const canvas = document.createElement("canvas");
  canvas.width = background.naturalWidth || background.width;
  canvas.height = background.naturalHeight || background.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to prepare the PDF slip.");
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  if (template.id === "premium") {
    const photoBox = { x: canvas.width * 0.031, y: canvas.height * 0.200, width: canvas.width * 0.205, height: canvas.height * 0.520, radius: canvas.width * 0.002 };
    drawCoverImage(ctx, passportPhoto, photoBox);
    ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
    ctx.fillRect(canvas.width * 0.27, canvas.height * 0.14, canvas.width * 0.34, canvas.height * 0.28);
    ctx.fillRect(canvas.width * 0.78, canvas.height * 0.44, canvas.width * 0.12, canvas.height * 0.11);
    ctx.fillRect(canvas.width * 0.24, canvas.height * 0.84, canvas.width * 0.4, canvas.height * 0.075);
    drawFittedText(ctx, record.surname, { x: canvas.width * 0.270, y: canvas.height * 0.278, maxWidth: canvas.width * 0.16, fontSize: Math.round(canvas.width * 0.024), fontWeight: "700", color: "#212121", minFontSize: 14 });
    drawFittedText(ctx, record.givenNames, { x: canvas.width * 0.270, y: canvas.height * 0.425, maxWidth: canvas.width * 0.215, fontSize: Math.round(canvas.width * 0.026), fontWeight: "700", color: "#212121", minFontSize: 14 });
    drawFittedText(ctx, formatDateOnly(record.dateOfBirth), { x: canvas.width * 0.270, y: canvas.height * 0.60, maxWidth: canvas.width * 0.17, fontSize: Math.round(canvas.width * 0.022), fontWeight: "700", color: "#212121", minFontSize: 14 });
    drawFittedText(ctx, record.sex, { x: canvas.width * 0.596, y: canvas.height * 0.60, maxWidth: canvas.width * 0.03, fontSize: Math.round(canvas.width * 0.022), fontWeight: "700", color: "#212121", align: "center", minFontSize: 13 });
    drawFittedText(ctx, formatIssueDate(record.issueDate), { x: canvas.width * 0.866, y: canvas.height * 0.666, maxWidth: canvas.width * 0.11, fontSize: Math.round(canvas.width * 0.018), fontWeight: "700", color: "#111", align: "center", minFontSize: 13 });
    const qrMask = { x: canvas.width * 0.711, y: canvas.height * 0.091, size: canvas.width * 0.246 };
    const qrFrameInset = canvas.width * 0.011;
    const qrFrame = { x: qrMask.x + qrFrameInset, y: qrMask.y + qrFrameInset, size: qrMask.size - qrFrameInset * 2, padding: canvas.width * 0.0045, radius: canvas.width * 0.003 };
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrMask.x, qrMask.y, qrMask.size, qrMask.size);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(15, 23, 42, 0.1)";
    ctx.lineWidth = Math.max(2, canvas.width * 0.0016);
    ctx.shadowColor = "rgba(15, 23, 42, 0.16)";
    ctx.shadowBlur = canvas.width * 0.012;
    ctx.shadowOffsetY = canvas.width * 0.004;
    ctx.beginPath();
    ctx.roundRect(qrFrame.x, qrFrame.y, qrFrame.size, qrFrame.size, qrFrame.radius);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    if (qrImage) {
      ctx.drawImage(qrImage, qrFrame.x + qrFrame.padding, qrFrame.y + qrFrame.padding, qrFrame.size - qrFrame.padding * 2, qrFrame.size - qrFrame.padding * 2);
    }
    drawRotatedText(ctx, record.nin, { x: canvas.width * 0.401, y: canvas.height * 0.415, angle: -58, fontSize: Math.round(canvas.width * 0.014), fontWeight: "700", color: "#4b5563", opacity: 0.42, letterSpacing: canvas.width * 0.0006 });
    drawRotatedText(ctx, record.nin, { x: canvas.width * 0.792, y: canvas.height * 0.675, angle: -56, fontSize: Math.round(canvas.width * 0.013), fontWeight: "700", color: "#4b5563", opacity: 0.38, letterSpacing: canvas.width * 0.0004 });
    drawRotatedText(ctx, record.nin, { x: canvas.width * 0.032, y: canvas.height * 0.86, angle: -56, fontSize: Math.round(canvas.width * 0.015), fontWeight: "700", color: "#374151", opacity: 0.55, letterSpacing: canvas.width * 0.00055 });
    drawFittedText(ctx, formatNinGroups(record.nin), { x: canvas.width * 0.522, y: canvas.height * 0.892, maxWidth: canvas.width * 1.02, fontSize: Math.round(canvas.width * 0.056), fontWeight: "900", color: "#111", align: "center", minFontSize: 43, letterSpacing: canvas.width * 0.0089 });
  } else {
    const regularPhotoBox = { x: canvas.width * 0.814, y: canvas.height * 0.240, width: canvas.width * 0.157, height: canvas.height * 0.402, radius: canvas.width * 0.006 };
    drawCoverImage(ctx, passportPhoto, regularPhotoBox);
    const regularTextColor = "#1a1a1a";
    const regularBodyFont = Math.round(canvas.width * 0.019);
    const regularAddressFont = Math.round(canvas.width * 0.0185);
    drawFittedText(ctx, record.trackingId, { x: canvas.width * 0.134, y: canvas.height * 0.270, maxWidth: canvas.width * 0.147, fontSize: regularBodyFont, fontWeight: "500", color: regularTextColor, baseline: "top", minFontSize: 12 });
    drawFittedText(ctx, record.surname, { x: canvas.width * 0.430, y: canvas.height * 0.270, maxWidth: canvas.width * 0.089, fontSize: regularBodyFont, fontWeight: "500", color: regularTextColor, baseline: "top", minFontSize: 12 });
    drawFittedText(ctx, record.nin, { x: canvas.width * 0.145, y: canvas.height * 0.371, maxWidth: canvas.width * 0.147, fontSize: regularBodyFont, fontWeight: "500", color: regularTextColor, baseline: "top", minFontSize: 12 });
    drawFittedText(ctx, record.firstName, { x: canvas.width * 0.430, y: canvas.height * 0.371, maxWidth: canvas.width * 0.096, fontSize: regularBodyFont, fontWeight: "500", color: regularTextColor, baseline: "top", minFontSize: 12 });
    drawFittedText(ctx, record.middleName || "", { x: canvas.width * 0.430, y: canvas.height * 0.513, maxWidth: canvas.width * 0.095, fontSize: regularBodyFont, fontWeight: "500", color: regularTextColor, baseline: "top", minFontSize: 12 });
    drawFittedText(ctx, record.gender, { x: canvas.width * 0.442, y: canvas.height * 0.584, maxWidth: canvas.width * 0.07, fontSize: regularBodyFont, fontWeight: "500", color: regularTextColor, baseline: "top", minFontSize: 12 });
    drawFittedText(ctx, record.addressLines[0] || "", { x: canvas.width * 0.534, y: canvas.height * 0.352, maxWidth: canvas.width * 0.238, fontSize: regularAddressFont, fontWeight: "500", color: regularTextColor, baseline: "top", minFontSize: 11 });
    drawFittedText(ctx, record.addressLines[1] || "", { x: canvas.width * 0.534, y: canvas.height * 0.526, maxWidth: canvas.width * 0.208, fontSize: regularAddressFont, fontWeight: "500", color: regularTextColor, baseline: "top", minFontSize: 11 });
    drawFittedText(ctx, record.addressLines[2] || "", { x: canvas.width * 0.534, y: canvas.height * 0.612, maxWidth: canvas.width * 0.208, fontSize: regularAddressFont, fontWeight: "500", color: regularTextColor, baseline: "top", minFontSize: 11 });
  }
  const pdfPages = [{ dataUrl: canvas.toDataURL("image/jpeg", 0.96), width: canvas.width, height: canvas.height }];
  if (premiumBackImage) {
    const backCanvas = document.createElement("canvas");
    backCanvas.width = canvas.width;
    backCanvas.height = canvas.height;
    const backCtx = backCanvas.getContext("2d");
    if (!backCtx) throw new Error("Unable to prepare the premium back slip page.");
    backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
    backCtx.drawImage(premiumBackImage, 0, 0, backCanvas.width, backCanvas.height);
    pdfPages.push({ dataUrl: backCanvas.toDataURL("image/jpeg", 0.96), width: backCanvas.width, height: backCanvas.height });
  }
  const pdfBlob = createPdfBlobFromJpegPages(pdfPages);
  const filename = `nin-${template.id}-${record.nin}.pdf`;
  downloadBlob(pdfBlob, filename);
}
