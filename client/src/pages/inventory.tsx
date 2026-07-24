import Layout from "@/components/layout";
import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Search, Plus, Edit, Trash2, Package, Truck, ClipboardList, AlertTriangle,
  PackagePlus, ArrowUpDown, Eye, X, Loader2, MoreHorizontal, RefreshCw,
  ShoppingCart, Clock, Boxes,
} from "lucide-react";
import {
  useInventoryProducts, useCreateInventoryProduct, useUpdateInventoryProduct, useDeleteInventoryProduct,
  useLowStockProducts, useExpiringProducts,
  useInventorySuppliers, useCreateInventorySupplier, useUpdateInventorySupplier, useDeleteInventorySupplier,
  usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrder,
  useAdjustStock, useInventoryMovements,
  usePurchaseOrderItems, useAddPurchaseOrderItem,
} from "@/hooks/use-api";
import type { InventoryProduct, InventorySupplier, PurchaseOrder, InsertPurchaseOrder, InsertInventoryProduct, InsertInventorySupplier, PurchaseOrderItem } from "@shared/schema";

const defaultProductForm = (): Partial<InsertInventoryProduct> => ({
  name: "", sku: "", category: "", description: "", unit: "piece",
  purchasePrice: "0.00", sellingPrice: "0.00",
  currentStock: 0, minimumStock: 5, maximumStock: 100,
  supplierId: null, expirationDate: null,
});

const defaultSupplierForm = (): Partial<InsertInventorySupplier> => ({
  name: "", contactPerson: "", email: "", phone: "", address: "", notes: "", isActive: true,
});

function stockLevel(current: number, minimum: number) {
  if (minimum <= 0) return "green";
  const ratio = current / minimum;
  if (ratio > 0.5) return "green";
  if (ratio > 0.25) return "amber";
  return "red";
}

function StockIndicator({ current, minimum }: { current: number; minimum: number }) {
  const level = stockLevel(current, minimum);
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-2 w-2 rounded-full",
        level === "green" ? "bg-emerald-500" : level === "amber" ? "bg-amber-500" : "bg-red-500",
      )} />
      <span className={cn(
        "text-sm font-medium",
        level === "green" ? "text-emerald-600" : level === "amber" ? "text-amber-600" : "text-red-600",
      )}>{current}</span>
    </div>
  );
}


