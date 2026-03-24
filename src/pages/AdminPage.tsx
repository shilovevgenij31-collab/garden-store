import AdminLayout from "@/components/admin/AdminLayout";
import ProductsTable from "@/components/admin/ProductsTable";
import OrdersTable from "@/components/admin/OrdersTable";

export default function AdminPage() {
  return (
    <AdminLayout>
      {(tab) => {
        switch (tab) {
          case "products":
            return <ProductsTable />;
          case "orders":
            return <OrdersTable />;
          default:
            return <ProductsTable />;
        }
      }}
    </AdminLayout>
  );
}
