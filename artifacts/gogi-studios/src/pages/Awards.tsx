import { PageTransition } from "@/components/layout/PageTransition";
import { awards } from "@/lib/data";
import { Award } from "lucide-react";
import { Editable } from "@/components/ui/Editable";

export default function Awards() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-serif font-bold mb-6 text-foreground">
            <Editable id="awards-page-title">Awards & Recognitions</Editable>
          </h1>
          <p className="text-lg text-muted-foreground">
            <Editable id="awards-page-desc">
              A testament to a lifetime of dedication to the arts, storytelling, and social advocacy.
            </Editable>
          </p>
        </header>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {awards.map((award, idx) => (
            <div
              key={idx}
              className="group bg-card border border-border rounded-xl p-6 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 flex flex-col items-center text-center justify-center aspect-square"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-semibold text-lg leading-tight">
                <Editable id={`award-${idx}`}>{award}</Editable>
              </h3>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
