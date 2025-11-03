-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create course_categories junction table
CREATE TABLE public.course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, category_id)
);

ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course categories are viewable by everyone"
ON public.course_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage course categories"
ON public.course_categories FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes are viewable for enrolled students"
ON public.quizzes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid() AND e.course_id = quizzes.course_id
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage quizzes"
ON public.quizzes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quiz questions are viewable for enrolled students"
ON public.quiz_questions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.enrollments e ON e.course_id = q.course_id
    WHERE q.id = quiz_questions.quiz_id AND e.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage quiz questions"
ON public.quiz_questions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  answers JSONB NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz attempts"
ON public.quiz_attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts"
ON public.quiz_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz attempts"
ON public.quiz_attempts FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  certificate_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certificates"
ON public.certificates FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all certificates"
ON public.certificates FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create certificates"
ON public.certificates FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create lesson_progress table
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lesson progress"
ON public.lesson_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lesson progress"
ON public.lesson_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all lesson progress"
ON public.lesson_progress FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample categories
INSERT INTO public.categories (name, description, icon) VALUES
('Artificial Intelligence', 'Learn about AI fundamentals, machine learning, and intelligent systems', 'Brain'),
('Machine Learning', 'Master ML algorithms, data science, and predictive modeling', 'TrendingUp'),
('Deep Learning', 'Neural networks, computer vision, and advanced AI techniques', 'Network'),
('Natural Language Processing', 'Text processing, language models, and conversational AI', 'MessageSquare'),
('Computer Vision', 'Image recognition, object detection, and visual AI', 'Eye'),
('Data Science', 'Data analysis, visualization, and statistical modeling', 'BarChart');

-- Link courses to categories
INSERT INTO public.course_categories (course_id, category_id)
SELECT c.id, cat.id
FROM public.courses c
CROSS JOIN public.categories cat
WHERE 
  (c.title LIKE '%Python%' AND cat.name IN ('Artificial Intelligence', 'Machine Learning', 'Data Science'))
  OR (c.title LIKE '%Machine Learning%' AND cat.name IN ('Machine Learning', 'Data Science'))
  OR (c.title LIKE '%Deep Learning%' AND cat.name IN ('Deep Learning', 'Machine Learning'))
  OR (c.title LIKE '%NLP%' OR c.title LIKE '%Natural Language%' AND cat.name IN ('Natural Language Processing', 'Machine Learning'))
  OR (c.title LIKE '%Computer Vision%' AND cat.name IN ('Computer Vision', 'Deep Learning'))
  OR (c.title LIKE '%AI Ethics%' AND cat.name = 'Artificial Intelligence');

-- Insert sample lessons for the first course
INSERT INTO public.lessons (course_id, title, content, week_number, order_index, duration_minutes, video_url)
SELECT 
  c.id,
  'Introduction to Python Programming',
  'Learn the basics of Python syntax, variables, and data types. This lesson covers fundamental programming concepts that will be essential for your AI journey.',
  1,
  1,
  45,
  'https://www.youtube.com/embed/kqtD5dpn9C8'
FROM public.courses c
WHERE c.title = 'Python for AI & Machine Learning'
LIMIT 1;

INSERT INTO public.lessons (course_id, title, content, week_number, order_index, duration_minutes, video_url)
SELECT 
  c.id,
  'Python Data Structures',
  'Explore lists, tuples, dictionaries, and sets. Understanding these data structures is crucial for efficient data manipulation in AI applications.',
  1,
  2,
  50,
  'https://www.youtube.com/embed/W8KRzm-HUcc'
FROM public.courses c
WHERE c.title = 'Python for AI & Machine Learning'
LIMIT 1;

INSERT INTO public.lessons (course_id, title, content, week_number, order_index, duration_minutes, video_url)
SELECT 
  c.id,
  'Functions and Modules',
  'Master Python functions, lambda expressions, and module imports. Learn how to write reusable and maintainable code.',
  2,
  3,
  55,
  'https://www.youtube.com/embed/9Os0o3wzS_I'
FROM public.courses c
WHERE c.title = 'Python for AI & Machine Learning'
LIMIT 1;

INSERT INTO public.lessons (course_id, title, content, week_number, order_index, duration_minutes, video_url)
SELECT 
  c.id,
  'NumPy for Numerical Computing',
  'Introduction to NumPy arrays and operations. Learn how to perform efficient numerical computations essential for machine learning.',
  3,
  4,
  60,
  'https://www.youtube.com/embed/QUT1VHiLmmI'
FROM public.courses c
WHERE c.title = 'Python for AI & Machine Learning'
LIMIT 1;

-- Insert sample quiz for the first course
INSERT INTO public.quizzes (course_id, title, description, passing_score, time_limit_minutes)
SELECT 
  c.id,
  'Python Fundamentals Quiz',
  'Test your understanding of Python basics, data structures, and functions.',
  70,
  30
FROM public.courses c
WHERE c.title = 'Python for AI & Machine Learning'
LIMIT 1;

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, points, order_index)
SELECT 
  q.id,
  'What is the correct way to create a list in Python?',
  '["my_list = []", "my_list = {}", "my_list = ()", "my_list = <>"]'::jsonb,
  'my_list = []',
  1,
  1
FROM public.quizzes q
WHERE q.title = 'Python Fundamentals Quiz'
LIMIT 1;

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, points, order_index)
SELECT 
  q.id,
  'Which library is primarily used for numerical computing in Python?',
  '["Pandas", "NumPy", "Matplotlib", "Scikit-learn"]'::jsonb,
  'NumPy',
  1,
  2
FROM public.quizzes q
WHERE q.title = 'Python Fundamentals Quiz'
LIMIT 1;

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, points, order_index)
SELECT 
  q.id,
  'What does the "def" keyword do in Python?',
  '["Defines a variable", "Defines a function", "Defines a class", "Defines a module"]'::jsonb,
  'Defines a function',
  1,
  3
FROM public.quizzes q
WHERE q.title = 'Python Fundamentals Quiz'
LIMIT 1;

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, points, order_index)
SELECT 
  q.id,
  'Which data structure is immutable in Python?',
  '["List", "Dictionary", "Tuple", "Set"]'::jsonb,
  'Tuple',
  1,
  4
FROM public.quizzes q
WHERE q.title = 'Python Fundamentals Quiz'
LIMIT 1;

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, points, order_index)
SELECT 
  q.id,
  'What is the output of: print(type([]))?',
  '["<class ''list''>", "<class ''dict''>", "<class ''tuple''>", "<class ''array''>"]'::jsonb,
  '<class ''list''>',
  1,
  5
FROM public.quizzes q
WHERE q.title = 'Python Fundamentals Quiz'
LIMIT 1;
