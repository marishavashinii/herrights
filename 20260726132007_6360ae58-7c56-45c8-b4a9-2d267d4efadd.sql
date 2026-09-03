
-- =========================================================
-- Women Legal Rights Awareness System - Schema + Seed Data
-- =========================================================

-- Roles enum + user_roles table (secure role storage)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== Content tables (publicly readable) =====

CREATE TABLE public.legal_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id INT REFERENCES public.legal_categories(id)
);
GRANT SELECT ON public.legal_categories TO anon, authenticated;
GRANT ALL ON public.legal_categories TO service_role;
ALTER TABLE public.legal_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.legal_categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.laws (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  section TEXT,
  category_id INT REFERENCES public.legal_categories(id),
  description TEXT NOT NULL,
  punishment TEXT,
  year INT
);
GRANT SELECT ON public.laws TO anon, authenticated;
GRANT ALL ON public.laws TO service_role;
ALTER TABLE public.laws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read laws" ON public.laws FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.rights (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category_id INT REFERENCES public.legal_categories(id),
  description TEXT NOT NULL,
  how_to_exercise TEXT
);
GRANT SELECT ON public.rights TO anon, authenticated;
GRANT ALL ON public.rights TO service_role;
ALTER TABLE public.rights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rights" ON public.rights FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.government_schemes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ministry TEXT,
  description TEXT NOT NULL,
  eligibility TEXT,
  benefits TEXT,
  how_to_apply TEXT,
  website TEXT
);
GRANT SELECT ON public.government_schemes TO anon, authenticated;
GRANT ALL ON public.government_schemes TO service_role;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read schemes" ON public.government_schemes FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.helplines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  number TEXT NOT NULL,
  category TEXT,
  description TEXT,
  available TEXT
);
GRANT SELECT ON public.helplines TO anon, authenticated;
GRANT ALL ON public.helplines TO service_role;
ALTER TABLE public.helplines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read helplines" ON public.helplines FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.complaint_templates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category_id INT REFERENCES public.legal_categories(id),
  applicable_law TEXT,
  template_body TEXT NOT NULL,
  required_evidence TEXT,
  next_steps TEXT
);
GRANT SELECT ON public.complaint_templates TO anon, authenticated;
GRANT ALL ON public.complaint_templates TO service_role;
ALTER TABLE public.complaint_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read templates" ON public.complaint_templates FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id INT REFERENCES public.legal_categories(id)
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT SELECT ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback" ON public.feedback FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view all feedback" ON public.feedback FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Analytics: track searches / AI queries for admin dashboard
CREATE TABLE public.search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  category TEXT,
  risk_level TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.search_logs TO anon, authenticated;
GRANT SELECT ON public.search_logs TO authenticated;
GRANT ALL ON public.search_logs TO service_role;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone log search" ON public.search_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view logs" ON public.search_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- SEED DATA
-- =========================================================

INSERT INTO public.legal_categories (name, slug, description, icon) VALUES
('Domestic Violence','domestic-violence','Protection against physical, emotional, sexual, and economic abuse in the home.','shield'),
('Sexual Harassment','sexual-harassment','Laws against unwanted sexual advances in public and private spaces.','alert-triangle'),
('Workplace Harassment (POSH)','workplace-harassment','Prevention of Sexual Harassment at the Workplace Act, 2013.','briefcase'),
('Cyber Crime','cyber-crime','Online harassment, blackmail, identity theft, and fake accounts.','laptop'),
('Online Blackmail','online-blackmail','Threats and extortion through digital means.','lock'),
('Stalking','stalking','Repeated unwanted attention or following, in-person or online.','eye'),
('Acid Attack','acid-attack','Laws and support for acid attack survivors.','flame'),
('Child Marriage','child-marriage','Prohibition of Child Marriage Act, 2006.','baby'),
('Dowry','dowry','Dowry Prohibition Act, 1961 and related sections.','gift'),
('Property Rights','property-rights','Inheritance and property ownership rights of women.','home'),
('Divorce','divorce','Grounds and procedures for divorce under various personal laws.','file-x'),
('Maintenance','maintenance','Right to financial support after separation or divorce.','wallet'),
('Child Custody','child-custody','Guardianship and custody rights of mothers.','users'),
('Rape Awareness','rape-awareness','Legal definition, reporting, and support after sexual assault.','shield-alert'),
('Human Trafficking','human-trafficking','Immoral Traffic (Prevention) Act and rescue support.','users-x'),
('Eve Teasing','eve-teasing','Public sexual harassment and street harassment.','message-circle'),
('Identity Theft','identity-theft','Misuse of personal identity information.','user-x'),
('Fake Social Media Accounts','fake-accounts','Impersonation and fake profiles online.','user-minus'),
('Online Fraud','online-fraud','Financial fraud, phishing, and scam calls targeting women.','credit-card'),
('Employment Rights','employment-rights','Equal opportunity and fair working conditions.','briefcase'),
('Maternity Benefits','maternity-benefits','Maternity Benefit Act, 1961 (amended 2017).','heart'),
('Equal Pay','equal-pay','Equal Remuneration Act, 1976.','trending-up'),
('Inheritance Rights','inheritance-rights','Hindu Succession Act and personal law inheritance.','key'),
('Police Complaint Process','police-complaint','How to file FIR, zero FIR, and online complaints.','file-text'),
('Marital Rape Awareness','marital-rape','Ongoing legal reforms and available remedies.','shield'),
('Honor Killing','honor-killing','Protection under IPC and Supreme Court guidelines.','shield-alert'),
('Forced Marriage','forced-marriage','Right to refuse marriage without consent.','x-circle'),
('Female Foeticide','female-foeticide','PCPNDT Act against sex-selective abortion.','ban'),
('Trafficking of Minors','minor-trafficking','POCSO and ITPA protections for minor girls.','shield'),
('Reproductive Rights','reproductive-rights','MTP Act and access to healthcare.','activity'),
('Right to Education','right-to-education','RTE Act and gender parity in schooling.','book'),
('Right to Vote','right-to-vote','Political participation and safety at polling booths.','check-square'),
('Legal Aid','legal-aid','Free legal services under Legal Services Authorities Act, 1987.','scale'),
('Widow Rights','widow-rights','Pension, remarriage, and property rights of widows.','user'),
('Senior Women Rights','senior-women','Maintenance and Welfare of Parents and Senior Citizens Act, 2007.','heart-pulse'),
('Disability Rights','disability-rights','Rights of women with disabilities under RPwD Act, 2016.','accessibility'),
('LGBTQ+ Women','lgbtq-women','Rights following Section 377 decriminalisation and NALSA judgment.','rainbow'),
('Bail & Arrest Rights','arrest-rights','D.K. Basu guidelines and arrest procedures for women.','handcuffs'),
('Consumer Rights','consumer-rights','Protection against unfair trade practices.','shopping-bag'),
('Right to Information','right-to-information','RTI Act to access government records.','info'),
('Medical Negligence','medical-negligence','Consumer Protection Act remedies for medical harm.','stethoscope'),
('Passport & Travel','passport-travel','Independent passport and travel rights.','plane'),
('Financial Independence','financial-independence','Bank accounts, credit, and Stridhan.','dollar-sign'),
('Pregnancy at Workplace','pregnancy-workplace','Protection from dismissal during pregnancy.','baby'),
('Sexual Assault at Workplace','workplace-assault','Internal Committee procedures under POSH.','alert-octagon'),
('Trafficking Rescue','trafficking-rescue','Rehabilitation and shelter home rights.','life-buoy'),
('Marriage Registration','marriage-registration','Special Marriage Act and civil registration.','file-check'),
('Live-in Relationships','live-in','Legal status and protection under PWDVA.','users'),
('Domestic Workers','domestic-workers','Rights of women employed in households.','broom'),
('Sex Workers Rights','sex-workers','Fundamental rights and rehabilitation.','shield'),
('Refugee Women','refugee-women','Protections under Indian and international law.','globe');

-- Helper: pick category id by slug for downstream inserts
-- We'll rely on subselects in the massive insert below.

