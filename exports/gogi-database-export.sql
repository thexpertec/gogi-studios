--
-- PostgreSQL database dump
--

\restrict EFYEiZ7IQ3Y7krIuf0ivadS0vLpzdRLKoskhoOOhVizbqUkAxZCspBiohO8XPy5

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: catalog_books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalog_books (
    id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    price text DEFAULT ''::text NOT NULL,
    price_usd text DEFAULT ''::text NOT NULL,
    featured boolean DEFAULT false NOT NULL
);


--
-- Name: catalog_merchandise; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalog_merchandise (
    id text NOT NULL,
    name text NOT NULL,
    price text DEFAULT ''::text NOT NULL,
    tag text,
    description text DEFAULT ''::text NOT NULL
);


--
-- Name: catalog_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalog_projects (
    id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL
);


--
-- Name: content_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_overrides (
    id text NOT NULL,
    value text NOT NULL
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id text NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    top_service boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    link_url text
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    company_name text DEFAULT 'Gogi Studios'::text NOT NULL,
    tagline text DEFAULT 'Social Impact Communication — Since 1975'::text NOT NULL,
    footer_description text DEFAULT ''::text NOT NULL,
    copyright_text text DEFAULT ''::text NOT NULL,
    email text DEFAULT ''::text NOT NULL,
    social_links jsonb DEFAULT '[]'::jsonb NOT NULL,
    nav_links jsonb DEFAULT '[]'::jsonb NOT NULL
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id text NOT NULL,
    caption text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: work_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_gallery (
    id text NOT NULL,
    section_slug text NOT NULL,
    sub_category_slug text,
    caption text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    media_type text DEFAULT 'image'::text NOT NULL,
    video_url text
);


--
-- Name: work_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_sections (
    slug text NOT NULL,
    label text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    domain text DEFAULT 'work'::text NOT NULL
);


--
-- Name: work_sub_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_sub_categories (
    slug text NOT NULL,
    label text NOT NULL,
    section_slug text NOT NULL,
    parent_slug text,
    sort_order integer DEFAULT 0 NOT NULL,
    description text
);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Data for Name: catalog_books; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.catalog_books (id, name, description, price, price_usd, featured) FROM stdin;
1	Gogi Goes to School	A heartwarming tale of Gogi's first day navigating school life.	PKR 450	$16	f
2	Gogi and the Water Crisis	Teaching children the importance of water conservation.	PKR 500	$18	f
3	Gogi's Big Adventure	An epic journey exploring the cultural heritage of Pakistan.	PKR 550	$20	f
4	Gogi Saves the Day	Gogi uses wit and humor to solve a community problem.	PKR 450	$16	f
5	Gogi and the Climate	Understanding climate change through the eyes of Gogi.	PKR 500	$18	f
6	The Complete Gogi Collection	All five iconic Gogi books in one beautiful boxed set — the perfect gift.	PKR 2,000	$72	t
\.


--
-- Data for Name: catalog_merchandise; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.catalog_merchandise (id, name, price, tag, description) FROM stdin;
1	Gogi Classic Tote Bag	$25	Best Seller	Sturdy canvas tote with the iconic Gogi character print.
2	Gogi Enamel Pin Set	$15	\N	Set of 4 collectible enamel pins featuring Gogi expressions.
3	Gogi Studios Art Print	$40	Popular	Museum-quality 8x10 art print, ready to frame.
4	Gogi Coffee Mug	$20	\N	Start your morning with Gogi. Ceramic, dishwasher-safe.
5	Gogi Notebook	$18	\N	Ruled notebook with illustrated Gogi cover art, 160 pages.
6	Gogi Sticker Pack	$10	New	12 high-quality vinyl stickers — waterproof and vibrant.
7	Gogi Tee — Classic Black	$35	New	100% cotton unisex tee with embroidered Gogi Studios logo.
8	Gogi Gift Bundle	$75	Gift Idea	Tote, mug, sticker pack and art print — everything Gogi in one box.
\.


--
-- Data for Name: catalog_projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.catalog_projects (id, name, description) FROM stdin;
1	"Gogi" Comic Strip Series	Pakistan's longest-running female-led comic strip
2	Bus No.1 Campaign	Climate change awareness through art on public transport
3	NUST Mural Project	Large-scale campus artwork inspiring students
4	Beaconhouse School Program	Art education outreach for the next generation
5	UN SDG Awareness Campaign	Sustainable development through illustration and storytelling
\.


--
-- Data for Name: content_overrides; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_overrides (id, value) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, title, description, top_service, sort_order, link_url) FROM stdin;
s16	Character Development & Mascot Creation	Original character design for NGOs, educational institutions, and brands — creating memorable mascots that carry your message across campaigns, years, and audiences.	f	15	\N
s7	Child Protection & Safety Awareness Content	Child-safe, age-appropriate illustrated materials that teach children about personal boundaries, online safety, and how to seek help — aligned with international child protection frameworks.	f	6	\N
s8	Women's Empowerment Campaigns	Culturally grounded campaign content that celebrates and advances women's rights, economic participation, and leadership — with the credibility of Pakistan's most iconic female cartoonist.	f	7	\N
s9	Teacher Training Through Visual Learning	Capacity-building programs that train teachers to use visual and creative learning methods — improving student engagement and learning outcomes in under-resourced classrooms.	f	8	\N
s10	Youth Engagement Programs	Interactive programs — workshops, campaigns, and creative challenges — that engage young people on issues of climate, civic life, mental health, and rights.	f	9	\N
s11	Health Awareness Campaigns	Illustrated health communication for hospitals, government health departments, and WHO-aligned projects — covering maternal health, nutrition, vaccination, and epidemic awareness.	f	10	\N
s12	Environmental Awareness Campaigns	Compelling illustrated campaigns on water conservation, pollution, deforestation, and climate change — designed to move both children and adults to action.	f	11	\N
s13	Community Mobilisation Campaigns	Locally resonant illustrated campaigns that activate communities around development goals — designed to work in low-literacy and rural contexts.	f	12	\N
s17	Creative Writing & Storytelling Programs	Facilitated creative programs that develop storytelling skills among school students, university youth, and community members — blending writing with illustration.	f	16	\N
s18	Public Awareness Posters & Infographics	Eye-catching illustrated posters and data-driven infographics for NGOs, government agencies, and CSR departments — designed for both print and digital distribution.	f	17	\N
s19	Social Impact Communication Strategy	End-to-end communication strategy for development organisations — from audience analysis and message design to channel selection and content calendar planning.	f	18	\N
s20	Speaking Engagements & Keynote Sessions	Keynote presentations and panel appearances by Ms. Nigar Nazar — covering social impact through art, women in creative fields, and 50+ years of storytelling for change.	f	19	\N
s1	Cartoon-Based Social Awareness Campaigns	High-impact cartoon storytelling that simplifies complex social issues — climate, gender, child rights, health — for mass audiences. Delivered as print, digital, or out-of-home campaigns.	t	0	\N
s2	Animation & Explainer Videos	Animated content that brings development messages to life. From short social media clips to full explainer films for donor reporting, conferences, and community screenings.	t	1	\N
s3	Behaviour Change Communication (BCC) Content	Strategically designed illustrated materials that shift attitudes and behaviours — handwashing, vaccination uptake, gender norms, and more — built on communication theory and cultural insight.	t	2	\N
s4	Training Workshops on Cartooning & Creative Expression	Hands-on workshops led by Ms. Nigar Nazar that equip students, teachers, and youth facilitators with the tools to communicate through visual storytelling.	t	3	\N
s5	Illustrated Training Manuals & Guides	Clear, visually engaging manuals for NGO field workers, government staff, and teachers — turning dense technical content into illustrated guides that are easy to understand and retain.	t	4	\N
s6	Educational Comics & Storybooks	Custom illustrated comics and storybooks for school curricula, NGO programs, and publisher partnerships — covering life skills, science, civic education, and more.	f	5	\N
s14	Gender Equality & Human Rights Campaigns	Powerful visual content advancing gender equity and human rights — designed for UN agencies, INGOs, and advocacy organisations operating at national and international scale.	f	13	\N
s15	Children's Learning Materials	Custom illustrated learning materials for schools, learning centres, and educational publishers — workbooks, flashcards, posters, and activity sheets.	f	14	\N
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, company_name, tagline, footer_description, copyright_text, email, social_links, nav_links) FROM stdin;
1	Gogi Studios	Social Impact Communication — Since 1975	Pakistan's leading social impact communication studio. Illustrated campaigns, animation, and training programs for NGOs, UN agencies, governments, and CSR programmes — since 1975.	© 2026 Gogi Studios. All rights reserved.	info@gogistudios.com	[{"url": "https://www.instagram.com/gogistudiosofficial/", "platform": "instagram"}, {"url": "https://www.facebook.com/GogiStudiosOfficial/", "platform": "facebook"}]	[{"href": "/", "label": "Home"}, {"href": "/awards", "label": "Awards"}, {"href": "/blog", "label": "News"}, {"href": "/books", "label": "Books"}, {"href": "/merchandise", "label": "Shop"}]
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.testimonials (id, caption, sort_order) FROM stdin;
t1	American Embassy Award Hi res	0
\.


