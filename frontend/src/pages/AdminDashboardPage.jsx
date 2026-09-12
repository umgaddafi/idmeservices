import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChildCareRoundedIcon from "@mui/icons-material/ChildCareRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import * as XLSX from "xlsx";
import {
  adminDashboardNavItems,
  buildTemplatePricingCatalog,
  buildFallbackAdminSettings,
  formatTemplatePrice,
} from "../lib/appData.js";
import { formatDate, formatMoney } from "../lib/appUtils.js";

function getMessageSeverity(tone) {
  if (tone === "success") return "success";
  if (tone === "warning") return "warning";
  if (tone === "error") return "error";
  return "info";
}

function getStatusColor(value) {
  const normalized = String(value || "").toLowerCase();

  if (
    normalized.includes("completed")
    || normalized.includes("active")
    || normalized.includes("enabled")
    || normalized.includes("connected")
    || normalized.includes("live")
    || normalized.includes("ready")
    || normalized.includes("stable")
    || normalized.includes("resolved")
  ) {
    return "success";
  }

  if (
    normalized.includes("pending")
    || normalized.includes("processing")
    || normalized.includes("review")
    || normalized.includes("watch")
    || normalized.includes("investigating")
    || normalized.includes("medium")
  ) {
    return "warning";
  }

  if (
    normalized.includes("failed")
    || normalized.includes("suspended")
    || normalized.includes("escalated")
    || normalized.includes("critical")
    || normalized.includes("high")
    || normalized.includes("disabled")
  ) {
    return "error";
  }

  return "default";
}

function sanitizeReportCell(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "number") {
    return value;
  }

  return String(value);
}

function normalizeReportDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function isWithinReportRange(value, startDate, endDate) {
  const normalized = normalizeReportDate(value);

  if (!normalized) {
    return true;
  }

  if (startDate && normalized < startDate) {
    return false;
  }

  if (endDate && normalized > endDate) {
    return false;
  }

  return true;
}

function appendReportSheet(workbook, name, rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Notice: "No records found for this report section." }]);
  XLSX.utils.book_append_sheet(workbook, worksheet, name.slice(0, 31));
}

function ServiceManager({ services = [], serviceRequests = [], transactions = [], onSaveService, onDeleteService }) {
  const emptyForm = {
    title: "",
    category: "verification",
    type: "",
    routePath: "/verification",
    description: "",
    amount: 0,
    status: "Live",
    sortOrder: 0,
    showOnHomepage: true,
    image: null,
  };
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setMessage(null);
    setOpen(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setMessage(null);
    setForm({
      title: service.title || "",
      category: service.category || "verification",
      type: service.type || "",
      routePath: service.routePath || "/verification",
      description: service.description || "",
      amount: service.amount || 0,
      status: service.status || "Live",
      sortOrder: service.sortOrder || 0,
      showOnHomepage: service.showOnHomepage !== false,
      image: null,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await onSaveService?.({ id: editing?.id, form });
      setOpen(false);
    } catch (error) {
      setMessage({ tone: "error", text: error.message || "Unable to save this service right now." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <SectionHeader
        title="Service Management"
        description="Add, edit, delete, price, and publish the services that appear on the homepage and member dashboard."
        action={<Button variant="contained" onClick={openCreate}>Add Service</Button>}
      />
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead><TableRow><TableCell>Service</TableCell><TableCell>Category</TableCell><TableCell>Price</TableCell><TableCell>Status</TableCell><TableCell>Homepage</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {service.imageUrl ? <Box component="img" src={service.imageUrl} alt="" sx={{ width: 48, height: 38, borderRadius: 1, objectFit: "cover" }} /> : null}
                    <Box><Typography fontWeight={700}>{service.title}</Typography><Typography variant="caption" color="text.secondary">{service.description}</Typography></Box>
                  </Stack>
                </TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{formatMoney(service.amount)}</TableCell>
                <TableCell><StatusChip value={service.status} /></TableCell>
                <TableCell>{service.showOnHomepage ? "Yes" : "No"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(service)}><EditRoundedIcon /></IconButton>
                  <IconButton color="error" onClick={() => { if (window.confirm("Delete this service?")) void onDeleteService?.(service.id); }}><DeleteOutlineRoundedIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
        <MetricCard label="Published services" value={services.filter((item) => item.status === "Live").length} note="Visible service catalog records" />
        <MetricCard label="Service requests" value={serviceRequests.length} note="All submitted service records" />
        <MetricCard label="Service revenue" value={formatMoney(transactions.filter((item) => item.direction === "debit").reduce((sum, item) => sum + Number(item.amount || 0), 0))} note="Revenue generated from debit transactions" />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {message ? <Alert severity={getMessageSeverity(message.tone)}>{message.text}</Alert> : null}
            <TextField label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} fullWidth />
            <TextField label="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} fullWidth multiline minRows={3} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} fullWidth />
              <TextField label="Type" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} fullWidth />
            </Stack>
            <TextField label="Route path" value={form.routePath} onChange={(event) => setForm((current) => ({ ...current, routePath: event.target.value }))} fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Amount" type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} fullWidth />
              <TextField select label="Status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} fullWidth>
                {["Live", "Draft", "Hidden"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Sort order" type="number" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} fullWidth />
              <Stack direction="row" spacing={1} alignItems="center"><Checkbox checked={form.showOnHomepage} onChange={(event) => setForm((current) => ({ ...current, showOnHomepage: event.target.checked }))} /> <Typography>Show on homepage</Typography></Stack>
            </Stack>
            <Box>
              {editing?.imageUrl ? (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box component="img" src={editing.imageUrl} alt={`${editing.title} current service`} sx={{ width: 78, height: 54, objectFit: "cover", borderRadius: 1.5, border: "1px solid #d7ebe0" }} />
                  <Typography variant="caption" color="text.secondary">Current image. Upload another image to replace it.</Typography>
                </Stack>
              ) : null}
              <Button component="label" variant="outlined">Upload image<input hidden type="file" accept="image/*" onChange={(event) => setForm((current) => ({ ...current, image: event.target.files?.[0] || null }))} /></Button>
              <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary" }}>{form.image?.name || "No image selected"} - Max 5MB</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={() => { void save(); }}>{saving ? "Saving..." : "Save Service"}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function StatusChip({ value }) {
  return <Chip label={value} size="small" color={getStatusColor(value)} variant="outlined" />;
}

function SectionHeader({ title, description, action = null }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
    >
      <Box>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Stack>
  );
}

function MetricCard({ label, value, note }) {
  const normalized = String(label || "").toLowerCase();
  const Icon = normalized.includes("wallet") || normalized.includes("funding") || normalized.includes("revenue") ? PaymentsRoundedIcon
    : normalized.includes("member") || normalized.includes("user") ? PeopleRoundedIcon
      : normalized.includes("verification") || normalized.includes("nin") || normalized.includes("bvn") ? FactCheckRoundedIcon
        : normalized.includes("support") ? SupportAgentRoundedIcon
          : normalized.includes("setting") || normalized.includes("smtp") ? SettingsRoundedIcon
            : AssessmentRoundedIcon;
  return (
    <Card variant="outlined" className="admin-metric-card" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box className="admin-metric-heading">
          <Box className="admin-metric-icon"><Icon fontSize="small" /></Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              letterSpacing: "0.04em",
              fontSize: { xs: "0.72rem", sm: "0.76rem" },
              lineHeight: 1.2,
            }}
          >
            {label}
          </Typography>
        </Box>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            mt: 0.5,
            whiteSpace: "nowrap",
            fontSize: { xs: "1.35rem", sm: "1.6rem", md: "1.75rem" },
            lineHeight: 1.15,
          }}
        >
          {value}
        </Typography>
        {note ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {note}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

function buildSettingsForm(settings) {
  return {
    systemName: settings?.branding?.systemName || "IDM e-Services",
    supportEmail: settings?.supportEmail || "",
    supportPhone: settings?.supportPhone || "",
    currencyCode: settings?.currency?.code || "USD",
    currencyLocale: settings?.currency?.locale || "en-US",
    currencyRate: settings?.currency?.rate || 1,
    pricingSource: settings?.pricingSource || "env",
    registrationMode: settings?.registrationMode || "OPEN",
    smtpHost: settings?.smtp?.host || "",
    smtpPort: settings?.smtp?.port || 587,
    smtpUser: settings?.smtp?.user || "",
    smtpPass: settings?.smtp?.pass || "",
    smtpFromName: settings?.smtp?.fromName || "IDM e-Services",
    smtpFromEmail: settings?.smtp?.fromEmail || "",
    logo: null,
    homepageWallpaper: null,
  };
}

function SettingsManager({ settings, onUpdateSettings }) {
  const [form, setForm] = useState(() => buildSettingsForm(settings));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!dirty && !saving) {
      setForm(buildSettingsForm(settings));
    }
  }, [dirty, saving, settings]);

  const updateForm = (patch) => {
    setDirty(true);
    setForm((current) => ({ ...current, ...patch }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = new FormData();
      body.append("branding[systemName]", form.systemName);
      body.append("supportEmail", form.supportEmail);
      body.append("supportPhone", form.supportPhone);
      body.append("branding[currency][code]", form.currencyCode);
      body.append("branding[currency][locale]", form.currencyLocale);
      body.append("branding[currency][rate]", form.currencyRate);
      body.append("registrationMode", form.registrationMode);
      body.append("smtp[host]", form.smtpHost);
      body.append("smtp[port]", form.smtpPort);
      body.append("smtp[user]", form.smtpUser);
      body.append("smtp[pass]", form.smtpPass);
      body.append("smtp[fromName]", form.smtpFromName);
      body.append("smtp[fromEmail]", form.smtpFromEmail);
      if (form.logo) body.append("logo", form.logo);
      if (form.homepageWallpaper) body.append("homepageWallpaper", form.homepageWallpaper);
      const savedSettings = await onUpdateSettings?.(body);
      setForm(buildSettingsForm(savedSettings || settings));
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <SectionHeader title="System Settings" description="Update live platform branding, homepage wallpaper, support details, registration mode, SMTP sender, and global logo." />
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="System name" value={form.systemName} onChange={(event) => updateForm({ systemName: event.target.value })} fullWidth />
            <TextField select label="Registration mode" value={form.registrationMode} onChange={(event) => updateForm({ registrationMode: event.target.value })} fullWidth>
              {["OPEN", "INVITE_ONLY", "PAUSED"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="Support email" value={form.supportEmail} onChange={(event) => updateForm({ supportEmail: event.target.value })} fullWidth />
            <TextField label="Support phone" value={form.supportPhone} onChange={(event) => updateForm({ supportPhone: event.target.value })} fullWidth />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField select label="Currency" value={form.currencyCode} onChange={(event) => {
              const code = event.target.value;
              updateForm({
                currencyCode: code,
                currencyLocale: code === "NGN" ? "en-NG" : "en-US",
                currencyRate: code === "NGN" ? (Number(form.currencyRate) === 1 ? 1600 : form.currencyRate) : 1,
              });
            }} fullWidth helperText="Controls displayed wallet balances, pricing, and transactions">
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="NGN">Naira</MenuItem>
            </TextField>
            <TextField label="Currency locale" value={form.currencyLocale} onChange={(event) => updateForm({ currencyLocale: event.target.value })} fullWidth helperText="Example: en-US or en-NG" />
            <TextField label="Conversion rate" type="number" value={form.currencyRate} onChange={(event) => updateForm({ currencyRate: event.target.value })} fullWidth helperText="Displayed amount = stored amount x rate" />
            <TextField label="Pricing source (.env)" value={form.pricingSource} fullWidth disabled helperText="APP_PRICING_SOURCE=env keeps service pricing from .env" />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="SMTP host" value={form.smtpHost} onChange={(event) => updateForm({ smtpHost: event.target.value })} fullWidth />
            <TextField label="SMTP port" type="number" value={form.smtpPort} onChange={(event) => updateForm({ smtpPort: event.target.value })} fullWidth />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="SMTP user" value={form.smtpUser} onChange={(event) => updateForm({ smtpUser: event.target.value })} fullWidth />
            <TextField label="SMTP password" type="password" value={form.smtpPass} onChange={(event) => updateForm({ smtpPass: event.target.value })} fullWidth />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="From name" value={form.smtpFromName} onChange={(event) => updateForm({ smtpFromName: event.target.value })} fullWidth />
            <TextField label="From email" value={form.smtpFromEmail} onChange={(event) => updateForm({ smtpFromEmail: event.target.value })} fullWidth />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
            {settings?.branding?.logoUrl ? <Box component="img" src={settings.branding.logoUrl} alt="Current logo" sx={{ width: 86, height: 58, objectFit: "contain", border: "1px solid #d7ebe0", borderRadius: 2, p: 1 }} /> : null}
            <Box>
              <Button component="label" variant="outlined">Upload new logo<input hidden type="file" accept="image/*" onChange={(event) => updateForm({ logo: event.target.files?.[0] || null })} /></Button>
              <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary" }}>{form.logo?.name || "No logo selected"}</Typography>
            </Box>
            {settings?.branding?.homepageWallpaperUrl ? <Box component="img" src={settings.branding.homepageWallpaperUrl} alt="Current homepage wallpaper" sx={{ width: 110, height: 62, objectFit: "cover", border: "1px solid #d7ebe0", borderRadius: 2 }} /> : null}
            <Box>
              <Button component="label" variant="outlined">Upload homepage wallpaper<input hidden type="file" accept="image/*" onChange={(event) => updateForm({ homepageWallpaper: event.target.files?.[0] || null })} /></Button>
              <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary" }}>{form.homepageWallpaper?.name || "No wallpaper selected"}</Typography>
            </Box>
            <Button variant="contained" disabled={saving} onClick={() => { void save(); }}>{saving ? "Saving..." : "Save Settings"}</Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}

function SimpleTable({ columns, rows, emptyMessage, renderRow }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length ? (
            rows.map(renderRow)
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TableFilters({ children }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,251,247,0.98))",
        borderColor: "rgba(15, 122, 87, 0.12)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          flexWrap: { xs: "wrap", md: "nowrap" },
          gap: 1.5,
          alignItems: "start",
          "& > .MuiFormControl-root:first-of-type": {
            flex: "1 1 auto",
            minWidth: 0,
          },
          "& > .MuiFormControl-root:not(:first-of-type)": {
            flex: "0 0 auto",
            minWidth: "8.75rem",
            width: "auto",
          },
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}

function getFilterFieldSx() {
  return {
    width: "100%",
    minWidth: 0,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 8px 24px rgba(11, 92, 66, 0.06)",
      transition: "box-shadow 160ms ease, border-color 160ms ease, transform 160ms ease",
      "& fieldset": {
        borderColor: "rgba(15, 122, 87, 0.16)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(15, 122, 87, 0.3)",
      },
      "&.Mui-focused": {
        boxShadow: "0 10px 28px rgba(18, 149, 107, 0.12)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "rgba(18, 149, 107, 0.48)",
      },
    },
    "& .MuiInputLabel-root": {
      fontWeight: 600,
    },
  };
}

function SearchFilterField({ label, value, onChange, placeholder }) {
  return (
    <TextField
      label={label}
      size="small"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      sx={getFilterFieldSx()}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
          </InputAdornment>
        ),
      }}
    />
  );
}

function copyTextToClipboard(value) {
  const text = String(value || "").trim();
  if (!text || text === "N/A") return Promise.resolve(false);

  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true);
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve(copied);
}

