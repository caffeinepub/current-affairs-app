import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryColor } from "@/lib/utils-ca";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useAllNewsItems } from "../hooks/useQueries";

// Returns YYYY-MM-DD for date comparison with selectedDate
function formatBigIntDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toISOString().split("T")[0];
}

type MCQ = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
};

const SAMPLE_MCQS: MCQ[] = [
  {
    id: 1,
    question:
      "Which country became the first to ratify the Global Plastics Treaty in 2025?",
    options: ["Norway", "Germany", "Japan", "Canada"],
    correctIndex: 0,
    category: "Environment",
  },
  {
    id: 2,
    question:
      "The Reserve Bank of India's Monetary Policy Committee meets how many times a year?",
    options: ["4 times", "6 times", "8 times", "12 times"],
    correctIndex: 1,
    category: "Economy",
  },
  {
    id: 3,
    question: "India's PSLV-C58 mission launched which space observatory?",
    options: ["AstroSat-2", "XPoSat", "Chandrayaan-4", "Aditya-L2"],
    correctIndex: 1,
    category: "Science",
  },
  {
    id: 4,
    question: "Which Indian state enacted a Uniform Civil Code in 2024?",
    options: ["Gujarat", "Maharashtra", "Uttarakhand", "Goa"],
    correctIndex: 2,
    category: "Politics",
  },
  {
    id: 5,
    question:
      "The 2024 Paris Olympics was the first to achieve what milestone?",
    options: [
      "100+ countries",
      "Gender parity among athletes",
      "Carbon-neutral games",
      "Fully digital ticketing",
    ],
    correctIndex: 1,
    category: "Sports",
  },
  {
    id: 6,
    question: "OpenAI's GPT-4o model introduced which key capability in 2024?",
    options: [
      "Image generation",
      "Real-time multimodal voice interaction",
      "Code execution sandbox",
      "Web browsing",
    ],
    correctIndex: 1,
    category: "Technology",
  },
  {
    id: 7,
    question:
      "India's GDP growth rate for FY2024-25 was projected at approximately:",
    options: ["5.4%", "6.4%", "7.4%", "8.2%"],
    correctIndex: 2,
    category: "Economy",
  },
  {
    id: 8,
    question: "Which summit in 2024 marked NATO's 75th anniversary?",
    options: [
      "London Summit",
      "Brussels Summit",
      "Washington Summit",
      "Madrid Summit",
    ],
    correctIndex: 2,
    category: "International",
  },
  {
    id: 9,
    question: "The Chandrayaan-3 lander is named after which Indian scientist?",
    options: [
      "Vikram Sarabhai",
      "APJ Abdul Kalam",
      "Homi Bhabha",
      "Satish Dhawan",
    ],
    correctIndex: 0,
    category: "Science",
  },
  {
    id: 10,
    question:
      "India's first indigenously developed quantum computer was unveiled in which city?",
    options: ["Bengaluru", "Hyderabad", "Pune", "Mumbai"],
    correctIndex: 0,
    category: "Technology",
  },
];

function getQuestionsForDate(dateStr: string): MCQ[] {
  // Rotate questions based on date so different days show different questions
  const seed = dateStr.split("-").reduce((a, b) => a + Number(b), 0);
  const offset = seed % SAMPLE_MCQS.length;
  const rotated = [
    ...SAMPLE_MCQS.slice(offset),
    ...SAMPLE_MCQS.slice(0, offset),
  ];
  return rotated.slice(0, 5);
}

function todayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function displayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type MCQCardProps = { mcq: MCQ; index: number };

function MCQCard({ mcq, index }: MCQCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  function optionClass(i: number) {
    const base =
      "w-full text-left px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ";
    if (selected === null) {
      return `${base}border-border hover:border-teal hover:bg-teal/5 text-foreground`;
    }
    if (i === mcq.correctIndex) {
      return `${base}border-teal bg-teal/10 text-teal`;
    }
    if (i === selected) {
      return `${base}border-destructive bg-destructive/10 text-destructive`;
    }
    return `${base}border-border text-muted-foreground opacity-60`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="bg-card border border-border rounded-xl p-5 shadow-card"
      data-ocid={`mcq.card.${index + 1}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(mcq.category)} inline-block mb-2`}
          >
            {mcq.category}
          </span>
          <p className="text-sm font-semibold text-foreground leading-snug">
            {mcq.question}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
        {mcq.options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            onClick={() => selected === null && setSelected(i)}
            disabled={selected !== null}
            className={optionClass(i)}
            data-ocid={`mcq.option.${index + 1}`}
          >
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full border border-current flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                {["A", "B", "C", "D"][i]}
              </span>
              {opt}
              {selected !== null && i === mcq.correctIndex && (
                <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" />
              )}
              {selected === i && i !== mcq.correctIndex && (
                <XCircle className="w-4 h-4 ml-auto flex-shrink-0" />
              )}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function DailyCurrentAffairs() {
  const [selectedDate, setSelectedDate] = useState(todayDateStr());
  const { data: allNews, isLoading } = useAllNewsItems();

  const newsForDate = useMemo(() => {
    if (!allNews) return [];
    return allNews.filter(
      (item) => formatBigIntDate(item.date) === selectedDate,
    );
  }, [allNews, selectedDate]);

  const questions = useMemo(
    () => getQuestionsForDate(selectedDate),
    [selectedDate],
  );

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6">
      {/* Page Header with Date Selector */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Daily Current Affairs
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {displayDate(selectedDate)}
          </p>
        </div>
        <label className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 shadow-xs cursor-pointer hover:border-teal transition-colors">
          <Calendar className="w-4 h-4 text-teal flex-shrink-0" />
          <input
            type="date"
            value={selectedDate}
            max={todayDateStr()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer"
            data-ocid="daily_ca.input"
          />
        </label>
      </motion.div>

      {/* News Section */}
      <section className="mb-8" aria-label="News articles">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Top Stories
        </h2>

        {isLoading ? (
          <div className="flex flex-col gap-3" data-ocid="news.loading_state">
            {[1, 2, 3].map((k) => (
              <div
                key={k}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex gap-2 mb-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </div>
            ))}
          </div>
        ) : newsForDate.length === 0 ? (
          <div
            className="bg-card border border-border rounded-xl px-6 py-10 text-center"
            data-ocid="news.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No news items found for this date. Try selecting another date.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="wait">
              {newsForDate.map((item, idx) => (
                <motion.article
                  key={String(item.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-md transition-shadow"
                  data-ocid={`news.item.${idx + 1}`}
                >
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryColor(item.category)} inline-block mb-2.5`}
                  >
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* MCQ Section */}
      <section aria-label="Practice questions">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Practice Questions
          </h2>
          <Badge variant="secondary" className="text-[10px]">
            {questions.length} MCQs
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          {questions.map((mcq, idx) => (
            <MCQCard key={`${selectedDate}-${mcq.id}`} mcq={mcq} index={idx} />
          ))}
        </div>
      </section>
    </div>
  );
}