export default function Inventory() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("products");

  // Products state
  const { data: products = [], isLoading: productsLoading, isError: productsError, refetch: refetchProducts } = useInventoryProducts();
  const { data: suppliers = [], isLoading: suppliersLoading, isError: suppliersError, refetch: refetchSuppliers } = useInventorySuppliers();
  const { data: lowStock = [], isError: lowStockError, refetch: refetchLowStock } = useLowStockProducts();
  const { data: expiring = [], isError: expiringError, refetch: refetchExpiring } = useExpiringProducts();
  const createProduct = useCreateInventoryProduct();
  const updateProduct = useUpdateInventoryProduct();
  const deleteProduct = useDeleteInventoryProduct();
  const adjustStock = useAdjustStock();

  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("all");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<InsertInventoryProduct>>(defaultProductForm());
  const [deleteProductTarget, setDeleteProductTarget] = useState<string | null>(null);
  const [adjustDialogProduct, setAdjustDialogProduct] = useState<InventoryProduct | null>(null);
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustType, setAdjustType] = useState<"in" | "out">("in");
  const [adjustNotes, setAdjustNotes] = useState("");

  // Suppliers state
  const createSupplier = useCreateInventorySupplier();
  const updateSupplier = useUpdateInventorySupplier();
  const deleteSupplier = useDeleteInventorySupplier();
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierForm, setSupplierForm] = useState<Partial<InsertInventorySupplier>>(defaultSupplierForm());
  const [deleteSupplierTarget, setDeleteSupplierTarget] = useState<string | null>(null);

  // Purchase Orders state
  const { data: orders = [], isLoading: ordersLoading, isError: ordersError, refetch: refetchOrders } = usePurchaseOrders();
  const createOrder = useCreatePurchaseOrder();
  const updateOrder = useUpdatePurchaseOrder();
  const addPOItem = useAddPurchaseOrderItem();
  const [createOrderDialog, setCreateOrderDialog] = useState(false);
  const [orderForm, setOrderForm] = useState<Partial<InsertPurchaseOrder>>({
    orderNumber: "", supplierId: "", status: "draft", totalAmount: "0.00", expectedDate: null, notes: "",
  });
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const { data: orderItems = [] } = usePurchaseOrderItems(viewOrderId || "");
  const [addItemDialog, setAddItemDialog] = useState<{ orderId: string; open: boolean }>({ orderId: "", open: false });
  const [itemForm, setItemForm] = useState({ productId: "", quantity: "1", unitPrice: "0.00" });
  const [orderSearch, setOrderSearch] = useState("");

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];

  const filteredProducts = products.filter(p => {
    const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.sku || "").toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = productCategory === "all" || p.category === productCategory;
    return matchSearch && matchCat;
  });

  const isSavingProduct = createProduct.isPending || updateProduct.isPending;
  const isSavingSupplier = createSupplier.isPending || updateSupplier.isPending;
  const isSavingOrder = createOrder.isPending;

  // ── Product Handlers ──
  const openCreateProduct = () => {
    setEditingProductId(null);
    setProductForm(defaultProductForm());
    setProductDialogOpen(true);
  };

  const openEditProduct = (p: InventoryProduct) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name, sku: p.sku || "", category: p.category || "", description: p.description || "",
      unit: p.unit, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
      currentStock: p.currentStock, minimumStock: p.minimumStock, maximumStock: p.maximumStock,
      supplierId: p.supplierId || null, expirationDate: p.expirationDate ? new Date(p.expirationDate).toISOString().split("T")[0] as any : null,
    });
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) { toast.error(t("common.required")); return; }
    try {
      if (editingProductId) {
        await updateProduct.mutateAsync({ id: editingProductId, data: productForm });
        toast.success(t("common.saved"));
      } else {
        await createProduct.mutateAsync(productForm as InsertInventoryProduct);
        toast.success(t("common.saved"));
      }
      setProductDialogOpen(false);
      setEditingProductId(null);
      setProductForm(defaultProductForm());
    } catch { toast.error(t("common.error")); }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteProductTarget);
      toast.success(t("common.deleted"));
      setDeleteProductTarget(null);
    } catch { toast.error(t("common.error")); }
  };

  const openAdjust = (p: InventoryProduct) => {
    setAdjustDialogProduct(p);
    setAdjustQty(1);
    setAdjustType("in");
    setAdjustNotes("");
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustDialogProduct || adjustQty <= 0) return;
    try {
      await adjustStock.mutateAsync({
        id: adjustDialogProduct.id,
        quantity: adjustQty,
        type: adjustType,
        notes: adjustNotes || undefined,
      });
      toast.success(t("common.saved"));
      setAdjustDialogProduct(null);
    } catch { toast.error(t("common.error")); }
  };

  // ── Supplier Handlers ──
  const openCreateSupplier = () => {
    setEditingSupplierId(null);
    setSupplierForm(defaultSupplierForm());
    setSupplierDialogOpen(true);
  };

  const openEditSupplier = (s: InventorySupplier) => {
    setEditingSupplierId(s.id);
    setSupplierForm({
      name: s.name, contactPerson: s.contactPerson || "", email: s.email || "",
      phone: s.phone || "", address: s.address || "", notes: s.notes || "", isActive: s.isActive,
    });
    setSupplierDialogOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name) { toast.error(t("common.required")); return; }
    try {
      if (editingSupplierId) {
        await updateSupplier.mutateAsync({ id: editingSupplierId, data: supplierForm });
        toast.success(t("common.saved"));
      } else {
        await createSupplier.mutateAsync(supplierForm as InsertInventorySupplier);
        toast.success(t("common.saved"));
      }
      setSupplierDialogOpen(false);
      setEditingSupplierId(null);
      setSupplierForm(defaultSupplierForm());
    } catch { toast.error(t("common.error")); }
  };

  const handleDeleteSupplier = async () => {
    if (!deleteSupplierTarget) return;
    try {
      await deleteSupplier.mutateAsync(deleteSupplierTarget);
      toast.success(t("common.deleted"));
      setDeleteSupplierTarget(null);
    } catch { toast.error(t("common.error")); }
  };

  // ── Order Handlers ──
  const openCreateOrder = () => {
    setOrderForm({
      orderNumber: "PO-" + Date.now().toString(36).toUpperCase(),
      supplierId: "", status: "draft", totalAmount: "0.00", expectedDate: null, notes: "",
    });
    setCreateOrderDialog(true);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.orderNumber || !orderForm.supplierId) { toast.error(t("common.required")); return; }
    try {
      await createOrder.mutateAsync(orderForm as InsertPurchaseOrder);
      toast.success(t("common.saved"));
      setCreateOrderDialog(false);
    } catch { toast.error(t("common.error")); }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.productId || !itemForm.quantity) { toast.error(t("common.required")); return; }
    const qty = parseInt(itemForm.quantity);
    const price = itemForm.unitPrice;
    const total = (qty * parseFloat(price)).toFixed(2);
    try {
      await addPOItem.mutateAsync({
        orderId: addItemDialog.orderId,
        data: {
          productId: itemForm.productId,
          quantity: qty,
          unitPrice: price,
          total,
        },
      });
      toast.success(t("common.saved"));
      setAddItemDialog({ orderId: "", open: false });
      setItemForm({ productId: "", quantity: "1", unitPrice: "0.00" });
    } catch { toast.error(t("common.error")); }
  };

  const filteredOrders = orders.filter(o =>
    !orderSearch ||
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
    (o.supplierName || "").toLowerCase().includes(orderSearch.toLowerCase())
  );

  const today = new Date();

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("inventory.title")}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{t("inventory.subtitle") || "Gérez vos produits, fournisseurs et commandes"}</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="glass-strong border border-border p-1 rounded-xl gap-1">
            <TabsTrigger value="products" className="rounded-lg data-[state=active]:shadow-sm gap-2">
              <Package className="h-4 w-4" /> {t("inventory.products")}
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="rounded-lg data-[state=active]:shadow-sm gap-2">
              <Truck className="h-4 w-4" /> {t("inventory.suppliers")}
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:shadow-sm gap-2">
              <ClipboardList className="h-4 w-4" /> {t("inventory.purchaseOrders")}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:shadow-sm gap-2">
              <AlertTriangle className="h-4 w-4" /> {t("inventory.stockAlerts")}
            </TabsTrigger>
          </TabsList>

          {/* ════════════════════════════════════ PRODUCTS TAB ════════════════════════════════════ */}
          <TabsContent value="products" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t("common.search")} className="ps-9 bg-card" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                </div>
                <Select value={productCategory} onValueChange={setProductCategory}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={t("inventory.category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all") || "Tous"}</SelectItem>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="gap-2 shadow-sm" onClick={openCreateProduct}>
                <Plus className="h-4 w-4" /> {t("inventory.addProduct")}
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-b border-border">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("inventory.name")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("inventory.sku")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("inventory.category")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("inventory.stock")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("inventory.minStock")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("inventory.purchasePrice") || "PA"}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("inventory.sellingPrice") || "PV"}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("inventory.expiration")}</TableHead>
                    <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-12">
                        <div className="flex flex-col gap-4 px-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-12" />
                              <Skeleton className="h-4 w-12" />
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-8 w-24" />
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : productsError ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                          <p className="text-sm text-muted-foreground">{t("common.error") || "Erreur de chargement"}</p>
                          <Button variant="outline" size="sm" onClick={() => refetchProducts()}>
                            <RefreshCw className="h-4 w-4 me-1" /> {t("common.retry") || "Réessayer"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="py-12"><EmptyState icon={<Package />} title="Aucun produit" description="Ajoutez votre premier produit" /></TableCell></TableRow>
                  ) : filteredProducts.map(p => (
                    <TableRow key={p.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <PackagePlus className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{p.name}</p>
                            {p.description && <p className="text-xs text-muted-foreground truncate max-w-[180px]">{p.description}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">{p.sku || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.category ? <Badge variant="outline" className="text-xs font-medium">{p.category}</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <StockIndicator current={p.currentStock} minimum={p.minimumStock} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{p.minimumStock}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm font-medium">{parseFloat(p.purchasePrice).toLocaleString()} DA</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm font-medium">{parseFloat(p.sellingPrice).toLocaleString()} DA</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {p.expirationDate ? (
                          <span className={cn(new Date(p.expirationDate) <= today ? "text-red-600 font-medium" : "")}>
                            {new Date(p.expirationDate).toLocaleDateString()}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("inventory.adjustStock")} aria-label="Ajuster le stock" onClick={() => openAdjust(p)}>
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("common.edit")} aria-label="Modifier le produit" onClick={() => openEditProduct(p)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title={t("common.delete")} aria-label="Supprimer le produit" onClick={() => setDeleteProductTarget(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════ SUPPLIERS TAB ════════════════════════════════════ */}
          <TabsContent value="suppliers" className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Button className="gap-2 shadow-sm" onClick={openCreateSupplier}>
                <Plus className="h-4 w-4" /> {t("inventory.addSupplier") || "Ajouter un fournisseur"}
              </Button>
            </div>
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-b border-border">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("inventory.name")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("inventory.contactPerson") || "Contact"}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("inventory.email") || "Email"}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("inventory.phone") || "Téléphone"}</TableHead>
                    <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12">
                        <div className="flex flex-col gap-4 px-4">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <Skeleton className="h-4 w-28" />
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-36" />
                              <Skeleton className="h-4 w-28" />
                              <Skeleton className="h-8 w-20" />
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : suppliersError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                          <p className="text-sm text-muted-foreground">{t("common.error") || "Erreur de chargement"}</p>
                          <Button variant="outline" size="sm" onClick={() => refetchSuppliers()}>
                            <RefreshCw className="h-4 w-4 me-1" /> {t("common.retry") || "Réessayer"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : suppliers.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="py-12"><EmptyState icon={<Truck />} title="Aucun fournisseur" description="Ajoutez votre premier fournisseur" /></TableCell></TableRow>
                  ) : suppliers.map(s => (
                    <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-sm font-semibold">{s.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.contactPerson || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{s.email || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{s.phone || "—"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("common.edit")} aria-label="Modifier le fournisseur" onClick={() => openEditSupplier(s)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title={t("common.delete")} aria-label="Supprimer le fournisseur" onClick={() => setDeleteSupplierTarget(s.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════ PURCHASE ORDERS TAB ════════════════════════════════════ */}
          <TabsContent value="orders" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("common.search")} className="ps-9 bg-card" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
              </div>
              <Button className="gap-2 shadow-sm" onClick={openCreateOrder}>
                <Plus className="h-4 w-4" /> {t("inventory.createOrder") || "Nouveau bon"}
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-b border-border">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("inventory.orderNumber") || "N° Commande"}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("inventory.suppliers")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("inventory.status") || "Statut"}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("inventory.total") || "Total"}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("inventory.expectedDate") || "Date prévue"}</TableHead>
                    <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12">
                        <div className="flex flex-col gap-4 px-4">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <Skeleton className="h-4 w-28" />
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-8 w-20" />
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : ordersError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                          <p className="text-sm text-muted-foreground">{t("common.error") || "Erreur de chargement"}</p>
                          <Button variant="outline" size="sm" onClick={() => refetchOrders()}>
                            <RefreshCw className="h-4 w-4 me-1" /> {t("common.retry") || "Réessayer"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="py-12"><EmptyState icon={<ShoppingCart />} title="Aucun bon de commande" description="Créez votre premier bon de commande" /></TableCell></TableRow>
                  ) : filteredOrders.map(o => (
                    <TableRow key={o.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-sm font-mono font-semibold">{o.orderNumber}</TableCell>
                      <TableCell className="text-sm">{o.supplierName || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <StatusBadge status={o.status.charAt(0).toUpperCase() + o.status.slice(1)} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm font-medium">{parseFloat(o.totalAmount).toLocaleString()} DA</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {o.expectedDate ? new Date(o.expectedDate).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("common.view")} aria-label="Voir la commande" onClick={() => setViewOrderId(o.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("inventory.addItem") || "Ajouter article"} aria-label="Ajouter un article" onClick={() => { setAddItemDialog({ orderId: o.id, open: true }); setItemForm({ productId: "", quantity: "1", unitPrice: "0.00" }); }}>
                            <PackagePlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════ STOCK ALERTS TAB ════════════════════════════════════ */}
          <TabsContent value="alerts" className="mt-6 space-y-6">
            <Card className="card-hover">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold tracking-tight">{t("inventory.lowStock")}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{lowStock.length} {t("inventory.product") || "produit(s)"} {t("inventory.belowMinStock") || "en dessous du stock minimum"}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {lowStock.length === 0 ? (
                  <EmptyState icon={<AlertTriangle />} title="Aucun stock faible" description="Tous les stocks sont suffisants" />
                ) : (
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-2">
                      {lowStock.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 font-semibold">
                              {t("inventory.lowStock")}
                            </Badge>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.sku || ""} {p.sku && p.category ? "·" : ""} {p.category || ""}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-600">{p.currentStock}</p>
                            <p className="text-xs text-muted-foreground">{t("inventory.minStock")}: {p.minimumStock}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold tracking-tight">{t("inventory.expiring")}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{expiring.length} {t("inventory.product") || "produit(s)"} {t("inventory.expiringSoon") || "expire(nt) bientôt"}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {expiring.length === 0 ? (
                  <EmptyState icon={<Clock />} title="Aucun produit expiré" description="Aucun produit expiré détecté" />
                ) : (
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-2">
                      {expiring.map(p => {
                        const daysLeft = p.expirationDate ? Math.ceil((new Date(p.expirationDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                        return (
                          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">
                                {t("inventory.expiring")}
                              </Badge>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                                <p className="text-xs text-muted-foreground">{p.sku || ""}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={cn("text-sm font-bold", daysLeft !== null && daysLeft <= 0 ? "text-red-600" : "text-amber-600")}>
                                {daysLeft !== null ? `${daysLeft} j` : "—"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {p.expirationDate ? new Date(p.expirationDate).toLocaleDateString() : "—"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ════════════════════════════════════ PRODUCT DIALOG ════════════════════════════════════ */}
        <Dialog open={productDialogOpen} onOpenChange={(o) => { if (!o) { setProductDialogOpen(false); setEditingProductId(null); } }}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto p-0 gap-0">
            <div className="p-5 pb-4 border-b border-border">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">
                  {editingProductId ? t("common.edit") : t("inventory.addProduct")}
                </DialogTitle>
              </DialogHeader>
            </div>
            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.name")} *</Label>
                  <Input value={productForm.name || ""} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.sku")}</Label>
                  <Input value={productForm.sku || ""} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.category")}</Label>
                <Select value={productForm.category || ""} onValueChange={(v) => setProductForm({ ...productForm, category: v })}>
                  <SelectTrigger><SelectValue placeholder={t("inventory.category")} /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    <SelectItem value="__custom__">{t("common.other") || "Autre"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.description") || "Description"}</Label>
                <Input value={productForm.description || ""} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.unit")}</Label>
                  <Input value={productForm.unit || "piece"} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.purchasePrice") || "PA"}</Label>
                  <Input type="number" step="0.01" value={productForm.purchasePrice || "0.00"} onChange={(e) => setProductForm({ ...productForm, purchasePrice: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.sellingPrice") || "PV"}</Label>
                  <Input type="number" step="0.01" value={productForm.sellingPrice || "0.00"} onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.stock")}</Label>
                  <Input type="number" value={productForm.currentStock ?? 0} onChange={(e) => setProductForm({ ...productForm, currentStock: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.minStock")}</Label>
                  <Input type="number" value={productForm.minimumStock ?? 5} onChange={(e) => setProductForm({ ...productForm, minimumStock: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.maxStock") || "Stock max"}</Label>
                  <Input type="number" value={productForm.maximumStock ?? 100} onChange={(e) => setProductForm({ ...productForm, maximumStock: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.suppliers")}</Label>
                <Select value={productForm.supplierId || ""} onValueChange={(v) => setProductForm({ ...productForm, supplierId: v || null })}>
                  <SelectTrigger><SelectValue placeholder={t("inventory.selectSupplier") || "Sélectionner un fournisseur"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("common.none") || "Aucun"}</SelectItem>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.expiration")}</Label>
                <Input type="date" value={productForm.expirationDate ? new Date(productForm.expirationDate).toISOString().split("T")[0] : ""} onChange={(e) => setProductForm({ ...productForm, expirationDate: e.target.value ? new Date(e.target.value).toISOString() as any : null })} />
              </div>
              <DialogFooter className="gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => { setProductDialogOpen(false); setEditingProductId(null); }}>
                  <X className="h-4 w-4 me-1" /> {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSavingProduct}>
                  {isSavingProduct ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════ ADJUST STOCK DIALOG ════════════════════════════════════ */}
        <Dialog open={!!adjustDialogProduct} onOpenChange={(o) => { if (!o) setAdjustDialogProduct(null); }}>
          <DialogContent className="sm:max-w-[400px] p-0 gap-0">
            <div className="p-5 pb-4 border-b border-border">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{t("inventory.adjustStock")}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground mt-1">{adjustDialogProduct?.name}</p>
            </div>
            <form onSubmit={handleAdjustStock} className="p-5 space-y-4">
              <div className="flex gap-3">
                <Button type="button" variant={adjustType === "in" ? "default" : "outline"} className="flex-1" onClick={() => setAdjustType("in")}>
                  {t("inventory.stockIn") || "Entrée"}
                </Button>
                <Button type="button" variant={adjustType === "out" ? "default" : "outline"} className="flex-1" onClick={() => setAdjustType("out")}>
                  {t("inventory.stockOut") || "Sortie"}
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.quantity") || "Quantité"}</Label>
                <Input type="number" min="1" value={adjustQty} onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.notes") || "Notes"}</Label>
                <Input value={adjustNotes} onChange={(e) => setAdjustNotes(e.target.value)} placeholder={t("inventory.notesPlaceholder") || "Raison de l'ajustement"} />
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setAdjustDialogProduct(null)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={adjustStock.isPending}>
                  {adjustStock.isPending ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════ SUPPLIER DIALOG ════════════════════════════════════ */}
        <Dialog open={supplierDialogOpen} onOpenChange={(o) => { if (!o) { setSupplierDialogOpen(false); setEditingSupplierId(null); } }}>
          <DialogContent className="sm:max-w-[500px] p-0 gap-0">
            <div className="p-5 pb-4 border-b border-border">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">
                  {editingSupplierId ? t("common.edit") : t("inventory.addSupplier") || "Ajouter un fournisseur"}
                </DialogTitle>
              </DialogHeader>
            </div>
            <form onSubmit={handleSaveSupplier} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.name")} *</Label>
                <Input value={supplierForm.name || ""} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.contactPerson") || "Contact"}</Label>
                <Input value={supplierForm.contactPerson || ""} onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.email") || "Email"}</Label>
                  <Input type="email" value={supplierForm.email || ""} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.phone") || "Téléphone"}</Label>
                  <Input value={supplierForm.phone || ""} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.address") || "Adresse"}</Label>
                <Input value={supplierForm.address || ""} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.notes") || "Notes"}</Label>
                <Input value={supplierForm.notes || ""} onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })} />
              </div>
              <DialogFooter className="gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => { setSupplierDialogOpen(false); setEditingSupplierId(null); }}>
                  <X className="h-4 w-4 me-1" /> {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSavingSupplier}>
                  {isSavingSupplier ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════ CREATE ORDER DIALOG ════════════════════════════════════ */}
        <Dialog open={createOrderDialog} onOpenChange={(o) => { if (!o) setCreateOrderDialog(false); }}>
          <DialogContent className="sm:max-w-[500px] p-0 gap-0">
            <div className="p-5 pb-4 border-b border-border">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{t("inventory.createOrder") || "Nouveau bon de commande"}</DialogTitle>
              </DialogHeader>
            </div>
            <form onSubmit={handleCreateOrder} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.orderNumber") || "N° Commande"} *</Label>
                <Input value={orderForm.orderNumber || ""} onChange={(e) => setOrderForm({ ...orderForm, orderNumber: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.suppliers")} *</Label>
                <Select value={orderForm.supplierId || ""} onValueChange={(v) => setOrderForm({ ...orderForm, supplierId: v })}>
                  <SelectTrigger><SelectValue placeholder={t("inventory.selectSupplier") || "Sélectionner un fournisseur"} /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.expectedDate") || "Date prévue"}</Label>
                <Input type="date" value={orderForm.expectedDate ? new Date(orderForm.expectedDate).toISOString().split("T")[0] : ""} onChange={(e) => setOrderForm({ ...orderForm, expectedDate: e.target.value ? new Date(e.target.value).toISOString() as any : null })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.notes") || "Notes"}</Label>
                <Input value={orderForm.notes || ""} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} />
              </div>
              <DialogFooter className="gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setCreateOrderDialog(false)}>
                  <X className="h-4 w-4 me-1" /> {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSavingOrder}>
                  {isSavingOrder ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════ VIEW ORDER ITEMS DIALOG ════════════════════════════════════ */}
        <Dialog open={!!viewOrderId} onOpenChange={(o) => { if (!o) setViewOrderId(null); }}>
          <DialogContent className="sm:max-w-[500px] p-0 gap-0">
            <div className="p-5 pb-4 border-b border-border flex items-center justify-between">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{t("inventory.orderItems") || "Articles de la commande"}</DialogTitle>
              </DialogHeader>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewOrderId(null)} aria-label="Fermer">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5">
              {orderItems.length === 0 ? (
                <EmptyState icon={<Boxes />} title="Aucun article" description="Ajoutez des articles à l'inventaire" />
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.productName || item.productId}</p>
                        <p className="text-xs text-muted-foreground">{t("inventory.quantity") || "Qté"}: {item.quantity} × {parseFloat(item.unitPrice).toLocaleString()} DA</p>
                      </div>
                      <p className="text-sm font-bold">{parseFloat(item.total).toLocaleString()} DA</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <Button variant="outline" onClick={() => setViewOrderId(null)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════ ADD ITEM TO ORDER DIALOG ════════════════════════════════════ */}
        <Dialog open={addItemDialog.open} onOpenChange={(o) => { if (!o) setAddItemDialog({ orderId: "", open: false }); }}>
          <DialogContent className="sm:max-w-[400px] p-0 gap-0">
            <div className="p-5 pb-4 border-b border-border">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{t("inventory.addItem") || "Ajouter un article"}</DialogTitle>
              </DialogHeader>
            </div>
            <form onSubmit={handleAddItem} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("inventory.product") || "Produit"} *</Label>
                <Select value={itemForm.productId} onValueChange={(v) => setItemForm({ ...itemForm, productId: v })}>
                  <SelectTrigger><SelectValue placeholder={t("inventory.selectProduct") || "Sélectionner un produit"} /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.quantity") || "Quantité"}</Label>
                  <Input type="number" min="1" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("inventory.unitPrice") || "Prix unitaire"}</Label>
                  <Input type="number" step="0.01" value={itemForm.unitPrice} onChange={(e) => {
                    const price = e.target.value;
                    setItemForm({ ...itemForm, unitPrice: price });
                  }} />
                </div>
              </div>
              {itemForm.productId && itemForm.quantity && itemForm.unitPrice && (
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("inventory.total") || "Total"}</p>
                  <p className="text-lg font-bold">{(parseInt(itemForm.quantity) * parseFloat(itemForm.unitPrice || "0")).toLocaleString()} DA</p>
                </div>
              )}
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setAddItemDialog({ orderId: "", open: false })}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={addPOItem.isPending}>
                  {addPOItem.isPending ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ════════════════════════════════════ CONFIRM DIALOGS ════════════════════════════════════ */}
        <ConfirmDialog
          open={!!deleteProductTarget}
          onOpenChange={(o) => { if (!o) setDeleteProductTarget(null); }}
          title={t("common.delete") || "Supprimer"}
          description={t("inventory.confirmDeleteProduct") || "Êtes-vous sûr de vouloir supprimer ce produit ?"}
          confirmLabel={t("common.delete")}
          variant="destructive"
          loading={deleteProduct.isPending}
          onConfirm={handleDeleteProduct}
        />

        <ConfirmDialog
          open={!!deleteSupplierTarget}
          onOpenChange={(o) => { if (!o) setDeleteSupplierTarget(null); }}
          title={t("common.delete") || "Supprimer"}
          description={t("inventory.confirmDeleteSupplier") || "Êtes-vous sûr de vouloir supprimer ce fournisseur ?"}
          confirmLabel={t("common.delete")}
          variant="destructive"
          loading={deleteSupplier.isPending}
          onConfirm={handleDeleteSupplier}
        />
      </div>
    </Layout>
  );
}