-- === LAWS (30+ realistic Indian laws relevant to women) ===
INSERT INTO public.laws (title, section, category_id, description, punishment, year) VALUES
('Protection of Women from Domestic Violence Act','Section 3', (SELECT id FROM legal_categories WHERE slug='domestic-violence'),'Defines domestic violence including physical, sexual, verbal, emotional and economic abuse. Provides for protection orders, residence orders and monetary relief.','Civil remedies; breach of protection order is punishable with up to 1 year jail or fine up to Rs. 20,000',2005),
('Indian Penal Code - Cruelty by Husband','Section 498A', (SELECT id FROM legal_categories WHERE slug='dowry'),'Cruelty by husband or his relatives against a married woman, including harassment for dowry.','Imprisonment up to 3 years and fine',1983),
('Dowry Prohibition Act','Section 3', (SELECT id FROM legal_categories WHERE slug='dowry'),'Prohibits giving or taking of dowry.','Minimum 5 years imprisonment and fine of Rs. 15,000 or amount of dowry, whichever is more',1961),
('Sexual Harassment of Women at Workplace Act (POSH)','Section 3', (SELECT id FROM legal_categories WHERE slug='workplace-harassment'),'Prevention, prohibition and redressal of sexual harassment of women at workplace. Mandates Internal Committee (IC) in every organisation with 10+ employees.','Employer fine up to Rs. 50,000; repeat offence can lead to license cancellation',2013),
('Indian Penal Code - Sexual Harassment','Section 354A', (SELECT id FROM legal_categories WHERE slug='sexual-harassment'),'Physical contact and advances involving unwelcome and explicit sexual overtures; demand or request for sexual favours; showing pornography; making sexually coloured remarks.','Up to 3 years imprisonment or fine or both',2013),
('Indian Penal Code - Stalking','Section 354D', (SELECT id FROM legal_categories WHERE slug='stalking'),'Following a woman or contacting her repeatedly despite her disinterest, or monitoring her online activity.','First conviction: up to 3 years and fine; subsequent: up to 5 years and fine',2013),
('Indian Penal Code - Voyeurism','Section 354C', (SELECT id FROM legal_categories WHERE slug='cyber-crime'),'Capturing or disseminating image of a woman engaging in a private act without consent.','First: 1-3 years; subsequent: 3-7 years',2013),
('Indian Penal Code - Rape','Section 375', (SELECT id FROM legal_categories WHERE slug='rape-awareness'),'Defines rape and lists circumstances that constitute lack of consent.','Minimum 10 years to life imprisonment (Section 376)',2013),
('POCSO Act','Section 3-14', (SELECT id FROM legal_categories WHERE slug='child-marriage'),'Protection of Children from Sexual Offences Act - gender-neutral law protecting children below 18.','Rigorous imprisonment from 3 years to life depending on the offence',2012),
('Prohibition of Child Marriage Act','Section 9-11', (SELECT id FROM legal_categories WHERE slug='child-marriage'),'Marriage below 18 (girl) / 21 (boy) is voidable and punishable.','Up to 2 years rigorous imprisonment and fine up to Rs. 1 lakh',2006),
('Information Technology Act - Obscene Material','Section 67', (SELECT id FROM legal_categories WHERE slug='cyber-crime'),'Publishing or transmitting obscene material in electronic form.','First: up to 3 years and Rs. 5 lakh fine; subsequent: up to 5 years and Rs. 10 lakh',2000),
('Information Technology Act - Sexually Explicit','Section 67A', (SELECT id FROM legal_categories WHERE slug='cyber-crime'),'Publishing sexually explicit content in electronic form.','Up to 5 years and Rs. 10 lakh fine',2008),
('Information Technology Act - Identity Theft','Section 66C', (SELECT id FROM legal_categories WHERE slug='identity-theft'),'Fraudulent use of another persons electronic signature, password or unique identification.','Up to 3 years and fine up to Rs. 1 lakh',2008),
('Information Technology Act - Cheating by Personation','Section 66D', (SELECT id FROM legal_categories WHERE slug='fake-accounts'),'Cheating by personation using computer resource.','Up to 3 years and fine up to Rs. 1 lakh',2008),
('Information Technology Act - Privacy Violation','Section 66E', (SELECT id FROM legal_categories WHERE slug='cyber-crime'),'Capturing, publishing or transmitting image of private area of any person without consent.','Up to 3 years and fine up to Rs. 2 lakh',2008),
('Acid Attack','Section 326A IPC', (SELECT id FROM legal_categories WHERE slug='acid-attack'),'Voluntarily causing grievous hurt by use of acid.','Minimum 10 years to life imprisonment and fine to cover medical expenses',2013),
('Attempt to Acid Attack','Section 326B IPC', (SELECT id FROM legal_categories WHERE slug='acid-attack'),'Voluntarily throwing or attempting to throw acid.','5 to 7 years imprisonment and fine',2013),
('Hindu Succession (Amendment) Act','Section 6', (SELECT id FROM legal_categories WHERE slug='inheritance-rights'),'Daughters have equal coparcenary rights in ancestral property from birth.','Civil right - enforceable through partition suit',2005),
('Special Marriage Act','Section 4', (SELECT id FROM legal_categories WHERE slug='marriage-registration'),'Enables inter-caste and inter-religion marriages through civil registration.','N/A - civil law',1954),
('Hindu Marriage Act','Section 13', (SELECT id FROM legal_categories WHERE slug='divorce'),'Grounds for divorce including cruelty, desertion, conversion, mental disorder, communicable disease.','Civil decree',1955),
('CrPC - Maintenance','Section 125', (SELECT id FROM legal_categories WHERE slug='maintenance'),'Wife, children and parents who cannot maintain themselves are entitled to monthly allowance.','Non-compliance can lead to imprisonment up to 1 month per month of default',1973),
('Maternity Benefit (Amendment) Act','Section 5', (SELECT id FROM legal_categories WHERE slug='maternity-benefits'),'26 weeks paid maternity leave for first two children; 12 weeks for third onwards; work-from-home option post-leave.','Employer imprisonment up to 1 year or fine up to Rs. 5,000',2017),
('Equal Remuneration Act','Section 4', (SELECT id FROM legal_categories WHERE slug='equal-pay'),'Equal pay for men and women workers for same or similar work.','Fine of Rs. 10,000 to Rs. 20,000 or imprisonment 3 months to 1 year',1976),
('PCPNDT Act','Section 3', (SELECT id FROM legal_categories WHERE slug='female-foeticide'),'Pre-conception and Pre-natal Diagnostic Techniques Act prohibits sex determination.','3-5 years imprisonment and fine Rs. 10,000-1 lakh',1994),
('Immoral Traffic (Prevention) Act','Section 5', (SELECT id FROM legal_categories WHERE slug='human-trafficking'),'Procuring, inducing or taking a person for the sake of prostitution.','3-7 years imprisonment and fine',1956),
('Legal Services Authorities Act','Section 12', (SELECT id FROM legal_categories WHERE slug='legal-aid'),'Free legal aid for women, children, SC/ST, disabled, industrial workmen, and those with annual income below the limit.','N/A - entitlement',1987),
('RTI Act','Section 6', (SELECT id FROM legal_categories WHERE slug='right-to-information'),'Right of citizens to secure access to information under the control of public authorities.','Penalty on PIO Rs. 250/day up to Rs. 25,000 for delay',2005),
('Consumer Protection Act','Section 2', (SELECT id FROM legal_categories WHERE slug='consumer-rights'),'Protection against defective goods, deficient services and unfair trade practices.','Compensation, refund, replacement; up to 3 years imprisonment for false claims',2019),
('IPC - Outraging Modesty','Section 354', (SELECT id FROM legal_categories WHERE slug='eve-teasing'),'Assault or use of criminal force to any woman with intent to outrage her modesty.','1-5 years imprisonment and fine',1860),
('IPC - Word/Gesture/Act to Insult Modesty','Section 509', (SELECT id FROM legal_categories WHERE slug='eve-teasing'),'Word, gesture or act intended to insult the modesty of a woman.','Up to 3 years imprisonment and fine',1860),
('IPC - Trafficking of Person','Section 370', (SELECT id FROM legal_categories WHERE slug='human-trafficking'),'Recruits, transports, harbours or receives a person for exploitation.','7 years to life imprisonment and fine',2013),
('Medical Termination of Pregnancy Act','Section 3', (SELECT id FROM legal_categories WHERE slug='reproductive-rights'),'Allows termination of pregnancy up to 24 weeks for specified categories of women.','N/A - regulated procedure',2021),
('Rights of Persons with Disabilities Act','Section 3', (SELECT id FROM legal_categories WHERE slug='disability-rights'),'Non-discrimination and equal opportunity for persons with disabilities.','Up to 6 months and Rs. 10,000 fine (Section 89)',2016),
('IPC - Dowry Death','Section 304B', (SELECT id FROM legal_categories WHERE slug='dowry'),'Death of woman within 7 years of marriage from burns/bodily injury connected with dowry demand.','Minimum 7 years to life imprisonment',1986);

