import Layout from "@/components/layout";
import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { StockIndicator } from "@/components/inventory/stock-indicator";
import { TableSkeletonRows } from "@/components/inventory/table-skeleton";
import { TableErrorRows } from "@/components/inventory/table-error";
import { ProductFormDialog } from "@/components/inventory/product-form-dialog";
import { SupplierFormDialog } from "@/components/inventory/supplier-form-dialog";
import { StockAdjustDialog } from "@/components/inventory/stock-adjust-dialog";
import { OrderFormDialog } from "@/components/inventory/order-form-dialog";
import { OrderItemsDialog, AddItemDialog } from "@/components/inventory/order-item-dialogs";
import { StockAlertsTab } from "@/components/inventory/stock-alerts-tab";
import {
  Search, Plus, Edit, Trash2, Package, Truck, ClipboardList, AlertTriangle,
  PackagePlus, ArrowUpDown, Eye, RefreshCw,
  ShoppingCart,
} from "lucide-react";
import {
  useInventoryProducts, useDeleteInventoryProduct,
  useInventorySuppliers, useDeleteInventorySupplier,
  usePurchaseOrders,
} from "@/hooks/use-api";

export default function Inventory() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("products");

  const { data: products = [], isLoading: productsLoading, isError: productsError, refetch: refetchProducts } = useInventoryProducts();
  const { data: suppliers = [], isLoading: suppliersLoading, isError: suppliersError, refetch: refetchSuppliers } = useInventorySuppliers();
  const { data: orders = [], isLoading: ordersLoading, isError: ordersError, refetch: refetchOrders } = usePurchaseOrders();
  const deleteProduct = useDeleteInventoryProduct();
  const deleteSupplier = useDeleteInventorySupplier();

  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("all");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<string | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<typeof products[0] | null>(null);

  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [deleteSupplierTarget, setDeleteSupplierTarget] = useState<string | null>(null);

  const [orderSearch, setOrderSearch] = useState("");
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [addItem, setAddItem] = useState<{ orderId: string; open: boolean }>({ orderId: "", open: false });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];

  const filteredProducts = products.filter(p => {
    const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.sku || "").toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = productCategory === "all" || p.category === productCategory;
    return matchSearch && matchCat;
  });

  const filteredOrders = orders.filter(o =>
    !orderSearch ||
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
    (o.supplierName || "").toLowerCase().includes(orderSearch.toLowerCase())
  );

  const editingProduct = editingProductId ? products.find(p => p.id === editingProductId) ?? null : null;
  const editingSupplier = editingSupplierId ? suppliers.find(s => s.id === editingSupplierId) ?? null : null;
  const today = new Date();

  const handleDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteProductTarget);
      toast.success(t("common.deleted"));
      setDeleteProductTarget(null);
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

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("inventory.title")}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{t("inventory.subtitle") || "GÃ©rez vos produits, fournisseurs et commandes"}</p>
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
              <Button className="gap-2 shadow-sm cursor-pointer" onClick={() => { setEditingProductId(null); setProductDialogOpen(true); }}>
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
                        <TableSkeletonRows rows={5} classes={["h-4 w-32", "h-4 w-20", "h-4 w-24", "h-4 w-12", "h-4 w-12", "h-4 w-16", "h-4 w-16", "h-4 w-20", "h-8 w-24"]} />
                      </TableCell>
                    </TableRow>
                  ) : productsError ? (
                    <TableErrorRows colSpan={9} onRetry={() => refetchProducts()} />
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
                      <TableCell className="text-sm font-mono text-muted-foreground">{p.sku || "â€”"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.category ? <Badge variant="outline" className="text-xs font-medium">{p.category}</Badge> : <span className="text-muted-foreground">â€”</span>}
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
                        ) : "â€”"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("inventory.adjustStock")} aria-label="Ajuster le stock" onClick={() => setAdjustProduct(p)}>
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("common.edit")} aria-label="Modifier le produit" onClick={() => { setEditingProductId(p.id); setProductDialogOpen(true); }}>
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

          <TabsContent value="suppliers" className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Button className="gap-2 shadow-sm cursor-pointer" onClick={() => { setEditingSupplierId(null); setSupplierDialogOpen(true); }}>
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
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("inventory.phone") || "TÃ©lÃ©phone"}</TableHead>
                    <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12">
                        <TableSkeletonRows rows={4} classes={["h-4 w-28", "h-4 w-24", "h-4 w-36", "h-4 w-28", "h-8 w-20"]} />
                      </TableCell>
                    </TableRow>
                  ) : suppliersError ? (
                    <TableErrorRows colSpan={5} onRetry={() => refetchSuppliers()} />
                  ) : suppliers.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="py-12"><EmptyState icon={<Truck />} title="Aucun fournisseur" description="Ajoutez votre premier fournisseur" /></TableCell></TableRow>
                  ) : suppliers.map(s => (
                    <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-sm font-semibold">{s.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.contactPerson || "â€”"}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{s.email || "â€”"}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{s.phone || "â€”"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("common.edit")} aria-label="Modifier le fournisseur" onClick={() => { setEditingSupplierId(s.id); setSupplierDialogOpen(true); }}>
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

          <TabsContent value="orders" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("common.search")} className="ps-9 bg-card" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
              </div>
              <Button className="gap-2 shadow-sm cursor-pointer" onClick={() => setCreateOrderOpen(true)}>
                <Plus className="h-4 w-4" /> {t("inventory.createOrder") || "Nouveau bon"}
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-b border-border">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("inventory.orderNumber") || "NÂ° Commande"}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("inventory.suppliers")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("inventory.status") || "Statut"}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("inventory.total") || "Total"}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("inventory.expectedDate") || "Date prÃ©vue"}</TableHead>
                    <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12">
                        <TableSkeletonRows rows={4} classes={["h-4 w-28", "h-4 w-32", "h-4 w-20", "h-4 w-16", "h-4 w-24", "h-8 w-20"]} />
                      </TableCell>
                    </TableRow>
                  ) : ordersError ? (
                    <TableErrorRows colSpan={6} onRetry={() => refetchOrders()} />
                  ) : filteredOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="py-12"><EmptyState icon={<ShoppingCart />} title="Aucun bon de commande" description="CrÃ©ez votre premier bon de commande" /></TableCell></TableRow>
                  ) : filteredOrders.map(o => (
                    <TableRow key={o.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-sm font-mono font-semibold">{o.orderNumber}</TableCell>
                      <TableCell className="text-sm">{o.supplierName || "â€”"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <StatusBadge status={o.status.charAt(0).toUpperCase() + o.status.slice(1)} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm font-medium">{parseFloat(o.totalAmount).toLocaleString()} DA</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {o.expectedDate ? new Date(o.expectedDate).toLocaleDateString() : "â€”"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("common.view")} aria-label="Voir la commande" onClick={() => setViewOrderId(o.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("inventory.addItem") || "Ajouter article"} aria-label="Ajouter un article" onClick={() => setAddItem({ orderId: o.id, open: true })}>
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

          <TabsContent value="alerts" className="mt-6">
            <StockAlertsTab />
          </TabsContent>
        </Tabs>

        <ProductFormDialog open={productDialogOpen} onOpenChange={setProductDialogOpen} product={editingProduct} />

        <StockAdjustDialog product={adjustProduct} onClose={() => setAdjustProduct(null)} />

        <SupplierFormDialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen} supplier={editingSupplier} />

        <OrderFormDialog open={createOrderOpen} onOpenChange={setCreateOrderOpen} />

        <OrderItemsDialog orderId={viewOrderId} onClose={() => setViewOrderId(null)} />

        <AddItemDialog orderId={addItem.orderId} open={addItem.open} onOpenChange={(open) => setAddItem({ orderId: "", open })} />

        <ConfirmDialog
          open={!!deleteProductTarget}
          onOpenChange={(o) => { if (!o) setDeleteProductTarget(null); }}
          title={t("common.delete") || "Supprimer"}
          description={t("inventory.confirmDeleteProduct") || "ÃŠtes-vous sÃ»r de vouloir supprimer ce produit ?"}
          confirmLabel={t("common.delete")}
          variant="destructive"
          loading={deleteProduct.isPending}
          onConfirm={handleDeleteProduct}
        />

        <ConfirmDialog
          open={!!deleteSupplierTarget}
          onOpenChange={(o) => { if (!o) setDeleteSupplierTarget(null); }}
          title={t("common.delete") || "Supprimer"}
          description={t("inventory.confirmDeleteSupplier") || "ÃŠtes-vous sÃ»r de vouloir supprimer ce fournisseur ?"}
          confirmLabel={t("common.delete")}
          variant="destructive"
          loading={deleteSupplier.isPending}
          onConfirm={handleDeleteSupplier}
        />
      </div>
    </Layout>
  );
}
