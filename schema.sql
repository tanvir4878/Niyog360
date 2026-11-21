CREATE TABLE IF NOT EXISTS jobs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL, org TEXT DEFAULT '', category TEXT NOT NULL,
  vacancies TEXT DEFAULT '', location TEXT DEFAULT '', salary TEXT DEFAULT '',
  education TEXT DEFAULT '', experience TEXT DEFAULT '', age_limit TEXT DEFAULT '',
  deadline TEXT DEFAULT '', description TEXT DEFAULT '', how_to_apply TEXT DEFAULT '',
  apply_url TEXT DEFAULT '', image_url TEXT DEFAULT '', circular_images TEXT DEFAULT '[]',
  featured INTEGER DEFAULT 0, urgent INTEGER DEFAULT 0, status TEXT DEFAULT 'published',
  views INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_jobs_list ON jobs(status, category, id);
INSERT INTO jobs(title,org,category,vacancies,location,salary,education,age_limit,deadline,description,how_to_apply,apply_url,featured,urgent) VALUES
('সহকারী কমিশনার (ভূমি) পদে নিয়োগ বিজ্ঞপ্তি','জনপ্রশাসন মন্ত্রণালয়','govt','৫০ জন','সারা বাংলাদেশ','গ্রেড-৯ (২২,০০০–৫৩,০৬০ টাকা)','যেকোনো বিষয়ে স্নাতক','১৮–৩০ বছর',date('now','+20 day'),'এটি একটি নমুনা বিজ্ঞপ্তি। অ্যাডমিন প্যানেল থেকে এটি মুছে আপনার আসল বিজ্ঞপ্তি দিন।
আগ্রহী প্রার্থীরা অনলাইনে আবেদন করতে পারবেন।','অনলাইনে আবেদন ফরম পূরণ করে নির্ধারিত ফি জমা দিন।','https://example.com',1,1),
('অফিসার (ক্যাশ) নিয়োগ','নমুনা ব্যাংক লিমিটেড','bank','২০ জন','ঢাকা','আলোচনা সাপেক্ষে','স্নাতক (২য় শ্রেণি)','২৭ বছর',date('now','+10 day'),'নমুনা ব্যাংক বিজ্ঞপ্তি।','ওয়েবসাইটে আবেদন করুন।','https://example.com',0,0),
('প্রোগ্রাম অফিসার (এনজিও)','নমুনা ফাউন্ডেশন','ngo','০৫ জন','কুমিল্লা','৩০,০০০–৪৫,০০০ টাকা','স্নাতকোত্তর','৩৫ বছর',date('now','+5 day'),'নমুনা এনজিও বিজ্ঞপ্তি।','সিভি ইমেইল করুন।','https://example.com',0,0);