-- === RIGHTS (30+ specific rights) ===
INSERT INTO public.rights (title, category_id, description, how_to_exercise) VALUES
('Right to Zero FIR', (SELECT id FROM legal_categories WHERE slug='police-complaint'),'A woman can file an FIR at any police station regardless of where the crime occurred. The station must transfer it to the appropriate jurisdiction.','Approach any police station, insist on Zero FIR under Section 154 CrPC. If refused, complain to SP or use online portals.'),
('Right to Free Legal Aid', (SELECT id FROM legal_categories WHERE slug='legal-aid'),'Every woman is entitled to free legal aid under Section 12 of the Legal Services Authorities Act, 1987 regardless of income.','Visit District Legal Services Authority (DLSA) or apply online via nalsa.gov.in.'),
('Right to Privacy during Investigation', (SELECT id FROM legal_categories WHERE slug='rape-awareness'),'Identity of rape survivors cannot be disclosed. Trial can be held in-camera.','Insist on private recording of statement under Section 164 CrPC by a woman magistrate.'),
('Right against Arrest after Sunset', (SELECT id FROM legal_categories WHERE slug='arrest-rights'),'A woman cannot be arrested after sunset or before sunrise except in exceptional circumstances with written permission.','Cite Section 46(4) CrPC; call 1091 immediately if violated.'),
('Right to Dignity in Medical Examination', (SELECT id FROM legal_categories WHERE slug='rape-awareness'),'Medical examination of rape victim must be conducted by a female doctor within 24 hours.','Request female doctor at a government hospital; ask for two-finger test to be avoided (banned by SC).'),
('Right to Maternity Leave', (SELECT id FROM legal_categories WHERE slug='maternity-benefits'),'26 weeks paid maternity leave for first two children in establishments with 10+ employees.','Submit notice to employer 8 weeks before expected date of delivery.'),
('Right to Equal Pay', (SELECT id FROM legal_categories WHERE slug='equal-pay'),'Same wages for the same or similar nature of work as male colleagues.','File complaint with Labour Commissioner or approach Labour Court.'),
('Right to Ancestral Property', (SELECT id FROM legal_categories WHERE slug='inheritance-rights'),'Equal coparcenary rights in ancestral property from birth (Hindu Succession Amendment 2005).','File partition suit in civil court with proof of relationship.'),
('Right to Stridhan', (SELECT id FROM legal_categories WHERE slug='financial-independence'),'Absolute ownership of gifts received before, during and after marriage.','Maintain list with witnesses; file recovery suit under Section 27 Hindu Marriage Act if withheld.'),
('Right to File FIR Online', (SELECT id FROM legal_categories WHERE slug='police-complaint'),'Many states allow online filing of complaints (e-FIR) for non-cognizable offences.','Use state police website or cybercrime.gov.in for cyber offences.'),
('Right to Complaint Against Sexual Harassment at Workplace', (SELECT id FROM legal_categories WHERE slug='workplace-harassment'),'File written complaint with Internal Committee within 3 months (extendable).','Submit written complaint to IC Chairperson; if no IC, approach Local Committee.'),
('Right to Protection Order', (SELECT id FROM legal_categories WHERE slug='domestic-violence'),'Court can prohibit abuser from entering shared household or contacting the woman.','File petition under Section 12 of PWDVA 2005 in Magistrate court.'),
('Right to Residence in Shared Household', (SELECT id FROM legal_categories WHERE slug='domestic-violence'),'A woman cannot be evicted from shared household during pending DV proceedings.','Cite Section 17 PWDVA; obtain residence order under Section 19.'),
('Right to Maintenance from Husband', (SELECT id FROM legal_categories WHERE slug='maintenance'),'Right to monthly allowance if unable to maintain herself.','File under Section 125 CrPC in magistrate court or under personal law.'),
('Right to Custody of Minor Children', (SELECT id FROM legal_categories WHERE slug='child-custody'),'Mother is natural guardian of child below 5 years; courts prioritise welfare of child.','File guardianship petition under Guardians and Wards Act 1890.'),
('Right against Two-Finger Test', (SELECT id FROM legal_categories WHERE slug='rape-awareness'),'Supreme Court has banned the two-finger test as it violates dignity.','Refuse consent; report to NHRC if performed.'),
('Right to Compensation as Acid Attack Survivor', (SELECT id FROM legal_categories WHERE slug='acid-attack'),'Minimum Rs. 3 lakh compensation and free medical treatment.','Apply to State Legal Services Authority within 6 months of incident.'),
('Right to Anonymity in Cyber Crime Complaint', (SELECT id FROM legal_categories WHERE slug='cyber-crime'),'Complaints on cybercrime.gov.in can be filed anonymously for offences against women/children.','Choose "Report Anonymously" on the cybercrime portal.'),
('Right against Termination during Pregnancy', (SELECT id FROM legal_categories WHERE slug='pregnancy-workplace'),'Employer cannot dismiss a woman on account of pregnancy.','Send legal notice; approach Labour Commissioner or Industrial Tribunal.'),
('Right to Vote Independently', (SELECT id FROM legal_categories WHERE slug='right-to-vote'),'Every adult woman has right to vote by secret ballot.','Register on nvsp.in; use voter ID at polling booth.'),
('Right to Own a Bank Account', (SELECT id FROM legal_categories WHERE slug='financial-independence'),'Right to open, operate and close bank account independently.','Submit KYC documents; report harassment to Banking Ombudsman.'),
('Right to Passport in Own Name', (SELECT id FROM legal_categories WHERE slug='passport-travel'),'Married women are not required to include husbands name in passport.','Apply on passportindia.gov.in; select relevant option in application.'),
('Right to Refuse Sex-Determination Test', (SELECT id FROM legal_categories WHERE slug='female-foeticide'),'Doctors cannot legally reveal sex of foetus.','Report violations to district PCPNDT authority.'),
('Right to Education', (SELECT id FROM legal_categories WHERE slug='right-to-education'),'Free and compulsory education for children aged 6-14 under RTE Act.','Enrol in neighbourhood government school; approach BEO if denied.'),
('Right to File Domestic Incident Report', (SELECT id FROM legal_categories WHERE slug='domestic-violence'),'Protection Officer must record and forward Domestic Incident Report to Magistrate.','Contact appointed Protection Officer or NGO service provider.'),
('Right to Interim Compensation', (SELECT id FROM legal_categories WHERE slug='domestic-violence'),'Magistrate can grant interim monetary relief pending final orders.','Include prayer in DV petition; provide income affidavit of husband.'),
('Right to Report Marital Rape (Limited)', (SELECT id FROM legal_categories WHERE slug='marital-rape'),'Sexual assault by husband on wife under 18 is punishable; adult marital rape is not yet criminalised but remedies exist under PWDVA.','File under PWDVA 2005 or Section 498A IPC as cruelty.'),
('Right to Widow Pension', (SELECT id FROM legal_categories WHERE slug='widow-rights'),'Central and state widow pension schemes provide monthly financial assistance.','Apply through Social Welfare Department with death and income proof.'),
('Right to Live-in Relationship', (SELECT id FROM legal_categories WHERE slug='live-in'),'Long-term live-in relationships get similar remedies as marriage under PWDVA.','Maintain evidence of cohabitation; file under PWDVA if abuse occurs.'),
('Right to Marry Person of Choice', (SELECT id FROM legal_categories WHERE slug='forced-marriage'),'Consent of both adults is essential; forced marriage is void.','Register marriage under Special Marriage Act; seek police protection if threatened.'),
('Right to Adopt', (SELECT id FROM legal_categories WHERE slug='child-custody'),'Single women can adopt under Hindu Adoption Act and Juvenile Justice Act.','Register on cara.wcd.gov.in and complete home study.'),
('Right to Reproductive Choice', (SELECT id FROM legal_categories WHERE slug='reproductive-rights'),'Right to safe, legal abortion up to 24 weeks in specified circumstances.','Consult registered medical practitioner at approved MTP centre.'),
('Right to Emergency Contraception', (SELECT id FROM legal_categories WHERE slug='reproductive-rights'),'Over-the-counter access to emergency contraception without prescription.','Available at chemist shops and government primary health centres.'),
('Right against Honour Killing', (SELECT id FROM legal_categories WHERE slug='honor-killing'),'Supreme Court has directed police protection for inter-caste and inter-religious couples.','Approach SP for protection; use Section 366 IPC to file case.');

