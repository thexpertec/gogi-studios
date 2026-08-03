import DomainGalleryPage from "@/pages/DomainGalleryPage";

export default function Merchandise() {
  return (
    <DomainGalleryPage
      domain="shop"
      pageTitle="Shop"
      pageLabel="Merchandise"
      pageDescription="Gogi Studios merchandise, prints, and collectibles."
      emptyMessage="Shop items will appear here once they've been added from the admin panel."
    />
  );
}
