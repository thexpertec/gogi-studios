import { PageTransition } from "@/components/layout/PageTransition";
import { services } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { Editable } from "@/components/ui/Editable";

const DEFAULT_EMAIL = "info@gogistudios.com";

const orgTypes = [
  "UN Agency / INGO",
  "Local NGO",
  "Government Department",
  "Educational Institution",
  "Corporate / CSR",
  "Media / Publisher",
  "Other",
];

const budgetRanges = [
  "Under $2,000",
  "$2,000 – $10,000",
  "$10,000 – $50,000",
  "$50,000 – $100,000",
  "$100,000+",
  "To be discussed",
];

const timelines = [
  "Urgent (under 2 weeks)",
  "1 – 3 months",
  "3 – 6 months",
  "6 months+",
  "Ongoing engagement",
];

const processSteps = [
  {
    icon: MessageSquare,
    title: "Submit your brief",
    body: "Fill in the form below — takes under 5 minutes. Tell us your goal, audience, and timeline.",
  },
  {
    icon: Clock,
    title: "48-hour response",
    body: "Our team reviews your brief and responds within 48 hours with questions or a draft proposal.",
  },
  {
    icon: CheckCircle,
    title: "Proposal & kickoff",
    body: "Once aligned on scope and fees, we sign off and begin. Most projects start within two weeks.",
  },
];

type FormState = {
  name: string;
  email: string;
  organisation: string;
  orgType: string;
  serviceInterest: string;
  projectDescription: string;
  budget: string;
  timeline: string;
};

const empty: FormState = {
  name: "",
  email: "",
  organisation: "",
  orgType: "",
  serviceInterest: "",
  projectDescription: "",
  budget: "",
  timeline: "",
};

export default function Hire() {
  const [form, setForm] = useState<FormState>(empty);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [contactEmail, setContactEmail] = useState(DEFAULT_EMAIL);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => { if (d.email) setContactEmail(d.email); }).catch(() => {});
    const handler = (e: Event) => { const d = (e as CustomEvent).detail; if (d?.email) setContactEmail(d.email); };
    window.addEventListener("settings-updated", handler);
    return () => window.removeEventListener("settings-updated", handler);
  }, []);

  function validate() {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.organisation.trim()) e.organisation = "Required";
    if (!form.orgType) e.orgType = "Please select";
    if (!form.serviceInterest) e.serviceInterest = "Please select";
    if (!form.projectDescription.trim() || form.projectDescription.trim().length < 20)
      e.projectDescription = "Please provide at least a brief description";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
  }

  function field(id: keyof FormState, label: string, required = true) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-semibold">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        <input
          id={id}
          type={id === "email" ? "email" : "text"}
          value={form[id]}
          onChange={(e) => setForm({ ...form, [id]: e.target.value })}
          className={`rounded-xl border px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            errors[id] ? "border-red-400" : "border-border"
          }`}
          data-testid={`input-hire-${id}`}
        />
        {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
      </div>
    );
  }

  function select(id: keyof FormState, label: string, options: string[]) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-semibold">
          {label} <span className="text-primary">*</span>
        </label>
        <select
          id={id}
          value={form[id]}
          onChange={(e) => setForm({ ...form, [id]: e.target.value })}
          className={`rounded-xl border px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            errors[id] ? "border-red-400" : "border-border"
          }`}
          data-testid={`select-hire-${id}`}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
      </div>
    );
  }

  if (submitted) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 max-w-2xl text-center py-20">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4">Brief received!</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Thank you, {form.name}. We'll review your project brief and respond within 48 hours with
            next steps.
          </p>
          <Button
            onClick={() => {
              setForm(empty);
              setSubmitted(false);
            }}
            variant="outline"
            className="rounded-full px-8"
          >
            Submit another brief
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            <Editable id="hire-page-label">Commission a Project</Editable>
          </p>
          <h1 className="text-5xl font-serif font-bold mb-6 text-foreground">
            <Editable id="hire-page-title">Let's Work Together</Editable>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            <Editable id="hire-page-desc">
              Tell us about your programme, campaign, or training need. We'll respond within 48
              hours with a tailored proposal.
            </Editable>
          </p>
        </header>

        {/* Process Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {processSteps.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Form + sidebar */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 flex flex-col gap-6"
            noValidate
            data-testid="form-hire"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              {field("name", "Your name")}
              {field("email", "Work email")}
            </div>
            {field("organisation", "Organisation")}
            {select("orgType", "Organisation type", orgTypes)}
            {select("serviceInterest", "Primary service interest", services.map((s) => s.title))}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="projectDescription" className="text-sm font-semibold">
                Project description <span className="text-primary">*</span>
              </label>
              <textarea
                id="projectDescription"
                rows={5}
                value={form.projectDescription}
                onChange={(e) => setForm({ ...form, projectDescription: e.target.value })}
                placeholder="Tell us about your target audience, communication goal, and any existing materials…"
                className={`rounded-xl border px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none ${
                  errors.projectDescription ? "border-red-400" : "border-border"
                }`}
                data-testid="textarea-hire-projectDescription"
              />
              {errors.projectDescription && (
                <p className="text-xs text-red-500">{errors.projectDescription}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {select("budget", "Estimated budget", budgetRanges)}
              {select("timeline", "Project timeline", timelines)}
            </div>

            <Button
              type="submit"
              size="lg"
              className="rounded-full bg-primary text-white hover:bg-primary/90 px-10 font-semibold self-start"
              data-testid="button-hire-submit"
            >
              Send Brief <Mail className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8">
            <div className="bg-muted/40 rounded-2xl p-6 border border-border/40">
              <h3 className="font-serif font-bold text-lg mb-3">
                <Editable id="hire-sidebar-title">Prefer to email directly?</Editable>
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                <Editable id="hire-sidebar-desc">
                  Reach us at info@gogistudios.com — we respond to every inquiry within two
                  business days.
                </Editable>
              </p>
              <a href={`mailto:${contactEmail}`}>
                <Button variant="outline" size="sm" className="rounded-full w-full">
                  <Mail className="w-4 h-4 mr-2" /> Email Us
                </Button>
              </a>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
              <h3 className="font-serif font-bold text-lg mb-3">
                <Editable id="hire-sidebar-trust-title">Why Gogi Studios?</Editable>
              </h3>
              <ul className="space-y-3">
                {[
                  "45+ years of cultural authority",
                  "UN, INGO & government track record",
                  "End-to-end: strategy to delivery",
                  "Multilingual content capability",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
