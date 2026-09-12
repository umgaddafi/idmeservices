import { DUMMY_PASSPORT_IMAGE } from "./appData.js";

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

    for (let index = 0; index < imageBinary.length; index += 1) {
      imageBytes[index] = imageBinary.charCodeAt(index);
    }

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

function drawCoverImage(ctx, image, box) {
  const { x, y, width, height } = box;
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

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function drawText(ctx, text, x, y, options = {}) {
  const {
    fontSize = 18,
    fontWeight = "400",
    fontFamily = "Arial",
    color = "#111827",
    align = "left",
    baseline = "top",
  } = options;

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(String(text || ""), x, y);
}

function wrapText(ctx, text, maxWidth) {
  const value = String(text || "").trim();

  if (!value) return [""];

  const words = value.split(/\s+/);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (ctx.measureText(nextLine).width <= maxWidth || currentLine === "") {
      currentLine = nextLine;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function formatBvnDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "short" });

  return `${day}-${month}-${date.getFullYear()}`;
}

function getAddressText(record) {
  const addressLines = Array.isArray(record?.addressLines) ? record.addressLines.filter(Boolean).join(", ") : "";
  return String(record?.address || addressLines || "").trim();
}

function buildPdfFileName(record) {
  const timestamp = new Date();
  const value = [
    timestamp.getFullYear(),
    String(timestamp.getMonth() + 1).padStart(2, "0"),
    String(timestamp.getDate()).padStart(2, "0"),
    String(timestamp.getHours()).padStart(2, "0"),
    String(timestamp.getMinutes()).padStart(2, "0"),
    String(timestamp.getSeconds()).padStart(2, "0"),
  ].join("");

  return `BVN_Verification_${record?.bvn || "result"}_${value}.pdf`;
}

export async function generateBvnSlipPdf({ record }) {
  const pageWidth = 1240;
  const pageHeight = 1754;
  const canvas = document.createElement("canvas");
  canvas.width = pageWidth;
  canvas.height = pageHeight;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to prepare the BVN verification slip.");
  }

  const photo = await loadImage(record?.passportPhoto || DUMMY_PASSPORT_IMAGE)
    .catch(() => loadImage(DUMMY_PASSPORT_IMAGE));

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, pageWidth, pageHeight);

  drawText(ctx, "Bank Verification Number", pageWidth / 2, 108, {
    fontSize: 64,
    fontWeight: "700",
    color: "#4c138a",
    align: "center",
  });

  drawText(ctx, "The Bank Verification Number has successfully been verified.", pageWidth / 2, 196, {
    fontSize: 28,
    fontWeight: "400",
    color: "#404040",
    align: "center",
  });

  const photoFrame = { x: 118, y: 338, width: 190, height: 238 };
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 3;
  ctx.strokeRect(photoFrame.x, photoFrame.y, photoFrame.width, photoFrame.height);
  drawCoverImage(ctx, photo, {
    x: photoFrame.x + 4,
    y: photoFrame.y + 4,
    width: photoFrame.width - 8,
    height: photoFrame.height - 8,
  });

  const tableX = 386;
  const tableY = 338;
  const tableWidth = 832;
  const labelWidth = 234;
  const valueWidth = tableWidth - labelWidth;
  const rows = [
    { label: "BVN", value: record?.bvn || "" },
    { label: "First Name", value: record?.firstName || "" },
    { label: "Last Name", value: record?.lastName || "" },
    { label: "Middle Name", value: record?.middleName || "" },
    { label: "Phone Number", value: record?.phoneNumber || "" },
    { label: "Date of Birth", value: formatBvnDate(record?.dateOfBirth) },
    { label: "Gender", value: record?.gender || "" },
    { label: "Address", value: getAddressText(record), multiline: true },
  ];

  let currentY = tableY;

  rows.forEach((row) => {
    ctx.font = "500 18px Arial";
    const wrappedValue = row.multiline ? wrapText(ctx, row.value || "", valueWidth - 28) : [String(row.value || "")];
    const rowHeight = row.multiline ? Math.max(118, 34 + wrappedValue.length * 28) : 68;

    ctx.strokeStyle = "#d9d9d9";
    ctx.lineWidth = 2;
    ctx.strokeRect(tableX, currentY, labelWidth, rowHeight);
    ctx.strokeRect(tableX + labelWidth, currentY, valueWidth, rowHeight);

    drawText(ctx, row.label, tableX + 16, currentY + 18, {
      fontSize: 18,
      fontWeight: "700",
      color: "#444444",
    });

    if (row.multiline) {
      wrappedValue.forEach((line, index) => {
        drawText(ctx, line, tableX + labelWidth + 16, currentY + 18 + index * 28, {
          fontSize: 18,
          fontWeight: "400",
          color: "#444444",
        });
      });
    } else {
      drawText(ctx, row.value || "", tableX + labelWidth + 16, currentY + 18, {
        fontSize: 18,
        fontWeight: "400",
        color: "#444444",
      });
    }

    currentY += rowHeight;
  });

  drawText(ctx, "NOTE: This document is for verification purposes only.", 404, currentY + 76, {
    fontSize: 18,
    fontWeight: "400",
    fontFamily: "Arial",
    color: "#444444",
  });

  const pdfBlob = createPdfBlobFromJpegPages([
    {
      dataUrl: canvas.toDataURL("image/jpeg", 0.96),
      width: pageWidth,
      height: pageHeight,
    },
  ]);

  downloadBlob(pdfBlob, buildPdfFileName(record));
}
