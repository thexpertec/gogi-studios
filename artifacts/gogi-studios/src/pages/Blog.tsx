import DomainGalleryPage from "@/pages/DomainGalleryPage";

export default function Blog() {
  return (
    <DomainGalleryPage
      domain="news"
      pageTitle="Journal & News"
      pageLabel="Latest Updates"
      pageDescription="The latest updates, event recaps, and visual stories from Gogi Studios."
      emptyMessage="News and journal entries will appear here once they've been added from the admin panel."
    />
  );
}
