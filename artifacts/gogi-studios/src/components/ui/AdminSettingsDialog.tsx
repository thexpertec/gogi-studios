import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Plus, Trash2, Save, Upload, ImageIcon, Camera, Pencil, X as XIcon } from "lucide-react";
const STATIC_LOGO = "/api/static-images/gogi-logo.png";
import type { WorkSection, SubCategory } from "@/lib/workSections";
import { buildTreeOrder } from "@/lib/workSections";

const API = "/api";

export interface SocialLink {
  platform: string;
  url: string;
}

const PLATFORM_OPTIONS = [
  { value: "facebook",  label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin",  label: "LinkedIn" },
  { value: "youtube",   label: "YouTube" },
  { value: "x",         label: "X / Twitter" },
  { value: "tiktok",    label: "TikTok" },
  { value: "pinterest", label: "Pinterest" },
  { value: "whatsapp",  label: "WhatsApp" },
  { value: "threads",   label: "Threads" },
  { value: "other",     label: "Other" },
];

type Tab = "branding" | "contact" | "logo" | "social" | "images" | "testimonials" | "workgallery";
type SectionType = "books" | "merchandise" | "projects";

interface CatalogItem { id: string; name: string; }
interface CatalogState { books: CatalogItem[]; merchandise: CatalogItem[]; projects: CatalogItem[]; }
interface TestimonialItem { id: string; caption: string; }
interface WorkGalleryItem { id: string; caption: string; subCategorySlug?: string | null; }

const SECTION_LABELS: Record<SectionType, string> = {
  books: "Books", merchandise: "Merchandise", projects: "Projects",
};

const ADD_PLACEHOLDER: Record<SectionType, string> = {
  books: "e.g. Gogi and the Sea",
  merchandise: "e.g. Gogi Poster Set",
  projects: "e.g. UNICEF Mural Project",
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function AdminSettingsDialog({ open, onOpenChange }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("branding");

  // Branding
  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [footerDescription, setFooterDescription] = useState("");
  const [copyrightText, setCopyrightText] = useState("");

  // Contact
  const [email, setEmail] = useState("");

  // Social links
  const [links, setLinks] = useState<SocialLink[]>([]);

  // Logo
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingLogoPreview, setPendingLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Content images
  const [contentImages, setContentImages] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const pendingImageTarget = useRef<{ type: string; id: string } | null>(null);

  // Catalog
  const [catalog, setCatalog] = useState<CatalogState>({ books: [], merchandise: [], projects: [] });
  const [addingSection, setAddingSection] = useState<SectionType | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [addingSaving, setAddingSaving] = useState(false);

  // Catalog — edit / delete
  const [editingCatalogKey, setEditingCatalogKey] = useState<string | null>(null); // "type/id"
  const [editCatalogName, setEditCatalogName] = useState("");
  const [savingCatalogEdit, setSavingCatalogEdit] = useState(false);
  const [confirmDeleteCatalogKey, setConfirmDeleteCatalogKey] = useState<string | null>(null); // "type/id"
  const [deletingCatalogItem, setDeletingCatalogItem] = useState(false);

  // Testimonials
  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>([]);
  const [addingTestimonial, setAddingTestimonial] = useState(false);
  const [newTestiCaption, setNewTestiCaption] = useState("");
  const [newTestiFile, setNewTestiFile] = useState<File | null>(null);
  const [newTestiPreview, setNewTestiPreview] = useState<string | null>(null);
  const [savingTestimonial, setSavingTestimonial] = useState(false);
  const [uploadingTestimonialId, setUploadingTestimonialId] = useState<string | null>(null);
  const newTestiFileRef = useRef<HTMLInputElement>(null);
  const existingTestiFileRef = useRef<HTMLInputElement>(null);
  const pendingTestiTarget = useRef<string | null>(null);

  // Testimonials — edit / delete
  const [editingTestiId, setEditingTestiId] = useState<string | null>(null);
  const [editTestiCaption, setEditTestiCaption] = useState("");
  const [savingTestiEdit, setSavingTestiEdit] = useState(false);
  const [confirmDeleteTestiId, setConfirmDeleteTestiId] = useState<string | null>(null);
  const [deletingTesti, setDeletingTesti] = useState(false);

  // Work Gallery — sections management
  const [workSections, setWorkSections] = useState<WorkSection[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [savingEditSection, setSavingEditSection] = useState(false);
  const [addingNewSection, setAddingNewSection] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const [savingNewSection, setSavingNewSection] = useState(false);

  // Work Gallery — items
  const [activeWorkSection, setActiveWorkSection] = useState<string>("");
  const [workGalleryItems, setWorkGalleryItems] = useState<Record<string, WorkGalleryItem[]>>({});
  const [addingWorkItem, setAddingWorkItem] = useState(false);
  const [newWorkCaption, setNewWorkCaption] = useState("");
  const [newWorkFile, setNewWorkFile] = useState<File | null>(null);
  const [newWorkPreview, setNewWorkPreview] = useState<string | null>(null);
  const [savingWorkItem, setSavingWorkItem] = useState(false);
  const [uploadingWorkKey, setUploadingWorkKey] = useState<string | null>(null);
  const newWorkFileRef = useRef<HTMLInputElement>(null);
  const existingWorkFileRef = useRef<HTMLInputElement>(null);
  const pendingWorkTarget = useRef<{ section: string; id: string } | null>(null);

  // Work Gallery — sub-category management
  const [editingSubSlug, setEditingSubSlug] = useState<string | null>(null);
  const [editSubLabel, setEditSubLabel] = useState("");
  const [savingSubEdit, setSavingSubEdit] = useState(false);
  const [addingSubParent, setAddingSubParent] = useState<string | "root" | null>(null);
  const [newSubLabel, setNewSubLabel] = useState("");
  const [savingNewSub, setSavingNewSub] = useState(false);
  const [confirmDeleteSubSlug, setConfirmDeleteSubSlug] = useState<string | null>(null);
  const [newWorkSubCategory, setNewWorkSubCategory] = useState<string>("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(""); setSuccess(false);
    setPendingLogoFile(null); setPendingLogoPreview(null);
    setAddingSection(null); setNewItemName("");
    setEditingCatalogKey(null); setEditCatalogName(""); setConfirmDeleteCatalogKey(null);
    setAddingTestimonial(false); setNewTestiCaption(""); setNewTestiFile(null); setNewTestiPreview(null);
    setEditingTestiId(null); setEditTestiCaption(""); setConfirmDeleteTestiId(null);
    setAddingWorkItem(false); setNewWorkCaption(""); setNewWorkFile(null); setNewWorkPreview(null);
    setEditingSlug(null); setEditLabel(""); setAddingNewSection(false); setNewSectionLabel("");
    setEditingSubSlug(null); setEditSubLabel(""); setAddingSubParent(null); setNewSubLabel(""); setConfirmDeleteSubSlug(null); setNewWorkSubCategory("");

    Promise.all([
      fetch(`${API}/settings`).then((r) => r.json()),
      fetch(`${API}/logo`).then((r) => (r.ok ? `${API}/logo?t=${Date.now()}` : null)).catch(() => null),
      fetch(`${API}/content-images`).then((r) => r.json()).catch(() => ({})),
      fetch(`${API}/catalog`).then((r) => r.json()).catch(() => ({ books: [], merchandise: [], projects: [] })),
      fetch(`${API}/testimonials`).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch(`${API}/work-sections`).then((r) => r.json()).catch(() => []),
    ])
      .then(async ([data, logoUrl, imgMap, cat, testi, sectionsData]) => {
        setCompanyName(data.companyName ?? "");
        setTagline(data.tagline ?? "");
        setFooterDescription(data.footerDescription ?? "");
        setCopyrightText(data.copyrightText ?? "");
        setEmail(data.email ?? "");
        setLinks(Array.isArray(data.socialLinks) ? data.socialLinks : []);
        setCurrentLogoUrl(logoUrl);
        setContentImages(imgMap ?? {});
        setCatalog({ books: cat.books ?? [], merchandise: cat.merchandise ?? [], projects: cat.projects ?? [] });
        setTestimonialsList(testi.items ?? []);
        const sections: WorkSection[] = Array.isArray(sectionsData) ? sectionsData : [];
        setWorkSections(sections);
        setActiveWorkSection((prev) => sections.some((s) => s.slug === prev) ? prev : (sections[0]?.slug ?? ""));
        // Load gallery items for each section
        const wg: Record<string, WorkGalleryItem[]> = {};
        await Promise.all(sections.map(async (s) => {
          const r = await fetch(`${API}/work-gallery/${s.slug}`).then((res) => res.json()).catch(() => ({ items: [] }));
          wg[s.slug] = r.items ?? [];
        }));
        setWorkGalleryItems(wg);
      })
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, [open]);

  // Social link helpers
  function updateLink(i: number, field: keyof SocialLink, value: string) { setLinks((p) => p.map((l, idx) => idx === i ? { ...l, [field]: value } : l)); setSuccess(false); }
  function addLink() { setLinks((p) => [...p, { platform: "facebook", url: "" }]); setSuccess(false); }
  function removeLink(i: number) { setLinks((p) => p.filter((_, idx) => idx !== i)); setSuccess(false); }

  // Logo
  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setPendingLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPendingLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadLogo() {
    if (!pendingLogoFile) return;
    setLogoUploading(true); setError("");
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((res, rej) => { reader.onload = (e) => res((e.target?.result as string).split(",")[1]); reader.onerror = rej; reader.readAsDataURL(pendingLogoFile); });
      const r = await fetch(`${API}/logo`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: base64, mimeType: pendingLogoFile.type }) });
      const data = await r.json();
      if (data.ok) {
        const newUrl = `${API}/logo?t=${Date.now()}`;
        setCurrentLogoUrl(newUrl); setPendingLogoFile(null); setPendingLogoPreview(null);
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { logoUpdated: true, logoUrl: newUrl } }));
      } else { setError(data.error ?? "Logo upload failed."); }
    } catch { setError("Network error uploading logo."); }
    finally { setLogoUploading(false); }
  }

  // Generic content image upload (books/merch/projects)
  function triggerImageUpload(type: string, id: string) {
    pendingImageTarget.current = { type, id };
    if (imageFileInputRef.current) { imageFileInputRef.current.value = ""; imageFileInputRef.current.click(); }
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const target = pendingImageTarget.current;
    if (!file || !target) return;
    const key = `${target.type}/${target.id}`;
    setUploadingImage(key); setError("");
    try {
      const base64 = await toBase64(file);
      const r = await fetch(`${API}/content-images/${target.type}/${target.id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: base64, mimeType: file.type }) });
      const data = await r.json();
      if (data.ok) {
        const newMap = { ...contentImages, [key]: `${data.url}?t=${Date.now()}` };
        setContentImages(newMap);
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { contentImages: newMap } }));
      } else { setError(data.error ?? "Image upload failed."); }
    } catch { setError("Network error uploading image."); }
    finally { setUploadingImage(null); pendingImageTarget.current = null; }
  }

  // Catalog add
  async function handleAddItem(type: SectionType) {
    if (!newItemName.trim()) return;
    setAddingSaving(true); setError("");
    try {
      const r = await fetch(`${API}/catalog/${type}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newItemName.trim() }) });
      const data = await r.json();
      if (data.ok) {
        const updated = { ...catalog, [type]: [...catalog[type], data.item] };
        setCatalog(updated); setAddingSection(null); setNewItemName("");
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { catalogUpdated: true, catalog: updated } }));
      } else { setError(data.error ?? "Failed to add item."); }
    } catch { setError("Network error adding item."); }
    finally { setAddingSaving(false); }
  }

  // Catalog — rename item
  async function handleRenameCatalogItem(type: SectionType, id: string) {
    if (!editCatalogName.trim()) { setEditingCatalogKey(null); return; }
    const current = catalog[type].find((i) => i.id === id);
    if (editCatalogName.trim() === current?.name) { setEditingCatalogKey(null); return; }
    setSavingCatalogEdit(true); setError("");
    try {
      const r = await fetch(`${API}/catalog/${type}/${id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editCatalogName.trim() }) });
      const data = await r.json();
      if (data.ok) {
        const updated = { ...catalog, [type]: catalog[type].map((i) => i.id === id ? { ...i, name: editCatalogName.trim() } : i) };
        setCatalog(updated); setEditingCatalogKey(null);
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { catalogUpdated: true, catalog: updated } }));
      } else { setError(data.error ?? "Failed to rename item."); }
    } catch { setError("Network error."); }
    finally { setSavingCatalogEdit(false); }
  }

  // Catalog — delete item
  async function handleDeleteCatalogItem(type: SectionType, id: string) {
    setDeletingCatalogItem(true); setError("");
    try {
      const r = await fetch(`${API}/catalog/${type}/${id}`, { method: "DELETE", credentials: "include" });
      const data = await r.json();
      if (data.ok) {
        const updated = { ...catalog, [type]: catalog[type].filter((i) => i.id !== id) };
        setCatalog(updated); setConfirmDeleteCatalogKey(null);
        const imgKey = `${type}/${id}`;
        const { [imgKey]: _removed, ...restImages } = contentImages;
        setContentImages(restImages);
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { catalogUpdated: true, catalog: updated, contentImages: restImages } }));
      } else { setError(data.error ?? "Failed to delete item."); }
    } catch { setError("Network error."); }
    finally { setDeletingCatalogItem(false); }
  }

  // Testimonials
  function handleNewTestiFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setNewTestiFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setNewTestiPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function triggerTestiImageUpload(id: string) {
    pendingTestiTarget.current = id;
    if (existingTestiFileRef.current) { existingTestiFileRef.current.value = ""; existingTestiFileRef.current.click(); }
  }

  async function handleExistingTestiFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const id = pendingTestiTarget.current;
    if (!file || !id) return;
    setUploadingTestimonialId(id); setError("");
    try {
      const base64 = await toBase64(file);
      const r = await fetch(`${API}/content-images/testimonials/${id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: base64, mimeType: file.type }) });
      const data = await r.json();
      if (data.ok) {
        const key = `testimonials/${id}`;
        const newMap = { ...contentImages, [key]: `${data.url}?t=${Date.now()}` };
        setContentImages(newMap);
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { contentImages: newMap } }));
      } else { setError(data.error ?? "Image upload failed."); }
    } catch { setError("Network error uploading image."); }
    finally { setUploadingTestimonialId(null); pendingTestiTarget.current = null; }
  }

  async function handleSaveTestimonial() {
    if (!newTestiCaption.trim()) return;
    setSavingTestimonial(true); setError("");
    try {
      // Build a single atomic request: caption + optional image in one call.
      // The API uploads to R2 first, then inserts the DB row.
      // If either step fails, nothing is saved (no orphaned rows or images).
      let imageData: string | undefined;
      let imageMimeType: string | undefined;
      if (newTestiFile) {
        imageData = await toBase64(newTestiFile);
        imageMimeType = newTestiFile.type;
      }

      const r = await fetch(`${API}/testimonials`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: newTestiCaption.trim(), imageData, imageMimeType }),
      });
      const data = await r.json();
      if (!data.ok) { setError(data.error ?? "Failed to add testimonial."); return; }

      const newItem: TestimonialItem = { id: data.item.id, caption: data.item.caption };
      let newContentImages = { ...contentImages };
      if (imageData) {
        // Image was saved atomically by the API — register it in local state
        newContentImages = { ...newContentImages, [`testimonials/${newItem.id}`]: `/api/content-images/testimonials/${newItem.id}?t=${Date.now()}` };
        setContentImages(newContentImages);
      }

      const updated = [...testimonialsList, newItem];
      setTestimonialsList(updated);
      setAddingTestimonial(false); setNewTestiCaption(""); setNewTestiFile(null); setNewTestiPreview(null);
      window.dispatchEvent(new CustomEvent("settings-updated", { detail: { testimonials: updated, contentImages: newContentImages } }));
    } catch { setError("Network error adding testimonial."); }
    finally { setSavingTestimonial(false); }
  }

  // Testimonials — edit caption
  async function handleRenameTestimonial(id: string) {
    if (!editTestiCaption.trim()) { setEditingTestiId(null); return; }
    const current = testimonialsList.find((t) => t.id === id);
    if (editTestiCaption.trim() === current?.caption) { setEditingTestiId(null); return; }
    setSavingTestiEdit(true); setError("");
    try {
      const r = await fetch(`${API}/testimonials/${id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caption: editTestiCaption.trim() }) });
      const data = await r.json();
      if (data.ok) {
        const updated = testimonialsList.map((t) => t.id === id ? { ...t, caption: editTestiCaption.trim() } : t);
        setTestimonialsList(updated); setEditingTestiId(null);
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { testimonials: updated } }));
      } else { setError(data.error ?? "Failed to update testimonial."); }
    } catch { setError("Network error."); }
    finally { setSavingTestiEdit(false); }
  }

  // Testimonials — delete
  async function handleDeleteTestimonial(id: string) {
    setDeletingTesti(true); setError("");
    try {
      const r = await fetch(`${API}/testimonials/${id}`, { method: "DELETE", credentials: "include" });
      const data = await r.json();
      if (data.ok) {
        const updated = testimonialsList.filter((t) => t.id !== id);
        setTestimonialsList(updated); setConfirmDeleteTestiId(null);
        const imgKey = `testimonials/${id}`;
        const { [imgKey]: _removed, ...restImages } = contentImages;
        setContentImages(restImages);
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { testimonials: updated, contentImages: restImages } }));
      } else { setError(data.error ?? "Failed to delete testimonial."); }
    } catch { setError("Network error."); }
    finally { setDeletingTesti(false); }
  }

  // Work Gallery — section management
  async function handleRenameSection(slug: string) {
    if (!editLabel.trim()) { setEditingSlug(null); return; }
    const current = workSections.find((s) => s.slug === slug);
    if (editLabel.trim() === current?.label) { setEditingSlug(null); return; }
    setSavingEditSection(true); setError("");
    try {
      const r = await fetch(`${API}/work-sections/${slug}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: editLabel.trim() }) });
      const data = await r.json();
      if (data.ok) {
        const updated = workSections.map((s) => s.slug === slug ? { ...s, label: editLabel.trim() } : s);
        setWorkSections(updated); setEditingSlug(null);
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { workSections: updated } }));
      } else { setError(data.error ?? "Failed to rename section."); }
    } catch { setError("Network error."); }
    finally { setSavingEditSection(false); }
  }

  async function handleDeleteSection(slug: string) {
    setError("");
    try {
      const r = await fetch(`${API}/work-sections/${slug}`, { method: "DELETE", credentials: "include" });
      const data = await r.json();
      if (data.ok) {
        const updated = workSections.filter((s) => s.slug !== slug);
        setWorkSections(updated);
        if (activeWorkSection === slug) setActiveWorkSection(updated[0]?.slug ?? "");
        const { [slug]: _removed, ...rest } = workGalleryItems;
        setWorkGalleryItems(rest);
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { workSections: updated } }));
      } else { setError(data.error ?? "Failed to delete section."); }
    } catch { setError("Network error."); }
  }

  async function handleAddSection() {
    if (!newSectionLabel.trim()) return;
    setSavingNewSection(true); setError("");
    try {
      const r = await fetch(`${API}/work-sections`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: newSectionLabel.trim() }) });
      const data = await r.json();
      if (data.ok) {
        const updated = [...workSections, data.section];
        setWorkSections(updated);
        setWorkGalleryItems((prev) => ({ ...prev, [data.section.slug]: [] }));
        setAddingNewSection(false); setNewSectionLabel("");
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { workSections: updated } }));
      } else { setError(data.error ?? "Failed to add section."); }
    } catch { setError("Network error."); }
    finally { setSavingNewSection(false); }
  }

  // Work Gallery — sub-category management
  async function handleAddSubCategory() {
    if (!newSubLabel.trim() || !activeWorkSection) return;
    setSavingNewSub(true); setError("");
    try {
      const body = { label: newSubLabel.trim(), parentSlug: addingSubParent === "root" ? null : addingSubParent };
      const r = await fetch(`${API}/work-sections/${activeWorkSection}/sub-categories`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json();
      if (data.ok) {
        const updated = workSections.map((s) => s.slug === activeWorkSection ? { ...s, subCategories: [...(s.subCategories ?? []), data.subCategory] } : s);
        setWorkSections(updated); setAddingSubParent(null); setNewSubLabel("");
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { workSections: updated } }));
      } else { setError(data.error ?? "Failed to add sub-category."); }
    } catch { setError("Network error."); }
    finally { setSavingNewSub(false); }
  }

  async function handleRenameSubCategory(subSlug: string) {
    if (!editSubLabel.trim() || !activeWorkSection) { setEditingSubSlug(null); return; }
    const sec = workSections.find((s) => s.slug === activeWorkSection);
    const current = sec?.subCategories?.find((s) => s.slug === subSlug);
    if (editSubLabel.trim() === current?.label) { setEditingSubSlug(null); return; }
    setSavingSubEdit(true); setError("");
    try {
      const r = await fetch(`${API}/work-sections/${activeWorkSection}/sub-categories/${subSlug}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: editSubLabel.trim() }) });
      const data = await r.json();
      if (data.ok) {
        const updated = workSections.map((s) => s.slug === activeWorkSection ? { ...s, subCategories: (s.subCategories ?? []).map((sub) => sub.slug === subSlug ? { ...sub, label: editSubLabel.trim() } : sub) } : s);
        setWorkSections(updated); setEditingSubSlug(null);
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { workSections: updated } }));
      } else { setError(data.error ?? "Failed to rename sub-category."); }
    } catch { setError("Network error."); }
    finally { setSavingSubEdit(false); }
  }

  async function handleDeleteSubCategory(subSlug: string) {
    if (!activeWorkSection) return;
    setError("");
    try {
      const r = await fetch(`${API}/work-sections/${activeWorkSection}/sub-categories/${subSlug}`, { method: "DELETE", credentials: "include" });
      const data = await r.json();
      if (data.ok) {
        const deletedSlugs = new Set<string>(data.deleted ?? [subSlug]);
        const updated = workSections.map((s) => s.slug === activeWorkSection ? { ...s, subCategories: (s.subCategories ?? []).filter((sub) => !deletedSlugs.has(sub.slug)) } : s);
        setWorkSections(updated); setConfirmDeleteSubSlug(null);
        const sectionItems = (workGalleryItems[activeWorkSection] ?? []).map((item) =>
          item.subCategorySlug && deletedSlugs.has(item.subCategorySlug) ? { ...item, subCategorySlug: null } : item
        );
        setWorkGalleryItems((prev) => ({ ...prev, [activeWorkSection]: sectionItems }));
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { workSections: updated } }));
      } else { setError(data.error ?? "Failed to delete sub-category."); }
    } catch { setError("Network error."); }
  }

  // Work Gallery — existing item image upload
  function triggerWorkImageUpload(section: string, id: string) {
    pendingWorkTarget.current = { section, id };
    if (existingWorkFileRef.current) { existingWorkFileRef.current.value = ""; existingWorkFileRef.current.click(); }
  }

  async function handleExistingWorkFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const target = pendingWorkTarget.current;
    if (!file || !target) return;
    const type = `work-${target.section}`;
    const key = `${type}/${target.id}`;
    setUploadingWorkKey(key); setError("");
    try {
      const base64 = await toBase64(file);
      const r = await fetch(`${API}/content-images/${type}/${target.id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: base64, mimeType: file.type }) });
      const data = await r.json();
      if (data.ok) {
        const newMap = { ...contentImages, [key]: `${data.url}?t=${Date.now()}` };
        setContentImages(newMap);
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: { contentImages: newMap } }));
      } else { setError(data.error ?? "Image upload failed."); }
    } catch { setError("Network error uploading image."); }
    finally { setUploadingWorkKey(null); pendingWorkTarget.current = null; }
  }

  // Work Gallery — new item file picker
  function handleNewWorkFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setNewWorkFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setNewWorkPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  // Work Gallery — save new item
  async function handleSaveWorkItem() {
    if (!newWorkCaption.trim()) return;
    setSavingWorkItem(true); setError("");
    try {
      const r = await fetch(`${API}/work-gallery/${activeWorkSection}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caption: newWorkCaption.trim(), subCategorySlug: newWorkSubCategory || null }) });
      const data = await r.json();
      if (!data.ok) { setError(data.error ?? "Failed to add item."); return; }
      const newItem: WorkGalleryItem = { id: data.item.id, caption: data.item.caption, subCategorySlug: newWorkSubCategory || null };
      let newContentImages = { ...contentImages };
      if (newWorkFile) {
        const type = `work-${activeWorkSection}`;
        const base64 = await toBase64(newWorkFile);
        const ir = await fetch(`${API}/content-images/${type}/${newItem.id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: base64, mimeType: newWorkFile.type }) });
        const idata = await ir.json();
        if (idata.ok) { newContentImages = { ...newContentImages, [`${type}/${newItem.id}`]: `${idata.url}?t=${Date.now()}` }; setContentImages(newContentImages); }
      }
      const updatedSection = [...(workGalleryItems[activeWorkSection] ?? []), newItem];
      const updatedGallery = { ...workGalleryItems, [activeWorkSection]: updatedSection };
      setWorkGalleryItems(updatedGallery);
      setAddingWorkItem(false); setNewWorkCaption(""); setNewWorkFile(null); setNewWorkPreview(null); setNewWorkSubCategory("");
      window.dispatchEvent(new CustomEvent("settings-updated", { detail: { workGallery: updatedGallery, contentImages: newContentImages } }));
    } catch { setError("Network error adding item."); }
    finally { setSavingWorkItem(false); }
  }

  // Save text settings
  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setSuccess(false);
    try {
      const r = await fetch(`${API}/settings`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyName, tagline, footerDescription, copyrightText, email, socialLinks: links }) });
      const data = await r.json();
      if (data.ok) { setSuccess(true); window.dispatchEvent(new CustomEvent("settings-updated", { detail: data.settings })); }
      else { setError(data.error ?? "Failed to save settings."); }
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "branding",     label: "Branding" },
    { id: "contact",      label: "Contact" },
    { id: "logo",         label: "Logo" },
    { id: "social",       label: "Social Links" },
    { id: "images",       label: "Page Images" },
    { id: "testimonials", label: "Testimonials" },
    { id: "workgallery",  label: "Work Gallery" },
  ];

  const isActionTab = activeTab === "logo" || activeTab === "images" || activeTab === "testimonials" || activeTab === "workgallery";
  const SECTION_TYPES: SectionType[] = ["books", "merchandise", "projects"];

  // Derived: active section sub-category tree
  const activeSection = workSections.find((s) => s.slug === activeWorkSection);
  const activeSubCategories: SubCategory[] = activeSection?.subCategories ?? [];
  const activeTreeNodes = buildTreeOrder(activeSubCategories);
  const addSubFormDepth = addingSubParent === "root" ? 0
    : (activeTreeNodes.find((n) => n.node.slug === addingSubParent)?.depth ?? 0) + 1;

  const isBusy = saving || logoUploading || !!uploadingImage || addingSaving || savingTestimonial || savingWorkItem || !!uploadingWorkKey || savingEditSection || savingNewSection || savingSubEdit || savingNewSub || savingCatalogEdit || deletingCatalogItem || savingTestiEdit || deletingTesti;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isBusy) { setError(""); setSuccess(false); onOpenChange(v); } }}>
      <DialogContent className="sm:max-w-xl rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <DialogTitle className="text-center font-serif text-xl">Site Settings</DialogTitle>
        </DialogHeader>

        {/* Tab strip */}
        <div className="flex border-b border-border shrink-0 -mx-6 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Hidden file inputs */}
        <input ref={logoFileInputRef}      type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" className="hidden" onChange={handleLogoFileChange} />
        <input ref={imageFileInputRef}     type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleImageFileChange} />
        <input ref={newTestiFileRef}       type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleNewTestiFileChange} />
        <input ref={existingTestiFileRef}  type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleExistingTestiFileChange} />
        <input ref={newWorkFileRef}        type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleNewWorkFileChange} />
        <input ref={existingWorkFileRef}   type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleExistingWorkFileChange} />

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4 overflow-y-auto flex-1 py-4">

            {/* ── BRANDING ── */}
            {activeTab === "branding" && (
              <div className="flex flex-col gap-4">
                <Field label="Company name"><input value={companyName} onChange={(e) => { setCompanyName(e.target.value); setSuccess(false); }} placeholder="Gogi Studios" className={inputCls} /></Field>
                <Field label="Tagline" hint="Shown in browser tab / meta"><input value={tagline} onChange={(e) => { setTagline(e.target.value); setSuccess(false); }} placeholder="Social Impact Communication — Since 1975" className={inputCls} /></Field>
                <Field label="Footer description"><textarea rows={3} value={footerDescription} onChange={(e) => { setFooterDescription(e.target.value); setSuccess(false); }} placeholder="Pakistan's leading social impact studio…" className={`${inputCls} resize-none`} /></Field>
                <Field label="Copyright text"><input value={copyrightText} onChange={(e) => { setCopyrightText(e.target.value); setSuccess(false); }} placeholder="© 2026 Gogi Studios. All rights reserved." className={inputCls} /></Field>
              </div>
            )}

            {/* ── CONTACT ── */}
            {activeTab === "contact" && (
              <div className="flex flex-col gap-4">
                <Field label="Contact email" hint="Used in footer, Hire page, and Services page">
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setSuccess(false); }} placeholder="info@gogistudios.com" className={inputCls} />
                </Field>
              </div>
            )}

            {/* ── LOGO ── */}
            {activeTab === "logo" && (
              <div className="flex flex-col gap-5">
                <p className="text-sm text-muted-foreground">Upload a replacement logo for the navbar. PNG, JPG, WEBP, or SVG recommended.</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Current logo</p>
                  <div className="w-24 h-24 border border-border rounded-xl flex items-center justify-center bg-muted/30 overflow-hidden p-2">
                    {currentLogoUrl ? <img src={currentLogoUrl} alt="Current logo" className="max-w-full max-h-full object-contain" onError={() => setCurrentLogoUrl(null)} /> : <img src={STATIC_LOGO} alt="Default logo" className="max-w-full max-h-full object-contain" />}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Replace with</p>
                  {pendingLogoPreview ? (
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 border border-primary/30 rounded-xl flex items-center justify-center bg-primary/5 overflow-hidden p-2">
                        <img src={pendingLogoPreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button type="button" size="sm" onClick={uploadLogo} disabled={logoUploading} className="rounded-full gap-1.5">
                          {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload this logo
                        </Button>
                        <button type="button" onClick={() => { setPendingLogoFile(null); setPendingLogoPreview(null); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => logoFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors w-full justify-center">
                      <ImageIcon className="w-4 h-4" /> Choose image file
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── SOCIAL LINKS ── */}
            {activeTab === "social" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Links</p>
                  <button type="button" onClick={addLink} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"><Plus className="w-3.5 h-3.5" /> Add</button>
                </div>
                {links.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No links yet. Click "Add" to create one.</p> : (
                  <div className="flex flex-col gap-2">
                    {links.map((link, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select value={link.platform} onChange={(e) => updateLink(i, "platform", e.target.value)} className="h-9 rounded-lg border border-input bg-background px-2 text-sm w-36 shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/30">
                          {PLATFORM_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <input type="url" placeholder="https://…" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <button type="button" onClick={() => removeLink(i)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PAGE IMAGES ── */}
            {activeTab === "images" && (
              <div className="flex flex-col gap-6">
                <p className="text-sm text-muted-foreground">Upload cover images for books, merchandise, and projects.</p>
                {SECTION_TYPES.map((type) => {
                  const allItems = catalog[type];
                  const label = SECTION_LABELS[type];
                  return (
                    <div key={type}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{label}</p>
                      <div className="flex flex-col gap-2">
                        {allItems.map((item) => {
                          const key = `${type}/${item.id}`;
                          const imgUrl = contentImages[key];
                          const isUploading = uploadingImage === key;
                          const isEditing = editingCatalogKey === key;
                          const isConfirmDelete = confirmDeleteCatalogKey === key;
                          return (
                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl border border-border hover:border-primary/30 transition-colors group">
                              {/* Thumbnail — always shown */}
                              <button type="button" onClick={() => triggerImageUpload(type, item.id)} disabled={!!uploadingImage || isEditing || isConfirmDelete}
                                className="w-12 h-12 rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0 relative">
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : imgUrl ? (
                                  <><img src={imgUrl} alt={item.name} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="w-3.5 h-3.5 text-white" /></div></>
                                ) : (
                                  <><ImageIcon className="w-5 h-5 text-muted-foreground/40" /><div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"><Camera className="w-3.5 h-3.5 text-primary" /></div></>
                                )}
                              </button>

                              {/* Inline rename */}
                              {isEditing ? (
                                <>
                                  <input value={editCatalogName} onChange={(e) => setEditCatalogName(e.target.value)} autoFocus
                                    className="flex-1 h-8 rounded-lg border border-input bg-muted/40 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRenameCatalogItem(type, item.id); } if (e.key === "Escape") setEditingCatalogKey(null); }} />
                                  <Button type="button" size="sm" onClick={() => handleRenameCatalogItem(type, item.id)} disabled={savingCatalogEdit || !editCatalogName.trim()}
                                    className="rounded-full h-7 px-3 text-xs shrink-0">
                                    {savingCatalogEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                                  </Button>
                                  <button type="button" onClick={() => setEditingCatalogKey(null)} className="p-1 text-muted-foreground hover:text-foreground shrink-0">
                                    <XIcon className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : isConfirmDelete ? (
                                /* Inline delete confirmation */
                                <>
                                  <span className="flex-1 text-sm text-destructive truncate">Delete "{item.name}"?</span>
                                  <button type="button" onClick={() => handleDeleteCatalogItem(type, item.id)} disabled={deletingCatalogItem}
                                    className="text-xs font-medium text-destructive hover:underline shrink-0">
                                    {deletingCatalogItem ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Delete"}
                                  </button>
                                  <button type="button" onClick={() => setConfirmDeleteCatalogKey(null)} className="text-xs text-muted-foreground hover:text-foreground shrink-0 ml-1">Cancel</button>
                                </>
                              ) : (
                                /* Normal row */
                                <>
                                  <span className="text-sm text-foreground flex-1 line-clamp-1">{item.name}</span>
                                  <button type="button" title="Rename" onClick={() => { setEditingCatalogKey(key); setEditCatalogName(item.name); setConfirmDeleteCatalogKey(null); }}
                                    className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button type="button" title="Delete" onClick={() => { setConfirmDeleteCatalogKey(key); setEditingCatalogKey(null); }}
                                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button type="button" onClick={() => triggerImageUpload(type, item.id)} disabled={!!uploadingImage}
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors shrink-0 px-2 py-1 rounded-md hover:bg-primary/5">
                                    {imgUrl ? "Replace" : "Upload"}
                                  </button>
                                </>
                              )}
                            </div>
                          );
                        })}
                        {addingSection === type ? (
                          <div className="flex items-center gap-2 p-2 rounded-xl border border-primary/40 bg-primary/5 mt-1">
                            <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder={ADD_PLACEHOLDER[type]}
                              className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" autoFocus
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddItem(type); } if (e.key === "Escape") { setAddingSection(null); setNewItemName(""); } }} />
                            <Button type="button" size="sm" onClick={() => handleAddItem(type)} disabled={addingSaving || !newItemName.trim()} className="rounded-full h-9 px-3 gap-1 text-xs shrink-0">
                              {addingSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Save
                            </Button>
                            <button type="button" onClick={() => { setAddingSection(null); setNewItemName(""); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 px-1">Cancel</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => { setAddingSection(type); setNewItemName(""); }}
                            className="flex items-center justify-center gap-1.5 w-full py-2 mt-1 text-xs text-primary font-medium border border-dashed border-primary/30 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Add {label.replace(/s$/, "")}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── TESTIMONIALS ── */}
            {activeTab === "testimonials" && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">Upload testimonial images and add a caption for each. They appear on the home page.</p>
                <div className="flex flex-col gap-2">
                  {testimonialsList.length === 0 && !addingTestimonial && (
                    <p className="text-sm text-muted-foreground text-center py-4">No testimonials yet. Click "+ Add Testimonial" to get started.</p>
                  )}
                  {testimonialsList.map((t) => {
                    const key = `testimonials/${t.id}`;
                    const imgUrl = contentImages[key];
                    const isUploading = uploadingTestimonialId === t.id;
                    const isEditing = editingTestiId === t.id;
                    const isConfirmDelete = confirmDeleteTestiId === t.id;
                    return (
                      <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors group">
                        {/* Thumbnail */}
                        <button type="button" onClick={() => triggerTestiImageUpload(t.id)} disabled={!!uploadingTestimonialId || isEditing || isConfirmDelete}
                          className="w-16 h-16 rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0 relative">
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : imgUrl ? (
                            <><img src={imgUrl} alt={t.caption} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="w-3.5 h-3.5 text-white" /></div></>
                          ) : (
                            <><ImageIcon className="w-5 h-5 text-muted-foreground/40" /><div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"><Camera className="w-3.5 h-3.5 text-primary" /></div></>
                          )}
                        </button>

                        {isEditing ? (
                          /* Inline caption edit */
                          <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center">
                            <input value={editTestiCaption} onChange={(e) => setEditTestiCaption(e.target.value)} autoFocus
                              className="w-full h-8 rounded-lg border border-input bg-muted/40 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRenameTestimonial(t.id); } if (e.key === "Escape") setEditingTestiId(null); }} />
                            <div className="flex gap-2">
                              <Button type="button" size="sm" onClick={() => handleRenameTestimonial(t.id)} disabled={savingTestiEdit || !editTestiCaption.trim()} className="rounded-full h-7 px-3 text-xs">
                                {savingTestiEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                              </Button>
                              <button type="button" onClick={() => setEditingTestiId(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1">Cancel</button>
                            </div>
                          </div>
                        ) : isConfirmDelete ? (
                          /* Inline delete confirm */
                          <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center">
                            <p className="text-sm text-destructive">Delete this testimonial?</p>
                            <div className="flex gap-3">
                              <button type="button" onClick={() => handleDeleteTestimonial(t.id)} disabled={deletingTesti}
                                className="text-xs font-medium text-destructive hover:underline">
                                {deletingTesti ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Delete"}
                              </button>
                              <button type="button" onClick={() => setConfirmDeleteTestiId(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          /* Normal view */
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">{t.caption}</p>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => triggerTestiImageUpload(t.id)} disabled={!!uploadingTestimonialId}
                                className="text-xs text-muted-foreground hover:text-primary transition-colors">{imgUrl ? "Replace image" : "Upload image"}</button>
                              <button type="button" title="Edit caption" onClick={() => { setEditingTestiId(t.id); setEditTestiCaption(t.caption); setConfirmDeleteTestiId(null); }}
                                className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" title="Delete" onClick={() => { setConfirmDeleteTestiId(t.id); setEditingTestiId(null); }}
                                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {addingTestimonial ? (
                    <div className="flex flex-col gap-3 p-3 rounded-xl border border-primary/40 bg-primary/5 mt-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">New Testimonial</p>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Image <span className="opacity-60">(optional)</span></p>
                        {newTestiPreview ? (
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-14 rounded-lg border border-primary/30 overflow-hidden shrink-0"><img src={newTestiPreview} alt="Preview" className="w-full h-full object-cover" /></div>
                            <button type="button" onClick={() => { setNewTestiFile(null); setNewTestiPreview(null); if (newTestiFileRef.current) newTestiFileRef.current.value = ""; }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Remove</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => newTestiFileRef.current?.click()} className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors w-full justify-center">
                            <ImageIcon className="w-3.5 h-3.5" /> Choose image
                          </button>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Caption <span className="text-destructive">*</span></p>
                        <input type="text" value={newTestiCaption} onChange={(e) => setNewTestiCaption(e.target.value)} placeholder="e.g. Program Manager, UNICEF Pakistan" className={`${inputCls} text-sm`} autoFocus />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={handleSaveTestimonial} disabled={savingTestimonial || !newTestiCaption.trim()} className="rounded-full h-9 px-4 gap-1 text-xs">
                          {savingTestimonial ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Save Testimonial
                        </Button>
                        <button type="button" onClick={() => { setAddingTestimonial(false); setNewTestiCaption(""); setNewTestiFile(null); setNewTestiPreview(null); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setAddingTestimonial(true)}
                      className="flex items-center justify-center gap-1.5 w-full py-2 mt-1 text-xs text-primary font-medium border border-dashed border-primary/30 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Testimonial
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── WORK GALLERY ── */}
            {activeTab === "workgallery" && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">Manage your work categories and upload images to each one.</p>

                {/* ── Section manager ── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Work Categories</p>
                    {!addingNewSection && (
                      <button type="button" onClick={() => { setAddingNewSection(true); setEditingSlug(null); }}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Category
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {workSections.map((s) => (
                      <div key={s.slug} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background">
                        {editingSlug === s.slug ? (
                          <>
                            <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} autoFocus
                              className="flex-1 h-8 rounded-lg border border-input bg-muted/40 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRenameSection(s.slug); } if (e.key === "Escape") setEditingSlug(null); }} />
                            <Button type="button" size="sm" onClick={() => handleRenameSection(s.slug)} disabled={savingEditSection || !editLabel.trim()}
                              className="rounded-full h-7 px-3 text-xs shrink-0">
                              {savingEditSection ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                            </Button>
                            <button type="button" onClick={() => setEditingSlug(null)} className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                              <XIcon className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm text-foreground">{s.label}</span>
                            <button type="button" onClick={() => { setEditingSlug(s.slug); setEditLabel(s.label); setAddingNewSection(false); }}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0" title="Rename">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => handleDeleteSection(s.slug)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    {workSections.length === 0 && !addingNewSection && (
                      <p className="text-sm text-muted-foreground text-center py-3">No categories yet. Click "Add Category" to create one.</p>
                    )}
                    {addingNewSection && (
                      <div className="flex items-center gap-2 p-2 rounded-xl border border-primary/40 bg-primary/5">
                        <input value={newSectionLabel} onChange={(e) => setNewSectionLabel(e.target.value)} autoFocus
                          placeholder="e.g. Documentary Projects"
                          className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSection(); } if (e.key === "Escape") { setAddingNewSection(false); setNewSectionLabel(""); } }} />
                        <Button type="button" size="sm" onClick={handleAddSection} disabled={savingNewSection || !newSectionLabel.trim()}
                          className="rounded-full h-9 px-3 text-xs shrink-0">
                          {savingNewSection ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
                        </Button>
                        <button type="button" onClick={() => { setAddingNewSection(false); setNewSectionLabel(""); }}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {workSections.length > 0 && (
                  <>
                    <div className="h-px bg-border" />

                    {/* Section selector */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Upload Images</p>
                      <div className="flex flex-wrap gap-1.5">
                        {workSections.map((s) => (
                          <button key={s.slug} type="button"
                            onClick={() => { setActiveWorkSection(s.slug); setAddingWorkItem(false); setNewWorkCaption(""); setNewWorkFile(null); setNewWorkPreview(null); setNewWorkSubCategory(""); setAddingSubParent(null); setEditingSubSlug(null); setConfirmDeleteSubSlug(null); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeWorkSection === s.slug ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sub-category tree for active section */}
                    {activeWorkSection && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sub-categories</p>
                          {addingSubParent === null && (
                            <button type="button" onClick={() => { setAddingSubParent("root"); setEditingSubSlug(null); setConfirmDeleteSubSlug(null); }}
                              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                              <Plus className="w-3 h-3" /> Add
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {activeTreeNodes.map(({ node, depth }) => (
                            <div key={node.slug} style={{ marginLeft: `${depth * 14}px` }}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border bg-background text-xs">
                              {editingSubSlug === node.slug ? (
                                <>
                                  <input value={editSubLabel} onChange={(e) => setEditSubLabel(e.target.value)} autoFocus
                                    className="flex-1 h-6 rounded border border-input bg-muted/40 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRenameSubCategory(node.slug); } if (e.key === "Escape") setEditingSubSlug(null); }} />
                                  <Button type="button" size="sm" onClick={() => handleRenameSubCategory(node.slug)} disabled={savingSubEdit || !editSubLabel.trim()}
                                    className="h-6 px-2 text-xs rounded-full shrink-0">
                                    {savingSubEdit ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : "Save"}
                                  </Button>
                                  <button type="button" onClick={() => setEditingSubSlug(null)} className="p-0.5 text-muted-foreground hover:text-foreground shrink-0">
                                    <XIcon className="w-3 h-3" />
                                  </button>
                                </>
                              ) : confirmDeleteSubSlug === node.slug ? (
                                <>
                                  <span className="flex-1 text-destructive truncate">Delete with all children?</span>
                                  <button type="button" onClick={() => handleDeleteSubCategory(node.slug)} className="text-destructive font-medium hover:underline shrink-0">Yes</button>
                                  <button type="button" onClick={() => setConfirmDeleteSubSlug(null)} className="text-muted-foreground hover:text-foreground shrink-0 ml-1">No</button>
                                </>
                              ) : (
                                <>
                                  <span className="flex-1 truncate">{node.label}</span>
                                  <button type="button" title="Add child" onClick={() => { setAddingSubParent(node.slug); setEditingSubSlug(null); setConfirmDeleteSubSlug(null); }}
                                    className="p-0.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0">
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button type="button" title="Rename" onClick={() => { setEditingSubSlug(node.slug); setEditSubLabel(node.label); setAddingSubParent(null); setConfirmDeleteSubSlug(null); }}
                                    className="p-0.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button type="button" title="Delete" onClick={() => {
                                      const hasChildren = activeSubCategories.some((s) => s.parentSlug === node.slug);
                                      if (hasChildren) setConfirmDeleteSubSlug(node.slug);
                                      else handleDeleteSubCategory(node.slug);
                                    }}
                                    className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                          {activeTreeNodes.length === 0 && addingSubParent === null && (
                            <p className="text-xs text-muted-foreground text-center py-2">No sub-categories yet. Click "+ Add" to create one.</p>
                          )}
                          {addingSubParent !== null && (
                            <div style={{ marginLeft: `${addSubFormDepth * 14}px` }}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-primary/40 bg-primary/5">
                              <input value={newSubLabel} onChange={(e) => setNewSubLabel(e.target.value)} autoFocus placeholder="Sub-category name"
                                className="flex-1 h-6 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSubCategory(); } if (e.key === "Escape") { setAddingSubParent(null); setNewSubLabel(""); } }} />
                              <Button type="button" size="sm" onClick={handleAddSubCategory} disabled={savingNewSub || !newSubLabel.trim()}
                                className="h-6 px-2 text-xs rounded-full shrink-0">
                                {savingNewSub ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : "Add"}
                              </Button>
                              <button type="button" onClick={() => { setAddingSubParent(null); setNewSubLabel(""); }}
                                className="p-0.5 text-muted-foreground hover:text-foreground shrink-0">
                                <XIcon className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Items for selected section */}
                    {activeWorkSection && (
                      <div className="flex flex-col gap-2">
                        {(workGalleryItems[activeWorkSection] ?? []).length === 0 && !addingWorkItem && (
                          <p className="text-sm text-muted-foreground text-center py-4">No images yet for this section.</p>
                        )}

                        {(workGalleryItems[activeWorkSection] ?? []).map((item) => {
                          const type = `work-${activeWorkSection}`;
                          const key = `${type}/${item.id}`;
                          const imgUrl = contentImages[key];
                          const isUploading = uploadingWorkKey === key;
                          return (
                            <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors group">
                              <button type="button" onClick={() => triggerWorkImageUpload(activeWorkSection, item.id)} disabled={!!uploadingWorkKey}
                                className="w-16 h-16 rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0 relative">
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : imgUrl ? (
                                  <><img src={imgUrl} alt={item.caption} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="w-3.5 h-3.5 text-white" /></div></>
                                ) : (
                                  <><ImageIcon className="w-5 h-5 text-muted-foreground/40" /><div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"><Camera className="w-3.5 h-3.5 text-primary" /></div></>
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">{item.caption}</p>
                                <button type="button" onClick={() => triggerWorkImageUpload(activeWorkSection, item.id)} disabled={!!uploadingWorkKey}
                                  className="text-xs text-muted-foreground hover:text-primary transition-colors">{imgUrl ? "Replace image" : "Upload image"}</button>
                              </div>
                            </div>
                          );
                        })}

                        {addingWorkItem ? (
                          <div className="flex flex-col gap-3 p-3 rounded-xl border border-primary/40 bg-primary/5 mt-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">New Image</p>
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Image <span className="opacity-60">(optional, can add later)</span></p>
                              {newWorkPreview ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-24 h-16 rounded-lg border border-primary/30 overflow-hidden shrink-0"><img src={newWorkPreview} alt="Preview" className="w-full h-full object-cover" /></div>
                                  <button type="button" onClick={() => { setNewWorkFile(null); setNewWorkPreview(null); if (newWorkFileRef.current) newWorkFileRef.current.value = ""; }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Remove</button>
                                </div>
                              ) : (
                                <button type="button" onClick={() => newWorkFileRef.current?.click()} className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors w-full justify-center">
                                  <ImageIcon className="w-3.5 h-3.5" /> Choose image
                                </button>
                              )}
                            </div>
                            {activeTreeNodes.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1.5">Sub-category <span className="opacity-60">(optional)</span></p>
                                <select value={newWorkSubCategory} onChange={(e) => setNewWorkSubCategory(e.target.value)}
                                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                  <option value="">— Uncategorised —</option>
                                  {activeTreeNodes.map(({ node, pathLabel }) => (
                                    <option key={node.slug} value={node.slug}>{pathLabel}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground mb-1.5">Caption <span className="text-destructive">*</span></p>
                              <input type="text" value={newWorkCaption} onChange={(e) => setNewWorkCaption(e.target.value)} placeholder="e.g. Water & Sanitation Awareness Campaign, 2023" className={`${inputCls} text-sm`} autoFocus
                                onKeyDown={(e) => { if (e.key === "Escape") { setAddingWorkItem(false); setNewWorkCaption(""); setNewWorkFile(null); setNewWorkPreview(null); setNewWorkSubCategory(""); } }} />
                            </div>
                            <div className="flex gap-2">
                              <Button type="button" size="sm" onClick={handleSaveWorkItem} disabled={savingWorkItem || !newWorkCaption.trim()} className="rounded-full h-9 px-4 gap-1 text-xs">
                                {savingWorkItem ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Save Image
                              </Button>
                              <button type="button" onClick={() => { setAddingWorkItem(false); setNewWorkCaption(""); setNewWorkFile(null); setNewWorkPreview(null); setNewWorkSubCategory(""); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setAddingWorkItem(true)}
                            className="flex items-center justify-center gap-1.5 w-full py-2 mt-1 text-xs text-primary font-medium border border-dashed border-primary/30 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Add Image
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Feedback */}
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            {success && <p className="text-sm text-green-600 text-center font-medium">✓ Saved successfully.</p>}

            {/* Footer */}
            {!isActionTab ? (
              <div className="flex gap-2 justify-end pt-1 shrink-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="rounded-full px-5">Cancel</Button>
                <Button type="submit" disabled={saving} className="rounded-full bg-primary text-white hover:bg-primary/90 px-5 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 justify-end pt-1 shrink-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-5">Close</Button>
              </div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper: read file as base64 (no prefix)
function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => res((e.target?.result as string).split(",")[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