function MemberDetailItem({ label, value, copyable = true }) {
  const [copied, setCopied] = useState(false);
  const displayValue = value || "N/A";
  const canCopy = copyable && displayValue !== "N/A";

  const handleCopy = async () => {
    const didCopy = await copyTextToClipboard(displayValue);
    if (!didCopy) return;

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "grid",
        gap: 0.65,
        minWidth: 0,
        p: { xs: 1.35, sm: 1.55 },
        pr: canCopy ? 5.25 : { xs: 1.35, sm: 1.55 },
        border: "1px solid rgba(15, 122, 87, 0.16)",
        borderRadius: 2,
        background: "rgba(255, 255, 255, 0.98)",
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 800, letterSpacing: 0.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} sx={{ color: "#10231c", overflowWrap: "anywhere", lineHeight: 1.55 }}>
        {displayValue}
      </Typography>
      {canCopy ? (
        <Tooltip title={copied ? "Copied" : "Copy"}>
          <IconButton
            size="small"
            onClick={handleCopy}
            aria-label={`Copy ${label}`}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 30,
              height: 30,
              border: "1px solid rgba(15, 122, 87, 0.16)",
              color: copied ? "#0b9868" : "text.secondary",
              background: copied ? "rgba(18, 173, 120, 0.12)" : "rgba(248, 252, 250, 0.95)",
              "&:hover": { background: "rgba(18, 173, 120, 0.12)", color: "#07543a" },
            }}
          >
            {copied ? <CheckRoundedIcon fontSize="inherit" /> : <ContentCopyRoundedIcon fontSize="inherit" />}
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  );
}

const SERVICE_REQUEST_STATUSES = ["New Request", "Processing", "Completed"];
const CUSTOMER_HIDDEN_SERVICE_CATEGORIES = ["ninModifications", "birthAttestations", "diasporaBirth"];

const ADMIN_SERVICE_REQUEST_TYPES = [
  {
    id: "ninModifications",
    title: "NIN Modification Requests",
    description: "Review submitted NIN name, phone number, and date of birth modification requests.",
    statLabel: "NIN Modification",
    tableLabel: "NIN Modification",
    typeOptions: ["NAME MODIFICATION", "PHONE NUMBER MODIFICATION", "DOB MODIFICATION", "ADDRESS MODIFICATION"],
  },
  {
    id: "birthAttestations",
    title: "Birth Attestation Requests",
    description: "Track permanent and temporary birth attestation submissions.",
    statLabel: "Birth Attestation",
    tableLabel: "Birth Attestation",
    typeOptions: ["PERMANENT BIRTH ATTESTATION", "TEMPORARY BIRTH ATTESTATION"],
  },
  {
    id: "diasporaBirth",
    title: "Diaspora Child Birth Notifications",
    description: "Review diaspora child birth notification requests linked to parent or guardian NIN records.",
    statLabel: "Diaspora Birth",
    tableLabel: "Diaspora Birth Notification",
    typeOptions: ["DIASPORA CHILD BIRTH NOTIFICATION"],
  },
  {
    id: "resolutions",
    title: "IPE / Error 50 / Resolution Requests",
    description: "Track resolution requests submitted by tracking ID.",
    statLabel: "IPE / Error 50",
    tableLabel: "IPE / Error 50 / Resolution",
    typeOptions: ["SUBMIT TRACKING ID"],
  },
];

const adminMenuIconMap = {
  dashboard: <DashboardRoundedIcon fontSize="small" />,
  users: <PeopleRoundedIcon fontSize="small" />,
  verifications: <FactCheckRoundedIcon fontSize="small" />,
  ninModifications: <AssignmentTurnedInRoundedIcon fontSize="small" />,
  birthAttestations: <ChildCareRoundedIcon fontSize="small" />,
  diasporaBirth: <ChildCareRoundedIcon fontSize="small" />,
  resolutions: <WarningAmberRoundedIcon fontSize="small" />,
  wallet: <PaymentsRoundedIcon fontSize="small" />,
  transactions: <ReceiptLongRoundedIcon fontSize="small" />,
  templates: <DescriptionRoundedIcon fontSize="small" />,
  reports: <AssessmentRoundedIcon fontSize="small" />,
  support: <SupportAgentRoundedIcon fontSize="small" />,
  admins: <AdminPanelSettingsRoundedIcon fontSize="small" />,
  settings: <SettingsRoundedIcon fontSize="small" />,
};

