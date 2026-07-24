import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, Download, Trash2, Save, Edit3 } from "lucide-react";
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
  { value: " ", label: "Aucune" },
  ...([18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38,55,54,53,52,51,61,62,63,64,65,85,84,83,82,81,71,72,73,74,75]
    .map((t) => ({ value: String(t), label: `Dent ${t}` }))),
];

interface ImageViewerProps {
  images: any[];
  currentIndex: number;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: any) => void;
}

export function ImageViewer({ images, currentIndex, onClose, onDelete, onUpdate }: ImageViewerProps) {
  const [index, setIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const image = images[index];

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [index]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const isImage = image?.mimeType?.startsWith("image/");
  const isPDF = image?.mimeType === "application/pdf";

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = image.filePath;
    a.download = image.fileName || "image";
    a.click();
  };

  const handleDelete = () => {
    if (!confirm("Supprimer cette image ?")) return;
    onDelete(image.id);
    if (images.length <= 1) onClose();
    else if (index >= images.length - 1) setIndex((i) => i - 1);
  };

  const startEdit = () => {
    setEditData({
      imageType: image.imageType,
      toothNumbers: image.toothNumbers || "",
      clinicalNote: image.clinicalNote || "",
      tags: image.tags || "",
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    try {
      await onUpdate(image.id, editData);
      setEditing(false);
      toast.success("Image mise \u00e0 jour");
    } catch {
      toast.error("Erreur de mise \u00e0 jour");
    }
  };

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-white/10">
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <span className="font-medium">{image.fileName || "Image"}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/60">{index + 1}/{images.length}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/60">{IMAGE_TYPES.find((t) => t.value === image.imageType)?.label || image.imageType}</span>
          {image.toothNumbers && (
            <>
              <span className="text-white/40">|</span>
              <span className="text-white/60">Dent {image.toothNumbers}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white transition-colors duration-200" onClick={startEdit} title="Modifier">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white transition-colors duration-200" onClick={handleZoomOut} title="Zoom -">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-white/60 text-xs w-8 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white transition-colors duration-200" onClick={handleZoomIn} title="Zoom +">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white transition-colors duration-200" onClick={toggleFullscreen} title="Plein \u00e9cran">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white transition-colors duration-200" onClick={handleDownload} title="T\u00e9l\u00e9charger">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 transition-colors duration-200" onClick={handleDelete} title="Supprimer">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white transition-colors duration-200" onClick={onClose} title="Fermer">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Prev/Next arrows */}
        {images.length > 1 && (
          <>
            <Button variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-10 p-0 text-white/40 hover:text-white hover:bg-white/10 z-10 transition-colors duration-200" onClick={goPrev}>
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-10 p-0 text-white/40 hover:text-white hover:bg-white/10 z-10 transition-colors duration-200" onClick={goNext}>
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {isImage ? (
          <img
            src={image.filePath}
            alt={image.fileName || "Image"}
            className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
            style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, cursor: isDragging ? "grabbing" : "grab" }}
            draggable={false}
          />
        ) : isPDF ? (
          <iframe src={image.filePath} className="w-full h-full" title={image.fileName} />
        ) : (
          <div className="text-white/60 text-center">
            <p className="text-sm">{image.fileName || "Fichier"}</p>
            <p className="text-xs text-white/40">{image.mimeType}</p>
            <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={handleDownload}>
              <Download className="h-3 w-3 mr-1" /> T\u00e9l\u00e9charger
            </Button>
          </div>
        )}
      </div>

      {/* Bottom info / edit panel */}
      <div className="bg-black/60 border-t border-white/10 px-4 py-2 max-h-[200px] overflow-y-auto">
        {editing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="space-y-0.5">
                <label className="text-[10px] text-white/50 uppercase">Type</label>
                <Select value={editData.imageType} onValueChange={(v) => setEditData({ ...editData, imageType: v })}>
                  <SelectTrigger className="h-7 text-xs bg-white/10 border-white/20 text-white w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] text-white/50 uppercase">Dent(s)</label>
                <Input
                  value={editData.toothNumbers}
                  onChange={(e) => setEditData({ ...editData, toothNumbers: e.target.value })}
                  className="h-7 text-xs bg-white/10 border-white/20 text-white w-[100px]"
                  placeholder="26,27"
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] text-white/50 uppercase">Tags</label>
                <Input
                  value={editData.tags}
                  onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                  className="h-7 text-xs bg-white/10 border-white/20 text-white w-[150px]"
                  placeholder="carie, couronne"
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] text-white/50 uppercase">Note clinique</label>
              <Textarea
                value={editData.clinicalNote}
                onChange={(e) => setEditData({ ...editData, clinicalNote: e.target.value })}
                className="min-h-[50px] text-xs bg-white/10 border-white/20 text-white resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" className="h-7 text-xs text-white/60" onClick={() => setEditing(false)}>Annuler</Button>
              <Button size="sm" className="h-7 gap-1 text-xs" onClick={saveEdit}>
                <Save className="h-3 w-3" /> Enregistrer
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-xs text-white/60 flex-wrap">
            {image.createdAt && (
              <span>Date: {format(new Date(image.createdAt), "dd/MM/yyyy HH:mm")}</span>
            )}
            {image.clinicalNote && (
              <span className="italic">Note: {image.clinicalNote}</span>
            )}
            {image.tags && (
              <span>Tags: {image.tags}</span>
            )}
            {image.dentistName && (
              <span>Dr. {image.dentistName}</span>
            )}
            {image.fileSize && (
              <span>Taille: {(image.fileSize / 1024 / 1024).toFixed(1)} MB</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