-- === GOVERNMENT SCHEMES (25+) ===
INSERT INTO public.government_schemes (name, ministry, description, eligibility, benefits, how_to_apply, website) VALUES
('Beti Bachao Beti Padhao','Ministry of Women & Child Development','Scheme to prevent gender-biased sex selective elimination and ensure survival, protection and education of the girl child.','Girl children across India','Awareness, education support, monitoring','District Magistrate office or wcd.nic.in','https://wcd.nic.in/bbbp-schemes'),
('Sukanya Samriddhi Yojana','Ministry of Finance','Small savings scheme for girl child under Beti Bachao Beti Padhao.','Girl child below 10 years','7.6% interest rate; tax-free returns; account matures at 21 years','Post office or authorised banks','https://www.nsiindia.gov.in'),
('Pradhan Mantri Matru Vandana Yojana','Ministry of Women & Child Development','Maternity benefit programme for pregnant and lactating mothers.','Pregnant women 19+ for first live birth','Rs. 5,000 in three instalments','Anganwadi centre with MCP card','https://pmmvy.wcd.gov.in'),
('One Stop Centre (Sakhi)','Ministry of Women & Child Development','Integrated support to women affected by violence - medical, legal, psychological.','Any woman affected by violence','Free medical aid, police assistance, legal aid, counselling, shelter','Visit nearest OSC or call 181','https://wcd.nic.in/schemes/one-stop-centre-scheme-1'),
('Mahila Shakti Kendra','Ministry of Women & Child Development','Empowerment of rural women through community participation.','Rural women','Awareness, training, skill development','Block-level Mahila Shakti Kendra','https://wcd.nic.in'),
('Ujjawala Scheme','Ministry of Women & Child Development','Prevention of trafficking and rescue, rehabilitation of trafficked victims.','Victims of trafficking','Shelter, food, clothing, medical care, legal aid, vocational training','Through NGOs implementing the scheme','https://wcd.nic.in/schemes/ujjawala-new-scheme'),
('Swadhar Greh','Ministry of Women & Child Development','Shelter, food, clothing and health for women in difficult circumstances.','Women in distress with no social/economic support','Shelter up to 3 years, medical care, legal aid, skill training','Apply through implementing agency listed on WCD website','https://wcd.nic.in/schemes/swadhar-greh-scheme'),
('Working Womens Hostel','Ministry of Women & Child Development','Safe and affordable accommodation for working women.','Working women, women trainees, single working women','Subsidised accommodation and day care for children','Apply to hostel management or state WCD department','https://wcd.nic.in'),
('Nirbhaya Fund','Ministry of Finance','Empowerment, safety and security of women.','Women across India','Funds women safety projects, emergency response systems','Indirect - funds implemented via various schemes','https://mha.gov.in'),
('Mahila E-Haat','Ministry of Women & Child Development','Online marketing platform for women entrepreneurs.','Women entrepreneurs, SHGs, NGOs','Free online storefront to showcase products','Register on mahilaehaat-rmk.gov.in','http://mahilaehaat-rmk.gov.in'),
('STEP - Support to Training and Employment Programme','Ministry of Women & Child Development','Skills to women in traditional sectors like agriculture, handloom, handicrafts.','Women 16+ years, especially poor and asset-less','Skill training, market linkages','Through implementing agencies','https://wcd.nic.in/schemes/step'),
('Rashtriya Mahila Kosh','Ministry of Women & Child Development','Micro-credit for socio-economic upliftment of poor women.','Poor women through NGO intermediary','Loans up to Rs. 10 lakh at concessional interest','Through affiliated NGOs','http://rmk.nic.in'),
('Kishori Shakti Yojana','Ministry of Women & Child Development','Empowerment of adolescent girls 11-18 years.','Adolescent girls, esp. school dropouts','Nutrition, health check-up, vocational training','Anganwadi centre','https://wcd.nic.in'),
('SABLA / RGSEAG','Ministry of Women & Child Development','Holistic development of adolescent girls.','Adolescent girls 11-18 in selected districts','Nutritional support, life skills education, health','Through Anganwadi worker','https://wcd.nic.in'),
('Priyadarshini','Ministry of Rural Development','Womens empowerment through livelihood programme in mid-Gangetic plains.','Women SHGs in select districts of UP and Bihar','Micro-finance, training, marketing','Through NABARD partner NGOs','https://nabard.org'),
('Deendayal Antyodaya Yojana - NRLM','Ministry of Rural Development','Self-help group model for rural poor women.','Rural women below poverty line','SHG formation, revolving fund, interest subvention','Through block/village-level DAY-NRLM staff','https://aajeevika.gov.in'),
('Mudra Yojana','Ministry of Finance','Loans up to Rs. 10 lakh for micro-enterprises; 60% goes to women.','Women running or planning small business','Loans in three categories: Shishu, Kishor, Tarun','Any commercial bank or MFI','https://www.mudra.org.in'),
('Stand Up India','Ministry of Finance','Bank loans for SC/ST and women entrepreneurs.','Woman entrepreneur setting up greenfield enterprise','Rs. 10 lakh to Rs. 1 crore loan','Apply at scheduled commercial bank','https://www.standupmitra.in'),
('Mahila Coir Yojana','Ministry of MSME','Training in coir spinning for rural women.','Women 18-55 years in coir producing states','Free training and stipend','Coir Board regional offices','http://coirboard.gov.in'),
('Free Sanitary Napkin Distribution','Ministry of Health','Menstrual hygiene through ASHA workers.','Adolescent girls 10-19 in rural areas','Subsidised sanitary napkins','Through ASHA workers','https://nhm.gov.in'),
('Widow Pension Scheme (IGNWPS)','Ministry of Rural Development','Monthly pension to widows aged 40-79 below poverty line.','BPL widows aged 40-79','Rs. 300 per month up to age 79; Rs. 500 thereafter','Apply to Block Development Officer','https://nsap.nic.in'),
('Janani Suraksha Yojana','Ministry of Health','Safe motherhood intervention promoting institutional delivery.','Pregnant women 19+ from BPL households','Cash assistance Rs. 700 (rural) / Rs. 600 (urban)','Government health facility','https://nhm.gov.in'),
('Janani Shishu Suraksha Karyakram','Ministry of Health','Free delivery, C-section, medicines, diet, transport for pregnant women.','All pregnant women in government facilities','Fully free delivery services','Automatically at government hospitals','https://nhm.gov.in'),
('Mahila Police Volunteers','Ministry of Women & Child Development','Community woman volunteer as bridge between police and community.','Women 21-45 with 12th pass','Honorarium and awareness training','District administration','https://wcd.nic.in'),
('Universal Immunisation Programme','Ministry of Health','Free vaccination for mothers and children including HPV in some states.','All pregnant women and children','Free vaccines','Government health centre','https://nhm.gov.in'),
('Cyber Crime Reporting Portal','Ministry of Home Affairs','National cybercrime reporting portal with special focus on women and children.','Any citizen','Report cybercrime; complaints against women/children can be anonymous','Register on cybercrime.gov.in','https://cybercrime.gov.in'),
('Mission Shakti','Ministry of Women & Child Development','Umbrella scheme for safety and empowerment of women (Sambal + Samarthya).','Women and girls across India','Sub-schemes cover safety, shelter, education, livelihoods','District Mission Shakti office','https://missionshakti.wcd.gov.in'),
('Awas Yojana (PMAY) for Women','Ministry of Housing','Ownership of PMAY house preferably in the name of woman member.','Eligible BPL family','Subsidised housing with woman as co-owner or sole owner','Apply on pmaymis.gov.in','https://pmaymis.gov.in'),
('Ayushman Bharat','Ministry of Health','Health insurance up to Rs. 5 lakh per family per year.','Families listed in SECC data','Cashless treatment at empanelled hospitals','Apply at Ayushman Mitra kiosk','https://pmjay.gov.in');

