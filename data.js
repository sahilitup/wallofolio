// Shared lists used by the wall, the submit form and the admin page.
// If you add or rename a domain id, update the allowed list in supabase/schema.sql too.
window.DOMAINS = [
  {id:"sales", name:"Sales", ic:"↗", c:"#2b47e6", blurb:"Closers, AEs and BD"},
  {id:"marketing", name:"Marketing", ic:"✶", c:"#d0397a", blurb:"Brand, growth and content"},
  {id:"founders-office", name:"Founder's Office", ic:"◆", c:"#6a4be0", blurb:"Generalists close to the CEO"},
  {id:"chief-of-staff", name:"Chief of Staff", ic:"★", c:"#7a5c2e", blurb:"Operators who run the room"},
  {id:"finance", name:"Finance", ic:"₹", c:"#18a57a", blurb:"Analysts, IB and FP&A"},
  {id:"consulting", name:"Consulting", ic:"◐", c:"#1b8fb8", blurb:"Strategy and management"},
  {id:"supply-chain", name:"Supply Chain", ic:"⇄", c:"#e0732b", blurb:"Ops, procurement, logistics"},
  {id:"hr", name:"HR & People", ic:"☺", c:"#c99a12", blurb:"Talent and people teams"},
  {id:"others", name:"Others", ic:"…", c:"#4b6378", blurb:"Everything in between"},
];
window.TITLES = ["Sales Manager","Account Executive","Business Development Associate","Marketing Manager","Growth Marketer","Brand Manager","Founder's Office Associate","Chief of Staff","Financial Analyst","Investment Banking Analyst","Management Consultant","Strategy Consultant","Supply Chain Manager","Procurement Lead","HR Business Partner","Talent Acquisition Lead","Product Manager","Operations Manager","MBA Intern","Other"];
window.INDUSTRIES = ["Fintech","Consumer & D2C","E‑commerce","SaaS & B2B","FMCG","Consulting firm","Banking","Healthcare","Edtech","Manufacturing","Logistics","Startup (early stage)"];

// Demo-mode sample entries (placeholder people and companies). Not used once Supabase is configured.
// [name, title, company, domains, years, country, openToWork, industry]
window.DEMO_DATA = [
  ["Aarav Mehta","Sales Manager","Ledgerly",["sales"],6,"India",true,"Fintech"],
  ["Mira Kapoor","Growth Marketer","Glowbar",["marketing"],3,"India",false,"Consumer & D2C"],
  ["Jonah Ellis","Chief of Staff","Stackwise",["chief-of-staff","founders-office"],8,"United States",false,"SaaS & B2B"],
  ["Sana Iqbal","Founder's Office Associate","Northwind Pay",["founders-office","finance"],2,"UAE",true,"Fintech"],
  ["Leo Andersen","Management Consultant","Brightpath Partners",["consulting"],5,"Germany",false,"Consulting firm"],
  ["Ishita Rao","Brand Manager","Morning Oats",["marketing"],4,"India",true,"FMCG"],
  ["Kabir Sethi","Supply Chain Manager","Cartwheel",["supply-chain"],7,"India",false,"E‑commerce"],
  ["Ava Moreno","HR Business Partner","Medivo",["hr"],5,"Spain",true,"Healthcare"],
  ["Rohan Das","Account Executive","Insight Grid",["sales"],3,"India",false,"SaaS & B2B"],
  ["Nadia Haddad","Strategy Consultant","Keystone Advisory",["consulting","finance"],8,"United Kingdom",false,"Consulting firm"],
  ["Ethan Park","Financial Analyst","Harbor Capital",["finance"],4,"Singapore",true,"Banking"],
  ["Tara Nair","Chief of Staff","Tiffinbox",["chief-of-staff"],11,"India",false,"Startup (early stage)"],
  ["Owen Brooks","Procurement Lead","Ironline Works",["supply-chain"],6,"Canada",true,"Manufacturing"],
  ["Priya Menon","MBA Intern","Learnly",["founders-office","marketing"],0,"India",true,"Edtech"],
  ["Lucas Ferreira","Business Development Associate","Routeway",["sales","founders-office"],2,"Brazil",false,"Logistics"],
  ["Zara Khan","Talent Acquisition Lead","Promptly AI",["hr"],4,"India",true,"SaaS & B2B"],
  ["Noah Fischer","Product Manager","Vectorlab",["others"],5,"Germany",false,"SaaS & B2B"],
  ["Ananya Joshi","Investment Banking Analyst","Crestline Securities",["finance"],2,"India",false,"Banking"],
  ["Felix Wong","Operations Manager","Packright",["supply-chain","others"],7,"Australia",true,"Logistics"],
  ["Meera Pillai","Marketing Manager","Basketful",["marketing","sales"],8,"India",false,"E‑commerce"],
  ["Daniel Okafor","Strategy Consultant","Meridian Group",["consulting"],12,"United Kingdom",false,"Consulting firm"],
  ["Riya Bansal","Founder's Office Associate","Snackdash",["founders-office"],1,"India",true,"Consumer & D2C"],
  ["Sofia Rossi","HR Business Partner","Ironline Works",["hr","others"],9,"Italy",false,"Manufacturing"],
  ["Arjun Kulkarni","Chief of Staff","Pulse Health",["chief-of-staff","consulting"],6,"India",true,"Healthcare"],
  ["Hana Sato","Account Executive","Tutorverse",["sales"],3,"Japan",false,"Edtech"],
  ["Vikram Shah","Financial Analyst","Lendwise",["finance","founders-office"],5,"India",false,"Fintech"],
];

window.getSupabase = function(){
  const c = window.DOMAINFOLIO_CONFIG || {};
  if(!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY || !window.supabase) return null;
  return window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY);
};
window.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
window.safeUrl = u => /^https:\/\/[^\s"'<>]+$/i.test(u || "") ? u : "#";
