import { PageTransition } from "@/components/layout/PageTransition";
import { Brush, GraduationCap, Globe2, Bus, Image as ImageIcon } from "lucide-react";
import { Editable } from "@/components/ui/Editable";
import { useState, useEffect } from "react";

interface Project {
  id: string;
  name: string;
  description?: string;
}

const iconMap: Record<string, any> = {
  "1": ImageIcon,
  "2": Bus,
  "3": Brush,
  "4": GraduationCap,
  "5": Globe2,
};

export default function Projects() {
  const [imageMap, setImageMap]   = useState<Record<string, string>>({});
  const [projects, setProjects]   = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/content-images").then((r) => r.json()).then((m) => setImageMap(m ?? {})).catch(() => {});
    fetch("/api/catalog").then((r) => r.json()).then((c) => setProjects(c.projects ?? [])).catch(() => {});

    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.contentImages) setImageMap(d.contentImages);
      if (d?.catalog?.projects) setProjects(d.catalog.projects);
      if (d?.catalogUpdated && d?.catalog) setProjects(d.catalog.projects ?? []);
    };
    window.addEventListener("settings-updated", handler);
    return () => window.removeEventListener("settings-updated", handler);
  }, []);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-serif font-bold mb-6 text-foreground">
            <Editable id="projects-page-title">Featured Projects</Editable>
          </h1>
          <p className="text-lg text-muted-foreground">
            <Editable id="projects-page-desc">
              From comic strips to large-scale public murals and educational outreach, Gogi Studios uses art to educate, inspire, and drive change.
            </Editable>
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const Icon = iconMap[project.id] ?? Brush;
            const artworkUrl = imageMap[`projects/${project.id}`];
            return (
              <div key={project.id}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                {artworkUrl && (
                  <div className="aspect-video overflow-hidden border-b border-border">
                    <img src={artworkUrl} alt={project.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-8">
                  {!artworkUrl && (
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <Icon className="w-7 h-7" />
                    </div>
                  )}
                  <h3 className="text-2xl font-serif font-bold mb-3">{project.name}</h3>
                  {project.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      <Editable id={`project-${project.id}-description`}>{project.description}</Editable>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