-- === HELPLINES ===
INSERT INTO public.helplines (name, number, category, description, available) VALUES
('Women Helpline (All India)','1091','General','Distress helpline for women in emergency.','24x7'),
('Domestic Abuse Helpline','181','Domestic Violence','Sakhi One Stop Centre helpline.','24x7'),
('National Commission for Women','7827170170','Complaints','WhatsApp complaint number.','24x7'),
('Police Emergency','112','Emergency','Unified emergency response.','24x7'),
('Child Helpline','1098','Child Protection','For children in distress including girl child.','24x7'),
('Cyber Crime Helpline','1930','Cyber','Financial cyber fraud reporting.','24x7'),
('Women in Distress','1091','General','State-level women helpline.','24x7'),
('POCSO e-Box','1098','Child Sexual Abuse','NCPCR complaint portal and helpline.','24x7'),
('Anti-Trafficking Helpline','1098','Trafficking','Report human trafficking.','24x7'),
('Senior Citizen Helpline','14567','Senior Women','Elder abuse and support.','24x7'),
('Mental Health Helpline (KIRAN)','1800-599-0019','Mental Health','Counselling for women in distress.','24x7'),
('Vandrevala Foundation','1860-2662-345','Mental Health','Free mental health counselling.','24x7'),
('iCall','9152987821','Counselling','Free psychosocial helpline.','Mon-Sat 8am-10pm'),
('AIDS Helpline','1097','Health','Confidential HIV/AIDS support.','24x7'),
('Delhi Commission for Women','181','Regional','Delhi state helpline.','24x7'),
('Maharashtra State Women Commission','022-26592707','Regional','Maharashtra complaints.','Mon-Fri 10am-6pm'),
('Tamil Nadu Women Helpline','044-28551155','Regional','Tamil Nadu Social Welfare.','24x7'),
('Karnataka Women Helpline','1091','Regional','Karnataka state helpline.','24x7'),
('West Bengal Women Commission','033-23217252','Regional','West Bengal complaints.','Mon-Fri 10am-6pm'),
('Kerala Womens Helpline','1091','Regional','Kerala state helpline.','24x7'),
('Snehalaya Anti-Trafficking','1800-233-2211','Trafficking','Rescue and rehabilitation.','24x7'),
('Sneha Suicide Prevention','044-24640050','Mental Health','Chennai based crisis helpline.','24x7'),
('Nirbhaya Squad','7837018555','Safety','Punjab womens safety.','24x7'),
('Rani Laxmibai Helpline','1090','UP Regional','Uttar Pradesh womens power line.','24x7'),
('Bombay Bar Legal Aid','022-22696655','Legal Aid','Maharashtra legal support.','Mon-Fri 10am-5pm'),
('NALSA Legal Aid','15100','Legal Aid','National Legal Services helpline.','24x7'),
('Missing Persons Bureau','1094','Missing','Report missing women/children.','24x7'),
('Railway Protection Force','182','Travel','Emergency on Indian Railways.','24x7'),
('Highway Safety','1033','Travel','National Highway emergency.','24x7'),
('Ambulance','108','Medical','Free emergency ambulance service.','24x7'),
('Fire Services','101','Emergency','Fire and rescue.','24x7'),
('Blood Bank Helpline','104','Health','Blood availability and health advice.','24x7');