--
-- Data for Name: work_gallery; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_gallery (id, section_slug, sub_category_slug, caption, sort_order, media_type, video_url) FROM stdin;
\.


--
-- Data for Name: work_sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_sections (slug, label, sort_order, domain) FROM stdin;
social-awareness	Social Awareness Campaigns	0	work
animation-videos	Animation & Explainer Videos	1	work
bcc-content	BCC Content	2	work
workshops-training	Workshops & Training Manuals & Guides	3	work
\.


--
-- Data for Name: work_sub_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_sub_categories (slug, label, section_slug, parent_slug, sort_order, description) FROM stdin;
sdgs-kashmir	SDGs Kashmir	social-awareness	\N	0	\N
malala-mural	Malala Mural	social-awareness	\N	1	\N
\.


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, false);


--
-- Name: catalog_books catalog_books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_books
    ADD CONSTRAINT catalog_books_pkey PRIMARY KEY (id);


--
-- Name: catalog_merchandise catalog_merchandise_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_merchandise
    ADD CONSTRAINT catalog_merchandise_pkey PRIMARY KEY (id);


--
-- Name: catalog_projects catalog_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_projects
    ADD CONSTRAINT catalog_projects_pkey PRIMARY KEY (id);


--
-- Name: content_overrides content_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_overrides
    ADD CONSTRAINT content_overrides_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: work_gallery work_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_gallery
    ADD CONSTRAINT work_gallery_pkey PRIMARY KEY (id);


--
-- Name: work_sections work_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_sections
    ADD CONSTRAINT work_sections_pkey PRIMARY KEY (slug);


--
-- Name: work_sub_categories work_sub_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_sub_categories
    ADD CONSTRAINT work_sub_categories_pkey PRIMARY KEY (slug);


--
-- Name: work_sub_categories work_sub_categories_section_slug_work_sections_slug_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_sub_categories
    ADD CONSTRAINT work_sub_categories_section_slug_work_sections_slug_fk FOREIGN KEY (section_slug) REFERENCES public.work_sections(slug) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict EFYEiZ7IQ3Y7krIuf0ivadS0vLpzdRLKoskhoOOhVizbqUkAxZCspBiohO8XPy5

