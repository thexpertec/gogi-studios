import { PageTransition } from "@/components/layout/PageTransition";
import { interviews } from "@/lib/data";
import { Play } from "lucide-react";
import { Editable } from "@/components/ui/Editable";

export default function Interviews() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-serif font-bold mb-6 text-foreground">
            <Editable id="interviews-page-title">In Conversation</Editable>
          </h1>
          <p className="text-lg text-muted-foreground">
            <Editable id="interviews-page-desc">
              Listen to Ms. Nigar Nazar discuss her journey, the creation of Gogi, and the role of
              art in social change.
            </Editable>
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-video bg-muted relative flex items-center justify-center border-b border-border">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary to-transparent" />
                <div className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-primary transition-all duration-300 z-10">
                  <Play className="w-6 h-6 ml-1" />
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground bg-secondary/20 px-3 py-1 rounded-full">
                    <Editable id={`interview-${interview.id}-type`}>{interview.type}</Editable>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    <Editable id={`interview-${interview.id}-date`}>{interview.date}</Editable>
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-bold group-hover:text-primary transition-colors">
                  <Editable id={`interview-${interview.id}-title`}>{interview.title}</Editable>
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