-- === COMPLAINT TEMPLATES ===
INSERT INTO public.complaint_templates (title, category_id, applicable_law, template_body, required_evidence, next_steps) VALUES
('FIR for Domestic Violence',(SELECT id FROM legal_categories WHERE slug='domestic-violence'),'Protection of Women from Domestic Violence Act, 2005; Section 498A IPC','To,\nThe Station House Officer,\n[Police Station Name]\n\nSubject: Complaint regarding domestic violence\n\nRespected Sir/Madam,\n\nI, [Name], aged [Age], D/o [Fathers Name], residing at [Address], wish to lodge a formal complaint against [Name of Accused], my [relation], residing at [Address].\n\nThat on [Date], the accused subjected me to physical/mental/economic abuse in the following manner: [Describe incident].\n\nI request you to register an FIR under the Protection of Women from Domestic Violence Act, 2005 and Section 498A of IPC, and to take immediate action.\n\nYours faithfully,\n[Name]\n[Contact]\n[Date]','Medical reports, photographs of injuries, WhatsApp messages, witness statements, financial records','1) Get medical examination. 2) Approach Protection Officer for DIR. 3) File PWDVA petition in Magistrate court. 4) Contact 181/1091.'),
('Complaint under POSH Act',(SELECT id FROM legal_categories WHERE slug='workplace-harassment'),'Sexual Harassment of Women at Workplace Act, 2013','To,\nThe Presiding Officer,\nInternal Committee,\n[Company Name]\n\nSubject: Complaint of Sexual Harassment at Workplace\n\nMadam/Sir,\n\nI, [Name], employee of [Department], wish to lodge a formal complaint against [Name of Accused], [Designation].\n\nOn [Date] at [Location], the accused: [Describe incident in detail].\n\nI request the IC to conduct an inquiry as per the POSH Act 2013 and take appropriate action.\n\nThank you.\n\n[Name]\n[Employee ID]\n[Date]','Emails, text messages, CCTV footage, witness statements, complaint diary','1) File within 90 days (extendable). 2) Request interim relief - transfer/leave. 3) IC to complete inquiry within 90 days. 4) Escalate to Local Committee or High Court if unsatisfied.'),
('Cyber Stalking Complaint',(SELECT id FROM legal_categories WHERE slug='stalking'),'Section 354D IPC; Section 67 IT Act','To,\nCyber Crime Cell,\n[City]\n\nSubject: Complaint of cyber stalking\n\nI, [Name], residing at [Address], wish to report cyber stalking by [Name/Username].\n\nSince [Date], the accused has been repeatedly contacting me through [Platform] despite my clear disinterest. Screenshots and account details are attached.\n\nI request immediate action under Section 354D IPC and Section 67 IT Act.\n\n[Name]\n[Contact]\n[Date]','Screenshots with timestamps, URL/profile links, phone call records, chat exports','1) Preserve all evidence. 2) File on cybercrime.gov.in. 3) Approach nearest police station for FIR. 4) Block accused; do not delete evidence.'),
('FIR for Sexual Harassment (354A)',(SELECT id FROM legal_categories WHERE slug='sexual-harassment'),'Section 354A IPC','To,\nThe SHO,\n[Police Station]\n\nSubject: FIR for sexual harassment\n\nI, [Name], D/o [Fathers Name], resident of [Address], state that on [Date], at [Time], at [Place], [Name of Accused] committed the following acts of sexual harassment: [Describe].\n\nWitnesses: [Names, if any].\n\nKindly register FIR under Section 354A IPC and take necessary action.\n\n[Name]\n[Contact]\n[Date]','CCTV footage, witness testimony, medical examination if applicable, timing details','1) Insist on Zero FIR if outside jurisdiction. 2) Get statement recorded before woman magistrate under Section 164 CrPC. 3) Follow up on investigation. 4) Free legal aid from DLSA.'),
('Complaint for Online Blackmail',(SELECT id FROM legal_categories WHERE slug='online-blackmail'),'Section 384 IPC; Section 67 IT Act','To,\nCyber Crime Cell,\n[City]\n\nSubject: Complaint of online blackmail/extortion\n\nI, [Name], resident of [Address], report that [Name/Username] has been blackmailing me by threatening to publish intimate images/personal information unless I pay Rs. [Amount] or perform [Act].\n\nAll evidence including screenshots, transaction attempts, chat logs is attached.\n\nRequest immediate action.\n\n[Name]\n[Contact]\n[Date]','Screenshots of threats, financial demand messages, phone recordings, bank statements if payments demanded','1) Do NOT pay. 2) File on cybercrime.gov.in immediately. 3) Approach cyber cell in person. 4) Preserve all evidence in secondary storage. 5) Get psychological support from KIRAN 1800-599-0019.'),
('Dowry Harassment Complaint',(SELECT id FROM legal_categories WHERE slug='dowry'),'Section 498A IPC; Dowry Prohibition Act, 1961','To,\nSHO,\n[Police Station]\n\nSubject: FIR against husband and in-laws for dowry harassment\n\nI, [Name], W/o [Husbands Name], married on [Date], residing at [Address], state that since [Date], my husband and in-laws have been harassing me for additional dowry of [Amount/Items]. Incidents include: [Describe].\n\nKindly register FIR under Section 498A IPC and Dowry Prohibition Act, 1961.\n\n[Name]\n[Contact]\n[Date]','Marriage photos, gift list, WhatsApp messages, financial transaction records, witness statements','1) File at Mahila Thana if available. 2) Simultaneously file PWDVA petition. 3) Seek Section 125 CrPC maintenance. 4) Approach Mediation Cell before escalation if desired.'),
('Acid Attack FIR',(SELECT id FROM legal_categories WHERE slug='acid-attack'),'Sections 326A and 326B IPC','To,\nSHO,\n[Police Station]\n\nSubject: FIR for acid attack\n\nOn [Date] at [Time], at [Location], [Name of Accused] threw acid at me/attempted to throw acid at me, causing [Injuries].\n\nMedical reports, witness statements and photographs are attached.\n\nRequest immediate FIR under Sections 326A/326B IPC.\n\n[Name/Complainant Name]\n[Contact]\n[Date]','Hospital records, photographs of injuries, witness statements, purchase records of acid if available','1) Get free medical treatment (Supreme Court order). 2) Apply for compensation to State Legal Services Authority within 6 months. 3) NGO support (Chhanv Foundation). 4) Free plastic surgery at empanelled hospitals.'),
('Cyber Fraud Complaint',(SELECT id FROM legal_categories WHERE slug='online-fraud'),'Sections 419, 420 IPC; Sections 66C, 66D IT Act','To,\nCyber Crime Cell,\n[City]\n\nSubject: Financial cyber fraud complaint\n\nI, [Name], report that on [Date], I lost Rs. [Amount] to a fraudulent [call/message/website/OTP scam]. Details: [Describe incident including bank details of fraudster if known].\n\nRequest immediate action to freeze fraudulent transactions.\n\n[Name]\n[Contact]\n[Date]','SMS/call recording, transaction receipts, bank statements, screenshots of fraudulent website','1) Call 1930 within one hour (golden hour). 2) File on cybercrime.gov.in. 3) Inform bank to freeze transaction. 4) File FIR in cyber cell.'),
('Complaint against Fake Social Media Account',(SELECT id FROM legal_categories WHERE slug='fake-accounts'),'Section 66C, 66D IT Act; Section 419 IPC','To,\nCyber Crime Cell,\n[City]\n\nSubject: Impersonation through fake social media account\n\nI, [Name], report that a fake account impersonating me has been created on [Platform] at URL [Link]. The account is being used to [Describe misuse]. This is causing me [Harm].\n\nRequest urgent action to takedown the account and identify the accused.\n\n[Name]\n[Contact]\n[Date]','Screenshots of fake profile, URL, evidence of impersonation, my own genuine profile screenshots','1) Report to platform first. 2) File on cybercrime.gov.in. 3) Approach cyber cell with printed evidence. 4) Obtain court order for platform data if needed.'),
('Maintenance Petition under Section 125 CrPC',(SELECT id FROM legal_categories WHERE slug='maintenance'),'Section 125 CrPC','In the Court of Judicial Magistrate,\n[City]\n\nIn the matter of:\n[Petitioner Name] ... Petitioner\nVersus\n[Respondent Name] ... Respondent\n\nPetition for maintenance under Section 125 CrPC.\n\nThe petitioner is legally wedded wife of the respondent. The respondent has neglected/refused to maintain the petitioner since [Date] despite having sufficient means (approx. Rs. [Amount] per month).\n\nPrayer: Grant monthly maintenance of Rs. [Amount] and litigation expenses.\n\n[Signed]\n[Advocate]\n[Date]','Marriage certificate, income proof of husband (IT returns, salary slips), household expense records','1) File in Family/Magistrate court. 2) Interim maintenance possible during pendency. 3) Enforcement via warrant of arrest for non-payment.'),
('Child Custody Petition',(SELECT id FROM legal_categories WHERE slug='child-custody'),'Guardians and Wards Act, 1890; Hindu Minority and Guardianship Act, 1956','In the Court of District Judge,\n[City]\n\n[Petitioner] vs [Respondent]\n\nPetition under Section 7 of Guardians and Wards Act for custody of minor [Child Name] aged [Age].\n\nGrounds: [Describe unsuitability of respondent, welfare of child].\n\nPrayer: Grant custody to petitioner and visitation rights to respondent.\n\n[Advocate]\n[Date]','Birth certificate of child, school records, medical records, income affidavit of both parents','1) File in District Court. 2) Court may order counselling/mediation. 3) Interim custody possible. 4) Enforcement via contempt if visitation denied.'),
('Divorce Petition (Mutual Consent)',(SELECT id FROM legal_categories WHERE slug='divorce'),'Section 13B Hindu Marriage Act, 1955','In the Family Court,\n[City]\n\n[Petitioner 1] and [Petitioner 2]\n\nJoint petition under Section 13B Hindu Marriage Act for dissolution of marriage by mutual consent.\n\nStatement: We have been living separately since [Date]. We have decided that our marriage cannot continue and mutually agree to divorce. Terms of settlement: [Alimony, custody, property].\n\nPrayer: Grant decree of divorce.\n\n[Signatures]\n[Advocates]\n[Date]','Marriage certificate, address proof, mutually signed settlement, photograph of marriage','1) First motion filed jointly. 2) 6-month cooling period (waivable by SC in special cases). 3) Second motion after 6-18 months. 4) Decree issued.'),
('Rape Case FIR',(SELECT id FROM legal_categories WHERE slug='rape-awareness'),'Section 375, 376 IPC; POCSO Act if minor','[FORMAT AS PER PRESCRIBED STATEMENT FORMAT UNDER SECTION 154(1) CrPC - to be recorded by a woman police officer]\n\nStatement of [Name], D/o [Name], aged [Age], residing at [Address], regarding incident of [Date] at [Place].\n\n[Detailed statement to be recorded in survivors own words by woman officer at survivors residence or place of choice.]\n\nSignature: [Or thumb impression]','Medical examination report (within 24 hours by female doctor), forensic evidence (clothes, samples), CCTV, phone location, witness statements','1) Insist on statement being recorded by woman officer at your convenience. 2) Medical exam at government hospital by female doctor. 3) Statement under Section 164 CrPC before woman magistrate. 4) Free legal aid; identity protected under law. 5) Compensation from Nirbhaya Fund.'),
('Complaint to National Commission for Women',(SELECT id FROM legal_categories WHERE slug='police-complaint'),'National Commission for Women Act, 1990','To,\nThe Chairperson,\nNational Commission for Women,\n\nSubject: Complaint under NCW Act\n\nI, [Name], resident of [Address], wish to bring the following grievance to NCWs notice: [Describe grievance including inaction by local authorities].\n\nRequest: Direct authorities to take action; provide legal aid; monitor progress.\n\n[Name]\n[Contact]\n[Date]','All prior complaint copies, evidence of grievance, correspondence with authorities','1) File online at ncw.nic.in. 2) NCW summons parties, holds inquiry. 3) Recommendations sent to concerned authority. 4) Follow-up through NCW helpline 7827170170.'),
('Eviction Protection Order (DV Act)',(SELECT id FROM legal_categories WHERE slug='domestic-violence'),'Section 19 PWDVA, 2005','In the Court of Metropolitan Magistrate,\n[City]\n\n[Aggrieved] vs [Respondent]\n\nApplication under Section 19 PWDVA for residence order.\n\nFacts: The aggrieved person resides at [Shared Household Address] and is being threatened with eviction by the respondent.\n\nPrayer: Restrain respondent from evicting/disturbing possession of the aggrieved.\n\n[Advocate]\n[Date]','Utility bills, rent receipts, marriage certificate, threat evidence','1) Interim ex-parte order possible. 2) Court fixes date for reply. 3) Breach punishable with imprisonment up to 1 year.'),
('RTI Application for Case Status',(SELECT id FROM legal_categories WHERE slug='right-to-information'),'Section 6 RTI Act, 2005','To,\nThe Public Information Officer,\n[Department Name]\n\nSubject: Request for information under RTI Act\n\nI, [Name], seek the following information regarding [FIR No / Case No / Application No]:\n1. Current status of investigation.\n2. Reasons for delay if any.\n3. Name of investigating officer.\n\nRs. 10 court fee stamp / IPO enclosed.\n\n[Name]\n[Address]\n[Date]','Copy of FIR/application, ID proof','1) Reply expected within 30 days. 2) File first appeal after 30 days. 3) Second appeal to Information Commission after 30 more days.'),
('Free Legal Aid Application',(SELECT id FROM legal_categories WHERE slug='legal-aid'),'Section 12 Legal Services Authorities Act, 1987','To,\nThe Member Secretary,\nDistrict Legal Services Authority,\n[District]\n\nSubject: Application for free legal aid\n\nI, [Name], being a woman/SC/ST/disabled/senior citizen/BPL, seek free legal representation in [Case No / Matter].\n\nBrief facts: [Describe].\n\nEnclosed: ID proof, income affidavit, case papers.\n\n[Name]\n[Contact]\n[Date]','Aadhaar/Voter ID, income proof, case papers','1) DLSA screens application. 2) Panel advocate assigned. 3) Services free including court fee waiver.'),
('Consumer Complaint',(SELECT id FROM legal_categories WHERE slug='consumer-rights'),'Consumer Protection Act, 2019','Before the District Consumer Disputes Redressal Commission,\n[District]\n\n[Complainant] vs [Opposite Party]\n\nComplaint under Section 35 CPA 2019.\n\nFacts: On [Date] I purchased [Product/Service] worth Rs. [Amount] which turned out to be defective/deficient. Despite repeated requests, the OP has not resolved the grievance.\n\nPrayer: Refund/replacement, compensation of Rs. [Amount], and cost of litigation.\n\n[Advocate/Complainant]\n[Date]','Purchase invoice, warranty card, correspondence with company, photos/videos of defect','1) File within 2 years of cause of action. 2) Fee based on claim value. 3) Case decided within 3-5 months typically.'),
('Complaint to Womens Commission (State)',(SELECT id FROM legal_categories WHERE slug='police-complaint'),'State Women Commission Act','To,\nChairperson,\n[State] Womens Commission\n\nSubject: [Type of complaint]\n\nI, [Name], resident of [Address], wish to lodge the following complaint: [Details].\n\nActions taken so far: [Describe].\n\nRelief sought: [Describe].\n\n[Name]\n[Contact]\n[Date]','Prior complaint copies, response/lack of response from authorities, evidence','1) File online or in person. 2) Commission calls parties for hearing. 3) Recommendations sent to authorities.'),
('Complaint against Eve Teasing',(SELECT id FROM legal_categories WHERE slug='eve-teasing'),'Sections 354 and 509 IPC','To,\nSHO,\n[Police Station]\n\nSubject: FIR under Sections 354 and 509 IPC\n\nOn [Date] at [Time] at [Place], [Description of accused] committed eve-teasing by [Describe act]. Witnesses: [Names].\n\nRequest immediate action.\n\n[Name]\n[Contact]\n[Date]','CCTV footage, witness statements, description of accused, timings','1) Dial 1091 or 112. 2) Use Himmat Plus / equivalent state safety app. 3) Follow up written complaint at nearest station. 4) SHE Teams (Telangana) or similar unit.');

