import DomainGalleryPage from "@/pages/DomainGalleryPage";

export default function Books() {
  return (
    <DomainGalleryPage
      domain="books"
      pageTitle="Books"
      pageLabel="Publications"
      pageDescription="Illustrated books, manuals, and publications from Gogi Studios."
      emptyMessage="Books and publications will appear here once they've been added from the admin panel."
    />
  );
}
