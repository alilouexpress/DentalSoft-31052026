import { useState, useRef } from "react";
import { useLanguage } from "@/i18n/language-context";
import { usePatientImages, useUploadPatientImage, useUpdatePatientImage, useDeletePatientImage, useDoctors, usePatientTreatmentProgress } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ImageViewer } from "@/components/image-viewer";
import { toast } from "sonner";
import { Upload, X, Search, Filter, Camera, Eye, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";

const IMAGE_TYPES = [
  { value: "periapical", label: "P\u00e9riapicale" },
  { value: "bitewing", label: "Bitewing" },
  { value: "panoramic", label: "Panoramique" },
  { value: "cbct", label: "CBCT" },
  { value: "intraoral", label: "Photo intra-orale" },
  { value: "extraoral", label: "Photo extra-orale" },
  { value: "stl", label: "STL" },
  { value: "pdf", label: "PDF" },
  { value: "dicom", label: "DICOM" },
];

const FDI_TEETH = [
  18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
  48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38,
  55,54,53,52,51,61,62,63,64,65,
  85,84,83,82,81,71,72,73,74,75,
];

interface PatientImagingProps {
  patientId: string;
  selectedTooth?: number | null;
}

export function PatientImaging({ patientId, selectedTooth }: PatientImagingProps) {
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: doctors = [] } = useDoctors();

  const [filters, setFilters] = useState<Record<string, string>>(selectedTooth ? { tooth: String(selectedTooth) } : {});
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const { data: images = [], isLoading, refetch } = usePatientImages(patientId, filters);
  const uploadImage = useUploadPatientImage();
  const updateImage = useUpdatePatientImage();
  const deleteImage = useDeletePatientImage();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    imageType: "periapical",
    toothNumbers: selectedTooth ? String(selectedTooth) : "",
    dentistId: "",
    clinicalNote: "",
    tags: "",
  });

  const imageTypesForGrid = images.filter((img) => {
    if (!img.mimeType?.startsWith("image/") && img.mimeType !== "application/pdf") return false;
    return true;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadImage.mutateAsync({
        patientId,
        file,
        imageType: uploadData.imageType,
        toothNumbers: uploadData.toothNumbers || undefined,
        dentistId: uploadData.dentistId || undefined,
        clinicalNote: uploadData.clinicalNote || undefined,
        tags: uploadData.tags || undefined,
      });
      toast.success("Image import\u00e9e avec succ\u00e8s");
      setUploadOpen(false);
      setUploadData({ imageType: "periapical", toothNumbers: selectedTooth ? String(selectedTooth) : "", dentistId: "", clinicalNote: "", tags: "" });
      refetch();
    } catch {
      toast.error("Erreur lors de l'import");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    await deleteImage.mutateAsync(id);
    toast.success("Image supprim\u00e9e");
    refetch();
  };

  const handleUpdate = async (id: string, data: any) => {
    await updateImage.mutateAsync({ id, data });
    refetch();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getTypeLabel = (type: string) => IMAGE_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.stl"
        className="hidden"
        onChange={handleUpload}
      />

      {/* Header + Upload */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Imagerie</h3>
          <Badge variant="secondary" className="text-[10px]">{images.length} image{images.length !== 1 ? "s" : ""}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {uploadOpen && (
            <div className="flex items-center gap-1.5">
              <Select value={uploadData.imageType} onValueChange={(v) => setUploadData({ ...uploadData, imageType: v })}>
                <SelectTrigger className="h-7 text-xs w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_TYPES.filter((t) => t.value).map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="h-7 gap-1 text-xs" onClick={openFileDialog} disabled={uploadImage.isPending}>
                <Upload className="h-3 w-3" /> Importer
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setUploadOpen(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {!uploadOpen && (
            <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => setUploadOpen(true)}>
              <Upload className="h-3 w-3" /> Ajouter une image
            </Button>
          )}
        </div>
      </div>

      {/* Upload form (metadata) */}
      {uploadOpen && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Dent(s)</label>
                <Input
                  value={uploadData.toothNumbers}
                  onChange={(e) => setUploadData({ ...uploadData, toothNumbers: e.target.value })}
                  className="h-7 text-xs w-[100px]"
                  placeholder="26,27"
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">M\u00e9decin</label>
                <Select value={uploadData.dentistId} onValueChange={(v) => setUploadData({ ...uploadData, dentistId: v })}>
                  <SelectTrigger className="h-7 text-xs w-[130px]">
                    <SelectValue placeholder="Optionnel" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d: any) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Tags</label>
                <Input
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                  className="h-7 text-xs w-[130px]"
                  placeholder="carie, couronne"
                />
              </div>
              <div className="space-y-0.5 flex-1 min-w-[200px]">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Note clinique</label>
                <Input
                  value={uploadData.clinicalNote}
                  onChange={(e) => setUploadData({ ...uploadData, clinicalNote: e.target.value })}
                  className="h-7 text-xs"
                  placeholder="Note..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <Select
          value={filters.type || undefined}
          onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}
        >
          <SelectTrigger className="h-8 text-xs w-[130px]">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            {IMAGE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={filters.tooth || ""}
          onChange={(e) => setFilters((f) => ({ ...f, tooth: e.target.value }))}
          className="h-8 text-xs w-[100px]"
          placeholder="Dent"
        />
        <Input
          value={filters.tag || ""}
          onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))}
          className="h-8 text-xs w-[120px]"
          placeholder="Tag"
        />
        <Input
          type="date"
          value={filters.dateFrom || ""}
          onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
          className="h-8 text-xs w-[140px]"
          title="Date de d\u00e9but"
        />
        <Input
          type="date"
          value={filters.dateTo || ""}
          onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
          className="h-8 text-xs w-[140px]"
          title="Date de fin"
        />
        {Object.keys(filters).length > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => setFilters({})}>
            <X className="h-3 w-3 mr-1" /> Effacer
          </Button>
        )}
      </div>

      {/* Image grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2" />
          Chargement...
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Camera className="h-10 w-10 mb-2 text-muted-foreground/30" />
          <p className="text-sm">Aucune image</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {Object.keys(filters).length > 0 ? "Essayez de modifier les filtres" : "Importez une image pour commencer"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((img, i) => {
            const isImageFile = img.mimeType?.startsWith("image/");
            return (
              <Card
                key={img.id}
                className="border-border/40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
                onClick={() => setViewerIndex(i)}
              >
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {isImageFile ? (
                    <img
                      src={img.filePath}
                      alt={img.fileName || "Image"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground/40">
                      <Download className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2">
                    <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0 bg-black/50 text-white border-0"
                  >
                    {getTypeLabel(img.imageType)}
                  </Badge>
                </div>
                <CardContent className="p-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                    {img.toothNumbers && <Badge variant="outline" className="text-[8px] px-1 py-0 h-3">Dent {img.toothNumbers}</Badge>}
                    {img.createdAt && <span className="truncate">{format(new Date(img.createdAt), "dd/MM/yyyy")}</span>}
                  </div>
                  {img.clinicalNote && (
                    <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{img.clinicalNote}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewerIndex !== null && (
        <ImageViewer
          images={images}
          currentIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