-- === FAQs ===
INSERT INTO public.faqs (question, answer, category_id) VALUES
('What is the Domestic Violence Act 2005?','The Protection of Women from Domestic Violence Act, 2005 protects women from physical, mental, sexual and economic abuse within the household. It provides for protection orders, residence orders, monetary relief and custody orders.',(SELECT id FROM legal_categories WHERE slug='domestic-violence')),
('Can I file an FIR at any police station?','Yes. Under Zero FIR provisions, any police station is bound to register an FIR regardless of jurisdiction. It will be transferred to the appropriate station later.',(SELECT id FROM legal_categories WHERE slug='police-complaint')),
('What is the POSH Act?','The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 mandates every organisation with 10 or more employees to constitute an Internal Committee to receive and inquire into complaints of sexual harassment.',(SELECT id FROM legal_categories WHERE slug='workplace-harassment')),
('How do I report cyber crime online?','File a complaint on cybercrime.gov.in. You can file anonymously for offences against women and children. For financial fraud, call 1930 immediately.',(SELECT id FROM legal_categories WHERE slug='cyber-crime')),
('What is Section 498A IPC?','Section 498A punishes cruelty by husband or relatives of husband against a married woman, including harassment for unlawful demand of dowry. Punishment can extend to 3 years imprisonment and fine.',(SELECT id FROM legal_categories WHERE slug='dowry')),
('Can a woman be arrested at night?','No. Under Section 46(4) CrPC, a woman cannot be arrested after sunset or before sunrise except in exceptional circumstances with written permission of a Magistrate.',(SELECT id FROM legal_categories WHERE slug='arrest-rights')),
('How much maternity leave am I entitled to?','Under the Maternity Benefit (Amendment) Act 2017, women in establishments with 10+ employees get 26 weeks paid maternity leave for the first two children and 12 weeks for the third onwards.',(SELECT id FROM legal_categories WHERE slug='maternity-benefits')),
('What is the punishment for acid attack?','Under Section 326A IPC, minimum 10 years imprisonment extendable to life, with fine to cover medical expenses of the victim.',(SELECT id FROM legal_categories WHERE slug='acid-attack')),
('Do daughters have equal rights in ancestral property?','Yes. The Hindu Succession (Amendment) Act 2005 gives daughters equal coparcenary rights in ancestral property by birth.',(SELECT id FROM legal_categories WHERE slug='inheritance-rights')),
('Is marital rape a crime in India?','As of now, sexual intercourse by a husband with his wife (not below 15 years) is not classified as rape under Section 375 IPC. However, women have remedies under PWDVA, 2005 and Section 498A IPC.',(SELECT id FROM legal_categories WHERE slug='marital-rape')),
('How do I claim maintenance from my husband?','File a petition under Section 125 CrPC in a Magistrate court, or under personal laws (Hindu Adoption and Maintenance Act, etc.). Interim maintenance can be granted during pendency.',(SELECT id FROM legal_categories WHERE slug='maintenance')),
('Is dowry legal in India?','No. The Dowry Prohibition Act 1961 prohibits giving or taking dowry. Punishment is minimum 5 years imprisonment and fine of Rs. 15,000 or amount of dowry, whichever is more.',(SELECT id FROM legal_categories WHERE slug='dowry')),
('Can I get free legal aid?','Yes. Every woman is entitled to free legal aid under Section 12 of the Legal Services Authorities Act 1987 regardless of income. Contact your District Legal Services Authority.',(SELECT id FROM legal_categories WHERE slug='legal-aid')),
('What is a Protection Order under DV Act?','A Magistrate can pass an order restraining the abuser from committing violence, entering the aggrieved persons workplace or communicating with her. Breach is punishable with up to 1 year imprisonment.',(SELECT id FROM legal_categories WHERE slug='domestic-violence')),
('What is Zero FIR?','A Zero FIR is an FIR that can be registered at any police station regardless of the jurisdiction where the crime occurred. It is later transferred to the appropriate station.',(SELECT id FROM legal_categories WHERE slug='police-complaint')),
('How can I get a divorce by mutual consent?','File a joint petition under Section 13B of Hindu Marriage Act after living separately for 1 year. Second motion is after 6-18 months. Cooling period can be waived in special cases.',(SELECT id FROM legal_categories WHERE slug='divorce')),
('What is Sukanya Samriddhi Yojana?','A savings scheme for the girl child under Beti Bachao Beti Padhao. Account can be opened for a girl below 10 years with attractive tax-free interest.',(SELECT id FROM legal_categories WHERE slug='inheritance-rights')),
('How do I approach the Internal Committee at work?','Submit a written complaint within 3 months of the incident (extendable) to the IC Presiding Officer. IC must complete inquiry within 90 days.',(SELECT id FROM legal_categories WHERE slug='workplace-harassment')),
('What is the age of consent in India?','The age of consent for sexual activity in India is 18 years (Section 375 IPC and POCSO Act).',(SELECT id FROM legal_categories WHERE slug='rape-awareness')),
('Can I file a complaint against my father-in-law under 498A?','Yes. Section 498A IPC covers cruelty by husband OR his relatives. However, courts have cautioned against roping in all relatives without specific allegations.',(SELECT id FROM legal_categories WHERE slug='dowry')),
('What is Stridhan?','Stridhan is the property that a woman receives before, during and after marriage - gifts from parents, in-laws, husband, at engagement, wedding rituals, etc. She has absolute ownership over it.',(SELECT id FROM legal_categories WHERE slug='financial-independence')),
('How can I report an online blackmail attempt?','Do NOT pay. Preserve all evidence (screenshots, chat logs). File complaint on cybercrime.gov.in and at nearest cyber cell. Call 1930 for financial component.',(SELECT id FROM legal_categories WHERE slug='online-blackmail')),
('What is the two-finger test?','A discredited medical practice earlier used in rape investigations, banned by the Supreme Court in 2013. Any medical examiner performing it is violating the survivors dignity and human rights.',(SELECT id FROM legal_categories WHERE slug='rape-awareness')),
('Can a girl below 18 get married?','No. Under the Prohibition of Child Marriage Act 2006, marriage of a girl below 18 or boy below 21 is voidable and punishable with up to 2 years imprisonment.',(SELECT id FROM legal_categories WHERE slug='child-marriage')),
('What is the Nirbhaya Fund?','A fund set up by Government of India in 2013 for projects to enhance safety and security of women, especially after the December 2012 Delhi gang rape case.',(SELECT id FROM legal_categories WHERE slug='rape-awareness')),
('Can single women adopt a child in India?','Yes. Single women can adopt under Hindu Adoption and Maintenance Act or Juvenile Justice Act by registering on the Central Adoption Resource Authority website (cara.wcd.gov.in).',(SELECT id FROM legal_categories WHERE slug='child-custody')),
('What is a Domestic Incident Report (DIR)?','A DIR is a report of a domestic violence incident recorded by a Protection Officer or service provider under Section 9 of PWDVA. It is then forwarded to the Magistrate.',(SELECT id FROM legal_categories WHERE slug='domestic-violence')),
('What is the compensation for an acid attack survivor?','A minimum of Rs. 3 lakh compensation and free medical treatment including plastic surgery at empanelled hospitals. Apply to State Legal Services Authority within 6 months.',(SELECT id FROM legal_categories WHERE slug='acid-attack')),
('Can I get maintenance if I earn my own income?','Yes, if your husband earns significantly more and maintenance is required to maintain the standard of living during marriage. Court considers various factors including income disparity.',(SELECT id FROM legal_categories WHERE slug='maintenance')),
('What is the Special Marriage Act?','The Special Marriage Act 1954 allows inter-caste, inter-religion and secular civil marriages without conversion, with a mandatory 30-day notice period.',(SELECT id FROM legal_categories WHERE slug='marriage-registration')),
('How do I register a marriage?','Contact the marriage registrar in your locality with both parties, three witnesses, ID/address proofs, photographs and marriage invitation. Rules vary by state.',(SELECT id FROM legal_categories WHERE slug='marriage-registration')),
('What is Section 354D IPC?','Section 354D punishes stalking - following, contacting or monitoring a woman despite her disinterest. First conviction: up to 3 years; subsequent: up to 5 years.',(SELECT id FROM legal_categories WHERE slug='stalking')),
('Can my employer force me to work night shifts?','Under various state laws, women can work in night shifts only with consent and adequate safety arrangements (transport, security, common rooms).',(SELECT id FROM legal_categories WHERE slug='employment-rights')),
('What is the Equal Remuneration Act?','A 1976 law that prohibits discrimination in wages between male and female workers for the same or similar work.',(SELECT id FROM legal_categories WHERE slug='equal-pay')),
('Can I include my husbands name in my passport optionally?','Yes. Married women are NOT required to include the husbands name in their passport. It is optional.',(SELECT id FROM legal_categories WHERE slug='passport-travel')),
('What are my rights during police interrogation?','Right to have a lawyer, right against self-incrimination, right to have a woman officer present, right to inform a relative, right not to be detained beyond 24 hours without magistrate order.',(SELECT id FROM legal_categories WHERE slug='arrest-rights')),
('Are widow remarriages legal?','Yes. Under the Hindu Widows Remarriage Act 1856 and later Hindu Marriage Act, widow remarriage is completely legal.',(SELECT id FROM legal_categories WHERE slug='widow-rights')),
('What is Section 66E IT Act?','Section 66E punishes capturing, publishing or transmitting the image of a private area of any person without consent - a form of privacy violation. Punishment up to 3 years and Rs. 2 lakh fine.',(SELECT id FROM legal_categories WHERE slug='cyber-crime')),
('Can I get an abortion in India?','Yes, up to 24 weeks under specified circumstances under the MTP (Amendment) Act 2021. Must be performed by a registered medical practitioner at an approved facility.',(SELECT id FROM legal_categories WHERE slug='reproductive-rights')),
('What is Beti Bachao Beti Padhao?','A government scheme launched in 2015 to address declining child sex ratio and promote education of girls through awareness, monitoring and interventions.',(SELECT id FROM legal_categories WHERE slug='right-to-education')),
('Who can approach a One Stop Centre?','Any woman affected by violence (physical, sexual, emotional, economic) can approach an OSC (Sakhi) for integrated support - medical, legal, psychological. Call 181 for the nearest OSC.',(SELECT id FROM legal_categories WHERE slug='domestic-violence')),
('What is honour killing and is there a specific law?','Honour killing is murder of a person by family/community members for perceived dishonour. It is prosecuted under IPC (Sections 302, 307, 120B). SC has issued guidelines for police protection to inter-caste/religion couples.',(SELECT id FROM legal_categories WHERE slug='honor-killing')),
('Are live-in relationships legal in India?','Yes. Supreme Court has held that live-in relationships between consenting adults are not illegal. Long-term live-in partners can claim maintenance under PWDVA 2005.',(SELECT id FROM legal_categories WHERE slug='live-in')),
('What is Section 66C IT Act?','Section 66C punishes identity theft - fraudulent or dishonest use of electronic signature, password or unique identification of another person. Up to 3 years imprisonment and Rs. 1 lakh fine.',(SELECT id FROM legal_categories WHERE slug='identity-theft')),
('Can I file complaint against fake profile impersonating me?','Yes. Report to the platform first, then file at cybercrime.gov.in under Sections 66C and 66D IT Act. Take screenshots of the fake profile as evidence.',(SELECT id FROM legal_categories WHERE slug='fake-accounts')),
('What is PCPNDT Act?','Pre-conception and Pre-natal Diagnostic Techniques Act 1994 prohibits sex determination and sex-selective abortion. Punishment: 3-5 years imprisonment and Rs. 10,000-1 lakh fine.',(SELECT id FROM legal_categories WHERE slug='female-foeticide')),
('How much widow pension can I get?','Under Indira Gandhi National Widow Pension Scheme, BPL widows aged 40-79 get Rs. 300/month, increasing to Rs. 500/month after 80. States often supplement this amount.',(SELECT id FROM legal_categories WHERE slug='widow-rights')),
('What is Section 354 IPC?','Section 354 punishes assault or use of criminal force to any woman with intent to outrage her modesty. Punishment: 1-5 years imprisonment and fine.',(SELECT id FROM legal_categories WHERE slug='eve-teasing')),
('Can I record my statement at home?','If you are a victim of sexual offence or unable to visit the police station, you can request the statement to be recorded at your residence in the presence of a woman officer.',(SELECT id FROM legal_categories WHERE slug='rape-awareness')),
('What if the police refuse to file my FIR?','You can approach the Superintendent of Police in writing, file an application before the Magistrate under Section 156(3) CrPC, or use online complaint portals of your state police.',(SELECT id FROM legal_categories WHERE slug='police-complaint'));

-- Create an admin bootstrap RPC (users can request admin via manual grant in DB)