export function AdminDashboardPage({
  user,
  navigate,
  transactions = [],
  members = [],
  verifications = [],
  serviceRequests = [],
  supportTickets = [],
  settings,
  loading = false,
  message = null,
  activeTab = "dashboard",
  onChangeActiveTab = () => {},
  templatePricing,
  onUpdateTemplatePricing = () => {},
  onUpdateMember = async () => {},
  onDeleteMember = async () => {},
  onUpdateServiceRequestStatus = async () => {},
  services = [],
  onSaveService = async () => {},
  onDeleteService = async () => {},
  onUpdateSettings = async () => {},
  onUpdateSupportTicket = async () => {},
  onReconcileWallets = async () => {},
  onLookupPaystackReference = async () => {},
  externalWalletState = null,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pricingDrafts, setPricingDrafts] = useState({});
  const [pricingSavingKey, setPricingSavingKey] = useState("");
  const [memberViewTarget, setMemberViewTarget] = useState(null);
  const [supportReplyTarget, setSupportReplyTarget] = useState(null);
  const [supportReplyText, setSupportReplyText] = useState("");
  const [supportReplySaving, setSupportReplySaving] = useState(false);
  const [memberDeleteTarget, setMemberDeleteTarget] = useState(null);
  const [memberEditState, setMemberEditState] = useState({
    open: false,
    saving: false,
    message: null,
    member: null,
    form: {
      name: "",
      email: "",
      phone: "",
      role: "MEMBER",
      status: "Active",
    },
  });
  const [memberDeleteState, setMemberDeleteState] = useState({
    saving: false,
    message: null,
  });
  const [requestViewTarget, setRequestViewTarget] = useState(null);
  const [requestStatusSaving, setRequestStatusSaving] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleDraft, setRoleDraft] = useState({ id: "", name: "", role: "ADMIN", status: "Active", scope: "" });
  const [extraRoles, setExtraRoles] = useState([]);
  const [localMessage, setLocalMessage] = useState(null);
  const [requestFilters, setRequestFilters] = useState(() =>
    ADMIN_SERVICE_REQUEST_TYPES.reduce((filters, item) => ({
      ...filters,
      [item.id]: { search: "", status: "all", type: "all" },
    }), {}),
  );
  const [tableFilters, setTableFilters] = useState({
    users: { search: "", status: "all", plan: "all" },
    verifications: { search: "", status: "all", channel: "all" },
    transactions: { search: "", status: "all", direction: "all" },
    support: { search: "", status: "all", priority: "all" },
  });
  const [reportOptions, setReportOptions] = useState({
    type: "complete",
    startDate: "",
    endDate: "",
  });
  const [reportMessage, setReportMessage] = useState(null);
  const [walletReconcileState, setWalletReconcileState] = useState({ loading: false, message: null });
  const [paystackLookupState, setPaystackLookupState] = useState({
    loading: false,
    reference: "",
    message: null,
    result: null,
    modalOpen: false,
  });

  const adminMembers = useMemo(() => {
    const currentMember = user
      ? [
          {
            id: user.id || user.memberId || "ADM-MB-LIVE",
            memberId: user.memberId || user.id || "ADM-MB-LIVE",
            name: user.name || "Current User",
            email: user.email || "user@example.com",
            phone: user.phone || "N/A",
            walletBalance: Number(user.walletBalance || 0),
            status: user.status || "Active",
            plan: user.role || "Member",
            joinedAt: user.joinDate || "2026-01-01",
          },
        ]
      : [];

    const seededMembers = members.length
      ? members.map((member) => ({
          id: member.id || member.memberId || member.email,
          memberId: member.memberId || member.id || member.email,
          name: member.name,
          email: member.email,
          phone: member.phone || "N/A",
          walletBalance: Number(member.walletBalance || 0),
          status: member.status || "Active",
          plan: member.role || "Member",
          joinedAt: member.joinDate || "N/A",
        }))
      : [];

    return [...currentMember, ...seededMembers].filter(
      (member, index, list) => list.findIndex((item) => item.email === member.email) === index,
    );
  }, [members, user]);

  const transactionFeed = transactions;
  const verificationFeed = verifications;
  const supportItems = supportTickets;
  const effectiveSettings = settings || buildFallbackAdminSettings();

  const pendingTickets = supportItems.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return !status.includes("closed") && !status.includes("resolved") && !status.includes("verified");
  }).length;
  const activeMembers = adminMembers.filter((item) => String(item.status || "").toLowerCase() === "active").length;
  const pendingVerifications = verificationFeed.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status.includes("pending") || status.includes("review");
  }).length;
  const completedVerifications = verificationFeed.filter((item) => String(item.status || "").toLowerCase().includes("completed")).length;
  const totalWalletFloat = adminMembers.reduce((sum, item) => sum + Number(item.walletBalance || 0), 0);
  const totalRevenue = transactionFeed
    .filter((item) => item.direction === "debit")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalInflow = transactionFeed
    .filter((item) => item.direction === "credit")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const externalWalletBalance = externalWalletState?.balance === null || externalWalletState?.balance === undefined
    ? null
    : Number(externalWalletState.balance || 0);
  const externalWalletNote = externalWalletState?.message
    ? externalWalletState.message
    : externalWalletState?.fetchedAt
      ? `Updated ${new Date(externalWalletState.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : externalWalletState?.loading
        ? "Connecting to KhadVerify..."
        : "Refreshes every 30 seconds";
  const serviceRequestCounts = useMemo(
    () =>
      ADMIN_SERVICE_REQUEST_TYPES.reduce((counts, item) => {
        const rows = serviceRequests.filter((request) => request.category === item.id);
        const completed = rows.filter((request) => String(request.status || "").toLowerCase().includes("completed")).length;
        const processing = rows.filter((request) => String(request.status || "").toLowerCase().includes("processing")).length;

        return {
          ...counts,
          [item.id]: {
            total: rows.length,
            completed,
            processing,
            newRequest: rows.filter((request) => String(request.status || "").toLowerCase().includes("new request")).length,
          },
        };
      }, {}),
    [serviceRequests],
  );

  const templateCatalog = useMemo(() => buildTemplatePricingCatalog(templatePricing), [templatePricing]);

  const updateTableFilter = (table, field, value) => {
    setTableFilters((current) => ({
      ...current,
      [table]: {
        ...current[table],
        [field]: value,
      },
    }));
  };

  const updateRequestFilter = (section, field, value) => {
    setRequestFilters((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const getFilteredServiceRequests = (sectionId) => {
    const filters = requestFilters[sectionId] || { search: "", status: "all", type: "all" };
    const searchValue = String(filters.search || "").trim().toLowerCase();

    return serviceRequests.filter((request) => {
      if (request.category !== sectionId) return false;

      const matchesSearch = !searchValue || [
        request.id,
        request.reference,
        request.customer,
        request.email,
        request.type,
        request.status,
      ].some((value) => String(value || "").toLowerCase().includes(searchValue));
      const matchesStatus = filters.status === "all"
        || String(request.status || "").toLowerCase() === filters.status;
      const matchesType = filters.type === "all"
        || String(request.type || "").toLowerCase() === filters.type;

      return matchesSearch && matchesStatus && matchesType;
    });
  };

  useEffect(() => {
    if (!requestViewTarget) return;

    const latestRequest = serviceRequests.find((request) => request.id === requestViewTarget.id);

    if (latestRequest) {
      setRequestViewTarget(latestRequest);
    }
  }, [requestViewTarget, serviceRequests]);

  const updateRequestStatus = async (requestId, status) => {
    setRequestStatusSaving(true);

    try {
      const updatedRequest = await onUpdateServiceRequestStatus(requestId, status);
      setRequestViewTarget((current) => (
        current && current.id === requestId ? updatedRequest : current
      ));
    } finally {
      setRequestStatusSaving(false);
    }
  };

  useEffect(() => {
    const nextDrafts = {};

    Object.entries(templatePricing || {}).forEach(([service, items]) => {
      (items || []).forEach((item) => {
        nextDrafts[`${service}:${item.id}`] = String(item.amount ?? 0);
      });
    });

    setPricingDrafts(nextDrafts);
  }, [templatePricing]);

  const groupedTemplateCatalog = useMemo(
    () => [
      { id: "nin", label: "NIN Verification", items: templateCatalog.filter((item) => item.channel === "NIN"), routePath: "/select_nin_template" },
      { id: "phone", label: "Phone Verification", items: templateCatalog.filter((item) => item.channel === "Phone"), routePath: "/verify_phone" },
      { id: "bvn", label: "BVN Verification", items: templateCatalog.filter((item) => item.channel === "BVN"), routePath: "/verify_bvn" },
      { id: "modification", label: "NIN Modification", items: templateCatalog.filter((item) => item.channel === "Modification"), routePath: "/modification/nin" },
      { id: "birthAttestation", label: "Birth Attestation", items: templateCatalog.filter((item) => item.channel === "Birth Attestation"), routePath: "/birth-attestation" },
      { id: "diaspora", label: "Diaspora Birth", items: templateCatalog.filter((item) => item.channel === "Diaspora"), routePath: "/diaspora-child-birth-notification" },
      { id: "resolutions", label: "IPE / Error 50", items: templateCatalog.filter((item) => item.channel === "Resolution"), routePath: "/ipe-error-50-resolution" },
      { id: "others", label: "Other Verification Products", items: templateCatalog.filter((item) => item.channel === "Others"), routePath: null },
    ],
    [templateCatalog],
  );

  const handleDraftChange = (service, id, value) => {
    setPricingDrafts((current) => ({
      ...current,
      [`${service}:${id}`]: value,
    }));
  };

  const handlePricingSave = async (service, item) => {
    const draftKey = `${service}:${item.id}`;
    const nextAmount = pricingDrafts[draftKey];
    setPricingSavingKey(draftKey);

    try {
      await onUpdateTemplatePricing({
        service,
        id: item.id,
        amount: nextAmount,
      });
    } finally {
      setPricingSavingKey("");
    }
  };

  const baseAdminRoster = useMemo(
    () => [
      {
        id: user?.memberId || "ADM-0001",
        name: user?.name || "Platform Admin",
        role: String(user?.role || "ADMIN").toUpperCase(),
        status: user?.status || "Active",
        scope: "Members, verifications, wallets, and reports",
      },
      {
        id: "AUD-0002",
        name: "Audit Supervisor",
        role: "AUDITOR",
        status: "Active",
        scope: "Audit logs, reports, and verification review",
      },
      {
        id: "OPS-0003",
        name: "Operations Manager",
        role: "ADMIN",
        status: "Active",
        scope: "Support, templates, and members",
      },
    ],
    [user],
  );
  const adminRoster = useMemo(() => {
    const merged = [...baseAdminRoster];
    extraRoles.forEach((role) => {
      const index = merged.findIndex((item) => item.id === role.id);
      if (index >= 0) {
        merged[index] = role;
      } else {
        merged.push(role);
      }
    });
    return merged;
  }, [baseAdminRoster, extraRoles]);

  const openRoleEditor = (role = null) => {
    setRoleDraft(role || { id: `ROLE-${Date.now()}`, name: "", role: "ADMIN", status: "Active", scope: "" });
    setRoleDialogOpen(true);
  };

  const saveRoleDraft = () => {
    setExtraRoles((current) => {
      const without = current.filter((item) => item.id !== roleDraft.id);
      return [...without, roleDraft];
    });
    setLocalMessage({ tone: "success", text: "Role saved successfully." });
    setRoleDialogOpen(false);
  };

  const settingsCards = [
    { label: "System Name", value: effectiveSettings.branding?.systemName || "IDM e-Services", note: "Public-facing platform name" },
    { label: "Pool Liquidity", value: formatMoney(Number(effectiveSettings.totalPoolLiquidity || 0)), note: "Current configured liquidity" },
    { label: "Auto Debit", value: effectiveSettings.isAutoDebitActive ? "Enabled" : "Disabled", note: `Scheduled for day ${effectiveSettings.autoDebitDate || 1}` },
    { label: "SMTP Sender", value: effectiveSettings.smtp?.fromEmail || "Not configured", note: effectiveSettings.smtp?.fromName || "Outgoing sender name" },
  ];

  const recentItems = [...verificationFeed, ...transactionFeed]
    .map((item) => ({
      id: item.id,
      title: item.reference || item.type,
      meta: item.customer || item.description || item.channel || item.type,
      timestamp: item.createdAt || item.date,
      status: item.status,
    }))
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, 5);

  const filteredMembers = useMemo(() => {
    const searchValue = String(tableFilters.users.search || "").trim().toLowerCase();

    return adminMembers.filter((member) => {
      const matchesSearch = !searchValue || [
        member.id,
        member.name,
        member.email,
        member.phone,
        member.plan,
      ].some((value) => String(value || "").toLowerCase().includes(searchValue));
      const matchesStatus = tableFilters.users.status === "all"
        || String(member.status || "").toLowerCase() === tableFilters.users.status;
      const matchesPlan = tableFilters.users.plan === "all"
        || String(member.plan || "").toLowerCase() === tableFilters.users.plan;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [adminMembers, tableFilters.users]);

  const filteredVerifications = useMemo(() => {
    const searchValue = String(tableFilters.verifications.search || "").trim().toLowerCase();

    return verificationFeed.filter((item) => {
      const matchesSearch = !searchValue || [
        item.reference,
        item.customer,
        item.channel,
      ].some((value) => String(value || "").toLowerCase().includes(searchValue));
      const matchesStatus = tableFilters.verifications.status === "all"
        || String(item.status || "").toLowerCase() === tableFilters.verifications.status;
      const matchesChannel = tableFilters.verifications.channel === "all"
        || String(item.channel || "").toLowerCase() === tableFilters.verifications.channel;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [tableFilters.verifications, verificationFeed]);

  const filteredTransactions = useMemo(() => {
    const searchValue = String(tableFilters.transactions.search || "").trim().toLowerCase();

    return transactionFeed.filter((item) => {
      const matchesSearch = !searchValue || [
        item.type,
        item.reference,
        item.status,
        item.description,
      ].some((value) => String(value || "").toLowerCase().includes(searchValue));
      const matchesStatus = tableFilters.transactions.status === "all"
        || String(item.status || "").toLowerCase() === tableFilters.transactions.status;
      const matchesDirection = tableFilters.transactions.direction === "all"
        || String(item.direction || "").toLowerCase() === tableFilters.transactions.direction;

      return matchesSearch && matchesStatus && matchesDirection;
    });
  }, [tableFilters.transactions, transactionFeed]);

  const filteredSupportItems = useMemo(() => {
    const searchValue = String(tableFilters.support.search || "").trim().toLowerCase();

    return supportItems.filter((item) => {
      const matchesSearch = !searchValue || [
        item.subject,
        item.customer,
        item.channel,
      ].some((value) => String(value || "").toLowerCase().includes(searchValue));
      const matchesStatus = tableFilters.support.status === "all"
        || String(item.status || "").toLowerCase() === tableFilters.support.status;
      const matchesPriority = tableFilters.support.priority === "all"
        || String(item.priority || "").toLowerCase() === tableFilters.support.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [supportItems, tableFilters.support]);

  const handleReportOptionChange = (field, value) => {
    setReportOptions((current) => ({ ...current, [field]: value }));
    setReportMessage(null);
  };

  const generateAdminReport = () => {
    const { type, startDate, endDate } = reportOptions;

    if (startDate && endDate && startDate > endDate) {
      setReportMessage({ tone: "error", text: "Start date must be before the end date." });
      return;
    }

    const reportTransactions = transactionFeed.filter((item) => isWithinReportRange(item.date || item.createdAt, startDate, endDate));
    const reportVerifications = verificationFeed.filter((item) => isWithinReportRange(item.createdAt || item.date, startDate, endDate));
    const reportMembers = adminMembers.filter((item) => isWithinReportRange(item.joinedAt || item.createdAt, startDate, endDate));
    const reportSupport = supportItems.filter((item) => isWithinReportRange(item.createdAt || item.date, startDate, endDate));
    const reportServiceRequests = serviceRequests.filter((item) => isWithinReportRange(item.submittedAt || item.createdAt || item.date, startDate, endDate));
    const debitRevenue = reportTransactions
      .filter((item) => String(item.direction || "").toLowerCase() === "debit")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const creditInflow = reportTransactions
      .filter((item) => String(item.direction || "").toLowerCase() === "credit")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const reportGeneratedAt = new Date();
    const workbook = XLSX.utils.book_new();

    appendReportSheet(workbook, "Summary", [
      { Metric: "Report type", Value: type },
      { Metric: "Generated at", Value: reportGeneratedAt.toLocaleString() },
      { Metric: "Date range", Value: startDate || endDate ? `${startDate || "Beginning"} to ${endDate || "Today"}` : "All available records" },
      { Metric: "Members", Value: reportMembers.length },
      { Metric: "Active members", Value: reportMembers.filter((item) => String(item.status || "").toLowerCase() === "active").length },
      { Metric: "Verifications", Value: reportVerifications.length },
      { Metric: "Completed verifications", Value: reportVerifications.filter((item) => String(item.status || "").toLowerCase().includes("completed")).length },
      { Metric: "Transactions", Value: reportTransactions.length },
      { Metric: "Debit revenue", Value: debitRevenue },
      { Metric: "Credit inflow", Value: creditInflow },
      { Metric: "Service requests", Value: reportServiceRequests.length },
      { Metric: "Open support tickets", Value: reportSupport.filter((item) => !String(item.status || "").toLowerCase().includes("resolved")).length },
    ]);

    if (type === "complete" || type === "transactions") {
      appendReportSheet(workbook, "Transactions", reportTransactions.map((item) => ({
        Date: sanitizeReportCell(item.date || item.createdAt),
        Type: sanitizeReportCell(item.type),
        Reference: sanitizeReportCell(item.reference),
        Direction: sanitizeReportCell(item.direction),
        Amount: Number(item.amount || 0),
        Status: sanitizeReportCell(item.status),
        Description: sanitizeReportCell(item.description),
      })));
    }

    if (type === "complete" || type === "verifications") {
      appendReportSheet(workbook, "Verifications", reportVerifications.map((item) => ({
        Date: sanitizeReportCell(item.createdAt || item.date),
        Customer: sanitizeReportCell(item.customer),
        Channel: sanitizeReportCell(item.channel),
        Reference: sanitizeReportCell(item.reference),
        Amount: Number(item.amount || 0),
        Status: sanitizeReportCell(item.status),
      })));
    }

    if (type === "complete" || type === "members") {
      appendReportSheet(workbook, "Members", reportMembers.map((item) => ({
        "Member ID": sanitizeReportCell(item.memberId || item.id),
        Name: sanitizeReportCell(item.name),
        Email: sanitizeReportCell(item.email),
        Phone: sanitizeReportCell(item.phone),
        "Wallet Balance": Number(item.walletBalance || 0),
        Status: sanitizeReportCell(item.status),
        Role: sanitizeReportCell(item.plan),
        Joined: sanitizeReportCell(item.joinedAt),
      })));
    }

    if (type === "complete" || type === "serviceRequests") {
      appendReportSheet(workbook, "Service Requests", reportServiceRequests.map((item) => ({
        Date: sanitizeReportCell(item.submittedAt || item.createdAt),
        Customer: sanitizeReportCell(item.customer),
        Email: sanitizeReportCell(item.email),
        Category: sanitizeReportCell(item.category),
        Type: sanitizeReportCell(item.type),
        Reference: sanitizeReportCell(item.reference),
        Status: sanitizeReportCell(item.status),
      })));
    }

    if (type === "complete" || type === "support") {
      appendReportSheet(workbook, "Support", reportSupport.map((item) => ({
        Date: sanitizeReportCell(item.createdAt || item.date),
        Subject: sanitizeReportCell(item.subject),
        Customer: sanitizeReportCell(item.customer),
        Email: sanitizeReportCell(item.email),
        Priority: sanitizeReportCell(item.priority),
        Status: sanitizeReportCell(item.status),
        Channel: sanitizeReportCell(item.channel),
      })));
    }

    const filenameDate = reportGeneratedAt.toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `ninverify-admin-${type}-report-${filenameDate}.xlsx`);
    setReportMessage({ tone: "success", text: "Report generated and downloaded successfully." });
  };

  const menuItems = adminDashboardNavItems.map((item) => ({
    ...item,
    icon: adminMenuIconMap[item.id],
    badge:
      item.id === "dashboard"
        ? "Live"
        : item.id === "users"
          ? adminMembers.length
          : item.id === "verifications"
            ? pendingVerifications
            : serviceRequestCounts[item.id]
              ? serviceRequestCounts[item.id].newRequest
            : item.id === "wallet"
              ? transactionFeed.filter((entry) => entry.direction === "credit").length
              : item.id === "transactions"
                ? transactionFeed.length
                : item.id === "templates"
                  ? templateCatalog.length
                  : item.id === "reports"
                    ? "KPI"
                    : item.id === "support"
                      ? pendingTickets
                      : item.id === "admins"
                        ? adminRoster.length
                    : "Config",
  }));

  const openMemberEdit = (member) => {
    setMemberEditState({
      open: true,
      saving: false,
      message: null,
      member,
      form: {
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        role: String(member.plan || member.role || "MEMBER").toUpperCase(),
        status: member.status || "Active",
      },
    });
  };

  const closeMemberEdit = () => {
    setMemberEditState((current) => ({
      ...current,
      open: false,
      saving: false,
      message: null,
      member: null,
    }));
  };

  const closeMemberDelete = () => {
    setMemberDeleteTarget(null);
    setMemberDeleteState({
      saving: false,
      message: null,
    });
  };

  const handleMemberEditSubmit = async () => {
    if (!memberEditState.member) return;

    try {
      setMemberEditState((current) => ({
        ...current,
        saving: true,
        message: null,
      }));

      await onUpdateMember(memberEditState.member.id, {
        name: memberEditState.form.name,
        phone: memberEditState.form.phone,
        role: memberEditState.form.role,
        status: memberEditState.form.status,
      });

      closeMemberEdit();
    } catch (error) {
      setMemberEditState((current) => ({
        ...current,
        saving: false,
        message: { tone: "error", text: error.message || "Unable to update this member right now." },
      }));
    }
  };

  const handleMemberDeleteSubmit = async () => {
    if (!memberDeleteTarget) return;

    try {
      setMemberDeleteState({
        saving: true,
        message: null,
      });

      await onDeleteMember(memberDeleteTarget);
      closeMemberDelete();
    } catch (error) {
      setMemberDeleteState({
        saving: false,
        message: { tone: "error", text: error.message || "Unable to delete this member right now." },
      });
    }
  };

  const openSupportReply = (ticket) => {
    setSupportReplyTarget(ticket);
    setSupportReplyText(ticket.reply || "");
  };

  const submitSupportReply = async (sendEmail = false) => {
    if (!supportReplyTarget || !supportReplyText.trim()) return;

    setSupportReplySaving(true);
    try {
      await onUpdateSupportTicket(supportReplyTarget.id, "Resolved", supportReplyText.trim(), { sendEmail });
      setSupportReplyTarget(null);
      setSupportReplyText("");
    } finally {
      setSupportReplySaving(false);
    }
  };

  const renderServiceRequestSection = (config) => {
    const rows = getFilteredServiceRequests(config.id);
    const counts = serviceRequestCounts[config.id] || { newRequest: 0, processing: 0, completed: 0, total: 0 };
    const filters = requestFilters[config.id] || { search: "", status: "all", type: "all" };

    return (
      <Stack spacing={2}>
        <SectionHeader title={config.title} description={config.description} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
          <MetricCard label="New Request" value={counts.newRequest} />
          <MetricCard label="Processing" value={counts.processing} />
          <MetricCard label="Completed" value={counts.completed} />
          <MetricCard label="Total" value={counts.total} />
        </Box>
        <TableFilters>
          <SearchFilterField
            label={`Search ${config.tableLabel}`}
            value={filters.search}
            onChange={(event) => updateRequestFilter(config.id, "search", event.target.value)}
            placeholder="Name, email, reference, type"
          />
          <TextField
            select
            label="Status"
            size="small"
            value={filters.status}
            onChange={(event) => updateRequestFilter(config.id, "status", event.target.value)}
            sx={getFilterFieldSx()}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="new request">New Request</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="pending review">Pending Review</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
          <TextField
            select
            label="Request Type"
            size="small"
            value={filters.type}
            onChange={(event) => updateRequestFilter(config.id, "type", event.target.value)}
            sx={getFilterFieldSx()}
          >
            <MenuItem value="all">All request types</MenuItem>
            {config.typeOptions.map((type) => (
              <MenuItem key={type} value={type.toLowerCase()}>{type}</MenuItem>
            ))}
          </TextField>
        </TableFilters>
        <SimpleTable
          columns={["Request ID", "Customer", "Email", "Type", "Reference", "Status", "Submitted", "Action"]}
          rows={rows}
          emptyMessage={`No ${config.tableLabel.toLowerCase()} requests match the current filters.`}
          renderRow={(request) => (
            <TableRow key={request.id}>
              <TableCell>{request.id}</TableCell>
              <TableCell>{request.customer}</TableCell>
              <TableCell>{request.email}</TableCell>
              <TableCell>{request.type}</TableCell>
              <TableCell>{request.reference}</TableCell>
              <TableCell><StatusChip value={request.status} /></TableCell>
              <TableCell>{formatDate(request.submittedAt)}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VisibilityRoundedIcon fontSize="small" />}
                  onClick={() => setRequestViewTarget(request)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          )}
        />
      </Stack>
    );
  };

  const handleWalletReconcile = async () => {
    setWalletReconcileState({ loading: true, message: null });

    try {
      const payload = await onReconcileWallets();
      setWalletReconcileState({
        loading: false,
        message: {
          tone: payload?.summary?.credited > 0 ? "success" : "info",
          text: payload?.message || "Wallet reconciliation completed.",
        },
      });
    } catch (error) {
      setWalletReconcileState({
        loading: false,
        message: { tone: "error", text: error.message || "Unable to reconcile wallet payments right now." },
      });
    }
  };

  const handlePaystackReferenceLookup = async (event) => {
    event.preventDefault();

    const reference = paystackLookupState.reference.trim();

    if (!reference) {
      setPaystackLookupState((current) => ({
        ...current,
        message: { tone: "error", text: "Enter a Paystack reference number first." },
        result: null,
      }));
      return;
    }

    setPaystackLookupState((current) => ({
      ...current,
      loading: true,
      message: null,
      result: null,
    }));

    try {
      const payload = await onLookupPaystackReference(reference);
      setPaystackLookupState((current) => ({
        ...current,
        loading: false,
        message: {
          tone: payload?.result?.credited || payload?.result?.alreadyProcessed ? "success" : "info",
          text: payload?.message || "Payment reference checked.",
        },
        result: payload?.result || null,
        modalOpen: true,
      }));
    } catch (error) {
      setPaystackLookupState((current) => ({
        ...current,
        loading: false,
        message: { tone: "error", text: error.message || "Unable to retrieve this payment right now." },
        result: null,
      }));
    }
  };

  const content = {
    dashboard: (
      <Stack spacing={2}>
        {message ? <Alert severity={getMessageSeverity(message.tone)}>{message.text}</Alert> : null}

        {/* <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <SectionHeader
            title="Admin Dashboard"
            description="A simple operations workspace for members, verifications, payments, and support."
            action={
              <Button variant="contained" onClick={() => navigate("/dashboard")} endIcon={<OpenInNewRoundedIcon />}>
                Open Member View
              </Button>
            }
          />
        </Paper> */}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
          <MetricCard label="API Wallet" value={externalWalletBalance === null ? (externalWalletState?.loading ? "Loading..." : "N/A") : formatMoney(externalWalletBalance)} note={externalWalletNote} />
          <MetricCard label="Wallet Float" value={formatMoney(totalWalletFloat)}  />
          <MetricCard label="Completed Verifications" value={completedVerifications}  />
          <MetricCard label="Support Queue" value={pendingTickets}  />
          <MetricCard label="NIN Modification" value={serviceRequestCounts.ninModifications?.total || 0} note={`${serviceRequestCounts.ninModifications?.newRequest || 0} new`} />
          <MetricCard label="Birth Attestation" value={serviceRequestCounts.birthAttestations?.total || 0} note={`${serviceRequestCounts.birthAttestations?.newRequest || 0} new`} />
          <MetricCard label="Diaspora Birth" value={serviceRequestCounts.diasporaBirth?.total || 0} note={`${serviceRequestCounts.diasporaBirth?.newRequest || 0} new`} />
          <MetricCard label="IPE / Error 50" value={serviceRequestCounts.resolutions?.total || 0} note={`${serviceRequestCounts.resolutions?.newRequest || 0} new`} />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Priority Items
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Pending verification reviews</Typography>
                <StatusChip value={`${pendingVerifications} pending`} />
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Open support tickets</Typography>
                <StatusChip value={`${pendingTickets} open`} />
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Funding inflow</Typography>
                <StatusChip value={formatMoney(totalInflow)} />
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Recent Activity
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {recentItems.map((item) => (
                <Box key={item.id}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.meta} - {formatDate(item.timestamp)}
                      </Typography>
                    </Box>
                    <StatusChip value={item.status} />
                  </Stack>
                  <Divider sx={{ mt: 1.5 }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>
      </Stack>
    ),
    users: (
      <Stack spacing={2}>
        <SectionHeader
          title="User Management"
          description="Keep the member list and account status visible in one simple table."
          action={
            <Button variant="contained" onClick={() => navigate("/register")}>
              Add Member
            </Button>
          }
        />
        <TableFilters>
          <SearchFilterField
            label="Search members"
            value={tableFilters.users.search}
            onChange={(event) => updateTableFilter("users", "search", event.target.value)}
            placeholder="Name, email, phone, ID"
          />
          <TextField
            select
            label="Status"
            size="small"
            value={tableFilters.users.status}
            onChange={(event) => updateTableFilter("users", "status", event.target.value)}
            sx={getFilterFieldSx()}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending review">Pending Review</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </TextField>
          <TextField
            select
            label="Plan"
            size="small"
            value={tableFilters.users.plan}
            onChange={(event) => updateTableFilter("users", "plan", event.target.value)}
            sx={getFilterFieldSx()}
          >
            <MenuItem value="all">All plans</MenuItem>
            <MenuItem value="member">Member</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="agent">Agent</MenuItem>
          </TextField>
        </TableFilters>
        <SimpleTable
          columns={["Member ID", "Name", "Email", "Phone", "Wallet", "Status", "Plan", "Action"]}
          rows={loading ? [] : filteredMembers}
          emptyMessage="No members match the current filters."
          renderRow={(member) => (
            <TableRow key={member.id}>
              <TableCell>{member.memberId || member.id}</TableCell>
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.phone}</TableCell>
              <TableCell>{formatMoney(member.walletBalance)}</TableCell>
              <TableCell><StatusChip value={member.status} /></TableCell>
              <TableCell>{member.plan}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <Tooltip title="View member">
                  <IconButton size="small" aria-label={`View ${member.name}`} onClick={() => setMemberViewTarget(member)}>
                    <VisibilityRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit member">
                  <IconButton size="small" aria-label={`Edit ${member.name}`} onClick={() => openMemberEdit(member)}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={String(member.id) === String(user?.id || "") ? "You cannot delete the current admin account" : "Delete member"}>
                  <span>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={`Delete ${member.name}`}
                    onClick={() => setMemberDeleteTarget(member)}
                    disabled={String(member.id) === String(user?.id || "")}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
            </TableRow>
          )}
        />
      </Stack>
    ),
    verifications: (
      <Stack spacing={2}>
        <SectionHeader title="Verification" description="Track request volume, charges, and verification outcomes." />
        <TableFilters>
          <SearchFilterField
            label="Search verifications"
            value={tableFilters.verifications.search}
            onChange={(event) => updateTableFilter("verifications", "search", event.target.value)}
            placeholder="Reference, customer, channel"
          />
          <TextField
            select
            label="Status"
            size="small"
            value={tableFilters.verifications.status}
            onChange={(event) => updateTableFilter("verifications", "status", event.target.value)}
            sx={getFilterFieldSx()}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending review">Pending Review</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </TextField>
          <TextField
            select
            label="Channel"
            size="small"
            value={tableFilters.verifications.channel}
            onChange={(event) => updateTableFilter("verifications", "channel", event.target.value)}
            sx={getFilterFieldSx()}
          >
            <MenuItem value="all">All channels</MenuItem>
            <MenuItem value="nin verification">NIN Verification</MenuItem>
            <MenuItem value="bvn verification">BVN Verification</MenuItem>
          </TextField>
        </TableFilters>
        <SimpleTable
          columns={["Reference", "Customer", "Channel", "Charge", "Status", "Created"]}
          rows={filteredVerifications}
          emptyMessage="No verification records match the current filters."
          renderRow={(item) => (
            <TableRow key={item.id}>
              <TableCell>{item.reference}</TableCell>
              <TableCell>{item.customer}</TableCell>
              <TableCell>{item.channel}</TableCell>
              <TableCell>{formatMoney(item.amount)}</TableCell>
              <TableCell><StatusChip value={item.status} /></TableCell>
              <TableCell>{formatDate(item.createdAt)}</TableCell>
            </TableRow>
          )}
        />
      </Stack>
    ),
    ninModifications: renderServiceRequestSection(ADMIN_SERVICE_REQUEST_TYPES.find((item) => item.id === "ninModifications")),
    birthAttestations: renderServiceRequestSection(ADMIN_SERVICE_REQUEST_TYPES.find((item) => item.id === "birthAttestations")),
    diasporaBirth: renderServiceRequestSection(ADMIN_SERVICE_REQUEST_TYPES.find((item) => item.id === "diasporaBirth")),
    resolutions: renderServiceRequestSection(ADMIN_SERVICE_REQUEST_TYPES.find((item) => item.id === "resolutions")),
    wallet: (
      <Stack spacing={2}>
        <SectionHeader title="Wallet & Payments" description="A lightweight treasury view for wallet balances and inflows." />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          <MetricCard label="Funding Inflow" value={formatMoney(totalInflow)} note="Wallet credits in the current feed" />
          <MetricCard label="Verification Revenue" value={formatMoney(totalRevenue)} note="Debits captured from transactions" />
          <MetricCard label="Wallet Float" value={formatMoney(totalWalletFloat)} note="Combined member wallet balances" />
        </Box>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}>
            <Typography variant="h6" fontWeight={700}>
              Reconciliation Notes
            </Typography>
            <Button variant="contained" onClick={handleWalletReconcile} disabled={walletReconcileState.loading}>
              {walletReconcileState.loading ? "Checking..." : "Reconcile Paystack"}
            </Button>
          </Stack>
          {walletReconcileState.message ? (
            <Alert severity={getMessageSeverity(walletReconcileState.message.tone)} sx={{ mt: 2 }}>
              {walletReconcileState.message.text}
            </Alert>
          ) : null}
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">Review delayed wallet funding updates</Typography>
              <StatusChip value="Watch" />
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">Review manual funding adjustments</Typography>
              <StatusChip value="Pending" />
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    ),
    transactions: (
      <Stack spacing={2}>
        <SectionHeader title="Transaction History" description="Simple ledger view for credits, debits, and their status." />
        <Paper component="form" variant="outlined" onSubmit={handlePaystackReferenceLookup} sx={{ p: 2, borderRadius: 3 }}>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
              <TextField
                label="Paystack reference lookup"
                size="small"
                value={paystackLookupState.reference}
                onChange={(event) => setPaystackLookupState((current) => ({ ...current, reference: event.target.value }))}
                placeholder="Paste Paystack reference number"
                sx={{ flex: 1 }}
              />
              <Button type="submit" variant="contained" disabled={paystackLookupState.loading}>
                {paystackLookupState.loading ? "Retrieving..." : "Retrieve Payment"}
              </Button>
            </Stack>
            {paystackLookupState.message ? (
              <Alert severity={getMessageSeverity(paystackLookupState.message.tone)}>
                {paystackLookupState.message.text}
              </Alert>
            ) : null}
          </Stack>
        </Paper>
        <TableFilters>
          <SearchFilterField
            label="Search transactions"
            value={tableFilters.transactions.search}
            onChange={(event) => updateTableFilter("transactions", "search", event.target.value)}
            placeholder="Reference, type, description"
          />
          <TextField
            select
            label="Status"
            size="small"
            value={tableFilters.transactions.status}
            onChange={(event) => updateTableFilter("transactions", "status", event.target.value)}
            sx={getFilterFieldSx()}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </TextField>
          <TextField
            select
            label="Direction"
            size="small"
            value={tableFilters.transactions.direction}
            onChange={(event) => updateTableFilter("transactions", "direction", event.target.value)}
            sx={getFilterFieldSx()}
          >
            <MenuItem value="all">All directions</MenuItem>
            <MenuItem value="credit">Credit</MenuItem>
            <MenuItem value="debit">Debit</MenuItem>
          </TextField>
        </TableFilters>
        <SimpleTable
          columns={["Date", "Type", "Reference", "Amount", "Status", "Description"]}
          rows={filteredTransactions}
          emptyMessage="No transactions match the current filters."
          renderRow={(item) => (
            <TableRow key={item.id}>
              <TableCell>{formatDate(item.date)}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.reference}</TableCell>
              <TableCell sx={{ color: item.direction === "credit" ? "success.main" : "error.main", fontWeight: 600 }}>
                {item.direction === "credit" ? "+" : "-"}
                {formatMoney(item.amount)}
              </TableCell>
              <TableCell><StatusChip value={item.status} /></TableCell>
              <TableCell>{item.description}</TableCell>
            </TableRow>
          )}
        />
      </Stack>
    ),
    templates: (
      <Stack spacing={2}>
        <ServiceManager services={services} serviceRequests={serviceRequests} transactions={transactionFeed} onSaveService={onSaveService} onDeleteService={onDeleteService} />
        <SectionHeader title="Pricing" description="Set pricing for member-facing verification, modification, attestation, diaspora, and resolution services." />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
          {groupedTemplateCatalog.map((group) => (
            <Paper key={group.id} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {group.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {group.items.length} pricing item{group.items.length === 1 ? "" : "s"}
                    </Typography>
                  </Box>
                  {group.routePath ? (
                    <Button size="small" endIcon={<OpenInNewRoundedIcon />} onClick={() => navigate(group.routePath)}>
                      Open Flow
                    </Button>
                  ) : null}
                </Stack>

                <Stack spacing={1.5}>
                  {group.items.map((item) => {
                    const draftKey = `${group.id}:${item.id}`;

                    return (
                      <Card key={item.id} variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={700}>
                                  {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Current price: {item.price}
                                </Typography>
                              </Box>
                              <StatusChip value={item.status} />
                            </Stack>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
                              <TextField
                                label="Price"
                                type="number"
                                size="small"
                                value={pricingDrafts[draftKey] ?? String(item.amount ?? 0)}
                                onChange={(event) => handleDraftChange(group.id, item.id, event.target.value)}
                                inputProps={{ min: 0, step: "0.01" }}
                                sx={{ maxWidth: { sm: 220 } }}
                              />
                              <Button variant="contained" disabled={pricingSavingKey === draftKey} onClick={() => { void handlePricingSave(group.id, item); }}>
                                {pricingSavingKey === draftKey ? "Saving..." : "Save Price"}
                              </Button>
                              <Typography variant="body2" color="text.secondary">
                                Live display: {formatTemplatePrice(pricingDrafts[draftKey] ?? item.amount)}
                              </Typography>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Stack>
    ),
    reports: (
      <Stack spacing={2}>
        <SectionHeader
          title="Reports & Analytics"
          description="A simple KPI view for finance, adoption, and support pressure."
          action={
            <Button variant="contained" startIcon={<DownloadRoundedIcon />} onClick={generateAdminReport}>
              Generate Report
            </Button>
          }
        />
        {reportMessage ? <Alert severity={getMessageSeverity(reportMessage.tone)}>{reportMessage.text}</Alert> : null}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
            <TextField
              select
              label="Report type"
              size="small"
              value={reportOptions.type}
              onChange={(event) => handleReportOptionChange("type", event.target.value)}
              sx={{ minWidth: { md: 220 } }}
            >
              <MenuItem value="complete">Complete report</MenuItem>
              <MenuItem value="transactions">Transactions</MenuItem>
              <MenuItem value="verifications">Verifications</MenuItem>
              <MenuItem value="members">Members</MenuItem>
              <MenuItem value="serviceRequests">Service requests</MenuItem>
              <MenuItem value="support">Support tickets</MenuItem>
            </TextField>
            <TextField
              label="Start date"
              type="date"
              size="small"
              value={reportOptions.startDate}
              onChange={(event) => handleReportOptionChange("startDate", event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End date"
              type="date"
              size="small"
              value={reportOptions.endDate}
              onChange={(event) => handleReportOptionChange("endDate", event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={generateAdminReport} sx={{ alignSelf: { xs: "stretch", md: "center" } }}>
              Download XLSX
            </Button>
          </Stack>
        </Paper>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          <MetricCard label="Revenue" value={formatMoney(totalRevenue)} note="From debit transactions" />
          <MetricCard label="Verification Mix" value={`${verificationFeed.length} requests`} note="Across NIN and BVN channels" />
          <MetricCard label="Support Pressure" value={pendingTickets} note="Open support items" />
        </Box>
      </Stack>
    ),
    support: (
      <Stack spacing={2}>
        <SectionHeader title="Support Center" description="Customer complaints and issue status in one place." />
        <TableFilters>
          <SearchFilterField
            label="Search support"
            value={tableFilters.support.search}
            onChange={(event) => updateTableFilter("support", "search", event.target.value)}
            placeholder="Subject, customer, channel"
          />
          <TextField
            select
            label="Status"
            size="small"
            value={tableFilters.support.status}
            onChange={(event) => updateTableFilter("support", "status", event.target.value)}
            sx={getFilterFieldSx()}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="investigating">Investigating</MenuItem>
            <MenuItem value="escalated">Escalated</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </TextField>
          <TextField
            select
            label="Priority"
            size="small"
            value={tableFilters.support.priority}
            onChange={(event) => updateTableFilter("support", "priority", event.target.value)}
            sx={getFilterFieldSx()}
          >
            <MenuItem value="all">All priorities</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>
        </TableFilters>
        <SimpleTable
          columns={["Ticket", "Customer", "Priority", "Status", "Channel", "Action"]}
          rows={filteredSupportItems}
          emptyMessage="No support tickets match the current filters."
          renderRow={(ticket) => (
            <TableRow key={ticket.id}>
              <TableCell><Box><Typography fontWeight={800}>{ticket.subject}</Typography><Typography variant="caption" color="text.secondary">{ticket.message}</Typography></Box></TableCell>
              <TableCell><Box><Typography>{ticket.customer}</Typography><Typography variant="caption" color="text.secondary">{ticket.email || "No email"}</Typography></Box></TableCell>
              <TableCell><StatusChip value={ticket.priority} /></TableCell>
              <TableCell><StatusChip value={ticket.status} /></TableCell>
              <TableCell>{ticket.channel}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" onClick={() => { void onUpdateSupportTicket(ticket.id, "Investigating"); }}>Check</Button>
                  <Button size="small" variant="outlined" onClick={() => openSupportReply(ticket)}>View / Reply</Button>
                  <Button size="small" variant="contained" onClick={() => { void onUpdateSupportTicket(ticket.id, "Resolved"); }}>Resolve</Button>
                </Stack>
              </TableCell>
            </TableRow>
          )}
        />
      </Stack>
    ),
    admins: (
      <Stack spacing={2}>
        <SectionHeader title="Admins / Roles" description="Create and edit operational role cards for admin, audit, and support access." action={<Button variant="contained" onClick={() => openRoleEditor()}>Add Role</Button>} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          {adminRoster.map((admin) => (
            <Card key={admin.id} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700}>
                  {admin.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {admin.role}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {admin.scope}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <StatusChip value={admin.status} />
                </Box>
                <Button size="small" variant="outlined" sx={{ mt: 2 }} onClick={() => openRoleEditor(admin)}>Edit Role</Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>
    ),
    settings: (
      <Stack spacing={2}>
        <SettingsManager settings={effectiveSettings} onUpdateSettings={onUpdateSettings} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
          {settingsCards.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} note={item.note} />
          ))}
        </Box>
      </Stack>
    ),
  }[activeTab];

  return (
    <>
      <section className={`admin-dashboard-shell ${sidebarCollapsed ? "admin-dashboard-shell--collapsed" : ""}`}>
        {/* Simple custom sidebar replaces the MUI sidebar for easier flush layout and desktop collapse control. */}
        <aside className={`admin-dashboard-sidebar ${sidebarCollapsed ? "admin-dashboard-sidebar--collapsed" : ""}`}>
          <div className="admin-dashboard-sidebar-top">
            <div className="admin-dashboard-sidebar-label">{sidebarCollapsed ? "ADM" : "Admin Menu"}</div>
            <button
              type="button"
              className="admin-dashboard-collapse-button"
              onClick={() => setSidebarCollapsed((current) => !current)}
              aria-label={sidebarCollapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? ">" : "<"}
            </button>
          </div>

          <nav className="admin-dashboard-menu" aria-label="Admin sections">
            {menuItems.map((item) => {
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-dashboard-menu-button ${active ? "active" : ""}`}
                  onClick={() => onChangeActiveTab(item.id)}
                  aria-pressed={active}
                  title={item.label}
                >
                  <span className="admin-dashboard-menu-icon">{item.icon}</span>
                  <span className="admin-dashboard-menu-copy">
                    <strong>{item.label}</strong>
                  </span>
                  <span className="admin-dashboard-menu-badge">{item.badge}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <Box className="admin-dashboard-content" sx={{ minWidth: 0 }}>
          {localMessage ? <Alert severity={getMessageSeverity(localMessage.tone)} sx={{ mb: 2 }}>{localMessage.text}</Alert> : null}
          {content}
        </Box>
      </section>

      <Dialog open={Boolean(memberViewTarget)} onClose={() => setMemberViewTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Member Details</DialogTitle>
        <DialogContent dividers>
          {memberViewTarget ? (
            <Stack spacing={2}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                <MemberDetailItem label="Member ID" value={memberViewTarget.memberId || memberViewTarget.id} />
                <MemberDetailItem label="Full Name" value={memberViewTarget.name} />
                <MemberDetailItem label="Email" value={memberViewTarget.email} />
                <MemberDetailItem label="Phone" value={memberViewTarget.phone} />
                <MemberDetailItem label="Wallet Balance" value={formatMoney(memberViewTarget.walletBalance)} />
                <MemberDetailItem label="Status" value={memberViewTarget.status} />
                <MemberDetailItem label="Plan" value={memberViewTarget.plan} />
                <MemberDetailItem label="Joined" value={memberViewTarget.joinedAt && memberViewTarget.joinedAt !== "N/A" ? formatDate(memberViewTarget.joinedAt) : "N/A"} />
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberViewTarget(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{adminRoster.some((item) => item.id === roleDraft.id) ? "Edit Role" : "Add Role"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={roleDraft.name} onChange={(event) => setRoleDraft((current) => ({ ...current, name: event.target.value }))} fullWidth />
            <TextField select label="Role" value={roleDraft.role} onChange={(event) => setRoleDraft((current) => ({ ...current, role: event.target.value }))} fullWidth>
              {["ADMIN", "AUDITOR", "SUPPORT", "FINANCE"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField select label="Status" value={roleDraft.status} onChange={(event) => setRoleDraft((current) => ({ ...current, status: event.target.value }))} fullWidth>
              {["Active", "Suspended", "Pending Review"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField label="Scope" value={roleDraft.scope} onChange={(event) => setRoleDraft((current) => ({ ...current, scope: event.target.value }))} fullWidth multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveRoleDraft}>Save Role</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(supportReplyTarget)} onClose={supportReplySaving ? undefined : () => setSupportReplyTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Support Message</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={800}>{supportReplyTarget?.subject}</Typography>
              <Typography variant="body2" color="text.secondary">{supportReplyTarget?.customer} - {supportReplyTarget?.email || "No email"}</Typography>
              <Typography variant="body2" sx={{ mt: 1.5, whiteSpace: "pre-wrap" }}>{supportReplyTarget?.message}</Typography>
            </Paper>
            {supportReplyTarget?.reply ? (
              <Alert severity="success">Existing reply: {supportReplyTarget.reply}</Alert>
            ) : null}
            <TextField
              label="Admin reply"
              value={supportReplyText}
              onChange={(event) => setSupportReplyText(event.target.value)}
              fullWidth
              multiline
              minRows={5}
              placeholder="Type the reply the user will see inside their portal"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupportReplyTarget(null)} disabled={supportReplySaving}>Cancel</Button>
          <Button variant="outlined" disabled={supportReplySaving || !supportReplyText.trim()} onClick={() => { void submitSupportReply(false); }}>
            {supportReplySaving ? "Sending..." : "Send In-System Reply"}
          </Button>
          <Button variant="contained" disabled={supportReplySaving || !supportReplyText.trim()} onClick={() => { void submitSupportReply(true); }}>
            {supportReplySaving ? "Sending..." : "Send Reply + Email"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(requestViewTarget)}
        onClose={() => setRequestViewTarget(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            width: "min(100%, 54rem)",
            m: { xs: 1.25, sm: 3 },
            borderRadius: { xs: 2, sm: 3 },
            overflow: "hidden",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fcfa 100%)",
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 2.25, borderBottom: "1px solid rgba(15, 122, 87, 0.12)" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight={850} sx={{ color: "#10231c" }}>
                Request Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {requestViewTarget?.type || "Service request"}
              </Typography>
            </Box>
            {requestViewTarget ? <StatusChip value={requestViewTarget.status} /> : null}
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, borderColor: "rgba(15, 122, 87, 0.12)" }}>
          {requestViewTarget ? (
            <Stack spacing={{ xs: 2, sm: 2.5 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2.5,
                  background: "linear-gradient(135deg, rgba(236,250,243,0.95), rgba(255,255,255,0.98))",
                  borderColor: "rgba(15, 122, 87, 0.16)",
                }}
              >
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="overline" sx={{ color: "#08724e", fontWeight: 900, letterSpacing: 0.7 }}>
                      Submitted Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Review the details supplied by the member. Use the copy buttons to paste values into external processing tools.
                    </Typography>
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                    {CUSTOMER_HIDDEN_SERVICE_CATEGORIES.includes(requestViewTarget.category) ? null : (
                      <>
                        <MemberDetailItem label="Customer" value={requestViewTarget.customer} />
                        <MemberDetailItem label="Email" value={requestViewTarget.email} />
                      </>
                    )}
                  <MemberDetailItem label="Reference" value={requestViewTarget.reference} />
                  <MemberDetailItem label="Submitted" value={formatDate(requestViewTarget.submittedAt)} />
                  </Box>
                </Stack>
              </Paper>

              {requestViewTarget.passportUrl ? (
                <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, borderColor: "rgba(15, 122, 87, 0.14)" }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        component="img"
                        src={requestViewTarget.passportUrl}
                        alt={`${requestViewTarget.customer} passport`}
                        sx={{
                          width: 84,
                          height: 84,
                          borderRadius: 2,
                          objectFit: "cover",
                          border: "1px solid rgba(15, 122, 87, 0.16)",
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>
                          Uploaded Passport
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Preview and download the submitted passport image.
                        </Typography>
                      </Box>
                    </Stack>
                    <Tooltip title="Download passport">
                      <IconButton
                        component="a"
                        href={requestViewTarget.passportUrl}
                        download={`${requestViewTarget.id}-passport`}
                        color="primary"
                        aria-label="Download passport"
                      >
                        <DownloadRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>No passport image was attached to this request.</Alert>
              )}

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                {((requestViewTarget.detailRows || requestViewTarget.details || [])).map((detail) => (
                  <MemberDetailItem key={`${requestViewTarget.id}-${detail.label}`} label={detail.label} value={detail.value} />
                ))}
              </Box>

              <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, borderColor: "rgba(15, 122, 87, 0.14)", background: "#ffffff" }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800}>
                      Request Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Move the request through admin review without leaving this screen.
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="stretch">
                    {SERVICE_REQUEST_STATUSES.map((status) => {
                      const active = String(requestViewTarget.status || "").toLowerCase() === status.toLowerCase();

                      return (
                        <Button
                          key={status}
                          variant={active ? "contained" : "outlined"}
                          disabled={requestStatusSaving || active}
                          onClick={() => { void updateRequestStatus(requestViewTarget.id, status); }}
                          sx={{
                            minHeight: 42,
                            borderRadius: 2,
                            fontWeight: 800,
                            justifyContent: "center",
                            flex: 1,
                          }}
                        >
                          {requestStatusSaving && active ? "Saving..." : status}
                        </Button>
                      );
                    })}
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestViewTarget(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={paystackLookupState.modalOpen}
        onClose={() => setPaystackLookupState((current) => ({ ...current, modalOpen: false }))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Paystack Payment Details</DialogTitle>
        <DialogContent dividers>
          {paystackLookupState.result ? (
            <Stack spacing={2}>
              {paystackLookupState.message ? (
                <Alert severity={getMessageSeverity(paystackLookupState.message.tone)}>
                  {paystackLookupState.message.text}
                </Alert>
              ) : null}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                <MemberDetailItem label="Reference" value={paystackLookupState.result.reference || "N/A"} />
                <MemberDetailItem label="Status" value={paystackLookupState.result.status || "N/A"} />
                <MemberDetailItem label="Amount" value={formatMoney(paystackLookupState.result.amount)} />
                <MemberDetailItem label="Wallet Action" value={paystackLookupState.result.credited ? "Credited now" : paystackLookupState.result.alreadyProcessed ? "Already credited" : "Not credited"} />
                <MemberDetailItem label="Member Name" value={paystackLookupState.result.user?.name || "No matched member"} />
                <MemberDetailItem label="Member Email" value={paystackLookupState.result.user?.email || "No matched member"} />
                <MemberDetailItem label="Wallet Balance" value={paystackLookupState.result.user ? formatMoney(paystackLookupState.result.user.walletBalance) : "N/A"} />
                <MemberDetailItem label="Receiver Account" value={paystackLookupState.result.accountNumber || paystackLookupState.result.transaction?.receiverAccountNumber || "N/A"} />
                <MemberDetailItem label="Receiver Bank" value={paystackLookupState.result.transaction?.receiverBank || "N/A"} />
                <MemberDetailItem label="Channel" value={paystackLookupState.result.transaction?.channel || "N/A"} />
                <MemberDetailItem label="Customer Email" value={paystackLookupState.result.transaction?.customerEmail || "N/A"} />
                <MemberDetailItem label="Paid At" value={formatDate(paystackLookupState.result.transaction?.paidAt)} />
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaystackLookupState((current) => ({ ...current, modalOpen: false }))}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={memberEditState.open} onClose={memberEditState.saving ? undefined : closeMemberEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit Member</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {memberEditState.message ? <Alert severity={getMessageSeverity(memberEditState.message.tone)}>{memberEditState.message.text}</Alert> : null}
            <TextField
              label="Full Name"
              size="small"
              value={memberEditState.form.name}
              onChange={(event) => setMemberEditState((current) => ({ ...current, form: { ...current.form, name: event.target.value } }))}
              fullWidth
            />
            <TextField
              label="Email Address"
              size="small"
              value={memberEditState.form.email}
              disabled
              fullWidth
            />
            <TextField
              label="Phone Number"
              size="small"
              value={memberEditState.form.phone}
              onChange={(event) => setMemberEditState((current) => ({ ...current, form: { ...current.form, phone: event.target.value } }))}
              fullWidth
            />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
              <TextField
                select
                label="Role"
                size="small"
                value={memberEditState.form.role}
                onChange={(event) => setMemberEditState((current) => ({ ...current, form: { ...current.form, role: event.target.value } }))}
                fullWidth
              >
                <MenuItem value="MEMBER">MEMBER</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
              </TextField>
              <TextField
                select
                label="Status"
                size="small"
                value={memberEditState.form.status}
                onChange={(event) => setMemberEditState((current) => ({ ...current, form: { ...current.form, status: event.target.value } }))}
                fullWidth
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Pending Review">Pending Review</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </TextField>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMemberEdit} disabled={memberEditState.saving}>Cancel</Button>
          <Button variant="contained" onClick={handleMemberEditSubmit} disabled={memberEditState.saving}>
            {memberEditState.saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(memberDeleteTarget)} onClose={memberDeleteState.saving ? undefined : closeMemberDelete} fullWidth maxWidth="xs">
        <DialogTitle>Delete Member</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {memberDeleteState.message ? <Alert severity={getMessageSeverity(memberDeleteState.message.tone)}>{memberDeleteState.message.text}</Alert> : null}
            <Typography variant="body2" color="text.secondary">
              This will permanently remove <strong>{memberDeleteTarget?.name || "this member"}</strong> from the member list.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Related transactions and verification records may also be removed by the backend.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMemberDelete} disabled={memberDeleteState.saving}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleMemberDeleteSubmit} disabled={memberDeleteState.saving}>
            {memberDeleteState.saving ? "Deleting..." : "Delete Member"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

